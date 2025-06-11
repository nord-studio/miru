use std::env;

use lettre::{
    transport::smtp::authentication::{Credentials, Mechanism},
    Message, SmtpTransport, Transport,
};
use log::info;

use crate::MIRU_CONFIG;

use super::paths::find_template;

pub enum TemplateOptions {
    AutoIncidentCreate = 1,
    // AutoIncidentMonitoring = 2,
    // AutoIncidnetFailing = 3,
    // AutoIncidnetResolve = 4,
}

pub async fn send_email(
    template: TemplateOptions,
    to: &str,
    replace_values: Option<serde_json::Value>,
) -> Result<(), String> {
    let config = MIRU_CONFIG.get().expect("Failed to get MIRU_CONFIG");

    // Find the template content based on the provided template option
    let template_name = match template {
        TemplateOptions::AutoIncidentCreate => "auto-incid-create",
        // TemplateOptions::AutoIncidentMonitoring => "auto-incid-recovering",
        // TemplateOptions::AutoIncidnetFailing => "auto-incid-failing",
        // TemplateOptions::AutoIncidnetResolve => "auto-incid-resolve",
    };

    if !config.email.enabled {
        return Err(format!(
            "Failed to send {} email. Emails are not enabled in this instance.",
            template_name,
        ));
    }

    let content = find_template(template_name).await;

    let host = match env::var("SMTP_HOST") {
        Ok(ip) => ip,
        Err(_) => {
            return Err("SMTP_HOST environment variable not set".to_string());
        }
    };

    let secure = match env::var("SMTP_SECURE") {
        Ok(secure) => secure,
        Err(_) => {
            return Err("SMTP_SECURE environment variable not set".to_string());
        }
    };

    let user = match env::var("SMTP_USER") {
        Ok(user) => user,
        Err(_) => {
            return Err("SMTP_USER environment variable not set".to_string());
        }
    };

    let password = match env::var("SMTP_PASSWORD") {
        Ok(password) => password,
        Err(_) => {
            return Err("SMTP_PASSWORD environment variable not set".to_string());
        }
    };

    let from = match env::var("SMTP_FROM") {
        Ok(ip) => ip,
        Err(_) => {
            return Err("SMTP_FROM environment variable not set".to_string());
        }
    };

    match content {
        Some(content) => {
            // For each key in the replace_values, use the key to replace a placeholder in the template with the value
            let mut email_content = content;
            if let Some(values) = replace_values {
                for (key, value) in values.as_object().unwrap_or(&serde_json::Map::new()).iter() {
                    let placeholder = format!("{}", key);
                    email_content =
                        email_content.replace(&placeholder, value.as_str().unwrap_or(""));
                }
            }

            let email = Message::builder()
                .from(format!("Miru <{}>", from).parse().unwrap())
                .to(to.parse().unwrap())
                .subject(match template {
                    TemplateOptions::AutoIncidentCreate => "Some monitors are down!",
                    // TemplateOptions::AutoIncidentMonitoring => "Some monitors are recovering",
                    // TemplateOptions::AutoIncidnetFailing => "Some monitors are failing",
                    // TemplateOptions::AutoIncidnetResolve => "Some monitors are back online",
                })
                .body(email_content)
                .unwrap();

            let creds = Credentials::new(user, password);
            let mailer = match secure.as_str() {
                "true" | "1" => {
                    let mailer = match SmtpTransport::relay(&host) {
                        Ok(mailer) => {
                            info!("Using SSL for SMTP transport");
                            mailer
                        }
                        Err(e) => {
                            return Err(format!("Failed to create SMTP transport: {}", e));
                        }
                    };

                    mailer
                }
                "false" | "0" | _ => {
                    let mailer = match SmtpTransport::starttls_relay(&host) {
                        Ok(mailer) => {
                            info!("Using STARTTLS for SMTP transport");
                            mailer
                        }
                        Err(e) => {
                            return Err(format!("Failed to create SMTP transport: {}", e));
                        }
                    };

                    mailer
                }
            };

            let mailer = mailer
                .credentials(creds)
                .authentication(vec![Mechanism::Plain])
                .build();

            match mailer.send(&email) {
                Ok(_) => {
                    log::info!("Email sent successfully to {}", to);
                }
                Err(e) => {
                    return Err(format!("Failed to send email: {}", e));
                }
            }

            Ok(())
        }
        None => Err(format!("Failed to find template for: {:?}", template_name)),
    }
}
