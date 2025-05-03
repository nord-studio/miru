use chrono::NaiveDateTime;
use log::error;
use monitor::generate_id;
use sqlx::query;

use crate::{INCID_REGISTRY, POOL};

#[derive(Debug, Clone)]
pub struct Incident {
    pub id: String,
    pub title: String,
    pub started_at: NaiveDateTime,
    pub acknowledged_at: Option<NaiveDateTime>,
    pub resolved_at: Option<NaiveDateTime>,
    pub auto_resolved: bool,
}

#[derive(Debug, Clone)]
pub struct TrackedIncident {
    pub monitor_id: String,
    pub incident: Incident,
}

/// Check the health of a monitor and create an incident if necessary.
/// This function checks the last two pings of a monitor and if both have failed,
/// it creates a new incident in the database and adds it to the incident registry.
pub async fn check_health(monitor_id: String, url: String) {
    let pool = POOL.clone();

    let sched = match INCID_REGISTRY.get() {
        Some(sched) => sched,
        None => {
            error!("Failed to get incident registry");
            return;
        }
    };

    // Check if this monitor is already being tracked
    let mut tracked = false;
    {
        let incid_registry = sched.lock().await;
        for incident in incid_registry.iter() {
            if incident.monitor_id == monitor_id {
                tracked = true;
                break;
            }
        }
    }

    if tracked {
        // If the monitor is already being tracked, we don't need to check again
        return;
    }

    // Get the last two pings and check if they have also failed
    let last_two_pings = query!(
        "SELECT * FROM pings WHERE monitor_id = $1 ORDER BY created_at DESC LIMIT 2",
        monitor_id.to_string()
    )
    .fetch_all(&pool)
    .await
    .unwrap_or_else(|_| vec![]);

    if last_two_pings.len() >= 2 {
        let last_ping = &last_two_pings[0];
        let second_last_ping = &last_two_pings[1];

        if last_ping.success == false && second_last_ping.success == false {
            // If both pings have failed, create a new incident
            let incid_query = query!(
                "INSERT INTO incidents (id, title) VALUES ($1, $2) RETURNING *",
                generate_id(),
                format!("{} is down", url.to_string())
            )
            .fetch_one(&pool)
            .await;

            let incident: Incident = match incid_query {
                Ok(incid) => Incident {
                    id: incid.id,
                    title: incid.title,
                    started_at: incid.started_at,
                    acknowledged_at: None,
                    resolved_at: None,
                    auto_resolved: false,
                },
                Err(e) => {
                    error!("Error creating incident: {}", e.to_string());
                    return;
                }
            };

            let incid_id = incident.clone().id;

            let mti_query = query!(
                "INSERT INTO monitors_to_incidents (monitor_id, incident_id) VALUES ($1, $2)",
                monitor_id.to_string(),
                incid_id.clone()
            )
            .execute(&pool)
            .await;

            if let Err(e) = mti_query {
                error!("Error linking monitor to incident: {}", e.to_string());
            }

            let report_query = query!(
                "INSERT INTO incident_reports (id, incident_id, message, status) VALUES ($1, $2, $3, $4)",
                generate_id(),
                incid_id.clone(),
                format!("It appears that {} is down. We are currently investigating this incident.", url.to_string()),
                "investigating"
            ).execute(&pool).await;

            if let Err(e) = report_query {
                error!("Error creating incident report: {}", e.to_string());
            }

            // Add the incident to the registry
            let mut incid_registry = sched.lock().await;
            incid_registry.push(TrackedIncident {
                monitor_id: monitor_id.clone(),
                incident: incident.clone(),
            });
        }
    }
}

pub async fn resolve_incident(monitor_id: String) {
    let pool = POOL.clone();

    // Find if the monitor is being tracked
    let sched = INCID_REGISTRY.get().unwrap();
    let mut tracked = false;
    let mut incident_id = String::new();
    {
        let incid_registry = sched.lock().await;
        for incident in incid_registry.iter() {
            if incident.monitor_id == monitor_id {
                tracked = true;
                incident_id = incident.incident.id.clone();
                break;
            }
        }
    }
    if !tracked {
        // If the monitor is not being tracked, we don't need to resolve anything
        return;
    }

    // Check if the incident is already resolved
    let incid_query = query!(
        "SELECT * FROM incidents WHERE id = $1",
        incident_id.to_string()
    )
    .fetch_one(&pool)
    .await;

    let incident: Incident = match incid_query {
        Ok(incid) => Incident {
            id: incid.id,
            title: incid.title,
            started_at: incid.started_at,
            acknowledged_at: incid.acknowledged_at,
            resolved_at: incid.resolved_at,
            auto_resolved: incid.auto_resolved,
        },
        Err(e) => {
            error!("Error fetching incident: {}", e.to_string());
            return;
        }
    };

    if incident.resolved_at.is_some() || incident.auto_resolved {
        // If the incident is already resolved, we don't need to resolve it again
        return;
    }

    // Get monitor info
    let monitor_query = query!(
        "SELECT * FROM monitors WHERE id = $1",
        monitor_id.to_string()
    )
    .fetch_one(&pool)
    .await;

    let monitor = match monitor_query {
        Ok(monitor) => monitor,
        Err(e) => {
            error!("Error fetching monitor: {}", e.to_string());
            return;
        }
    };

    // Create a new incident report
    let report_query =
        query!(
        "INSERT INTO incident_reports (id, incident_id, message, status) VALUES ($1, $2, $3, $4)",
        generate_id(),
        incident_id.clone(),
        format!("The incident has been resolved. {} is back online.", monitor.name),
        "resolved"
    )
        .execute(&pool)
        .await;

    if let Err(e) = report_query {
        error!("Error creating incident report: {}", e.to_string());
    }

    // Update the incident in the database
    let query = query!(
        "UPDATE incidents SET resolved_at = $1, auto_resolved = true WHERE id = $2",
        chrono::Utc::now().naive_utc(),
        incident_id.to_string()
    )
    .execute(&pool)
    .await;

    if let Err(e) = query {
        error!("Error resolving incident: {}", e.to_string());
    }

    // Remove the incident from the registry
    let sched = INCID_REGISTRY.get().unwrap();
    let mut incid_registry = sched.lock().await;
    incid_registry.retain(|incident| incident.incident.id != incident_id);
}
