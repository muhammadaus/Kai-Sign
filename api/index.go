package handler

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"strings"
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
// Note: This is a simplified version - you'll need to match your Python model structure
type ERC7730Descriptor struct {
	Name        string      `json:"name"`
	Description string      `json:"description"`
	Functions   interface{} `json:"functions,omitempty"`
	Events      interface{} `json:"events,omitempty"`
	// Add other fields that match your Python model
}

// GenerateHandler is the entry point for the Vercel serverless function
// Export: /generateERC7730
// Export: /api/py/generateERC7730
func GenerateHandler(w http.ResponseWriter, r *http.Request) {
	// Set CORS headers
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	// Handle preflight requests
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	// Only handle POST requests for generateERC7730
	if r.Method != "POST" || (!strings.HasSuffix(r.URL.Path, "/generateERC7730") && 
		!strings.HasSuffix(r.URL.Path, "/api/py/generateERC7730")) {
		if r.URL.Path == "/" || r.URL.Path == "" {
			// Root path handler - health check
			response := map[string]string{"message": "API is running"}
			jsonResponse, _ := json.Marshal(response)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			w.Write(jsonResponse)
			return
		}
		http.Error(w, "Method not allowed or invalid endpoint", http.StatusMethodNotAllowed)
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

	// Load environment variables (similar to load_env in Python)
	etherscanAPIKey := os.Getenv("ETHERSCAN_API_KEY")
	if etherscanAPIKey == "" {
		fmt.Println("Warning: ETHERSCAN_API_KEY not set")
	}

	// TODO: Implement the actual ERC7730 generation logic
	// Since this requires a Go equivalent of your Python erc7730 library,
	// for now we'll return a placeholder response or call an external service
	
	var result *ERC7730Descriptor
	var generateError error

	if props.ABI != "" {
		// Logic to generate from ABI would go here
		result, generateError = generateFromABI(props.ABI, props.ChainID)
	} else if props.Address != "" {
		// Logic to generate from address would go here
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

// Placeholder functions for ERC7730 generation
// These would need to be implemented with actual logic

func generateFromABI(abi string, chainID int) (*ERC7730Descriptor, error) {
	// Placeholder implementation
	// In a real implementation, you'd need to:
	// 1. Parse the ABI
	// 2. Extract function and event information
	// 3. Format according to ERC7730 specification
	
	return &ERC7730Descriptor{
		Name:        "Generated from ABI",
		Description: "Placeholder ERC7730 descriptor",
		Functions:   map[string]string{"placeholder": "This is a placeholder. Implement actual ABI parsing."},
	}, nil
}

func generateFromAddress(address string, chainID int) (*ERC7730Descriptor, error) {
	// Placeholder implementation
	// In a real implementation, you'd need to:
	// 1. Fetch the contract ABI from Etherscan or similar service
	// 2. Parse the ABI
	// 3. Extract function and event information
	// 4. Format according to ERC7730 specification
	
	return &ERC7730Descriptor{
		Name:        "Generated from Address",
		Description: "Placeholder ERC7730 descriptor",
		Functions:   map[string]string{"placeholder": "This is a placeholder. Implement actual contract fetching."},
	}, nil
} 