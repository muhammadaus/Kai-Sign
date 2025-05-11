#!/usr/bin/env python3
"""Test script to verify the erc7730 package installation and functionality."""

import importlib.util
import sys
import os

def check_module(module_name):
    """Check if a module is installed."""
    spec = importlib.util.find_spec(module_name)
    if spec is None:
        print(f"❌ {module_name} is NOT installed")
        return False
    else:
        print(f"✅ {module_name} is installed")
        return True

def check_erc7730():
    """Detailed check of erc7730 package."""
    try:
        import erc7730
        print(f"✅ erc7730 package found (version: {erc7730.__version__ if hasattr(erc7730, '__version__') else 'unknown'})")
        
        # Check submodules
        from erc7730.generate.generate import generate_descriptor
        print("✅ erc7730.generate.generate module found")
        
        from erc7730.model.input.descriptor import InputERC7730Descriptor
        print("✅ erc7730.model.input.descriptor module found")
        
        # Check environment
        etherscan_key = os.environ.get('ETHERSCAN_API_KEY')
        if etherscan_key:
            print("✅ ETHERSCAN_API_KEY environment variable is set")
            if len(etherscan_key) < 20:
                print("⚠️ Warning: ETHERSCAN_API_KEY seems too short, verify it's correct")
        else:
            print("⚠️ Warning: ETHERSCAN_API_KEY environment variable is NOT set")
            
        return True
    except ImportError as e:
        print(f"❌ Error importing erc7730: {e}")
        return False

def main():
    """Run the test script."""
    print("=== Testing Python Environment ===")
    print(f"Python version: {sys.version}")
    
    print("\n=== Checking Required Packages ===")
    check_module('fastapi')
    check_module('uvicorn')
    check_module('mangum')
    check_module('python-dotenv')
    
    print("\n=== Detailed erc7730 Check ===")
    erc7730_ok = check_erc7730()
    
    print("\n=== Summary ===")
    if erc7730_ok:
        print("✅ Basic checks passed. erc7730 package is properly installed.")
    else:
        print("❌ There are issues with the erc7730 package installation.")
        print("Try reinstalling with: pip install erc7730==0.3.8")

if __name__ == "__main__":
    main() 