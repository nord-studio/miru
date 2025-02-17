use log::info;

pub async fn remove_job(url: String) -> Result<(), Box<dyn std::error::Error>> {
    info!("Removing job for {}", url);

    Ok(())
}
