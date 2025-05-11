package handler

import (
	"encoding/json"
	"net/http"
)

// Handler handles health check requests
func Handler(w http.ResponseWriter, r *http.Request) {
	response := map[string]string{"status": "ok", "message": "API is running"}
	jsonResponse, _ := json.Marshal(response)
	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(jsonResponse)
} 