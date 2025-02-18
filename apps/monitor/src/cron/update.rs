use log::info;
use tokio::sync::MutexGuard;
use tokio_cron_scheduler::JobScheduler;

use crate::{cron::create_job, REGISTRY, SCHED};

use super::worker::JobMetadata;

pub async fn update_job(
    monitor_id: String,
    sched: MutexGuard<'_, JobScheduler>,
    registry: MutexGuard<'_, Vec<JobMetadata>>,
) -> Result<(), Box<dyn std::error::Error>> {
    info!("Updating job with monitor id {}", monitor_id);

    // create new job
    create_job(monitor_id.clone(), sched, registry).await?;

    let sched = match SCHED.get() {
        Some(sched) => sched,
        None => {
            return Err("Failed to get scheduler".into());
        }
    };

    let reg = match REGISTRY.get() {
        Some(reg) => reg,
        None => {
            return Err("Failed to get registry".into());
        }
    };

    let id = {
        let reg = reg.lock().await;
        match reg.iter().find(|jmd| jmd.monitor_id == monitor_id) {
            Some(jmd) => jmd.clone().id,
            None => return Err("Job not found".into()),
        }
    };

    let sched_lock = sched.lock().await;
    if let Err(e) = sched_lock.remove(&id).await {
        return Err(e.to_string().into());
    }

    reg.lock().await.retain(|job| job.id != id);

    info!("Deleted old job {}", id);

    Ok(())
}
