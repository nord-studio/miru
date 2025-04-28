use actix_web::{post, web, HttpResponse, Responder};
use serde_json::json;

use crate::{cron, REGISTRY, SCHED};

#[post("/cron/update/{monitor_id}")]
pub async fn update_job_service(path: web::Path<String>) -> impl Responder {
    let monitor_id = path.into_inner();

    let sched = match SCHED.get() {
        Some(sched) => sched,
        None => {
            return HttpResponse::InternalServerError().json(json!({
                "error": "Failed to get scheduler"
            }))
        }
    };

    let reg = match REGISTRY.get() {
        Some(reg) => reg,
        None => {
            return HttpResponse::InternalServerError().json(json!({
                "error": "Failed to get registry"
            }))
        }
    };

    match cron::update_job(
        monitor_id,
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

    HttpResponse::Ok().json(json!({ "message": "Job updated" }))
}
