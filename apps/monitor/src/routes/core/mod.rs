pub mod hello;
pub mod ping;
pub mod registry;
pub mod test;

pub use hello::hello_service;
pub use ping::ping_service;
pub use registry::registry_service;
pub use test::test_service;
