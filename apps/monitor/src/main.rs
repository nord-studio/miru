mod cron;
mod email;
mod events;
mod monitors;
mod notifs;
mod ping;
mod routes;

use std::{
    env,
    sync::{Arc, OnceLock},
    thread,
    time::Duration,
};

use actix_cors::Cors;
use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use cron::worker::MonitorJobMetadata;
use dotenvy::dotenv;
use log::info;
use monitor::{read_config, MiruConfig};
use monitors::health::TrackedIncident;
use once_cell::sync::Lazy;
use routes::{
    core::registry_service, hello_service, not_found_service, ping_service, test_service,
};
use sqlx::{postgres::PgPoolOptions, PgPool};
use tokio::sync::Mutex;
use tokio_cron_scheduler::JobScheduler;

use crate::{
    cron::worker::EventJobMetadata,
    routes::{
        create_event_job_service, create_monitor_job_service,
        cron::events::update_event_job_service, remove_monitor_job_service,
        update_monitor_job_service,
    },
};

pub static POOL: Lazy<PgPool> = Lazy::new(|| {
    let pool_config = PgPoolOptions::new();
    let url = match env::var("DATABASE_URL") {
        Ok(val) => val,
        Err(_) => panic!("Environment variable 'DATABASE_URL' not found"),
    };
    pool_config.connect_lazy(&url).unwrap()
});

pub static SCHED: OnceLock<Arc<Mutex<JobScheduler>>> = OnceLock::new();
pub static MON_REGISTRY: OnceLock<Arc<Mutex<Vec<MonitorJobMetadata>>>> = OnceLock::new();
pub static EVENT_REGISTRY: OnceLock<Arc<Mutex<Vec<EventJobMetadata>>>> = OnceLock::new();
pub static INCID_REGISTRY: OnceLock<Arc<Mutex<Vec<TrackedIncident>>>> = OnceLock::new();
pub static MIRU_CONFIG: OnceLock<MiruConfig> = OnceLock::new();

// Kill the current process, hopefully Docker will restart it
async fn restart() -> impl Responder {
    // Spawn a thread to delay restart so we can return an HTTP response first
    thread::spawn(move || {
        // Give Actix some time to finish the response
        thread::sleep(Duration::from_secs(1));

        // Exit the current process
        std::process::exit(0);
    });

    HttpResponse::Ok().body("Killing current process...")
}

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
    info!("Loading cron jobs...");
    cron::worker::load_jobs().await;

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
            // Cron - Monitors
            .service(create_monitor_job_service)
            .service(remove_monitor_job_service)
            .service(update_monitor_job_service)
            // Cron - Events
            .service(create_event_job_service)
            .service(update_event_job_service)
            .service(registry_service)
            .route("/restart", web::get().to(restart))
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
