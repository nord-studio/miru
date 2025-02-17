use std::sync::Arc;

use log::{error, info};
use tokio::sync::Mutex;
use tokio_cron_scheduler::{Job, JobScheduler};
use uuid::Uuid;

use crate::ping::{http_ping, tcp_ping};

use super::worker::JobMetadata;

pub async fn create_job(
    url: String,
    r#type: String,
    interval: String,
    sched: Arc<Mutex<JobScheduler>>,
    registry: Arc<Mutex<Vec<JobMetadata>>>,
) -> Result<Uuid, Box<dyn std::error::Error>> {
    info!(
        "Creating job for {} with type {} and interval {:?}",
        url, r#type, interval
    );

    let url = Arc::new(url);
    let r#type = Arc::new(r#type);

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

    let sched = sched.lock().await;
    sched.add(job.clone()).await.unwrap();

    let mut registry = registry.lock().await;
    let job_id = job.guid();

    registry.push(JobMetadata {
        id: job_id.clone(),
        cron_expr: interval,
        created_at: std::time::SystemTime::now(),
    });

    Ok(job_id)
}
