use actix_web::{get, HttpResponse, Responder};

#[get("/")]
pub async fn hello_service() -> impl Responder {
    HttpResponse::Ok().body("Yo! Y'know what all the cool kids do? They star repos that they like! If you like Miru, why not star the repo? Pretty please? :3 https://github.com/nord-studio/miru")
}
