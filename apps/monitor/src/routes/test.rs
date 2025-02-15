use actix_web::{get, web, HttpResponse, Responder};

use serde_json::json;
use tokio::net::TcpStream;

#[get("/test/{type}/{url}")]
pub async fn test(path: web::Path<(String, String)>) -> impl Responder {
    let (req_type, url) = path.into_inner();

    match req_type.as_str() {
        "http" => {
            let now = chrono::Utc::now();
            let client = reqwest::Client::new();
            let url = if url.starts_with("http://") {
                url.replace("http://", "")
            } else if url.starts_with("https://") {
                url.replace("https://", "")
            } else {
                url
            };

            let url = format!("http://{}", url);
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
                    return HttpResponse::Ok().json(json!({
                        "status": status.as_u16(),
                        "latency": (chrono::Utc::now() - now).num_milliseconds(),
                        "headers": headers
                    }));
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
                            return HttpResponse::Ok().json(json!({
                                "status": status.as_u16(),
                                "latency": (chrono::Utc::now() - now).num_milliseconds(),
                                "headers": headers
                            }));
                        }
                        Err(err) => {
                            return HttpResponse::InternalServerError()
                                .json(json!({ "error": format!("{}", err) }));
                        }
                    }
                }
            }
        }
        "tcp" => {
            let now = chrono::Utc::now();
            match TcpStream::connect(&url).await {
                Ok(stream) => {
                    let local_addr = stream.local_addr().ok();
                    let peer_addr = stream.peer_addr().ok();

                    let status = if local_addr.is_some() && peer_addr.is_some() {
                        200
                    } else {
                        500
                    };

                    return HttpResponse::Ok().json(json!({
                        "status": status,
                        "latency": (chrono::Utc::now() - now).num_milliseconds(),
                        "time": now.to_rfc3339(),
                    }));
                }
                Err(err) => {
                    return HttpResponse::InternalServerError().json(json!({
                        "error": format!("TCP Error: {}", err),
                    }));
                }
            }
        }
        _ => {
            return HttpResponse::BadRequest()
                .body("Invalid type. Must be 'http' or 'tcp'".to_string());
        }
    }
}
