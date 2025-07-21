use log::info;
use sqlx::query;
use tokio::sync::MutexGuard;
use tokio_cron_scheduler::JobScheduler;

use crate::{events, EVENT_REGISTRY, POOL, SCHED};

use crate::cron::worker::EventJobMetadata;

pub async fn update_job(
    event_id: String,
    sched: MutexGuard<'_, JobScheduler>,
    registry: MutexGuard<'_, Vec<EventJobMetadata>>,
) -> Result<(), Box<dyn std::error::Error>> {
    info!("Updating job with event id {event_id}");

    let pool = POOL.clone();

    let event = match query!("SELECT * FROM events WHERE id = $1", event_id)
        .fetch_one(&pool)
        .await
    {
        Ok(event) => event,
        Err(_) => return Err("Event not found".into()),
    };

    // create new job
    events::create_job(event.id, sched, registry).await?;

    let sched = match SCHED.get() {
        Some(sched) => sched,
        None => {
            return Err("Failed to get scheduler".into());
        }
    };

    let reg = match EVENT_REGISTRY.get() {
        Some(reg) => reg,
        None => {
            return Err("Failed to get event registry".into());
        }
    };

    let id = {
        let reg = reg.lock().await;
        match reg.iter().find(|jmd| jmd.event_id == event_id) {
            Some(jmd) => jmd.clone().id,
            None => return Err("Event job not found".into()),
        }
    };

    let sched_lock = sched.lock().await;
    if let Err(e) = sched_lock.remove(&id).await {
        return Err(e.to_string().into());
    }

    reg.lock().await.retain(|job| job.id != id);

    info!("Deleted old event job {id}");

    Ok(())
}
