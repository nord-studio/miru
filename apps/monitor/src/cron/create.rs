use std::sync::Arc;

use log::{error, info};
use monitor::generate_id;
use sqlx::query;
use tokio::sync::MutexGuard;
use tokio_cron_scheduler::{Job, JobScheduler};
use uuid::Uuid;

use crate::{
    cron::{
        self,
        health::{check_health, resolve_incident},
    },
    ping::{http_ping, tcp_ping},
    MIRU_CONFIG, POOL,
};

use super::worker::JobMetadata;

pub async fn create_job<'a>(
    monitor_id: String,
    url: String,
    r#type: String,
    interval: String,
    sched: MutexGuard<'a, JobScheduler>,
    mut registry: MutexGuard<'a, Vec<JobMetadata>>,
) -> Result<Uuid, Box<dyn std::error::Error>> {
    let interval = match interval.to_string().as_str() {
        "1" => cron::ONE_MINUTE_CRON.to_string(),
        "5" => cron::FIVE_MINUTE_CRON.to_string(),
        "10" => cron::TEN_MINUTE_CRON.to_string(),
        "30" => cron::THIRTY_MINUTE_CRON.to_string(),
        "60" => cron::ONE_HOUR_CRON.to_string(),
        _ => cron::TEN_MINUTE_CRON.to_string(),
    };

    info!(
        "Creating job for {} with type {} and schedule {:?}",
        url, r#type, interval
    );

    let url = Arc::new(url);
    let r#type = Arc::new(r#type);
    let monitor_id = Arc::new(monitor_id);
    let monitor_id_clone = monitor_id.clone();

    let job = match Job::new_async(interval.clone(), move |_, _| {
        let url = Arc::clone(&url);
        let r#type = Arc::clone(&r#type);
        let monitor_id = Arc::clone(&monitor_id);
        Box::pin({
            async move {
                let pool = POOL.clone();

                match r#type.as_str() {
                    "http" => {
                        let result = match http_ping(url.to_string()).await {
                            Ok(result) => {
                                info!(
                                    "Successfully pinged {} at {} with status {} in {}ms",
                                    url.to_string(),
                                    chrono::Utc::now(),
                                    result.status,
                                    result.latency
                                );

                                let config = match MIRU_CONFIG.get() {
                                    Some(config) => config,
                                    None => {
                                        error!("Failed to get config");
                                        return;
                                    }
                                };

                                if config.incidents.auto.enabled {
                                    resolve_incident(monitor_id.to_string()).await;
                                }

                                result
                            }
                            Err(e) => {
                                error!(
                                    "Failed to ping {} at {} with error {} in {}ms: {}",
                                    url.to_string(),
                                    chrono::Utc::now(),
                                    e.response.status,
                                    e.response.latency,
                                    e.error.to_string()
                                );

                                let query = query!(
                                    "INSERT INTO pings (id, monitor_id, type, success, status, latency, headers) VALUES ($1, $2, $3, $4, $5, $6, $7)",
                                    generate_id(),
                                    monitor_id.to_string(),
                                    "http",
                                    false,
                                    e.response.status,
                                    e.response.latency,
                                    serde_json::to_value(e.response.headers).unwrap_or(serde_json::Value::Null)
                                )
                                .execute(&pool)
                                .await;

                                if let Err(e) = query {
                                    error!("Error inserting failed ping: {}", e.to_string());
                                }

                                let config = match MIRU_CONFIG.get() {
                                    Some(config) => config,
                                    None => {
                                        error!("Failed to get config");
                                        return;
                                    }
                                };

                                if config.incidents.auto.enabled {
                                    check_health(monitor_id.to_string(), url.to_string()).await;
                                }

                                return;
                            }
                        };

                        let headers_json =
                            serde_json::to_value(result.headers).unwrap_or(serde_json::Value::Null);

                        let query = query!(
                            "INSERT INTO pings (id, monitor_id, type, success, status, latency, headers) VALUES ($1, $2, $3, $4, $5, $6, $7)",
                            generate_id(),
                            monitor_id.to_string(),
                            "http",
                            result.success,
                            result.status,
                            result.latency,
                            headers_json
                        )
                        .execute(&pool)
                        .await;

                        match query {
                            Ok(_) => {}
                            Err(e) => {
                                error!("Error inserting successful ping: {}", e.to_string());
                            }
                        }
                    }
                    "tcp" => {
                        let result = match tcp_ping(url.to_string()).await {
                            Ok(result) => {
                                info!(
                                    "Successfully pinged {} at {} with success {} in {}ms",
                                    url.to_string(),
                                    chrono::Utc::now(),
                                    result.success,
                                    result.latency
                                );

                                let config = match MIRU_CONFIG.get() {
                                    Some(config) => config,
                                    None => {
                                        error!("Failed to get config");
                                        return;
                                    }
                                };

                                if config.incidents.auto.enabled {
                                    resolve_incident(monitor_id.to_string()).await;
                                }

                                result
                            }
                            Err(e) => {
                                error!(
                                    "Failed to ping {} at {}: {}",
                                    url.to_string(),
                                    chrono::Utc::now(),
                                    e.error.to_string()
                                );

                                let query = query!(
                                    "INSERT INTO pings (id, monitor_id, type, success, latency) VALUES ($1, $2, $3, $4, $5)",
                                    generate_id(),
                                    monitor_id.to_string(),
                                    "tcp",
                                    e.response.success,
                                    e.response.latency
                                )
                                .execute(&pool)
                                .await;

                                if let Err(e) = query {
                                    error!("Error inserting failed ping: {}", e.to_string());
                                }

                                let config = match MIRU_CONFIG.get() {
                                    Some(config) => config,
                                    None => {
                                        error!("Failed to get config");
                                        return;
                                    }
                                };

                                if config.incidents.auto.enabled {
                                    check_health(monitor_id.to_string(), url.to_string()).await;
                                }

                                return;
                            }
                        };

                        let query = query!(
                            "INSERT INTO pings (id, monitor_id, type, success, latency) VALUES ($1, $2, $3, $4, $5)",
                            generate_id(),
                            monitor_id.to_string(),
                            "tcp",
                            result.success,
                            result.latency
                        ).execute(&pool).await;

                        match query {
                            Ok(_) => {}
                            Err(e) => {
                                error!("Error inserting ping: {}", e.to_string());
                            }
                        }
                    }
                    _ => {
                        error!("Unknown type: {}", r#type);
                    }
                }
            }
        })
    }) {
        Ok(job) => job,
        Err(e) => return Err(e.into()),
    };

    sched.add(job.clone()).await.unwrap();

    let job_id = job.guid();

    registry.push(JobMetadata {
        id: job_id,
        monitor_id: monitor_id_clone.to_string(),
        cron_expr: interval.to_owned(),
        created_at: std::time::SystemTime::now(),
    });

    Ok(job_id)
}
