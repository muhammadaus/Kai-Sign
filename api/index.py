from fastapi import FastAPI, HTTPException, Path
from fastapi.middleware.cors import CORSMiddleware
from subprocess import Popen, PIPE
from dotenv import load_dotenv
import os
# Import the patched version of generate_descriptor
from erc7730.generate.generate import generate_descriptor
from erc7730.model.input.descriptor import InputERC7730Descriptor
import os
import traceback
from fastapi.encoders import jsonable_encoder

import json

from fastapi.responses import JSONResponse
from pydantic import BaseModel

# load_dotenv()

def load_env():
    etherscan_api_key = os.getenv("ETHERSCAN_API_KEY")
    env = os.environ.copy()
    env["ETHERSCAN_API_KEY"] = etherscan_api_key
    # We're using in-memory cache instead of file-based cache
    # but keep this env var for compatibility with other parts of the code
    env["XDG_CACHE_HOME"] = '/tmp'
    load_dotenv()

app = FastAPI()

# Add CORS middleware for Vercel deployment
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

@app.post("/generateERC7730", response_model=InputERC7730Descriptor, responses={400: {"model": Message}})
@app.post("/api/py/generateERC7730", response_model=InputERC7730Descriptor, responses={400: {"model": Message}})
def run_erc7730(params: Props):
    """Generate the 'erc7730' based on an ABI."""
    try:
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
                error_detail = f"Error with ABI: {str(e)}\n{traceback.format_exc()}"
                print(error_detail)
                return JSONResponse(status_code=500, content={"message": str(e)})
       
        if (params.address and not result):
            try:
            result = generate_descriptor(
                chain_id=chain_id,
                contract_address=params.address
            )
            except Exception as e:
                error_detail = f"Error with address: {str(e)}\n{traceback.format_exc()}"
                print(error_detail) 
                return JSONResponse(status_code=500, content={"message": str(e)})
            
        if result is None:
            return JSONResponse(status_code=400, content={"message": "No ABI or address provided"})
        
        # Ensure the response is properly serializable
        return jsonable_encoder(result)

    except Exception as e:
        error_detail = f"General error: {str(e)}\n{traceback.format_exc()}"
        print(error_detail)
        return JSONResponse(status_code=500, content={"message": str(e)})

# Add a simple test route for health check
@app.get("/")
def read_root():
    return {"message": "API is running"}

# Vercel-specific handler
from mangum import Mangum

# Create handler for AWS Lambda / Vercel
handler = Mangum(app)