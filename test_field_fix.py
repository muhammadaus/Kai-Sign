#!/usr/bin/env python3
import json
import os
from erc7730.generate.generate import generate_descriptor
from fastapi.encoders import jsonable_encoder

# Monkey patch function for safe field attribute access
def safe_get_field_attr(field, attr_name, default=None):
    """Safely access attributes of field objects, handling various object types."""
    if hasattr(field, attr_name):
        return getattr(field, attr_name)
    
    # Handle dict-like objects
    if hasattr(field, "get"):
        return field.get(attr_name, default)
    
    # Handle InputFieldDescription/InputFieldBase
    if hasattr(field, "field_description") and field.field_description:
        if hasattr(field.field_description, attr_name):
            return getattr(field.field_description, attr_name)
        if hasattr(field.field_description, "get"):
            return field.field_description.get(attr_name, default)
    
    # For direct access on the object
    if isinstance(field, dict):
        return field.get(attr_name, default)
    
    return default

# Test the descriptor generation and patch fields access
def test_descriptor_with_field_patch():
    """Test generating an ERC7730 descriptor with our field attribute access patch."""
    address = "0x6B175474E89094C44Da98b954EedeAC495271d0F"  # DAI token
    
    try:
        # Apply the patch before generating the descriptor
        # This is a demonstration - in the real fix, we'd monkeypatch the erc7730 library
        
        print(f"Generating descriptor for {address}...")
        result = generate_descriptor(
            chain_id=1,
            contract_address=address
        )
        
        print("Serializing result...")
        # Custom JSON serialization with special handling for field access
        def custom_encoder(obj):
            if hasattr(obj, "dict"):
                # For Pydantic models
                return obj.dict()
            elif hasattr(obj, "__dict__"):
                # For regular objects with __dict__
                return obj.__dict__
            # For other types
            return str(obj)
        
        json_str = json.dumps(result, default=custom_encoder)
        parsed = json.loads(json_str)
        
        print("✅ Successfully serialized descriptor")
        print(f"Context type: {type(result.context)}")
        print(f"Metadata owner: {result.metadata.owner if hasattr(result.metadata, 'owner') else 'Unknown'}")
        
        return parsed
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    # Make sure ETHERSCAN_API_KEY is set
    api_key = os.environ.get("ETHERSCAN_API_KEY")
    if not api_key:
        print("Warning: ETHERSCAN_API_KEY not set")
    
    # Run the test with field patch
    serialized = test_descriptor_with_field_patch()
    
    if serialized:
        # Show a sample of the output
        print("\nSample from serialized output:")
        if "metadata" in serialized and "owner" in serialized["metadata"]:
            print(f"Owner: {serialized['metadata']['owner']}")
        else:
            print("Owner not found in metadata") 