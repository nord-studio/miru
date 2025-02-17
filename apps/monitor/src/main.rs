mod cron;
mod ping;
mod routes;

use std::sync::OnceLock;

use actix_cors::Cors;
use actix_web::{web, App, HttpServer};
use cron::manager::AsyncScheduler;
use dotenvy::dotenv;
use dotenvy_macro::dotenv;
use log::info;
use once_cell::sync::Lazy;
use routes::{hello_service, not_found_service, ping_service, test_service};
use sqlx::{postgres::PgPoolOptions, PgPool};
use tokio::sync::Mutex;

pub static POOL: Lazy<PgPool> = Lazy::new(|| {
    let pool_config = PgPoolOptions::new();
    pool_config.connect_lazy(dotenv!("DATABASE_URL")).unwrap()
});

pub static SCHED: OnceLock<Mutex<AsyncScheduler>> = OnceLock::new();

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenv().ok();

    pretty_env_logger::formatted_builder()
        .filter_level(
            std::env::var("RUST_LOG")
                .unwrap_or_else(|_| "info".to_string())
                .parse()
                .unwrap(),
        )
        .init();

    info!("Starting monitor...");
    info!("Connecting to database...");

    let pool = POOL.clone();

    let query = sqlx::query("SELECT 1")
        .fetch_one(&pool)
        .await
        .map(|_| info!("Connected to database."));

    if let Err(e) = query {
        return Err(e.into());
    }

    info!("Starting cron worker...");
    cron::jobs::worker::init().await.map_err(|e| e)?;
    cron::jobs::worker::load_jobs().await.map_err(|e| e)?;
    cron::jobs::worker::start().await.map_err(|e| e)?;

    info!("Starting server...");
    match HttpServer::new(|| {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header();

        App::new()
            .wrap(cors)
            .service(hello_service)
            .service(test_service)
            .service(ping_service)
            .default_service(web::to(not_found_service))
    })
    .bind(("0.0.0.0", 8080))?
    .run()
    .await
    {
        Ok(_) => Ok(()),
        Err(e) => Err(e.into()),
    }
}
