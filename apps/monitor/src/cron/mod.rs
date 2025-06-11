pub mod worker;

// https://github.com/hexagon/croner-rust?tab=readme-ov-file#pattern
pub static ONE_MINUTE_CRON: &str = "0 * * * * *";
pub static FIVE_MINUTE_CRON: &str = "0 */5 * * * *";
pub static TEN_MINUTE_CRON: &str = "0 */10 * * * *";
pub static THIRTY_MINUTE_CRON: &str = "0 */30 * * * *";
pub static ONE_HOUR_CRON: &str = "0 0 * * * *";
