use std::{
    sync::{Arc, OnceLock},
    time::SystemTime,
};

use log::{error, info};
use sqlx::query;
use tokio::{sync::Mutex, task::JoinHandle};
use tokio_cron_scheduler::JobScheduler;
use uuid::Uuid;

use crate::{INCID_REGISTRY, POOL, REGISTRY, SCHED};

use super::health::{load_registry, TrackedIncident};

#[derive(Debug, Clone)]
pub struct JobMetadata {
    pub id: Uuid,
    pub cron_expr: String,
    pub monitor_id: String,
    pub created_at: SystemTime,
}

pub static HANDLE: OnceLock<JoinHandle<()>> = OnceLock::new();

/// Start the cron worker
pub async fn start() {
    let scheduler = Arc::new(Mutex::new(JobScheduler::new().await.unwrap()));
    let registry = Arc::new(Mutex::new(Vec::<JobMetadata>::new()));
    let incid_registry = Arc::new(Mutex::new(Vec::<TrackedIncident>::new()));

    let sched_clone = scheduler.clone();
    let handle = tokio::spawn(async move {
        sched_clone.lock().await.start().await.unwrap();
    });

    SCHED
        .set(scheduler)
        .map_err(|_| error!("Failed to set scheduler"))
        .ok();

    REGISTRY
        .set(registry)
        .map_err(|_| error!("Failed to set registry"))
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
    let reg = match REGISTRY.get() {
        Some(reg) => reg,
        None => {
            error!("Failed to get registry");
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
    let tasks = match query!("SELECT * FROM monitors ORDER BY created_at DESC")
        .fetch_all(&pool)
        .await
    {
        Ok(query) => query.into_iter().map(|row| {
            tokio::spawn(async move {
                match crate::cron::create_job(
                    row.id,
                    row.url,
                    row.r#type,
                    row.interval.to_string(),
                    sched.lock().await,
                    reg.lock().await,
                )
                .await
                {
                    Ok(_) => info!("Created job"),
                    Err(e) => error!("Failed to create job: {:?}", e),
                }
            })
        }),
        Err(e) => {
            error!("Failed to fetch monitors: {:?}", e);
            return;
        }
    };

    for task in tasks {
        task.await
            .map_err(|e| error!("Failed to await cron task: {:?}", e))
            .ok();
    }
}
