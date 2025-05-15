import os
import sys
import uvicorn

if __name__ == "__main__":
    try:
        # Get port from environment variable or use default
        port_str = os.environ.get("PORT", "8000")
        
        # Ensure we have a valid integer port
        try:
            port = int(port_str)
            if port < 1 or port > 65535:
                print(f"Error: Port {port} is out of valid range (1-65535)")
                sys.exit(1)
        except ValueError:
            print(f"Error: Invalid port '{port_str}' - must be an integer")
            sys.exit(1)
        
        print(f"Starting server on port {port}...")
        
        # Run the FastAPI application
        uvicorn.run(
            "api.index:app", 
            host="0.0.0.0", 
            port=port,
            log_level="info"
        )
    except Exception as e:
        print(f"Error starting server: {str(e)}")
        sys.exit(1) 