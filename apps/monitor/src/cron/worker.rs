use thiserror::Error;
use tokio::{sync::Mutex, task::JoinError};

use log::{info, trace};
use tokio_cron_scheduler::{
    Job, JobScheduler, JobSchedulerError, PostgresMetadataStore, PostgresNotificationStore,
    PostgresStore, SimpleJobCode, SimpleNotificationCode,
};

use crate::SCHEDULER;

#[derive(Error, Debug)]
pub enum SchedulerError {
    #[error("Failed to set scheduler")]
    SetFailed,
    #[error("Failed to start worker: {0}")]
    WorkerStartFailed(#[from] JoinError), // Assuming worker start returns JoinError
    #[error("Failed to load jobs: {0}")]
    LoadJobsFailed(String), // Replace String with actual error type if known
}

pub async fn init() -> Result<(), SchedulerError> {
    trace!("Initializing scheduler");
    trace!("Database URL: {:?}", std::env::var("DATABASE_URL"));
    let url = std::env::var("DATABASE_URL")
        .map(Some)
        .unwrap_or_default()
        .unwrap_or_else(|| {
            let db_host =
                std::env::var("DATABASE_HOST").unwrap_or_else(|_| "localhost".to_string());
            let port = std::env::var("DATABASE_PORT").unwrap_or_else(|_| "5432".to_string());
            let dbname = std::env::var("DATABASE_DB").unwrap_or_else(|_| "iris".to_string());
            let username =
                std::env::var("DATABASE_USERNAME").unwrap_or_else(|_| "iris".to_string());
            let password = std::env::var("DATABASE_PASSWORD")
                .map(Some)
                .unwrap_or_default();
            let application_name = std::env::var("DATABASE_APP_NAME")
                .map(Some)
                .unwrap_or_default();

            "".to_string()
                + "host="
                + &*db_host
                + " port="
                + &*port
                + " dbname="
                + &*dbname
                + " user="
                + &*username
                + &*match password {
                    Some(password) => " password=".to_string() + &*password,
                    None => "".to_string(),
                }
                + &*match application_name {
                    Some(application_name) => " application_name=".to_string() + &*application_name,
                    None => "".to_string(),
                }
        });
    let pg_store = PostgresStore::Created(url);
    let metadata_storage = Box::new(PostgresMetadataStore {
        store: std::sync::Arc::new(tokio::sync::RwLock::new(pg_store.clone())),
        init_tables: true,
        table: "monitor_jobs".to_string(),
        ..Default::default()
    });
    let notification_storage = Box::new(PostgresNotificationStore {
        store: std::sync::Arc::new(tokio::sync::RwLock::new(pg_store.clone())),
        init_tables: true,
        table: "monitor_notifications".to_string(),
        states_table: "monitor_notification_states".to_string(),
        ..Default::default()
    });

    let simple_job_code = Box::new(SimpleJobCode::default());
    let simple_notification_code = Box::new(SimpleNotificationCode::default());

    let mut sched = JobScheduler::new_with_storage_and_code(
        metadata_storage,
        notification_storage,
        simple_job_code,
        simple_notification_code,
        200,
    )
    .await
    .map_err(|e| SchedulerError::LoadJobsFailed(e.to_string()))?;

    // Add code to be run during/after shutdown
    sched.set_shutdown_handler(Box::new(|| {
        Box::pin(async move {
            info!("Shutting down scheduler");
        })
    }));

    let s = Mutex::new(sched);

    SCHEDULER.set(s).map_err(|_| SchedulerError::SetFailed)?;

    Ok(())
}

pub async fn start() -> Result<(), JobSchedulerError> {
    let sched = match SCHEDULER.get() {
        Some(s) => s,
        None => {
            return Err(JobSchedulerError::CantInit);
        }
    };

    trace!("Starting scheduler");
    tokio::task::spawn(async move {
        let _ = sched.lock().await.start().await;
    });

    Ok(())
}

pub async fn load_jobs() -> Result<(), JobSchedulerError> {
    let sched = match SCHEDULER.get() {
        Some(s) => s,
        None => {
            return Err(JobSchedulerError::CantInit);
        }
    };

    let s = sched.lock().await;
    // get all the jobs from the database, for now we just add a test job to simulate this
    let mut five_s_job = Job::new("1/5 * * * * *", |uuid, _l| {
        info!(
            "{:?} I run every 5 seconds id {:?}",
            chrono::Utc::now(),
            uuid
        );
    })
    .unwrap();

    // Adding a job notification without it being added to the scheduler will automatically add it to
    // the job store, but with stopped marking
    five_s_job
        .on_removed_notification_add(
            &s,
            Box::new(|job_id, notification_id, type_of_notification| {
                Box::pin(async move {
                    info!(
                        "5s Job {:?} was removed, notification {:?} ran ({:?})",
                        job_id, notification_id, type_of_notification
                    );
                })
            }),
        )
        .await?;
    let five_s_job_guid = five_s_job.guid();
    info!("Adding job {:?}", five_s_job_guid);
    s.add(five_s_job).await?;

    Ok(())
}
