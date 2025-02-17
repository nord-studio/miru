use std::{
    sync::{Arc, OnceLock},
    time::SystemTime,
};

use log::{error, info, warn};
use sqlx::query;
use tokio::{sync::Mutex, task::JoinHandle};
use tokio_cron_scheduler::JobScheduler;
use uuid::Uuid;

use crate::{POOL, REGISTRY, SCHED};

#[derive(Debug, Clone)]
pub struct JobMetadata {
    pub id: Uuid,
    pub cron_expr: String,
    pub created_at: SystemTime,
}

pub static HANDLE: OnceLock<JoinHandle<()>> = OnceLock::new();

/// Start the cron worker
pub async fn start() {
    let scheduler = Arc::new(Mutex::new(JobScheduler::new().await.unwrap()));
    let registry = Arc::new(Mutex::new(Vec::<JobMetadata>::new()));

    let sched_clone = scheduler.clone();
    let handle = tokio::spawn(async move {
        sched_clone.lock().await.start().await.unwrap();
    });

    match SCHED.set(scheduler) {
        Ok(_) => info!("Set scheduler"),
        Err(_) => warn!("Failed to set scheduler"),
    }

    match REGISTRY.set(registry) {
        Ok(_) => info!("Set registry"),
        Err(_) => warn!("Failed to set registry"),
    }

    match HANDLE.set(handle) {
        Ok(_) => info!("Set handle"),
        Err(_) => warn!("Failed to set handle"),
    }
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
            info!("Creating job for {:?}", row);
            tokio::spawn(async move {
                match crate::cron::create_job(
                    row.url.to_string(),
                    row.r#type.to_string(),
                    match row.interval.to_string().as_str() {
                        "1" => "1 * * * * *".to_string(),
                        "5" => "1/5 * * * * *".to_string(),
                        "10" => "1/10 * * * * *".to_string(),
                        "30" => "1/30 * * * * *".to_string(),
                        "60" => "1/60 * * * * *".to_string(),
                        _ => "1/10 * * * * *".to_string(), // default case
                    },
                    sched.clone(),
                    reg.clone(),
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
        task.await.unwrap();
    }
}
