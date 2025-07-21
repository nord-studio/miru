use actix_web::{post, web, HttpResponse, Responder};
use log::info;
use serde::{Deserialize, Serialize};
use serde_json::json;

use crate::{MON_REGISTRY, SCHED};

#[derive(Serialize, Deserialize)]
struct MonitorRemovePayload {
    ids: Vec<String>,
}

#[post("/cron/monitors/remove")]
pub async fn remove_monitor_job_service(item: web::Json<MonitorRemovePayload>) -> impl Responder {
    let ids = &item.ids;

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

    for monitor_id in ids {
        let id = {
            let reg = reg.lock().await;
            match reg
                .iter()
                .find(|jmd| jmd.monitor_id == *monitor_id)
            {
                Some(jmd) => jmd.clone().id,
                None => return HttpResponse::NotFound().json(json!({ "error": "Job not found" })),
            }
        };

        let sched_lock = sched.lock().await;
        if let Err(e) = sched_lock.remove(&id).await {
            return HttpResponse::InternalServerError().json(json!({ "error": e.to_string() }));
        }

        reg.lock().await.retain(|job| job.id != id);

        info!("Removed job {id}");
    }

    HttpResponse::Ok().json(json!({ "message": "Job removed" }))
}
