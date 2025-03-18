FROM rust:bookworm AS builder

# Set the working directory
WORKDIR /app

RUN apt-get update && apt-get upgrade -y && apt-get install -y libssl-dev openssl pkg-config

# Copy the rest of the application code
COPY ./Cargo.toml ./Cargo.lock ./
COPY ./apps/monitor ./apps/monitor
COPY ./.sqlx ./.sqlx

# Build the Rust application
ENV SQLX_OFFLINE=true
RUN cargo build --release

# Use a minimal base image for the final stage
FROM debian:bookworm-slim

# Set the working directory
WORKDIR /app
RUN apt-get update && apt-get upgrade -y && apt-get install -y curl

# Copy the built binary from the builder stage
COPY --from=builder /app/target/release/monitor .

# Expose the HTTP port
EXPOSE 8080

# Run the application
ENTRYPOINT ["./monitor"]