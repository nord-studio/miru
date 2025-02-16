pub struct HttpPingResponse {
    pub success: bool,
    pub status: i32,
    pub latency: i32,
    pub headers: std::collections::HashMap<String, String>,
}

pub struct HttpPingErrorResponse {
    pub response: HttpPingResponse,
    pub error: String,
}

pub async fn http_ping(url: String) -> Result<HttpPingResponse, HttpPingErrorResponse> {
    let now = chrono::Utc::now();
    let client = reqwest::Client::new();

    let url = url
        .trim_start_matches("http://")
        .trim_start_matches("https://")
        .to_string();

    let url = format!("http://{}", url);
    let resp = client.get(&url).send().await;

    match resp {
        Ok(resp) => {
            let status = resp.status().as_u16() as i32;
            let headers = resp
                .headers()
                .iter()
                .map(|(k, v)| {
                    (
                        k.to_string(),
                        v.to_str()
                            .map(|s| s.to_string())
                            .unwrap_or_else(|_| "Invalid Header Value".to_string()),
                    )
                })
                .collect::<std::collections::HashMap<String, String>>();

            Ok(HttpPingResponse {
                status,
                success: status == 200,
                latency: (chrono::Utc::now() - now)
                    .num_milliseconds()
                    .try_into()
                    .unwrap_or(i32::MAX),
                headers,
            })
        }
        Err(_) => {
            let url = url.replace("http://", "https://");
            let resp = client.get(&url).send().await;
            match resp {
                Ok(resp) => {
                    let status = resp.status();
                    let headers = resp
                        .headers()
                        .iter()
                        .map(|(k, v)| {
                            (
                                k.to_string(),
                                v.to_str()
                                    .map(|s| s.to_string())
                                    .unwrap_or_else(|_| "Invalid Header Value".to_string()),
                            )
                        })
                        .collect::<std::collections::HashMap<String, String>>();

                    Ok(HttpPingResponse {
                        status: status.as_u16() as i32,
                        success: status == 200,
                        latency: (chrono::Utc::now() - now)
                            .num_milliseconds()
                            .try_into()
                            .unwrap_or(i32::MAX),
                        headers,
                    })
                }
                Err(err) => {
                    return Err(HttpPingErrorResponse {
                        response: HttpPingResponse {
                            // Set default status code to 503 if it's not available
                            status: err.status().map_or(503, |s| s.as_u16() as i32),
                            success: false,
                            latency: (chrono::Utc::now() - now)
                                .num_milliseconds()
                                .try_into()
                                .unwrap_or(i32::MAX),
                            headers: std::collections::HashMap::new(),
                        },
                        error: format!("{}", err),
                    });
                }
            }
        }
    }
}
