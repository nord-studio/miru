use actix_web::{get, HttpResponse, Responder};

use crate::config::get_config;

#[get("/config")]
pub async fn config_service() -> impl Responder {
    let config = get_config();

    HttpResponse::Ok().body(format!("{config:?}"))
}
