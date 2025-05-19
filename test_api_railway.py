#!/usr/bin/env python3
"""
Test script to verify the ERC7730 descriptor generation API with our fixes.
This simulates how the API would be called in Railway environment.
"""

import os
import json
import sys
from dotenv import load_dotenv

# Set up environment variables similar to Railway
os.environ["USE_MOCK"] = "false"
load_dotenv()

# Check for ETHERSCAN_API_KEY
if not os.environ.get("ETHERSCAN_API_KEY"):
    print("ETHERSCAN_API_KEY not found. Please set it in your environment.")
    print("You can add it to your shell: export ETHERSCAN_API_KEY=your_key_here")
    sys.exit(1)

print("Testing with ETHERSCAN_API_KEY:", os.environ.get("ETHERSCAN_API_KEY")[:4] + "...")

# Import our patch first
try:
    import api.patched_erc7730
    print("✅ Successfully imported patched_erc7730")
except ImportError as e:
    print(f"❌ Failed to import patched_erc7730: {e}")
    sys.exit(1)

# Now import the actual generate function
try:
    from erc7730.generate.generate import generate_descriptor
    print("✅ Successfully imported generate_descriptor")
except ImportError as e:
    print(f"❌ Failed to import generate_descriptor: {e}")
    sys.exit(1)

def test_generate():
    """Test the ERC7730 descriptor generation with a known address."""
    # DAI token address for testing
    address = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
    
    print(f"Generating descriptor for: {address}")
    try:
        # Generate the descriptor using our patched function
        result = generate_descriptor(
            chain_id=1,
            contract_address=address
        )
        
        print("✅ Successfully generated descriptor")
        print(f"Result type: {type(result)}")
        
        # Verify the result can be serialized to JSON
        try:
            # Convert to JSON (this would be the response sent from the API)
            if hasattr(result, "__dict__"):
                print("Result is an object with __dict__")
            else:
                print("Result is already a dict-like object")
            
            json_str = json.dumps(result, default=lambda o: o.__dict__ if hasattr(o, "__dict__") else str(o))
            print("✅ Successfully serialized to JSON")
            
            # Parse it back (this would be the frontend receiving the response)
            parsed = json.loads(json_str)
            print("✅ Successfully parsed JSON response")
            
            # Verify key data is present
            if "metadata" in parsed and "owner" in parsed["metadata"]:
                print(f"Owner: {parsed['metadata']['owner']}")
            else:
                print("Owner not found in metadata")
            
            # Check for formats in display
            if "display" in parsed and "formats" in parsed["display"]:
                format_count = len(parsed["display"]["formats"])
                print(f"Number of formats: {format_count}")
                
                # Print a sample format
                if format_count > 0:
                    sample_key = list(parsed["display"]["formats"].keys())[0]
                    sample = parsed["display"]["formats"][sample_key]
                    print(f"Sample format key: {sample_key}")
                    print(f"Sample format intent: {sample.get('intent', '')}")
                    print(f"Sample format fields count: {len(sample.get('fields', []))}")
            else:
                print("No formats found in display")
            
            return True
        
        except Exception as e:
            print(f"❌ Error serializing result: {e}")
            return False
        
    except Exception as e:
        print(f"❌ Error generating descriptor: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("=== Testing ERC7730 Descriptor Generation ===")
    success = test_generate()
    
    if success:
        print("\n✅ TEST PASSED: The descriptor generation and serialization works correctly")
        print("This indicates that the API should work properly in the Railway environment")
    else:
        print("\n❌ TEST FAILED: There are still issues with descriptor generation or serialization")
        print("Fixes may be needed to make the API work in the Railway environment") 