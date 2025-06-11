use chrono::NaiveDateTime;
use log::{error, info};
use monitor::{generate_id, get_app_url};
use serde::Serialize;
use sqlx::query;
use tokio::sync::MutexGuard;

use crate::{
    email::send::send_email, notifs::discord::send::send_discord, INCID_REGISTRY, MIRU_CONFIG, POOL,
};

#[derive(Debug, Clone, Default, Serialize)]
pub struct Incident {
    pub id: String,
    pub title: String,
    pub started_at: NaiveDateTime,
    pub acknowledged_at: Option<NaiveDateTime>,
    pub resolved_at: Option<NaiveDateTime>,
    pub auto_resolved: bool,
}

#[derive(Debug, Clone, Default)]
pub struct Workspace {
    pub id: String,
    pub slug: String,
}

#[derive(Debug, Clone, Default, Serialize)]
pub struct TrackedIncident {
    pub monitor_id: String,
    pub incident: Incident,
    pub success: u32,
    pub monitoring_created: bool,
    pub investigating_created: bool,
}

/// Check the health of a monitor and create an incident if necessary.
/// This function checks the last few (threshold) pings of a monitor and if all have failed,
/// it creates a new incident in the database and adds it to the incident registry.
pub async fn check_health(monitor_id: String, url: String) {
    let pool = POOL.clone();
    let config = match MIRU_CONFIG.get() {
        Some(config) => config,
        None => {
            error!("Failed to get Miru config");
            return;
        }
    };

    let sched = match INCID_REGISTRY.get() {
        Some(sched) => sched,
        None => {
            error!("Failed to get incident registry");
            return;
        }
    };

    let tracked_incid = {
        let locked = sched.lock().await;
        locked
            .iter()
            .find(|inc| inc.monitor_id == monitor_id)
            .cloned()
    };

    let monitor = match query!(
        "SELECT * FROM monitors WHERE id = $1",
        monitor_id.to_string()
    )
    .fetch_one(&pool)
    .await
    {
        Ok(monitor) => monitor,
        Err(e) => {
            error!("Error fetching monitor: {}", e.to_string());
            return;
        }
    };

    if let Some(tracked_incid) = &tracked_incid {
        // If the recovering monitor fails again, reset the success count and create investigating report
        if !tracked_incid.investigating_created
            && tracked_incid.monitoring_created
            && tracked_incid.success != 0
        {
            let report_query = query!(
                    "INSERT INTO incident_reports (id, incident_id, message, status) VALUES ($1, $2, $3, $4)",
                    generate_id(),
                    tracked_incid.incident.id.to_string(),
                    format!("{} is failing to ping again. We're looking into this now.", monitor.name.to_string()),
                    "investigating"
                )
                .execute(&pool)
                .await;

            if let Err(e) = report_query {
                error!("Error creating incident report: {}", e.to_string());
            }

            // Reset the success count
            let mut incid_registry = sched.lock().await;
            for tracked in incid_registry.iter_mut() {
                if tracked.incident.id == tracked_incid.incident.id {
                    tracked.success = 0;
                    tracked.investigating_created = true;
                }
            }

            // Sync the registry with the database
            sync_registry(incid_registry).await;
            return;
        } else {
            return;
        }
    };

    // Get the pings_threshold amount of pings and check if they have also failed
    let threshold_pings = match query!(
        "SELECT * FROM pings WHERE monitor_id = $1 ORDER BY created_at DESC LIMIT $2",
        monitor_id.to_string(),
        config.incidents.auto.pings_threshold as i64
    )
    .fetch_all(&pool)
    .await
    {
        Ok(pings) => pings,
        Err(e) => {
            error!("Error fetching pings: {}", e.to_string());
            return;
        }
    };

    if threshold_pings.len() < config.incidents.auto.pings_threshold as usize {
        // If we don't have enough pings, we can't create an incident
        return;
    }

    let last_threshold_pings = threshold_pings
        .iter()
        .take((config.incidents.auto.pings_threshold) as usize)
        .collect::<Vec<_>>();

    if last_threshold_pings
        .iter()
        .all(|ping| ping.success == false)
    {
        // If all previous pings have failed, create a new incident
        let incid_query = query!(
            "INSERT INTO incidents (id, title) VALUES ($1, $2) RETURNING *",
            generate_id(),
            // TODO: Use custom message from config
            format!("{} is down", monitor.name.to_string())
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
            success: 0,
            monitoring_created: false,
            investigating_created: false,
        });

        // Sync the registry with the database
        sync_registry(incid_registry).await;

        // Get all workspace member emails to send notifications
        let workspace_user_ids = match query!(
            "SELECT user_id FROM workspace_members WHERE workspace_id = $1",
            monitor.workspace_id
        )
        .fetch_all(&pool)
        .await
        {
            Ok(ids) => ids.into_iter().map(|id| id.user_id).collect::<Vec<_>>(),
            Err(e) => {
                error!("Error fetching workspace members: {}", e.to_string());
                return;
            }
        };

        // Get the emails of the users
        let emails = match query!(
            "SELECT email FROM public.user WHERE id = ANY($1) AND email_verified = true",
            &workspace_user_ids
        )
        .fetch_all(&pool)
        .await
        {
            Ok(emails) => emails
                .into_iter()
                .map(|email| email.email)
                .collect::<Vec<_>>(),
            Err(e) => {
                error!("Error fetching user emails: {}", e.to_string());
                return;
            }
        };

        let app_url = get_app_url();

        let workspace: Workspace = match query!(
            "SELECT * FROM workspaces WHERE id = $1",
            monitor.workspace_id
        )
        .fetch_one(&pool)
        .await
        {
            Ok(workspace) => Workspace {
                id: workspace.id,
                slug: workspace.slug,
            },
            Err(e) => {
                error!("Error fetching workspace: {}", e.to_string());
                return;
            }
        };

        // Send `auto-incid-create` email and notification
        for email in emails.iter() {
            match send_email(
                crate::email::send::TemplateOptions::AutoIncidentCreate,
                email,
                Some(serde_json::json!({
                    "monitorNames": monitor.name,
                    "url": format!("{}/admin/{}/incidents/{}", app_url, workspace.slug, incident.id)
                })),
            )
            .await
            {
                Ok(_) => info!("Sent incident creation email to {}", email),
                Err(e) => error!("{}", e),
            }
        }

        // Send `auto-incid-create` Discord notifications if any
        match send_discord(
            crate::email::send::TemplateOptions::AutoIncidentCreate,
            workspace,
            incident.clone(),
        )
        .await
        {
            Ok(_) => info!("Sent incident creation Discord notification(s)"),
            Err(e) => error!("Failed to send Discord notification(s): {}", e),
        }
    }
}

