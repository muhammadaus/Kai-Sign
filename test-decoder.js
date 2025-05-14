// Test script for the BatchExecutor decoder
import { decodeTransactionCalldata } from './src/lib/loop-decoder.js';

async function runTest() {
  console.log('🧪 Testing Loop Decoder for BatchExecutor');
  console.log('========================================\n');

  // The BatchExecutor contract address on Sepolia
  const batchExecutorAddress = '0x5dd9fdf2310b5dac8dced8a100fb4952546ae7bd';
  const chainId = 11155111; // Sepolia
  
  // Sample executeBatch calldata for two ERC20 transfers to the same address
  const batchExecutorCalldata = "0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000001200000000000000000000000005dd9fdf2310b5dac8dced8a100fb4952546ae7bd000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000044a9059cbb000000000000000000000000bb6e6d6dabd150c4a000d1fd8a7de46a750477f40000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000000000000000000000005dd9fdf2310b5dac8dced8a100fb4952546ae7bd000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000044a9059cbb000000000000000000000000bb6e6d6dabd150c4a000d1fd8a7de46a750477f40000000000000000000000000000000000000000000000001bc16d674ec8000000000000000000000000000000000000000000000000000000000000";
  
  console.log('🔎 Testing BatchExecutor decoding on Sepolia');
  console.log(`Contract: ${batchExecutorAddress}`);
  console.log(`Calldata: ${batchExecutorCalldata.slice(0, 66)}...`);
  
  try {
    // Attempt to decode the batch operations
    const result = await decodeTransactionCalldata(
      chainId,
      batchExecutorAddress,
      batchExecutorCalldata
    );
    
    // Check the result
    if ('error' in result) {
      console.error('❌ Decoding failed:', result.error);
      if (result.details) {
        console.error('Details:', result.details);
      }
      return false;
    }
    
    // Success! Print the decoded result
    console.log('✅ Successfully decoded batch operations');
    console.log('Function Name:', result.name);
    console.log('Function Signature:', result.signature);
    
    // Extract operations from the decoded result
    const operations = result.params[0].valueDecoded?.params || [];
    console.log(`Found ${operations.length} operations in the batch`);
    
    // Print details about each operation
    operations.forEach((op, index) => {
      console.log(`\nOperation ${index + 1}:`);
      console.log(`  To: ${op.value.to}`);
      console.log(`  Value: ${op.value.value} wei`);
      
      // If the operation has a decoded calldata, print it
      if (op.valueDecoded) {
        console.log(`  Function: ${op.valueDecoded.name}`);
        console.log(`  Signature: ${op.valueDecoded.signature}`);
        
        // Print parameters
        op.valueDecoded.params.forEach(param => {
          console.log(`    ${param.name} (${param.type}): ${param.value}`);
        });
      } else {
        console.log('  Could not decode calldata');
      }
    });
    
    console.log('\n========================================');
    console.log('🎉 Test completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Test failed with exception:', error);
    return false;
  }
}

// Run the test
runTest().catch(console.error); 