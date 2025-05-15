from fastapi import FastAPI, HTTPException, Path
from fastapi.middleware.cors import CORSMiddleware
from subprocess import Popen, PIPE
from dotenv import load_dotenv
import os
import uvicorn
# Import the patched version of generate_descriptor
from erc7730.generate.generate import generate_descriptor
from erc7730.model.input.descriptor import InputERC7730Descriptor
from erc7730.model.types import StateMutability
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
    docs_url="/api/py/docs",  # Serve docs at /api/py/docs
    openapi_url="/api/py/openapi.json"  # Serve OpenAPI schema at /api/py/openapi.json
)

# Include the healthcheck router
app.include_router(healthcheck_router, prefix="/api/py")

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

@app.post("/generateERC7730", response_model=InputERC7730Descriptor, responses={400: {"model": Message}, 500: {"model": Message}})
@app.post("/api/py/generateERC7730", response_model=InputERC7730Descriptor, responses={400: {"model": Message}, 500: {"model": Message}})
async def run_erc7730(params: Props):
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
                # Convert state mutability strings to enum values
                if isinstance(result.context, InputContractContext):
                    for func in result.context.contract.abi:
                        if hasattr(func, 'stateMutability'):
                            func.stateMutability = StateMutability(func.stateMutability)
            except Exception as e:
                error_detail = f"Error with ABI: {str(e)}"
                raise HTTPException(status_code=500, detail=error_detail)
       
        if (params.address and not result):
            try:
                result = generate_descriptor(
                    chain_id=chain_id,
                    contract_address=params.address
                )
                # Convert state mutability strings to enum values
                if isinstance(result.context, InputContractContext):
                    for func in result.context.contract.abi:
                        if hasattr(func, 'stateMutability'):
                            func.stateMutability = StateMutability(func.stateMutability)
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
        
        # Ensure proper field formats and parameters
        if result.display and result.display.formats:
            for format_name, format_def in result.display.formats.items():
                for field in format_def.fields:
                    if isinstance(field, InputFieldDescription):
                        if field.field_description.format == 'raw':
                            field.field_description.format = FieldFormat.RAW
                        elif field.field_description.format == 'addressName':
                            field.field_description.format = FieldFormat.ADDRESS_NAME
                            if field.field_description.params and field.field_description.params.address_name:
                                field.field_description.params.address_name.types = [AddressNameType(t) for t in field.field_description.params.address_name.types]

        # Ensure the response is properly serializable
        return jsonable_encoder(result)

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

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)