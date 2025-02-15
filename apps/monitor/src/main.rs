mod routes;

use actix_cors::Cors;
use actix_web::{App, HttpServer};
use dotenvy::dotenv;
use dotenvy_macro::dotenv;
use log::info;
use once_cell::sync::Lazy;
use routes::{hello::hello, test::test};
use sqlx::{sqlite::SqlitePoolOptions, SqlitePool};

pub static POOL: Lazy<SqlitePool> = Lazy::new(|| {
    let pool_config = SqlitePoolOptions::new();
    pool_config.connect_lazy(dotenv!("DATABASE_URL")).unwrap()
});

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenv().ok();

    pretty_env_logger::formatted_builder()
        .filter_level(log::LevelFilter::Info)
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

    match HttpServer::new(|| {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header();

        App::new().wrap(cors).service(hello).service(test)
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
    {
        Ok(_) => {
            info!("Shutting down...");
            Ok(())
        }
        Err(e) => Err(e.into()),
    }
}
