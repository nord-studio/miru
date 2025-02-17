use std::sync::Arc;

use log::info;
use tokio::sync::Mutex;
use tokio_cron_scheduler::JobScheduler;
use uuid::Uuid;

use super::worker::JobMetadata;

pub async fn remove_job(
    job_id: Uuid,
    sched: Arc<Mutex<JobScheduler>>,
    registry: Arc<Mutex<Vec<JobMetadata>>>,
) -> Result<(), Box<dyn std::error::Error>> {
    info!("Removing job with id {}", job_id);

    sched.lock().await.remove(&job_id).await?;
    registry.lock().await.retain(|job| job.id != job_id);

    Ok(())
}
