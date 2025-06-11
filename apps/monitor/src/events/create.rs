use std::{sync::Arc, time::Duration};

use chrono::{TimeZone, Utc};
use log::{error, info};
use sqlx::query;
use tokio::sync::MutexGuard;
use tokio_cron_scheduler::{Job, JobScheduler};
use uuid::Uuid;

use crate::{cron::worker::EventJobMetadata, POOL};

pub async fn create_job<'a>(
    event_id: String,
    sched: MutexGuard<'a, JobScheduler>,
    mut registry: MutexGuard<'a, Vec<EventJobMetadata>>,
) -> Result<Uuid, Box<dyn std::error::Error>> {
    info!("Creating event job with ID: {}", event_id);

    let pool = POOL.clone();

    let event = match query!("SELECT * FROM events WHERE id = $1", event_id)
        .fetch_one(&pool)
        .await
    {
        Ok(event) => event,
        Err(e) => {
            error!("Failed to fetch event: {}", e);
            return Err(Box::new(e));
        }
    };

    // Figure out the duration for the job by adding the duration to the start time and date
    let datetime_utc = Utc.from_utc_datetime(&event.started_at);
    let scheduled_time = datetime_utc + chrono::Duration::minutes(event.duration as i64);

    let now = Utc::now();
    let delay_duration = scheduled_time.signed_duration_since(now);

    info!(
        "Scheduled time: {}, Now: {}, Delay duration: {} seconds",
        scheduled_time,
        now,
        delay_duration.num_seconds()
    );

    if delay_duration < chrono::Duration::zero() {
        match query!("UPDATE events SET completed = true WHERE id = $1", event_id)
            .fetch_one(&pool)
            .await
        {
            Ok(_) => {
                return Err(format!(
                    "Event {} marked as completed due to scheduled time",
                    event_id
                )
                .into());
            }
            Err(e) => {
                error!("Failed to mark event as completed: {}", e);
                return Err(Box::new(e));
            }
        }
    }

    let duration = Duration::from_secs(delay_duration.num_seconds() as u64);

    let event_id_clone = Arc::new(event.id.clone());

    let job = match Job::new_one_shot_async(duration, move |_, _| {
        let event_id = Arc::clone(&event_id_clone);
        Box::pin({
            async move {
                info!("Marking event {} as completed", event_id);
                let pool = POOL.clone();
                let id = event_id.to_string();
                match query!("UPDATE events SET completed = true WHERE id = $1", id)
                    .execute(&pool)
                    .await
                {
                    Ok(_) => info!("Event {} marked as completed", event_id),
                    Err(e) => error!("Failed to mark event {} as completed: {}", event_id, e),
                }
            }
        })
    }) {
        Ok(job) => job,
        Err(e) => return Err(e.into()),
    };

    sched.add(job.clone()).await.unwrap();

    let job_id = job.guid();

    registry.push(EventJobMetadata {
        id: job_id,
        event_id: event_id.to_string(),
        created_at: std::time::SystemTime::now(),
    });

    Ok(Uuid::new_v4())
}
