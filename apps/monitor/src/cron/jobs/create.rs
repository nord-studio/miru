use log::{error, info};
use std::sync::Arc;

use crate::{
    ping::{http_ping, tcp_ping},
    SCHED,
};

pub async fn create_job(
    url: String,
    r#type: String,
    interval: crate::cron::manager::Interval,
) -> Result<(), Box<dyn std::error::Error>> {
    info!(
        "Creating job for {} with type {} and interval {:?}",
        url, r#type, interval
    );
    let mut scheduler = match SCHED.get() {
        Some(s) => s.lock().await,
        None => return Err("Failed to get cron scheduler".into()),
    };

    let url = Arc::new(url);
    let r#type = Arc::new(r#type);

    scheduler.every(interval).run(move || {
        let url = Arc::clone(&url);
        let r#type = Arc::clone(&r#type);
        async move {
            match r#type.as_str() {
                "http" => match http_ping(url.to_string()).await {
                    Ok(result) => info!(
                        "Pinged {} at {} with status {} in {}ms",
                        url.to_string(),
                        chrono::Utc::now(),
                        result.status,
                        result.latency
                    ),
                    Err(e) => error!("Error: {:?}", e),
                },
                "tcp" => match tcp_ping(url.to_string()).await {
                    Ok(result) => info!(
                        "Pinged {} at {} with success {} in {}ms",
                        url.to_string(),
                        chrono::Utc::now(),
                        result.success,
                        result.latency
                    ),
                    Err(e) => error!("Error: {:?}", e),
                },
                _ => {
                    error!("Invalid monitor type: {}", r#type);
                }
            }
        }
    });

    Ok(())
}
