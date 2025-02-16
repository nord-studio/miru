use std::time::Duration;

use log::{info, trace};
use tokio_cron_scheduler::{Job, JobSchedulerError};

use crate::SCHEDULER;

pub async fn start() -> Result<(), JobSchedulerError> {
    let sched = match SCHEDULER.get() {
        Some(s) => s,
        None => {
            return Err(JobSchedulerError::CantInit);
        }
    };

    trace!("Starting scheduler");
    tokio::task::spawn(async move {
        let _ = sched.start().await;
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

    // get all the jobs from the database, for now we just add a test job to simulate this
    let jj = Job::new_repeated(Duration::from_secs(10), |_uuid, _l| {
        info!("I run repeatedly every 10 seconds");
    })?;

    trace!("Adding job to scheduler");
    sched.add(jj).await?;

    Ok(())
}
