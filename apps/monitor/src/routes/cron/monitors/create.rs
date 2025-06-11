use actix_web::{post, web, HttpResponse, Responder};
use serde_json::json;
use sqlx::query;

use crate::{monitors, MON_REGISTRY, POOL, SCHED};

#[post("/cron/monitors/create/{monitor_id}")]
pub async fn create_monitor_job_service(path: web::Path<String>) -> impl Responder {
    let monitor_id = path.into_inner();

    let sched = match SCHED.get() {
        Some(sched) => sched,
        None => {
            return HttpResponse::InternalServerError().json(json!({
                "error": "Failed to get scheduler"
            }))
        }
    };

    let reg = match MON_REGISTRY.get() {
        Some(reg) => reg,
        None => {
            return HttpResponse::InternalServerError().json(json!({
                "error": "Failed to get monitor registry"
            }))
        }
    };

    let pool = POOL.clone();

    let monitor = match query!("SELECT * FROM monitors WHERE id = $1", monitor_id)
        .fetch_one(&pool)
        .await
    {
        Ok(monitor) => monitor,
        Err(_) => {
            return HttpResponse::NotFound().json(json!({
                "error": "Monitor not found"
            }))
        }
    };

    match monitors::create_job(
        monitor_id,
        monitor.url,
        monitor.r#type,
        monitor.interval.to_string(),
        sched.clone().lock().await,
        reg.clone().lock().await,
    )
    .await
    {
        Ok(_) => {}
        Err(e) => {
            return HttpResponse::InternalServerError().json(json!({
                "error": format!("Failed to create job: {:?}", e)
            }))
        }
    }

    HttpResponse::Ok().json(json!({ "message": "Job created" }))
}
