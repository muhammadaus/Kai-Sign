package handler

import (
	"encoding/json"
	"net/http"
)

// RootHandler is the entry point for the root path
// Export: /api/go-root
func RootHandler(w http.ResponseWriter, r *http.Request) {
	response := map[string]string{
		"status": "ok",
		"message": "Go API is running",
		"service": "ERC7730 API",
	}
	
	jsonResponse, _ := json.Marshal(response)
	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(jsonResponse)
} 