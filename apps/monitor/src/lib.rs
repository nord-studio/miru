use std::fs;

use log::warn;
use rand::Rng;
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

#[derive(Deserialize)]
pub struct MiruConfigEmail {
    pub enabled: bool,
    pub verification: bool,
}

#[derive(Deserialize)]
pub struct MiruConfigIncident {
    pub auto: MiruConfigIncidentAuto,
}

#[derive(Deserialize)]
pub struct MiruConfigIncidentAuto {
    pub enabled: bool,
}

#[derive(Deserialize)]
pub struct MiruConfigStorage {
    pub max_size: u64,
}

#[derive(Deserialize)]
pub struct MiruConfig {
    pub email: MiruConfigEmail,
    pub incidents: MiruConfigIncident,
    pub storage: MiruConfigStorage,
}

pub fn read_config() -> MiruConfig {
    let default = MiruConfig {
        email: MiruConfigEmail {
            enabled: true,
            verification: true,
        },
        incidents: MiruConfigIncident {
            auto: MiruConfigIncidentAuto { enabled: true },
        },
        storage: MiruConfigStorage { max_size: 12582912 },
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
