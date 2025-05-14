# Railway Deployment Guide

This guide explains how to deploy the ERC7730 API on Railway.app using Python FastAPI.

## Prerequisites

1. A Railway account (https://railway.app/)
2. The Railway CLI (optional for local development)

## Deployment Steps

### Option 1: Deploy via GitHub

1. Fork this repository to your GitHub account
2. Log in to Railway.app with your GitHub account
3. Click "New Project" and select "Deploy from GitHub repo"
4. Select your forked repository
5. Railway will automatically detect the Python project and deploy the FastAPI application
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

- `GET /`: Root endpoint (health check)
- `GET /healthcheck`: Detailed health check endpoint
- `POST /generateERC7730`: Generate ERC7730 descriptor from ABI or address
- `POST /api/py/generateERC7730`: Alternative path for the same functionality

## Testing Locally

To test the API locally:

1. Set up a Python virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. Run the FastAPI server:
   ```
   uvicorn api.index:app --reload
   ```

3. In another terminal, run the test script:
   ```
   python test_fastapi.py
   ```

## Deployment Configuration

The project is configured for Railway.app deployment with:

1. `railway.toml`: Defines the build and deployment settings
2. `Procfile`: Specifies the command to run the FastAPI server
3. `requirements.txt`: Lists all Python dependencies
4. `Dockerfile`: Provides container configuration (optional, Railway can deploy without it) 