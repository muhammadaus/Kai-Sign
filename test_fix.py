#!/usr/bin/env python3
import os
import json
from erc7730.generate.generate import generate_descriptor
from erc7730.model.input.descriptor import InputERC7730Descriptor
from fastapi.encoders import jsonable_encoder

def test_generate_descriptor():
    """Test the ERC7730 descriptor generation and serialization"""
    # DAI token address
    address = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
    
    try:
        # 1. Generate descriptor
        print("Generating descriptor...")
        result = generate_descriptor(
            chain_id=1,
            contract_address=address
        )
        
        print("Type of result:", type(result))
        
        # 2. Test serialization approaches
        print("\nTest direct jsonable_encoder:")
        try:
            serialized_result = jsonable_encoder(result)
            print("✅ jsonable_encoder succeeded")
        except Exception as e:
            print(f"❌ jsonable_encoder failed: {str(e)}")
            
        print("\nTest dict conversion + json dumps/loads:")
        try:
            # Convert to dict manually if needed
            result_dict = result.dict() if hasattr(result, "dict") else result
            json_str = json.dumps(result_dict)
            parsed_json = json.loads(json_str)
            print("✅ dict conversion + json dumps/loads succeeded")
        except Exception as e:
            print(f"❌ dict conversion + json dumps/loads failed: {str(e)}")
            
        print("\nTest direct json dumps:")
        try:
            # Direct json dumps with custom encoder
            json_str = json.dumps(result, default=lambda o: o.__dict__ if hasattr(o, "__dict__") else str(o))
            print("✅ direct json dumps with custom encoder succeeded")
        except Exception as e:
            print(f"❌ direct json dumps with custom encoder failed: {str(e)}")
            
        return result
    except Exception as e:
        print(f"Error generating descriptor: {str(e)}")
        return None

if __name__ == "__main__":
    # Make sure ETHERSCAN_API_KEY is set
    api_key = os.environ.get("ETHERSCAN_API_KEY")
    if not api_key:
        print("Warning: ETHERSCAN_API_KEY not set. Set it with:")
        print("export ETHERSCAN_API_KEY=your_key_here")
    else:
        print(f"Using ETHERSCAN_API_KEY: {api_key[:4]}...")
    
    result = test_generate_descriptor()
    
    if result:
        # Print a subset of the result to verify it looks good
        print("\nSample data from result:")
        if hasattr(result, "metadata") and hasattr(result.metadata, "owner"):
            print(f"Owner: {result.metadata.owner}")
