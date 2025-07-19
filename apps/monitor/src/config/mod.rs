mod watcher;

pub use watcher::start_watcher;

use crate::MIRU_CONFIG;
use log::warn;
use serde::Deserialize;
use std::fs;

// Email Config
#[derive(Deserialize, Default, Copy, Clone, Debug)]
pub struct MiruConfigEmail {
    pub enabled: bool,
    pub verification: bool,
}

// Incidents Config
#[derive(Deserialize, Default, Copy, Clone, Debug)]
pub struct MiruConfigIncident {
    pub auto: MiruConfigIncidentAuto,
}

#[derive(Deserialize, Default, Copy, Clone, Debug)]
pub struct MiruConfigIncidentAuto {
    pub enabled: bool,
    pub pings_threshold: u64,
}

// Storage Config
#[derive(Deserialize, Default, Copy, Clone, Debug)]
pub struct MiruConfigStorage {
    pub max_size: u64,
}

// User Config
#[derive(Deserialize, Default, Copy, Clone, Debug)]
pub struct MiruConfigUsers {
    pub delete_on_empty: bool,
}

// Workspace Config
#[derive(Deserialize, Default, Copy, Clone, Debug)]
pub struct MiruConfigWorkspace {
    pub creation: bool,
}

#[derive(Deserialize, Copy, Clone, Debug)]
pub struct MiruConfig {
    pub email: MiruConfigEmail,
    pub incidents: MiruConfigIncident,
    pub storage: MiruConfigStorage,
    pub users: MiruConfigUsers,
    pub workspace: MiruConfigWorkspace,
}

pub static DEFAULT_CONFIG: MiruConfig = MiruConfig {
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

pub fn read_config_from_file() -> MiruConfig {
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

pub fn get_config() -> MiruConfig {
    match MIRU_CONFIG.get() {
        Some(config) => match config.read() {
            Ok(config) => config.clone(),
            Err(_) => {
                warn!("Failed to read config, falling back to defaults");
                DEFAULT_CONFIG
            }
        },
        None => DEFAULT_CONFIG,
    }
}
