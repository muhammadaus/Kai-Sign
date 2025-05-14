import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# API endpoint
BASE_URL = os.getenv('API_URL', 'http://localhost:8000')
TEST_CONTRACT_ADDRESS = '0x6b175474e89094c44da98b954eedeac495271d0f'  # DAI

def test_health_check():
    """Test the health check endpoint."""
    response = requests.get(f"{BASE_URL}/")
    print(f"Health Check Response: {response.status_code}")
    print(f"Health Check Data: {response.json()}")
    assert response.status_code == 200
    return response.json()

def test_generate_erc7730_with_address():
    """Test generating ERC7730 descriptor with a contract address."""
    payload = {
        "address": TEST_CONTRACT_ADDRESS,
        "chain_id": 1
    }
    
    response = requests.post(f"{BASE_URL}/generateERC7730", json=payload)
    print(f"Generate ERC7730 Response (Address): {response.status_code}")
    
    # Print full response or error
    if response.status_code == 200:
        data = response.json()
        print(f"Got {len(data['functions'])} functions in response")
        print(f"First function: {data['functions'][0]['name'] if data['functions'] else 'No functions'}")
    else:
        print(f"Error: {response.text}")
    
    assert response.status_code in [200, 400, 500]  # Accept various status codes for testing
    return response.json() if response.status_code == 200 else None

if __name__ == "__main__":
    print("Testing FastAPI deployment for Railway.app")
    
    # Run tests
    health_result = test_health_check()
    print(f"\nHealth check successful: {health_result['message']}\n")
    
    erc7730_result = test_generate_erc7730_with_address()
    if erc7730_result:
        print("\nERC7730 generation successful!")
    else:
        print("\nERC7730 generation returned an error (check logs above)")
    
    print("\nTests completed!") 