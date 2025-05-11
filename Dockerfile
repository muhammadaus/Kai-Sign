FROM golang:1.24-alpine AS builder

WORKDIR /app

# Copy go.mod first to leverage Docker caching
COPY go.mod ./
RUN go mod download

# Copy the source code
COPY *.go ./

# Build the Go app
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# Use a small alpine image for the final image
FROM alpine:latest

WORKDIR /app

# Copy the binary from the builder stage
COPY --from=builder /app/main .

# Expose port
EXPOSE 3000

# Set runtime environment variables
ENV PORT=3000

# Run the Go binary
CMD ["./main"] 