/// Run a check when a ping is successful to see if there are any tracked incidents in the registry related to that monitor.
/// If this is the first successful ping after an incident, create a `monitoring` report
/// If this isn't the first successful ping, increase the `success` count by 1 and do nothing
/// Check if `success` is equals to `pings_threshold` and if so, resolve the incident
pub async fn resolve_incident(monitor_id: String) {
    let pool = POOL.clone();
    let config = match MIRU_CONFIG.get() {
        Some(config) => config,
        None => {
            error!("Failed to get Miru config");
            return;
        }
    };

    // Find if the monitor is being tracked
    let sched = INCID_REGISTRY.get().unwrap();

    // Get the TrackedIncident from the registry
    let tracked_incid = {
        let incid_registry = sched.lock().await;
        incid_registry
            .iter()
            .find(|inc| inc.monitor_id == monitor_id)
            .cloned()
    };

    let tracked_incid = match tracked_incid {
        Some(inc) => inc,
        None => {
            // If the monitor is not being tracked, we don't need to resolve anything
            return;
        }
    };

    // Check if the incident is already resolved
    let incid_query = query!(
        "SELECT * FROM incidents WHERE id = $1",
        tracked_incid.incident.id.to_string()
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

    // If the incident is already resolved, we don't need to resolve it again. Remove from registry.
    if incident.resolved_at.is_some() || incident.auto_resolved {
        let sched = INCID_REGISTRY.get().unwrap();
        let mut incid_registry = sched.lock().await;
        incid_registry.retain(|inc| inc.incident.id != tracked_incid.incident.id);

        // Sync the registry with the database
        sync_registry(incid_registry).await;
        return;
    }

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

    // This is the culprit for the missing tracked_monitor issue
    if tracked_incid.success >= 1 {
        // If the incident is already being tracked and the success count is greater than 0,
        // just increase the success count and continue
        let sched = INCID_REGISTRY.get().unwrap();
        let mut incid_registry = sched.lock().await;
        for tracked in incid_registry.iter_mut() {
            if tracked.incident.id == incident.id {
                tracked.success += 1;
            }
        }
    } else {
        if tracked_incid.monitoring_created == false {
            // This is the first successful ping after an incident, so we need to create a monitoring report
            let report_query = query!(
                "INSERT INTO incident_reports (id, incident_id, message, status) VALUES ($1, $2, $3, $4)",
                generate_id(),
                incident.id.to_string(),
                format!("{} is back online. Monitoring for stability.", monitor.name.to_string()),
                "monitoring"
            );
            let report_query = report_query.execute(&pool).await;

            if let Err(e) = report_query {
                error!("Error creating incident report: {}", e.to_string());
            }
        }

        // Increase the success count
        let sched = INCID_REGISTRY.get().unwrap();
        let mut incid_registry = sched.lock().await;
        for tracked in incid_registry.iter_mut() {
            if tracked.incident.id == incident.id {
                tracked.success += 1;
            }
        }

        // Sync the registry with the database
        sync_registry(incid_registry).await;
    }

    // the culprit for the missing tracked_monitor issue
    info!("Success count: {}", tracked_incid.success);

    if tracked_incid.success == config.incidents.auto.pings_threshold as u32 {
        // If we have reached the pings threshold, we can resolve the incident

        // Create a new incident report
        let report_query = query!(
        "INSERT INTO incident_reports (id, incident_id, message, status) VALUES ($1, $2, $3, $4)",
        generate_id(),
        tracked_incid.incident.id.clone(),
        format!("The incident has been resolved. {} is back online.", monitor.name),
        "resolved"
    )
        .execute(&pool)
        .await;

        if let Err(e) = report_query {
            error!("Error creating incident report: {}", e.to_string());
        }

        // Update the incident in the database
        if let Err(e) = query!(
            "UPDATE incidents SET resolved_at = $1, auto_resolved = true WHERE id = $2",
            chrono::Utc::now().naive_utc(),
            tracked_incid.incident.id.to_string()
        )
        .execute(&pool)
        .await
        {
            error!("Error resolving incident: {}", e.to_string());
        }

        // Remove the incident from the registry
        let sched = INCID_REGISTRY.get().unwrap();
        let mut incid_registry = sched.lock().await;
        incid_registry.retain(|incident| incident.incident.id != tracked_incid.incident.id);

        // Sync the registry with the database
        sync_registry(incid_registry).await;
    }
}

/// Sync the registry with the database.
pub async fn sync_registry(registry: MutexGuard<'_, Vec<TrackedIncident>>) {
    let pool = POOL.clone();

    let mut tracked_incidents: Vec<TrackedIncident> = vec![];

    for incident in registry.iter() {
        tracked_incidents.push(incident.clone());
    }

    // Get all incidents from the database and check if they are already in the database
    let db_incidents = match query!("SELECT id FROM tracked_incidents")
        .fetch_all(&pool)
        .await
    {
        Ok(incidents) => incidents,
        Err(e) => {
            error!("Error fetching tracked incidents from the database: {}", e);
            return;
        }
    };

    let mut db_incidents_ids = vec![];

    for incident in db_incidents.iter() {
        db_incidents_ids.push(incident.id.clone());
    }

    tracked_incidents.retain(|incident| !db_incidents_ids.contains(&incident.incident.id));

    // Insert any new incidents into the database
    for incident in tracked_incidents.iter() {
        let query = query!(
            "INSERT INTO tracked_incidents (monitor_id, id, title, started_at, acknowledged_at, resolved_at, auto_resolved, success, monitoring_created, investigating_created) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
            incident.monitor_id.to_string(),
            incident.incident.id.to_string(),
            incident.incident.title.to_string(),
            incident.incident.started_at,
            incident.incident.acknowledged_at,
            incident.incident.resolved_at,
            incident.incident.auto_resolved,
            incident.success as i32,
            incident.monitoring_created as bool,
            incident.investigating_created as bool
        )
        .execute(&pool)
        .await;

        if let Err(e) = query {
            error!("Error syncing registry: {}", e.to_string());
        }
    }

    // Remove any incidents from the database that are no longer in the registry
    for incident in db_incidents.iter() {
        let mut found = false;
        for tracked_incident in tracked_incidents.iter() {
            if tracked_incident.incident.id == incident.id {
                found = true;
                break;
            }
        }

        if !found {
            let query = query!(
                "DELETE FROM tracked_incidents WHERE id = $1",
                incident.id.to_string()
            )
            .execute(&pool)
            .await;

            if let Err(e) = query {
                error!("Error removing incident from registry: {}", e.to_string());
            }
        }
    }
}

/// Loads all tracked incidents from the database and adds them to the registry.
pub async fn load_registry() {
    let pool = POOL.clone();

    let sched = match INCID_REGISTRY.get() {
        Some(sched) => sched,
        None => {
            error!("Failed to get incident registry");
            return;
        }
    };
    let mut incid_registry = sched.lock().await;

    // Get all incidents from the database
    let mut tracked_incids = match query!("SELECT * FROM tracked_incidents")
        .fetch_all(&pool)
        .await
    {
        Ok(incidents) => incidents,
        Err(e) => {
            error!("Error fetching tracked incidents: {}", e.to_string());
            return;
        }
    };

    // Do some cleaning up anc check if the incidents ACTUALLY exist in the database
    let incidents = match query!(
        "SELECT id FROM incidents WHERE id = ANY($1)",
        &tracked_incids
            .iter()
            .map(|inc| inc.id.clone())
            .collect::<Vec<String>>()
    )
    .fetch_all(&pool)
    .await
    {
        Ok(incidents) => incidents,
        Err(e) => {
            error!("Error fetching incidents: {}", e.to_string());
            return;
        }
    };

    info!(
        "Loaded {} tracked incidents from the database",
        incidents.len()
    );

    let incident_ids: Vec<String> = incidents
        .iter()
        .map(|incident| incident.id.clone())
        .collect();

    if incident_ids.is_empty() {
        return;
    }

    tracked_incids.retain(|incident| {
        let is_valid = incident_ids.contains(&incident.id);
        if !is_valid {
            info!("Filtered out invalid incident: {}", incident.id);
        }
        is_valid
    });

    for incident in tracked_incids.iter() {
        incid_registry.push(TrackedIncident {
            monitor_id: incident.monitor_id.to_string(),
            incident: Incident {
                id: incident.id.to_string(),
                title: incident.title.to_string(),
                started_at: incident.started_at,
                acknowledged_at: incident.acknowledged_at,
                resolved_at: incident.resolved_at,
                auto_resolved: incident.auto_resolved,
            },
            success: incident.success as u32,
            monitoring_created: incident.monitoring_created,
            investigating_created: incident.investigating_created,
        });
    }
}
