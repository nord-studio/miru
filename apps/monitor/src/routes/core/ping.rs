use actix_web::{post, web, HttpResponse, Responder};
use log::error;
use monitor::generate_id;
use serde_json::json;
use sqlx::query;

use crate::{
    ping::{http_ping, tcp_ping},
    POOL,
};

#[post("/ping/{monitor_id}")]
pub async fn ping_service(path: web::Path<String>) -> impl Responder {
    let monitor_id = path.into_inner();

    let pool = POOL.clone();

    // check if the monitor exists
    let monitor = match query!("SELECT * FROM monitors WHERE id = $1", monitor_id)
        .fetch_one(&pool)
        .await
    {
        Ok(monitor) => monitor,
        Err(_) => return HttpResponse::NotFound().json(json!({ "error": "Monitor not found" })),
    };

    match monitor.r#type.as_str() {
        "http" => {
            let result = http_ping(monitor.url).await;
            match result {
                Ok(result) => {
                    let headers_json =
                        serde_json::to_value(result.headers).unwrap_or(serde_json::Value::Null);

                    let query = query!(
                            "INSERT INTO pings (id, monitor_id, type, success, status, latency, body, headers) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
                            generate_id(),
                            monitor_id.to_string(),
                            "http",
                            result.success,
                            result.status,
                            result.latency,
                            result.body,
                            headers_json
                        )
                        .execute(&pool)
                        .await;

                    match query {
                        Ok(_) => HttpResponse::Ok().finish(),
                        Err(e) => {
                            error!("Error inserting failed ping: {}", e.to_string());
                            HttpResponse::InternalServerError().json(
                                json!({ "error": "Failed to insert failed ping".to_string() }),
                            )
                        }
                    }
                }
                Err(err) => HttpResponse::InternalServerError().json(json!({ "error": err })),
            }
        }
        "tcp" => {
            let result = tcp_ping(monitor.url).await;
            match result {
                Ok(result) => {
                    let query = query!(
                            "INSERT INTO pings (id, monitor_id, type, success, latency) VALUES ($1, $2, $3, $4, $5)",
                            generate_id(),
                            monitor_id.to_string(),
                            "tcp",
                            result.success,
                            result.latency,
                        )
                        .execute(&pool)
                        .await;

                    match query {
                        Ok(_) => HttpResponse::Ok().finish(),
                        Err(e) => {
                            error!("Error inserting failed ping: {}", e.to_string());
                            HttpResponse::InternalServerError().json(
                                json!({ "error": "Failed to insert failed ping".to_string() }),
                            )
                        }
                    }
                }
                Err(err) => {
                    error!("Error inserting failed ping: {}", err.error);
                    HttpResponse::InternalServerError().json(json!({ "error": err }))
                }
            }
        }
        _ => HttpResponse::InternalServerError().finish(),
    }
}
