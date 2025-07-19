use futures::{
    channel::mpsc::{channel, Receiver},
    SinkExt, StreamExt,
};
use log::{error, info, warn};
use notify::{Config, Event, EventKind, RecommendedWatcher, RecursiveMode, Watcher};
use std::fs;
use std::{path::Path, sync::OnceLock};
use tokio::task::JoinHandle;

use crate::{
    config::{MiruConfig, DEFAULT_CONFIG},
    MIRU_CONFIG,
};

fn watcher() -> notify::Result<(RecommendedWatcher, Receiver<notify::Result<Event>>)> {
    let (mut tx, rx) = channel(1);

    let watcher = RecommendedWatcher::new(
        move |res| {
            futures::executor::block_on(async {
                tx.send(res).await.unwrap();
            })
        },
        Config::default(),
    )?;

    Ok((watcher, rx))
}

pub async fn watch<P: AsRef<Path>>(path: P) -> notify::Result<()> {
    let (mut watcher, mut rx) = watcher()?;

    watcher.watch(path.as_ref(), RecursiveMode::Recursive)?;

    while let Some(res) = rx.next().await {
        match res {
            Ok(event) => {
                // When the config.toml file is updated
                if event.kind
                    == EventKind::Modify(notify::event::ModifyKind::Data(
                        notify::event::DataChange::Content,
                    ))
                {
                    let file = event
                        .paths
                        .iter()
                        .find(|path| path.to_string_lossy().contains("config.toml"));

                    let contents = match fs::read_to_string(file.unwrap()) {
                        Ok(contents) => contents,
                        Err(_) => "Failed to read config file contents.".to_string(),
                    };

                    let config: MiruConfig = match toml::from_str(&contents) {
                        Ok(config) => config,
                        Err(_) => {
                            warn!("Failed to parse config file. Falling back to default config.");
                            DEFAULT_CONFIG
                        }
                    };

                    match MIRU_CONFIG.get() {
                        Some(rwlock) => match rwlock.try_write() {
                            Ok(mut write_guard) => {
                                *write_guard = config;
                                info!("Updated global Miru config")
                            }
                            Err(e) => {
                                error!("Failed to get write lock for global Miru config: {:?}", e)
                            }
                        },
                        None => {
                            todo!()
                        }
                    }
                }
            }
            Err(e) => println!("watch error: {:?}", e),
        }
    }

    Ok(())
}

pub static HANDLE: OnceLock<JoinHandle<()>> = OnceLock::new();

pub fn start_watcher() -> Result<(), String> {
    let path = match std::env::current_dir() {
        Ok(path) => path,
        Err(_) => {
            return Err("Failed to get the currect directory. We can't watch the config file so will fallback to defaults.".to_string())
        }
    };

    #[cfg(debug_assertions)]
    let config_path = path.join("../../config.toml");
    #[cfg(not(debug_assertions))]
    let config_path = path.join("./config.toml");

    let handle = tokio::spawn(async move {
        futures::executor::block_on(async {
            if let Err(e) = watch(config_path).await {
                println!("error: {:?}", e)
            }
        });
    });

    HANDLE
        .set(handle)
        .map_err(|_| error!("Failed to set handle for config watcher"))
        .ok();

    Ok(())
}
