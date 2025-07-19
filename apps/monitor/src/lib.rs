use rand::Rng;
use regex::Regex;

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
