#!/bin/bash

# Start server in background
echo "Starting Go server in the background..."
go run main.go &
SERVER_PID=$!

# Wait for server to start
echo "Waiting for server to start..."
sleep 3

# Run tests
echo "Running tests..."
go run test_go_api.go "http://localhost:3000"

# Cleanup
echo "Stopping server..."
kill $SERVER_PID 