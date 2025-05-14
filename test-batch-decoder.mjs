#!/usr/bin/env node

/**
 * Test script for the batch decoder functionality
 * 
 * This directly tests the decoding of a BatchExecutor transaction
 * without relying on the Next.js API routes
 */

// Import the ESM version of node-fetch
import fetch from 'node-fetch';

// Sample executeBatch calldata for two ERC20 transfers to the same address
const TEST_CALLDATA = "0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000001200000000000000000000000005dd9fdf2310b5dac8dced8a100fb4952546ae7bd000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000044a9059cbb000000000000000000000000bb6e6d6dabd150c4a000d1fd8a7de46a750477f40000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000000000000000000000005dd9fdf2310b5dac8dced8a100fb4952546ae7bd000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000044a9059cbb000000000000000000000000bb6e6d6dabd150c4a000d1fd8a7de46a750477f40000000000000000000000000000000000000000000000001bc16d674ec8000000000000000000000000000000000000000000000000000000000000";

// BatchExecutor contract on Sepolia
const BATCH_EXECUTOR_ADDRESS = '0x5dd9fdf2310b5dac8dced8a100fb4952546ae7bd';
const CHAIN_ID = 11155111; // Sepolia

async function testDecode() {
  console.log('🧪 Testing BatchExecutor Decoder');
  console.log('===============================');
  console.log(`Contract: ${BATCH_EXECUTOR_ADDRESS}`);
  console.log(`Chain ID: ${CHAIN_ID}`);
  console.log(`Calldata: ${TEST_CALLDATA.slice(0, 64)}...`);
  
  try {
    // Use the API endpoint for decoding
    const response = await fetch('http://localhost:3000/api/loop-decoder/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chainId: CHAIN_ID,
        contractAddress: BATCH_EXECUTOR_ADDRESS,
        calldata: TEST_CALLDATA,
      }),
    });
    
    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`API responded with ${response.status}: ${response.statusText}`);
    }
    
    // Parse the JSON response
    const result = await response.json();
    
    // Check for errors in the result
    if (result.error) {
      console.error('❌ Decoding failed:', result.error);
      if (result.details) {
        console.error('Details:', result.details);
      }
      return;
    }
    
    // Success - display the decoded data
    console.log('\n✅ Successfully decoded batch operations');
    console.log('Function Name:', result.name);
    console.log('Function Signature:', result.signature);
    
    // Extract operations from the decoded result
    const params = result.params[0];
    console.log('\nParameters:');
    console.log(`- Name: ${params.name}`);
    console.log(`- Type: ${params.type}`);
    
    // Check if we have decoded operations
    if (params.valueDecoded && params.valueDecoded.params) {
      const operations = params.valueDecoded.params;
      console.log(`\nFound ${operations.length} operations in the batch:\n`);
      
      // Display each operation
      operations.forEach((op, index) => {
        console.log(`Operation ${index + 1}:`);
        console.log(`  To: ${op.value.to}`);
        console.log(`  Value: ${op.value.value} wei`);
        
        // Display the decoded function call
        if (op.valueDecoded) {
          console.log(`  Function: ${op.valueDecoded.name}`);
          console.log(`  Signature: ${op.valueDecoded.signature}`);
          
          // Display function parameters
          op.valueDecoded.params.forEach(param => {
            console.log(`    ${param.name} (${param.type}): ${param.value}`);
          });
        } else {
          console.log('  Could not decode the calldata for this operation');
        }
        console.log('');
      });
    } else {
      console.log('\n❌ No operations found in the decoded data');
    }
    
    console.log('===============================');
    console.log('🎉 Test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  }
}

// Run the test
testDecode().catch(console.error); 