use tokio::net::TcpStream;

pub struct TcpPingResponse {
    pub success: bool,
    pub latency: i32,
}

pub struct TcpPingErrorResponse {
    pub error: String,
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
        }),
    }
}
