use crate::INCID_REGISTRY;
use actix_web::{get, HttpResponse, Responder};
use log::error;

#[get("/registry")]
// Return all data in incident registry
pub async fn registry_service() -> impl Responder {
    let sched = match INCID_REGISTRY.get() {
        Some(sched) => sched,
        None => {
            error!("Failed to get incident registry");
            return HttpResponse::InternalServerError().finish(); // Return a valid HttpResponse
        }
    };

    let incids = {
        let locked = sched.lock().await;
        locked.iter().cloned().collect::<Vec<_>>() // Collect into a Vec for serialization
    };

    match serde_json::to_value(&incids) {
        Ok(json_data) => HttpResponse::Ok().json(json_data),
        Err(e) => {
            error!("Failed to serialize incident registry: {}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}
