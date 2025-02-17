use std::{
    sync::{Arc, OnceLock},
    time::SystemTime,
};

use log::{error, info, warn};
use tokio::{sync::Mutex, task::JoinHandle};
use tokio_cron_scheduler::JobScheduler;
use uuid::Uuid;

use crate::{REGISTRY, SCHED};

#[derive(Debug, Clone)]
pub struct JobMetadata {
    pub id: Uuid,
    pub cron_expr: String,
    pub created_at: SystemTime,
}

pub static HANDLE: OnceLock<JoinHandle<()>> = OnceLock::new();

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

pub async fn load_jobs() {
    // normally we will call the database to load all the monitors but for now we can use dummy data
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

    match crate::cron::create_job(
        "tygr.dev".to_string(),
        "http".to_string(),
        "1/5 * * * * *".to_string(),
        sched.clone(),
        reg.clone(),
    )
    .await
    {
        Ok(_) => info!("Created job"),
        Err(e) => error!("Failed to create job: {:?}", e),
    }

    match crate::cron::create_job(
        "gateway.campsite.chat:443".to_string(),
        "tcp".to_string(),
        "1/5 * * * * *".to_string(),
        sched.clone(),
        reg.clone(),
    )
    .await
    {
        Ok(_) => info!("Created job"),
        Err(e) => error!("Failed to create job: {:?}", e),
    }
}
