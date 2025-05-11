import requests
import json
import os
import sys

# Get base URL from environment or command line
base_url = os.environ.get('API_URL', 'http://localhost:3000')
if len(sys.argv) > 1:
    base_url = sys.argv[1]

print(f"Testing API at: {base_url}")

# Test the healthcheck endpoint
try:
    response = requests.get(f"{base_url}/api/healthcheck")
    print(f"Healthcheck status: {response.status_code}")
    print(f"Healthcheck response: {response.text}")
except Exception as e:
    print(f"Error testing healthcheck: {e}")

# Test generateERC7730 endpoint with a known address
test_address = "0x6B175474E89094C44Da98b954EedeAC495271d0F"  # DAI token
test_payload = {
    "address": test_address,
    "chain_id": 1
}

try:
    print(f"\nTesting generateERC7730 with address: {test_address}")
    response = requests.post(
        f"{base_url}/api/py/generateERC7730", 
        json=test_payload,
        headers={"Content-Type": "application/json"}
    )
    print(f"Status code: {response.status_code}")
    
    if response.status_code < 400:
        try:
            json_response = response.json()
            print("Response successfully parsed as JSON")
            print(f"First 200 chars of response: {json.dumps(json_response)[:200]}...")
        except json.JSONDecodeError as e:
            print(f"JSON parse error: {e}")
            print(f"Raw response: {response.text[:200]}...")
    else:
        print(f"Error response: {response.text}")
except Exception as e:
    print(f"Error making request: {e}")

print("\nAPI test completed") 