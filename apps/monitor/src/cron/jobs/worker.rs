use super::create::create_job;
use crate::{
    cron::manager::{AsyncScheduler, TimeUnits},
    SCHED,
};
use log::{error, info};
use std::time::Duration;
use tokio::sync::Mutex;

pub async fn init() -> Result<(), Box<dyn std::error::Error>> {
    let scheduler = AsyncScheduler::new();

    let m = Mutex::new(scheduler);

    match SCHED.set(m) {
        Ok(_) => Ok(()),
        Err(_) => Err("Failed to set cron scheduler".into()),
    }
}

pub async fn load_jobs() -> Result<(), Box<dyn std::error::Error>> {
    // Get jobs from database, add them to the scheduler
    // For now, we'll just add a dummy job
    match create_job("tygr.dev".to_string(), "http".to_string(), 5.seconds()).await {
        Ok(_) => info!("Loaded job"),
        Err(e) => error!("Error loading job: {:?}", e),
    };

    match create_job(
        "gateway.campsite.chat:443".to_string(),
        "tcp".to_string(),
        5.seconds(),
    )
    .await
    {
        Ok(_) => info!("Loaded job"),
        Err(e) => error!("Error loading job: {:?}", e),
    }

    Ok(())
}

pub async fn start() -> Result<(), Box<dyn std::error::Error>> {
    let mut scheduler = match SCHED.get() {
        Some(s) => s.lock().await,
        None => return Err("Failed to get cron scheduler".into()),
    };

    tokio::spawn(async move {
        loop {
            scheduler.run_pending().await;
            tokio::time::sleep(Duration::from_secs(1)).await;
        }
    });

    Ok(())
}
