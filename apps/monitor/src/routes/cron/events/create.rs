use actix_web::{post, web, HttpResponse, Responder};
use serde_json::json;
use sqlx::query;

use crate::{events, EVENT_REGISTRY, POOL, SCHED};

#[post("/cron/events/create/{event_id}")]
pub async fn create_event_job_service(path: web::Path<String>) -> impl Responder {
    let event_id = path.into_inner();

    let sched = match SCHED.get() {
        Some(sched) => sched,
        None => {
            return HttpResponse::InternalServerError().json(json!({
                "error": "Failed to get scheduler"
            }))
        }
    };

    let reg = match EVENT_REGISTRY.get() {
        Some(reg) => reg,
        None => {
            return HttpResponse::InternalServerError().json(json!({
                "error": "Failed to get event registry"
            }))
        }
    };

    let pool = POOL.clone();

    let event = match query!("SELECT * FROM events WHERE id = $1", event_id)
        .fetch_one(&pool)
        .await
    {
        Ok(event) => event,
        Err(_) => {
            return HttpResponse::NotFound().json(json!({
                "error": "Event not found"
            }))
        }
    };

    match events::create_job(
        event.id,
        sched.clone().lock().await,
        reg.clone().lock().await,
    )
    .await
    {
        Ok(_) => {}
        Err(e) => {
            return HttpResponse::InternalServerError().json(json!({
                "error": format!("Failed to create event job: {:?}", e)
            }))
        }
    }

    HttpResponse::Ok().json(json!({ "message": "Event job created" }))
}
