use crate::ping::{http_ping, tcp_ping};
use actix_web::{get, web, HttpResponse, Responder};
use log::error;
use serde_json::json;

#[get("/test/{type}/{url}")]
pub async fn test_service(path: web::Path<(String, String)>) -> impl Responder {
    let (req_type, url) = path.into_inner();

    match req_type.as_str() {
        "http" => {
            let result = http_ping(url).await;
            match result {
                Ok(result) => HttpResponse::Ok().json(json!({
                    "success": result.success,
                    "status": result.status,
                    "body": result.body,
                    "latency": result.latency,
                    "headers": result.headers,
                })),
                Err(err) => HttpResponse::InternalServerError().json(json!({ "error": err })),
            }
        }
        "tcp" => {
            let result = tcp_ping(url.clone()).await;
            match result {
                Ok(result) => HttpResponse::Ok().json(json!({
                    "success": result.success,
                    "latency": result.latency,
                })),
                Err(err) => {
                    error!("Error pinging {url}: {err:?}");
                    HttpResponse::InternalServerError().json(json!({ "error": err }))
                }
            }
        }
        _ => HttpResponse::BadRequest().body("Invalid type. Must be 'http' or 'tcp'".to_string()),
    }
}
