package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
)

// Test structs
type Props struct {
	ABI     string `json:"abi,omitempty"`
	Address string `json:"address,omitempty"`
	ChainID int    `json:"chain_id,omitempty"`
}

func main() {
	// Base URL - change this to your actual API URL when deployed
	baseURL := "http://localhost:3000"
	if len(os.Args) > 1 {
		baseURL = os.Args[1]
	}

	// Test health check
	fmt.Println("Testing health check...")
	resp, err := http.Get(baseURL + "/api/healthcheck")
	if err != nil {
		fmt.Printf("Error making health check request: %v\n", err)
		os.Exit(1)
	}
	checkResponse(resp)

	// Test generateERC7730 with ABI
	fmt.Println("\nTesting generateERC7730 with ABI...")
	// Example ABI - replace with a valid ABI
	abiExample := `[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"}]`
	testGenerateERC7730WithABI(baseURL, abiExample)

	// Test generateERC7730 with address
	fmt.Println("\nTesting generateERC7730 with address...")
	// Example address - replace with a valid Ethereum address
	addressExample := "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984" // Uniswap token contract
	testGenerateERC7730WithAddress(baseURL, addressExample)
}

func checkResponse(resp *http.Response) {
	defer resp.Body.Close()
	
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Printf("Error reading response body: %v\n", err)
		return
	}
	
	fmt.Printf("Status: %d\n", resp.StatusCode)
	fmt.Printf("Body: %s\n", string(body))
}

func testGenerateERC7730WithABI(baseURL, abi string) {
	props := Props{
		ABI:     abi,
		ChainID: 1,
	}
	makeGenerateRequest(baseURL, props)
}

func testGenerateERC7730WithAddress(baseURL, address string) {
	props := Props{
		Address: address,
		ChainID: 1,
	}
	makeGenerateRequest(baseURL, props)
}

func makeGenerateRequest(baseURL string, props Props) {
	jsonData, err := json.Marshal(props)
	if err != nil {
		fmt.Printf("Error marshaling request: %v\n", err)
		return
	}
	
	resp, err := http.Post(baseURL+"/generateERC7730", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		fmt.Printf("Error making request: %v\n", err)
		return
	}
	
	checkResponse(resp)
} 