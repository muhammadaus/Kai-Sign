package handler

import (
	"encoding/json"
	"net/http"
)

// Handler is a simple test handler for Vercel
func Handler(w http.ResponseWriter, r *http.Request) {
	response := map[string]string{
		"status": "ok",
		"message": "Go API is running successfully",
		"version": "1.0.0",
	}
	
	jsonResponse, _ := json.Marshal(response)
	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(jsonResponse)
} 