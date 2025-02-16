use actix_web::{HttpResponse, Responder};

pub async fn not_found_service() -> impl Responder {
    HttpResponse::NotFound().body("Awh man, we couldn't find anything on this route...\nWhile you're here, why not star the repo? Pretty please?\n\nhttps://github.com/nord-studio/iris")
}
