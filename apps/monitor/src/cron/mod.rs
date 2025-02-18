pub mod create;
pub mod update;
pub mod worker;

// https://github.com/hexagon/croner-rust?tab=readme-ov-file#pattern
pub static THIRTY_SECONDS_CRON: &str = "every 30 seconds";
#[cfg(not(debug_assertions))]
pub static ONE_MINUTE_CRON: &str = "every minute";
pub static FIVE_MINUTE_CRON: &str = "every 5 minutes";
pub static TEN_MINUTE_CRON: &str = "every 10 minutes";
pub static THIRTY_MINUTE_CRON: &str = "every 30 minutes";
pub static ONE_HOUR_CRON: &str = "every hour";

pub use create::create_job;
pub use update::update_job;
