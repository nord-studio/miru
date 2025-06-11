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

    channels
        .into_iter()
        .map(|channel| {
            if let Some(url) = channel.url {
                Ok(url)
            } else {
                Err(format!(
                    "Discord channel with ID {} does not have a URL",
                    channel.id
                ))
            }
        })
        .collect()
}
