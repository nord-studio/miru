mod cron;
mod ping;
mod routes;

use std::{
    env,
    sync::{Arc, OnceLock},
};

use actix_cors::Cors;
use actix_web::{web, App, HttpServer};
use cron::{health::TrackedIncident, worker::JobMetadata};
use dotenvy::dotenv;
use log::info;
use monitor::{read_config, MiruConfig};
use once_cell::sync::Lazy;
use routes::{
    create_job_service, hello_service, not_found_service, ping_service, registry::registry_service,
    remove_job_service, test_service, update_job_service,
};
use sqlx::{postgres::PgPoolOptions, PgPool};
use tokio::sync::Mutex;
use tokio_cron_scheduler::JobScheduler;

pub static POOL: Lazy<PgPool> = Lazy::new(|| {
    let pool_config = PgPoolOptions::new();
    let url = match env::var("DATABASE_URL") {
        Ok(val) => val,
        Err(_) => panic!("Environment variable 'DATABASE_URL' not found"),
    };
    pool_config.connect_lazy(&url).unwrap()
});

pub static SCHED: OnceLock<Arc<Mutex<JobScheduler>>> = OnceLock::new();
pub static REGISTRY: OnceLock<Arc<Mutex<Vec<JobMetadata>>>> = OnceLock::new();
pub static INCID_REGISTRY: OnceLock<Arc<Mutex<Vec<TrackedIncident>>>> = OnceLock::new();
pub static MIRU_CONFIG: OnceLock<MiruConfig> = OnceLock::new();

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
    info!("Loading config...");

    let config = read_config();

    MIRU_CONFIG
        .set(config)
        .unwrap_or_else(|_| panic!("Failed to set config"));

    info!("Successfully loaded config.");
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
    cron::worker::start().await;
    cron::worker::load_jobs().await;

    // info!("Reading email templates...");
    // let transactional_path = "node_modules/@miru/transactional/out";
    // match std::fs::read_dir(transactional_path) {
    //     Ok(entries) => {
    //         for entry in entries {
    //             if let Ok(entry) = entry {
    //                 info!("Found template: {}", entry.path().display());
    //                 if entry.file_name().to_string_lossy() == "monitor-down.html" {
    //                     info!("Found monitor-down.html template, applying replacements");
    //                     let path = entry.path();
    //                     match std::fs::read_to_string(&path) {
    //                         Ok(content) => {
    //                             let modified_content = content
    //                                 .replace("monitorNames", "Website, API and Gateway")
    //                                 .replace("url", "https://tygr.dev");

    //                             if let Err(e) = std::fs::write(&path, modified_content) {
    //                                 info!("Error writing modified template: {}", e);
    //                             } else {
    //                                 info!("Successfully applied replacements to monitor-down.html");
    //                             }
    //                         }
    //                         Err(e) => {
    //                             info!("Error reading monitor-down.html template: {}", e);
    //                         }
    //                     }
    //                 }
    //             }
    //         }
    //     }
    //     Err(e) => {
    //         info!("Error reading email templates: {}", e);
    //     }
    // }

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
            .service(create_job_service)
            .service(remove_job_service)
            .service(update_job_service)
            .service(registry_service)
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
