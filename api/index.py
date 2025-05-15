from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import logging
import traceback
import json
import requests
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from api.healthcheck import router as healthcheck_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
logger.info(f"Environment loaded. ETHERSCAN_API_KEY present: {'ETHERSCAN_API_KEY' in os.environ}")

app = FastAPI(
    title="ERC7730 API",
    description="API for generating ERC7730 descriptors",
    version="1.0.0"
)

# Include the healthcheck router
app.include_router(healthcheck_router)

# Add CORS middleware for deployment
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

def get_contract_abi(address, chain_id=1):
    """Get contract ABI from Etherscan API."""
    api_key = os.getenv("ETHERSCAN_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="ETHERSCAN_API_KEY environment variable is not set"
        )
    
    # Different URLs for different networks
    if chain_id == 1:
        base_url = "https://api.etherscan.io/api"
    elif chain_id == 5:
        base_url = "https://api-goerli.etherscan.io/api"
    elif chain_id == 11155111:
        base_url = "https://api-sepolia.etherscan.io/api"
    else:
        # Default to mainnet
        base_url = "https://api.etherscan.io/api"
    
    # Get contract ABI from Etherscan
    url = f"{base_url}?module=contract&action=getabi&address={address}&apikey={api_key}"
    response = requests.get(url)
    
    if response.status_code != 200:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get contract ABI from Etherscan: {response.text}"
        )
    
    data = response.json()
    if data.get("status") != "1":
        raise HTTPException(
            status_code=400,
            detail=f"Failed to get contract ABI: {data.get('message', 'Unknown error')}"
        )
    
    return data.get("result")

def generate_mock_descriptor(address, abi=None, chain_id=1):
    """Generate a simple ERC7730 descriptor."""
    # Parse the ABI if provided
    if abi:
        try:
            abi_json = json.loads(abi)
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=400,
                detail="Invalid ABI format: not valid JSON"
            )
    else:
        # Get ABI from Etherscan
        abi_str = get_contract_abi(address, chain_id)
        try:
            abi_json = json.loads(abi_str)
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=500,
                detail=f"Invalid ABI returned from Etherscan: {abi_str[:100]}..."
            )
    
    # Extract functions from ABI
    functions = []
    for item in abi_json:
        if item.get("type") == "function":
            functions.append({
                "name": item.get("name"),
                "inputs": item.get("inputs", []),
                "outputs": item.get("outputs", []),
                "stateMutability": item.get("stateMutability", "nonpayable")
            })
    
    # Create simple descriptor
    return {
        "functions": functions,
        "events": [],
        "contract_address": address,
        "chain_id": chain_id
    }

@app.post("/generateERC7730", response_model=dict, responses={400: {"model": Message}, 500: {"model": Message}})
@app.post("/api/py/generateERC7730", response_model=dict, responses={400: {"model": Message}, 500: {"model": Message}})
async def run_erc7730(params: Props):
    """Generate a simplified ERC7730 descriptor based on ABI or address."""
    try:
        logger.info(f"Received request: {params}")
        
        if not params.address and not params.abi:
            logger.error("No ABI or address provided")
            raise HTTPException(status_code=400, detail="No ABI or address provided")
        
        chain_id = params.chain_id or 1
        address = params.address or "0xdeadbeef00000000000000000000000000000000"
        
        # Generate descriptor
        result = generate_mock_descriptor(address, params.abi, chain_id)
        
        logger.info("Successfully generated descriptor")
        return result
        
    except HTTPException as e:
        raise e
    except Exception as e:
        error_detail = f"Unexpected error: {str(e)}"
        logger.error(error_detail)
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=error_detail)

# Add a simple test route for health check
@app.get("/")
@app.get("/api/py")
async def read_root():
    return {"message": "API is running"}