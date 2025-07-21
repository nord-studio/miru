use monitor::get_app_url;
use sqlx::query;

use crate::{
    email::send::TemplateOptions,
    monitors::health::{Incident, Workspace},
    POOL,
};

use super::get_url::get_discord_urls;

pub async fn send_discord(
    template: TemplateOptions,
    workspace: Workspace,
    incident: Incident,
) -> Result<(), String> {
    let pool = POOL.clone();
    let urls = get_discord_urls(workspace.id).await?;

    let monitors: String = match query!(
        "SELECT m.id AS monitor_id, m.name AS monitor_name, m.url AS monitor_url
        FROM monitors_to_incidents mti
        INNER JOIN monitors m ON mti.monitor_id = m.id
        WHERE mti.incident_id = $1",
        incident.id
    )
    .fetch_all(&pool)
    .await
    {
        Ok(mti) => {
            let mut monitor_names = String::new();
            for m in mti {
                monitor_names = format!("- {} ({})\n", m.monitor_name, m.monitor_url);
            }
            monitor_names
        }
        Err(e) => {
            return Err(format!("Failed to fetch monitors to incidents: {e}"));
        }
    };

    let app_url = get_app_url();

    let content = match template {
        TemplateOptions::AutoIncidentCreate => {
            let url = format!(
                "{}/admin/{}/incidents/{}",
                app_url, workspace.slug, incident.id
            );
            let formatted_content = format!("## Some monitors are down! \n\nAffected monitors: \n{}\n\nStarted: <t:{}:R>\nCurrently: {}\n\n[[View Incident]({})]", monitors, incident.started_at, "Investigating", url);
            formatted_content
        } // TemplateOptions::AutoIncidentMonitoring => "auto-incid-recovering".to_string(),
          // TemplateOptions::AutoIncidnetFailing => "auto-incid-failing".to_string(),
          // TemplateOptions::AutoIncidnetResolve => "auto-incid-resolve".to_string(),
    };

    let client = reqwest::Client::new();

    let body = serde_json::json!({
        "username": "Miru",
        "avatar_url": "https://i.imgur.com/CD6oLPo.png",
        "content": content
    });

    for url in urls {
        match client
            .post(&url)
            .body(
                serde_json::to_string(&body)
                    .map_err(|e| format!("Failed to serialize JSON body: {e}"))?,
            )
            .header("Content-Type", "application/json")
            .send()
            .await
        {
            Ok(response) => {
                if !response.status().is_success() {
                    return Err(format!(
                        "Failed to send Discord notification to {}: {}",
                        url,
                        response.status()
                    ));
                }
            }
            Err(_) => {
                return Err(format!("Failed to send Discord notification to {url}"));
            }
        }
    }
    Ok(())
}
