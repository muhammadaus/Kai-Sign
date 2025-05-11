# Railway Deployment Guide

This guide explains how to deploy the ERC7730 API on Railway.app.

## Prerequisites

1. A Railway account (https://railway.app/)
2. The Railway CLI (optional for local development)

## Deployment Steps

### Option 1: Deploy via GitHub

1. Fork this repository to your GitHub account
2. Log in to Railway.app with your GitHub account
3. Click "New Project" and select "Deploy from GitHub repo"
4. Select your forked repository
5. Railway will automatically detect the Dockerfile and deploy your application
6. Once deployed, you can configure environment variables in the Railway dashboard:
   - `ETHERSCAN_API_KEY`: Your Etherscan API key

### Option 2: Deploy via CLI

1. Install the Railway CLI:
   ```
   npm install -g @railway/cli
   ```

2. Login to your Railway account:
   ```
   railway login
   ```

3. Initialize your project:
   ```
   railway init
   ```

4. Link to an existing project or create a new one:
   ```
   railway link
   ```

5. Deploy your application:
   ```
   railway up
   ```

## Environment Variables

Configure the following environment variables in the Railway dashboard:

- `ETHERSCAN_API_KEY`: Your Etherscan API key

## API Endpoints

Once deployed, your API will have the following endpoints:

- `GET /api/healthcheck`: Health check endpoint
- `POST /generateERC7730`: Generate ERC7730 descriptor from ABI or address
- `POST /api/py/generateERC7730`: Alternative path for the same functionality

## Testing Locally

To test the API locally:

1. Run the Go server:
   ```
   go run main.go
   ```

2. In another terminal, run the test script:
   ```
   go run test_go_api.go
   ```

Or use the provided test script that automates this process:
```
./test_go_api.sh
``` 