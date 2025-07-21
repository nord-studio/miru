use log::info;
use std::path::PathBuf;

/// This function reads all email templates from the transaction JS package and returns their paths.
pub async fn get_paths() -> Result<Vec<PathBuf>, ()> {
    info!("Reading all email templates...");
    let transactional_path = "node_modules/@miru/transactional/out/notifications";
    match std::fs::read_dir(transactional_path) {
        Ok(entries) => {
            let paths = entries
                .filter_map(Result::ok)
                .filter(|entry| entry.path().is_file())
                .map(|entry| entry.path())
                .collect::<Vec<_>>();

            Ok(paths)
        }
        Err(e) => {
            info!("Error reading email templates: {e}");
            Err(())
        }
    }
}

/// Find an email template by file name and returns the contents of the template as String.
pub async fn find_template(name: &str) -> Option<String> {
    let paths = get_paths().await;

    match paths {
        Ok(paths) => {
            for path in paths {
                if let Some(file_name) = path.file_name() {
                    if file_name.to_string_lossy().contains(name) {
                        info!("Found email template: {}", path.display());
                        match std::fs::read_to_string(&path) {
                            Ok(content) => {
                                return Some(content);
                            }
                            Err(e) => {
                                info!("Error reading email template {}: {}", path.display(), e);
                                return None;
                            }
                        }
                    }
                }
            }
            // If the loop completes, no template was found.
            info!("No email template found matching: {name}");
            None
        }
        Err(_) => {
            info!("Failed to retrieve email template paths.");
            None
        }
    }
}
