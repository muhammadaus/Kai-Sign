import subprocess
import time
import requests
import os
import sys
import signal

def start_mock_server():
    """Start the mock API server in a subprocess."""
    print("Starting mock API server...")
    process = subprocess.Popen(["python", "test_api_mock.py"],
                              stdout=subprocess.PIPE,
                              stderr=subprocess.PIPE,
                              universal_newlines=True)
    return process

def test_endpoints():
    """Test all API endpoints."""
    test_results = []
    base_url = "http://localhost:8000"
    
    # Test the root endpoint
    try:
        response = requests.get(f"{base_url}/")
        test_results.append({
            "endpoint": "/",
            "success": response.status_code == 200,
            "status_code": response.status_code,
            "response": response.json()
        })
    except Exception as e:
        test_results.append({
            "endpoint": "/",
            "success": False,
            "error": str(e)
        })
    
    # Test the healthcheck endpoint
    try:
        response = requests.get(f"{base_url}/healthcheck")
        test_results.append({
            "endpoint": "/healthcheck",
            "success": response.status_code == 200,
            "status_code": response.status_code,
            "response": response.json()
        })
    except Exception as e:
        test_results.append({
            "endpoint": "/healthcheck",
            "success": False,
            "error": str(e)
        })
    
    # Test the generateERC7730 endpoint with an address
    try:
        payload = {"address": "0x6b175474e89094c44da98b954eedeac495271d0f", "chain_id": 1}
        response = requests.post(f"{base_url}/generateERC7730", json=payload)
        test_results.append({
            "endpoint": "/generateERC7730 (with address)",
            "success": response.status_code == 200,
            "status_code": response.status_code,
            "response": response.json()
        })
    except Exception as e:
        test_results.append({
            "endpoint": "/generateERC7730 (with address)",
            "success": False,
            "error": str(e)
        })
    
    return test_results

def print_test_results(results):
    """Print test results in a readable format."""
    print("\n=== TEST RESULTS ===")
    all_passed = True
    
    for result in results:
        success = result.get("success", False)
        endpoint = result.get("endpoint", "Unknown")
        
        if success:
            print(f"✅ {endpoint}: SUCCESS")
            if "response" in result:
                print(f"   Response: {result['response']}")
        else:
            all_passed = False
            print(f"❌ {endpoint}: FAILED")
            if "error" in result:
                print(f"   Error: {result['error']}")
            elif "status_code" in result:
                print(f"   Status Code: {result['status_code']}")
                if "response" in result:
                    print(f"   Response: {result['response']}")
        
        print("-" * 50)
    
    print("\n=== SUMMARY ===")
    print(f"Total Tests: {len(results)}")
    passed = sum(1 for r in results if r.get("success", False))
    print(f"Passed: {passed}")
    print(f"Failed: {len(results) - passed}")
    
    return all_passed

def check_configuration_files():
    """Check that all necessary configuration files exist."""
    required_files = [
        "railway.toml",
        "Procfile",
        "Dockerfile",
        "requirements.txt",
        "api/index.py",
        "api/healthcheck.py"
    ]
    
    missing_files = []
    for file in required_files:
        if not os.path.exists(file):
            missing_files.append(file)
    
    if missing_files:
        print("\n⚠️ WARNING: The following required files are missing:")
        for file in missing_files:
            print(f"  - {file}")
        return False
    
    print("\n✅ All required configuration files are present.")
    return True

if __name__ == "__main__":
    print("=== RAILWAY.APP DEPLOYMENT TEST ===")
    print("This script tests the FastAPI configuration for Railway.app deployment.")
    
    # Check configuration files
    config_ok = check_configuration_files()
    
    # Start the mock server
    server_process = start_mock_server()
    
    try:
        # Give the server time to start
        print("Waiting for server to start...")
        time.sleep(2)
        
        # Run the tests
        print("\nTesting API endpoints...")
        results = test_endpoints()
        
        # Print test results
        all_passed = print_test_results(results)
        
        # Overall result
        print("\n=== FINAL RESULT ===")
        if all_passed and config_ok:
            print("✅ SUCCESS: Your FastAPI application is ready for Railway.app deployment!")
            exit_code = 0
        else:
            print("❌ FAILURE: Please fix the issues above before deploying to Railway.app.")
            exit_code = 1
    
    finally:
        # Terminate the server process
        print("\nStopping mock API server...")
        server_process.terminate()
        server_process.wait()
        
        # Exit with appropriate code
        sys.exit(exit_code) 