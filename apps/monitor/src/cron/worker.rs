use std::{
    sync::{Arc, OnceLock},
    time::SystemTime,
};

use log::{error, info};
use sqlx::query;
use tokio::{sync::Mutex, task::JoinHandle};
use tokio_cron_scheduler::JobScheduler;
use uuid::Uuid;

use crate::{
    monitors::health::{load_registry, TrackedIncident},
    EVENT_REGISTRY, INCID_REGISTRY, MON_REGISTRY, POOL, SCHED,
};

#[derive(Debug, Clone)]
pub struct MonitorJobMetadata {
    pub id: Uuid,
    pub cron_expr: String,
    pub monitor_id: String,
    pub created_at: SystemTime,
}

#[derive(Debug, Clone)]
pub struct EventJobMetadata {
    pub id: Uuid,
    pub event_id: String,
    pub created_at: SystemTime,
}

pub static HANDLE: OnceLock<JoinHandle<()>> = OnceLock::new();

/// Start the cron worker
pub async fn start() {
    let scheduler = Arc::new(Mutex::new(JobScheduler::new().await.unwrap()));
    let monitor_registry = Arc::new(Mutex::new(Vec::<MonitorJobMetadata>::new()));
    let event_registry = Arc::new(Mutex::new(Vec::<EventJobMetadata>::new()));
    let incid_registry = Arc::new(Mutex::new(Vec::<TrackedIncident>::new()));

    let sched_clone = scheduler.clone();
    let handle = tokio::spawn(async move {
        sched_clone.lock().await.start().await.unwrap();
    });

    SCHED
        .set(scheduler)
        .map_err(|_| error!("Failed to set scheduler"))
        .ok();

    MON_REGISTRY
        .set(monitor_registry)
        .map_err(|_| error!("Failed to set monitor registry"))
        .ok();

    EVENT_REGISTRY
        .set(event_registry)
        .map_err(|_| error!("Failed to set event registry"))
        .ok();

    INCID_REGISTRY
        .set(incid_registry)
        .map_err(|_| error!("Failed to set incident registry"))
        .ok();

    HANDLE
        .set(handle)
        .map_err(|_| error!("Failed to set handle"))
        .ok();

    // Load all tracked incidents from the database
    load_registry().await;
}

/// Load all the monitors from the database and create a ping cron job for them
pub async fn load_jobs() {
    let mon_reg = match MON_REGISTRY.get() {
        Some(reg) => reg,
        None => {
            error!("Failed to get monitor registry");
            return;
        }
    };

    let event_reg = match EVENT_REGISTRY.get() {
        Some(reg) => reg,
        None => {
            error!("Failed to get event registry");
            return;
        }
    };

    let sched = match SCHED.get() {
        Some(sched) => sched,
        None => {
            error!("Failed to get scheduler");
            return;
        }
    };

    let pool = POOL.clone();
    let mon_tasks = match query!("SELECT * FROM monitors ORDER BY created_at DESC")
        .fetch_all(&pool)
        .await
    {
        Ok(query) => query.into_iter().map(|row| {
            tokio::spawn(async move {
                match crate::monitors::create_job(
                    row.id,
                    row.url,
                    row.r#type,
                    row.interval.to_string(),
                    sched.lock().await,
                    mon_reg.lock().await,
                )
                .await
                {
                    Ok(_) => info!("Created monitor job"),
                    Err(e) => error!("Failed to create monitor job: {:?}", e),
                }
            })
        }),
        Err(e) => {
            error!("Failed to fetch monitors: {:?}", e);
            return;
        }
    };

    let event_tasks =
        match query!("SELECT * FROM events WHERE completed is false AND auto_complete is true ORDER BY created_at DESC")
            .fetch_all(&pool)
            .await
        {
            Ok(query) => query.into_iter().map(|row| {
                tokio::spawn(async move {
                    match crate::events::create_job(
                        row.id,
                        sched.lock().await,
                        event_reg.lock().await,
                    )
                    .await
                    {
                        Ok(_) => info!("Created event job"),
                        Err(e) => error!("Failed to create event job: {:?}", e),
                    }
                })
            }),
            Err(e) => {
                error!("Failed to fetch events: {:?}", e);
                return;
            }
        };

    for monitor_task in mon_tasks {
        monitor_task
            .await
            .map_err(|e| error!("Failed to await cron task: {:?}", e))
            .ok();
    }

    for event_task in event_tasks {
        event_task
            .await
            .map_err(|e| error!("Failed to await event task: {:?}", e))
            .ok();
    }
}
