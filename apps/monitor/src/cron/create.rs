use std::sync::Arc;

use log::{error, info};
use sqlx::query;
use tokio::sync::MutexGuard;
use tokio_cron_scheduler::{Job, JobScheduler};
use uuid::Uuid;

use crate::{
    cron,
    ping::{http_ping, tcp_ping},
    POOL,
};

use super::worker::JobMetadata;

pub async fn create_job<'a>(
    monitor_id: String,
    sched: MutexGuard<'a, JobScheduler>,
    mut registry: MutexGuard<'a, Vec<JobMetadata>>,
) -> Result<Uuid, Box<dyn std::error::Error>> {
    let pool = POOL.clone();
    let monitor = match query!("SELECT * FROM monitors WHERE id = $1", monitor_id)
        .fetch_one(&pool)
        .await
    {
        Ok(monitor) => monitor,
        Err(_) => return Err("Monitor not found".into()),
    };

    let interval = match monitor.interval.to_string().as_str() {
        #[cfg(not(debug_assertions))]
        "1" => cron::ONE_MINUTE_CRON.to_string(),
        #[cfg(debug_assertions)]
        "1" => cron::THIRTY_SECONDS_CRON.to_string(),
        "5" => cron::FIVE_MINUTE_CRON.to_string(),
        "10" => cron::TEN_MINUTE_CRON.to_string(),
        "30" => cron::THIRTY_MINUTE_CRON.to_string(),
        "60" => cron::ONE_HOUR_CRON.to_string(),
        _ => cron::TEN_MINUTE_CRON.to_string(),
    };

    info!(
        "Creating job for {} with type {} that will run {:?}",
        monitor.url, monitor.r#type, interval
    );

    let url = Arc::new(monitor.url);
    let r#type = Arc::new(monitor.r#type);

    let job = Job::new_async(interval.clone(), move |_, _| {
        let url = Arc::clone(&url);
        let r#type = Arc::clone(&r#type);
        Box::pin(async move {
            match r#type.as_str() {
                "http" => match http_ping(url.to_string()).await {
                    Ok(result) => {
                        info!(
                            "Pinged {} at {} with status {} in {}ms",
                            url.to_string(),
                            chrono::Utc::now(),
                            result.status,
                            result.latency
                        )
                    }
                    Err(e) => {
                        error!("Error pinging {}: {:?}", url.to_string(), e)
                    }
                },
                "tcp" => match tcp_ping(url.to_string()).await {
                    Ok(result) => {
                        info!(
                            "Pinged {} at {} with success {} in {}ms",
                            url.to_string(),
                            chrono::Utc::now(),
                            result.success,
                            result.latency
                        )
                    }
                    Err(e) => {
                        error!("Error pinging {}: {:?}", url.to_string(), e)
                    }
                },
                _ => {
                    error!("Unknown type: {}", r#type);
                }
            }
        })
    })
    .unwrap();

    sched.add(job.clone()).await.unwrap();

    let job_id = job.guid();

    registry.push(JobMetadata {
        id: job_id,
        monitor_id,
        cron_expr: interval.to_owned(),
        created_at: std::time::SystemTime::now(),
    });

    Ok(job_id)
}
