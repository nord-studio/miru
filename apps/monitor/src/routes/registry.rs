use crate::INCID_REGISTRY;
use actix_web::{get, HttpResponse, Responder};
use log::error;
use serde_json::json;

#[get("/registry")]
pub async fn registry_service() -> impl Responder {
    let sched = match INCID_REGISTRY.get() {
        Some(sched) => sched,
        None => {
            error!("Failed to get incident registry");
            return HttpResponse::InternalServerError()
                .json(json!({"success": false, "error": "Failed to get incident registry"}));
        }
    };

    // return all the data in the registry
    let incid_registry = sched.lock().await;
    let mut data = Vec::new();
    for incident in incid_registry.iter() {
        data.push(incident.clone());
    }

    log::info!("{:?}", data);

    HttpResponse::Ok().json(json!({"success": true }))
}
