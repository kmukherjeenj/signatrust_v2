use axum::{routing::{get, post}, Router, Json};
use serde::{Deserialize, Serialize};
use tokio::net::TcpListener;

async fn health() -> &'static str { "ok" }

#[derive(Deserialize)]
struct VerifyReq { /* TODO */ }
#[derive(Serialize)]
struct VerifyRes { valid: bool }

async fn zk_verify(Json(_req): Json<VerifyReq>) -> Json<VerifyRes> {
    Json(VerifyRes { valid: true })
}

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/health", get(health))
        .route("/zk/verify", post(zk_verify));

    let listener = TcpListener::bind(("0.0.0.0", 4060)).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
