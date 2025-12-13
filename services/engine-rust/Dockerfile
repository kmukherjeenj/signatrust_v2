# syntax=docker/dockerfile:1

# ---------- Build stage ----------
FROM rust:1.80 AS builder
WORKDIR /app

# 1) Cache dependencies: copy only manifests, create a dummy main to compile deps
COPY Cargo.toml Cargo.lock* ./
RUN mkdir -p src && echo "fn main() {}" > src/main.rs
RUN cargo build --release
RUN rm -rf src

# 2) Now copy real source and build the binary
COPY . .
RUN cargo build --release

# ---------- Runtime stage (debug-friendly; distroless is OK later) ----------
FROM debian:bookworm-slim
WORKDIR /app
COPY --from=builder /app/target/release/engine-rust /usr/local/bin/engine
EXPOSE 4060
ENTRYPOINT ["/usr/local/bin/engine"]
