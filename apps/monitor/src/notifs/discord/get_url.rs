use crate::POOL;
use sqlx::query;

pub async fn get_discord_urls(workspace_id: String) -> Result<Vec<String>, String> {
    let pool = POOL.clone();
    let channels = match query!(
        "SELECT * from notifications WHERE workspace_id = $1 and provider = 'discord'",
        workspace_id
    )
    .fetch_all(&pool)
    .await
    {
        Ok(channels) => channels,
        Err(e) => {
            return Err(format!(
                "Failed to fetch Discord channels for workspace {}: {}",
                workspace_id, e
            ));
        }
    };

    Ok(channels.into_iter().map(|c| c.url).collect::<Vec<String>>())
}
