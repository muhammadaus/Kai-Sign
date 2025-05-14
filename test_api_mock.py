from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Create a simple FastAPI app for testing
app = FastAPI(title="ERC7730 API Mock",
              description="Mock API for testing Railway.app deployment",
              version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Message(BaseModel):
    message: str

class Props(BaseModel):
    abi: str | None = None
    address: str | None = None
    chain_id: int | None = None

@app.get("/")
def read_root():
    """Root endpoint that acts as a health check."""
    return {"message": "API is running"}

@app.get("/healthcheck")
def healthcheck():
    """Health check endpoint."""
    return {"status": "ok", "message": "API is running"}

@app.post("/generateERC7730")
@app.post("/api/py/generateERC7730")
def run_erc7730(params: Props):
    """Mock implementation of the ERC7730 generator."""
    # This is a mock implementation that returns a fixed response
    if not params.abi and not params.address:
        return {"message": "No ABI or address provided"}, 400
    
    # Return a mock response
    return {
        "functions": [
            {
                "name": "transfer",
                "inputs": [
                    {"name": "to", "type": "address"},
                    {"name": "value", "type": "uint256"}
                ],
                "outputs": [{"type": "bool"}]
            }
        ],
        "events": [],
        "contract_address": params.address or "0xdeadbeef00000000000000000000000000000000",
        "chain_id": params.chain_id or 1
    }

if __name__ == "__main__":
    # Run the FastAPI app
    print("Starting mock API server...")
    uvicorn.run(app, host="0.0.0.0", port=8000) 