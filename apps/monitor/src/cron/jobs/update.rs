use log::info;

use crate::cron::manager::Interval;

pub async fn update_job(
    url: String,
    r#type: String,
    interval: Interval,
) -> Result<(), Box<dyn std::error::Error>> {
    info!(
        "Updating job for {} with type {} and interval {:?}",
        url, r#type, interval
    );

    Ok(())
}
