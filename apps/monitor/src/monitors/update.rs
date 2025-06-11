use log::info;
use sqlx::query;
use tokio::sync::MutexGuard;
use tokio_cron_scheduler::JobScheduler;

use crate::{monitors::create_job, MON_REGISTRY, POOL, SCHED};

use crate::cron::worker::MonitorJobMetadata;

pub async fn update_job(
    monitor_id: String,
    sched: MutexGuard<'_, JobScheduler>,
    registry: MutexGuard<'_, Vec<MonitorJobMetadata>>,
) -> Result<(), Box<dyn std::error::Error>> {
    info!("Updating job with monitor id {}", monitor_id);

    let pool = POOL.clone();

    let monitor = match query!("SELECT * FROM monitors WHERE id = $1", monitor_id)
        .fetch_one(&pool)
        .await
    {
        Ok(monitor) => monitor,
        Err(_) => return Err("Monitor not found".into()),
    };

    // create new job
    create_job(
        monitor_id.clone(),
        monitor.url,
        monitor.r#type,
        monitor.interval.to_string(),
        sched,
        registry,
    )
    .await?;

    let sched = match SCHED.get() {
        Some(sched) => sched,
        None => {
            return Err("Failed to get scheduler".into());
        }
    };

    let reg = match MON_REGISTRY.get() {
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
