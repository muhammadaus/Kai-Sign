package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
)

// Props represents the input parameters
type Props struct {
	ABI     string `json:"abi,omitempty"`
	Address string `json:"address,omitempty"`
	ChainID int    `json:"chain_id,omitempty"`
}

// ErrorResponse represents an error response
type ErrorResponse struct {
	Message string `json:"message"`
}

// ERC7730Descriptor represents the output descriptor
type ERC7730Descriptor struct {
	Name        string      `json:"name"`
	Description string      `json:"description"`
	Functions   interface{} `json:"functions,omitempty"`
	Events      interface{} `json:"events,omitempty"`
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	// Define handlers
	http.HandleFunc("/api/healthcheck", healthCheckHandler)
	http.HandleFunc("/generateERC7730", generateERC7730Handler)
	http.HandleFunc("/api/py/generateERC7730", generateERC7730Handler)
	
	// Default route
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/" {
			healthCheckHandler(w, r)
			return
		}
		http.NotFound(w, r)
	})

	// Start server
	fmt.Printf("Server starting on port %s...\n", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Error starting server: %v", err)
	}
}

// Health check handler
func healthCheckHandler(w http.ResponseWriter, r *http.Request) {
	response := map[string]string{"status": "ok", "message": "API is running"}
	jsonResponse, _ := json.Marshal(response)
	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(jsonResponse)
}

// Generate ERC7730 handler
func generateERC7730Handler(w http.ResponseWriter, r *http.Request) {
	// Set CORS headers
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	// Handle preflight requests
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	// Only handle POST requests
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Read request body
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		sendErrorResponse(w, "Failed to read request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	// Parse JSON request
	var props Props
	if err := json.Unmarshal(body, &props); err != nil {
		sendErrorResponse(w, "Invalid JSON payload", http.StatusBadRequest)
		return
	}

	// Set default chain ID if not provided
	if props.ChainID == 0 {
		props.ChainID = 1 // Default to Ethereum mainnet
	}

	// Validate input parameters
	if props.ABI == "" && props.Address == "" {
		sendErrorResponse(w, "No ABI or address provided", http.StatusBadRequest)
		return
	}

	// Load environment variables
	etherscanAPIKey := os.Getenv("ETHERSCAN_API_KEY")
	if etherscanAPIKey == "" {
		fmt.Println("Warning: ETHERSCAN_API_KEY not set")
	}

	// Process the request based on input
	var result *ERC7730Descriptor
	var generateError error

	if props.ABI != "" {
		result, generateError = generateFromABI(props.ABI, props.ChainID)
	} else if props.Address != "" {
		result, generateError = generateFromAddress(props.Address, props.ChainID)
	}

	if generateError != nil {
		sendErrorResponse(w, fmt.Sprintf("Error generating descriptor: %v", generateError), http.StatusInternalServerError)
		return
	}

	// Convert result to JSON and return
	jsonResponse, err := json.Marshal(result)
	if err != nil {
		sendErrorResponse(w, "Error serializing response", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(jsonResponse)
}

// Helper function to send error responses
func sendErrorResponse(w http.ResponseWriter, message string, statusCode int) {
	response := ErrorResponse{Message: message}
	jsonResponse, _ := json.Marshal(response)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	w.Write(jsonResponse)
}

// Generate from ABI
func generateFromABI(abi string, chainID int) (*ERC7730Descriptor, error) {
	// Placeholder implementation
	return &ERC7730Descriptor{
		Name:        "Generated from ABI",
		Description: "Placeholder ERC7730 descriptor",
		Functions:   map[string]string{"placeholder": "This is a placeholder. Implement actual ABI parsing."},
	}, nil
}

// Generate from Address
func generateFromAddress(address string, chainID int) (*ERC7730Descriptor, error) {
	// Placeholder implementation
	// In a real implementation, you would:
	// 1. Use the Etherscan API to fetch the contract ABI
	// 2. Parse the ABI
	// 3. Extract function and event information
	// 4. Format according to ERC7730 specification
	
	return &ERC7730Descriptor{
		Name:        "Generated from Address: " + address,
		Description: "Placeholder ERC7730 descriptor",
		Functions:   map[string]string{"placeholder": "This is a placeholder. Implement actual contract fetching."},
	}, nil
} 