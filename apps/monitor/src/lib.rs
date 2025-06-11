use std::fs;

use log::warn;
use rand::Rng;
use regex::Regex;
use serde::Deserialize;

pub fn generate_id() -> String {
    const CHARSET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const LENGTH: usize = 16;
    let mut rng = rand::rng();

    let id: String = (0..LENGTH)
        .map(|_| {
            let idx = rng.random_range(0..CHARSET.len());
            CHARSET[idx] as char
        })
        .collect();

    id
}

pub fn get_app_url() -> String {
    let domain = match std::env::var("APP_DOMAIN") {
        Ok(val) => val,
        Err(_) => "localhost:3000".to_string(),
    };

    let re = Regex::new(r"/^(?:https?:\/\/)?(?:www\.)?/i").unwrap();
    let domain = re.replace_all(&domain, "").to_string();

    let secure = match std::env::var("APP_ENV") {
        Ok(val) => val == "development",
        Err(_) => false,
    };

    let url = format!("{}://{}", if secure { "https" } else { "http" }, domain);
    url
}

#[derive(Deserialize, Default)]
pub struct MiruConfigEmail {
    pub enabled: bool,
    pub verification: bool,
}

#[derive(Deserialize, Default)]
pub struct MiruConfigIncident {
    pub auto: MiruConfigIncidentAuto,
}

#[derive(Deserialize, Default)]
pub struct MiruConfigIncidentAuto {
    pub enabled: bool,
    pub pings_threshold: u64,
}

#[derive(Deserialize, Default)]
pub struct MiruConfigStorage {
    pub max_size: u64,
}

#[derive(Deserialize)]
pub struct MiruConfig {
    pub email: MiruConfigEmail,
    pub incidents: MiruConfigIncident,
    pub storage: MiruConfigStorage,
    pub users: MiruConfigUsers,
    pub workspace: MiruConfigWorkspace,
}

#[derive(Deserialize, Default)]
pub struct MiruConfigUsers {
    pub delete_on_empty: bool,
}

#[derive(Deserialize, Default)]
pub struct MiruConfigWorkspace {
    pub creation: bool,
}

pub fn read_config() -> MiruConfig {
    let default = MiruConfig {
        email: MiruConfigEmail {
            enabled: true,
            verification: true,
        },
        incidents: MiruConfigIncident {
            auto: MiruConfigIncidentAuto {
                enabled: true,
                pings_threshold: 3,
            },
        },
        storage: MiruConfigStorage { max_size: 12582912 },
        users: MiruConfigUsers {
            delete_on_empty: true,
        },
        workspace: MiruConfigWorkspace { creation: true },
    };

    let path = match std::env::current_dir() {
        Ok(path) => path,
        Err(_) => {
            warn!("Failed to get current directory while trying to read config. Falling back to default config.");
            return default;
        }
    };

    #[cfg(debug_assertions)]
    let config_path = path.join("../../config.toml");
    #[cfg(not(debug_assertions))]
    let config_path = path.join("./config.toml");

    let contents = match fs::read_to_string(config_path) {
        Ok(contents) => contents,
        Err(_) => {
            warn!("Failed to read config file. Falling back to default config.");
            return default;
        }
    };

    let config: MiruConfig = match toml::from_str(&contents) {
        Ok(config) => config,
        Err(_) => {
            warn!("Failed to parse config file. Falling back to default config.");
            return default;
        }
    };

    return config;
}
