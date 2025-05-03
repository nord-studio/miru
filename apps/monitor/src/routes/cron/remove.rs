use actix_web::{post, web, HttpResponse, Responder};
use log::info;
use serde_json::json;

use crate::{REGISTRY, SCHED};

#[post("/cron/remove/{monitor_id}")]
pub async fn remove_job_service(path: web::Path<String>) -> impl Responder {
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

    let id = {
        let reg = reg.lock().await;
        match reg.iter().find(|jmd| jmd.monitor_id == monitor_id) {
            Some(jmd) => jmd.clone().id,
            None => return HttpResponse::NotFound().json(json!({ "error": "Job not found" })),
        }
    };

    let sched_lock = sched.lock().await;
    if let Err(e) = sched_lock.remove(&id).await {
        return HttpResponse::InternalServerError().json(json!({ "error": e.to_string() }));
    }

    reg.lock().await.retain(|job| job.id != id);

    info!("Removed job {}", id);

    HttpResponse::Ok().json(json!({ "message": "Job removed" }))
}
