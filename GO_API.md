# Go API Implementation

This project includes a Go implementation of the ERC7730 API, designed to be deployed on either Vercel or Railway.

## Deployment Options

### 1. Vercel

The Go API can be deployed as serverless functions on Vercel:

- API files are located in the `/api` directory
- Each `.go` file in this directory becomes a serverless function
- The main endpoints are:
  - `/api/test`: A simple test endpoint to verify Go is working
  - `/api/healthcheck`: Returns the API status
  - `/generateERC7730`: Generates ERC7730 descriptors from ABI or contract address

To deploy on Vercel, simply push this repository to GitHub and connect it to your Vercel account.

### 2. Railway

For a more traditional deployment with a long-running server:

- Uses the `main.go` file as the entry point
- Dockerfile is provided for containerized deployment
- Railway.toml contains the configuration

To deploy on Railway, follow the instructions in RAILWAY.md.

## Local Development

To run the API locally:

```bash
# Run the main server
go run main.go

# Or use the automated test script
./test_go_api.sh
```

## Implementation Notes

The current implementation provides a basic structure for the ERC7730 API in Go. However, some key components will need to be completed:

1. **ABI Parsing**: You'll need to implement proper ABI parsing in Go
2. **Etherscan Integration**: Integration with Etherscan API to fetch contract ABIs
3. **ERC7730 Generation**: The core descriptor generation logic

These components are currently implemented as placeholders that return mock data.

## Environment Variables

- `ETHERSCAN_API_KEY`: Required for fetching contract ABIs from Etherscan

## Testing

Run the automated tests with:

```bash
./test_go_api.sh
``` 