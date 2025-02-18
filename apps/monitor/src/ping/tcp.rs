use tokio::net::TcpStream;

#[derive(Debug)]
pub struct TcpPingResponse {
    pub success: bool,
    pub latency: i32,
}

#[derive(Debug)]
pub struct TcpPingErrorResponse {
    pub error: String,
    pub response: TcpPingResponse,
}

pub async fn tcp_ping(url: String) -> Result<TcpPingResponse, TcpPingErrorResponse> {
    let now = chrono::Utc::now();
    match TcpStream::connect(&url).await {
        Ok(_) => Ok(TcpPingResponse {
            success: true,
            latency: (chrono::Utc::now() - now)
                .num_milliseconds()
                .try_into()
                .unwrap_or(i32::MAX),
        }),
        Err(err) => Err(TcpPingErrorResponse {
            error: format!("TCP Error: {}", err),
            response: TcpPingResponse {
                success: false,
                latency: (chrono::Utc::now() - now)
                    .num_milliseconds()
                    .try_into()
                    .unwrap_or(i32::MAX),
            },
        }),
    }
}
