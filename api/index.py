from fastapi import FastAPI, HTTPException, Path
from fastapi.middleware.cors import CORSMiddleware
from subprocess import Popen, PIPE
from dotenv import load_dotenv
import os
# Import the patched version of generate_descriptor
from erc7730.generate.generate import generate_descriptor
from erc7730.model.input.descriptor import InputERC7730Descriptor
from erc7730.model.display import FieldFormat, AddressNameType
from erc7730.model.input.context import InputContractContext, InputEIP712Context, InputContract, InputEIP712
from erc7730.model.input.display import InputDisplay, InputFieldDescription, InputAddressNameParameters
from erc7730.model.input.metadata import InputMetadata
import traceback
from fastapi.encoders import jsonable_encoder
import json
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from api.healthcheck import router as healthcheck_router
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

load_dotenv()

# Define USE_MOCK environment variable - set to False by default
USE_MOCK = os.getenv("USE_MOCK", "false").lower() == "true"

def load_env():
    etherscan_api_key = os.getenv("ETHERSCAN_API_KEY")
    if not etherscan_api_key:
        raise HTTPException(
            status_code=500,
            detail="ETHERSCAN_API_KEY environment variable is not set. Please configure it in your environment."
        )
    env = os.environ.copy()
    env["ETHERSCAN_API_KEY"] = etherscan_api_key
    # We're using in-memory cache instead of file-based cache
    # but keep this env var for compatibility with other parts of the code
    env["XDG_CACHE_HOME"] = '/tmp'
    load_dotenv()

app = FastAPI(
    title="ERC7730 API", 
    description="API for generating ERC7730 descriptors",
    version="1.0.0",
    docs_url="/docs",
    openapi_url="/openapi.json"
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

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": str(exc.detail)}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=422,
        content={"message": str(exc)}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"message": str(exc)}
    )

def generate_mock_descriptor(address: str, chain_id: int = 1):
    """Generate a mock ERC7730 descriptor for testing purposes."""
    return {
        "context": {
            "contract": {
                "deployments": [
                    {
                        "chainId": chain_id,
                        "address": address
                    }
                ],
                "abi": [
                    {
                        "type": "function",
                        "name": "balanceOf",
                        "inputs": [
                            {
                                "name": "owner",
                                "type": "address"
                            }
                        ],
                        "outputs": [
                            {
                                "name": "",
                                "type": "uint256"
                            }
                        ],
                        "stateMutability": "view"
                    },
                    {
                        "type": "function",
                        "name": "transfer",
                        "inputs": [
                            {
                                "name": "to",
                                "type": "address"
                            },
                            {
                                "name": "value",
                                "type": "uint256"
                            }
                        ],
                        "outputs": [
                            {
                                "name": "",
                                "type": "bool"
                            }
                        ],
                        "stateMutability": "nonpayable"
                    }
                ]
            }
        },
        "metadata": {
            "owner": "Mock Token",
            "constants": {}
        },
        "display": {
            "formats": {
                "balanceOf(address)": {
                    "description": "Get the balance of an account",
                    "fields": [
                        {
                            "field_description": {
                                "description": "Account address",
                                "format": "raw"
                            }
                        }
                    ]
                },
                "transfer(address,uint256)": {
                    "description": "Transfer tokens to a recipient",
                    "fields": [
                        {
                            "field_description": {
                                "description": "Recipient address",
                                "format": "raw"
                            }
                        },
                        {
                            "field_description": {
                                "description": "Amount to transfer",
                                "format": "raw"
                            }
                        }
                    ]
                }
            }
        }
    }

@app.post("/generateERC7730", response_model=InputERC7730Descriptor, responses={400: {"model": Message}, 500: {"model": Message}})
@app.post("/api/py/generateERC7730", response_model=InputERC7730Descriptor, responses={400: {"model": Message}, 500: {"model": Message}})
async def run_erc7730(params: Props):
    """Generate the 'erc7730' based on an ABI."""
    try:
        # Proceed with actual implementation
        load_env()
        result = None

        # we only manage ethereum mainnet
        chain_id = params.chain_id or 1
        
        if (params.abi):
            try:
                result = generate_descriptor(
                    chain_id=chain_id,
                    contract_address='0xdeadbeef00000000000000000000000000000000', # because it's mandatory mock address see with laurent
                    abi=params.abi
                )
            except Exception as e:
                error_detail = f"Error with ABI: {str(e)}"
                raise HTTPException(status_code=500, detail=error_detail)
       
        if (params.address and not result):
            try:
                result = generate_descriptor(
                    chain_id=chain_id,
                    contract_address=params.address
                )
            except Exception as e:
                error_detail = f"Error with address: {str(e)}"
                if "Missing/Invalid API Key" in str(e):
                    raise HTTPException(
                        status_code=500,
                        detail="Etherscan API key is missing or invalid. Please check your configuration."
                    )
                raise HTTPException(status_code=500, detail=error_detail)
            
        if result is None:
            raise HTTPException(status_code=400, detail="No ABI or address provided")
        
        # Ensure the response is properly serializable
        serialized_result = jsonable_encoder(result)
        
        # For frozen models, we need to modify the serialized JSON rather than the model
        if serialized_result.get("display") and serialized_result["display"].get("formats"):
            for format_name, format_def in serialized_result["display"]["formats"].items():
                if format_def.get("fields"):
                    for field in format_def["fields"]:
                        if field.get("format") == "raw":
                            field["format"] = "raw"  # Already correct format
                        elif field.get("format") == "addressName":
                            field["format"] = "addressName"  # Already correct format
        
        return serialized_result

    except HTTPException as e:
        raise e
    except Exception as e:
        error_detail = f"Unexpected error: {str(e)}"
        raise HTTPException(status_code=500, detail=error_detail)

# Add a simple test route for health check
@app.get("/")
@app.get("/api/py")
async def read_root():
    return {"message": "API is running"}