use actix_web::{post, web, HttpResponse, Responder};
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
            let result = match http_ping(monitor.url).await {
                Ok(result) => result,
                Err(e) => {
                    let query = query!(
                        "INSERT INTO pings (id, monitor_id, success, status, latency, headers) VALUES ($1, $2, $3, $4, $5, $6)",
                        generate_id(),
                        monitor_id,
                        false,
                        e.response.status,
                        e.response.latency,
                        serde_json::to_value(e.response.headers).unwrap_or(serde_json::Value::Null)
                    )
                    .execute(&pool)
                    .await;

                    match query {
                        Ok(_) => HttpResponse::Ok().finish(),
                        #[cfg(debug_assertions)]
                        Err(e) => HttpResponse::InternalServerError()
                            .json(json!({ "error": e.to_string() })),
                        #[cfg(not(debug_assertions))]
                        Err(e) => {
                            log::error!("Error pinging monitor: {}", e.to_string());
                            return HttpResponse::InternalServerError().json(
                                json!({ "error": "Something went wrong! Please try again." }),
                            );
                        }
                    };

                    #[cfg(debug_assertions)]
                    return HttpResponse::InternalServerError().json(json!({ "error": e.error }));
                    #[cfg(not(debug_assertions))]
                    return HttpResponse::InternalServerError().json(
                        json!({ "error": "Failed to ping the monitor. Is the URL correct?" }),
                    );
                }
            };

            let headers_json =
                serde_json::to_value(result.headers).unwrap_or(serde_json::Value::Null);

            let query = query!(
                "INSERT INTO pings (id, monitor_id, success, status, latency, headers) VALUES ($1, $2, $3, $4, $5, $6)",
                generate_id(),
                monitor_id,
                result.success,
                result.status,
                result.latency,
                headers_json
            )
            .execute(&pool)
            .await;

            match query {
                Ok(_) => HttpResponse::Ok().finish(),
                Err(e) => {
                    HttpResponse::InternalServerError().json(json!({ "error": e.to_string() }))
                }
            }
        }
        "tcp" => {
            let result = match tcp_ping(monitor.url).await {
                Ok(result) => result,
                Err(e) => {
                    return HttpResponse::InternalServerError().json(json!({ "error": e.error }))
                }
            };

            let query = query!(
                "INSERT INTO pings (id, monitor_id, success, latency) VALUES ($1, $2, $3, $4)",
                generate_id(),
                monitor_id,
                result.success,
                result.latency
            )
            .execute(&pool)
            .await;

            match query {
                Ok(_) => HttpResponse::Ok().finish(),
                Err(_) => HttpResponse::InternalServerError().finish(),
            }
        }
        _ => HttpResponse::InternalServerError().finish(),
    }
}
