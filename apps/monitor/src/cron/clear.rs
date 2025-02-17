use std::sync::Arc;

use log::info;
use tokio::sync::Mutex;
use tokio_cron_scheduler::JobScheduler;

use super::worker::JobMetadata;

pub async fn clear_jobs(
    sched: Arc<Mutex<JobScheduler>>,
    registry: Arc<Mutex<Vec<JobMetadata>>>,
) -> Result<(), Box<dyn std::error::Error>> {
    info!("Clearing all jobs");

    let mut registry = registry.lock().await;
    let sched = sched.lock().await;

    for job in registry.iter() {
        sched.remove(&job.id).await?;
    }

    registry.clear();

    Ok(())
}
