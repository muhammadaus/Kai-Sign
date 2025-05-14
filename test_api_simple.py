import uvicorn
import threading
import time
import requests
import sys

def start_server():
    """Start the FastAPI server in a separate thread."""
    uvicorn.run("api.index:app", host="127.0.0.1", port=8000, log_level="info")

def test_root_endpoint():
    """Test the root endpoint."""
    try:
        response = requests.get("http://127.0.0.1:8000/")
        print(f"Root endpoint response: {response.status_code}")
        print(f"Response data: {response.json()}")
        assert response.status_code == 200
        return True
    except Exception as e:
        print(f"Error testing root endpoint: {str(e)}")
        return False

if __name__ == "__main__":
    # Start server in a separate thread
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    
    # Wait for server to start
    print("Starting server...")
    time.sleep(2)
    
    # Test root endpoint
    print("Testing root endpoint...")
    success = test_root_endpoint()
    
    # Print result
    if success:
        print("\nTest succeeded! FastAPI setup for Railway is working.")
        sys.exit(0)
    else:
        print("\nTest failed! Please check the logs above.")
        sys.exit(1) 