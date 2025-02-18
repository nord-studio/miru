use actix_web::{get, HttpResponse, Responder};

#[get("/")]
pub async fn hello_service() -> impl Responder {
    HttpResponse::Ok().body("Hello, World!")
}
