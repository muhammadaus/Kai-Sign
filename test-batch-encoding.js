/**
 * Standalone test script for the BatchExecutor calldata parsing
 * 
 * This script directly analyzes the calldata structure without depending on
 * the full decoder implementation
 */

// BatchExecutor executeBatch function calldata 
// Function selector: 0x34fcd5be for executeBatch(Operation[])
const TEST_CALLDATA = "0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000001200000000000000000000000005dd9fdf2310b5dac8dced8a100fb4952546ae7bd000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000044a9059cbb000000000000000000000000bb6e6d6dabd150c4a000d1fd8a7de46a750477f40000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000000000000000000000005dd9fdf2310b5dac8dced8a100fb4952546ae7bd000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000044a9059cbb000000000000000000000000bb6e6d6dabd150c4a000d1fd8a7de46a750477f40000000000000000000000000000000000000000000000001bc16d674ec8000000000000000000000000000000000000000000000000000000000000";

// Skip the function selector (first 4 bytes/8 hex chars)
const data = TEST_CALLDATA.substring(10);

/**
 * Helper function to convert Wei to Ether
 */
function weiToEther(wei) {
  const weiValue = BigInt(wei);
  const etherValue = Number(weiValue) / 1e18;
  return etherValue.toString();
}

/**
 * Helper to format address
 */
function formatAddress(address) {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

/**
 * Decode the ERC20 transfer function
 */
function decodeERC20Transfer(calldata) {
  if (!calldata.startsWith('0xa9059cbb')) {
    return null;
  }
  
  // Skip function selector (4 bytes/8 hex chars)
  const params = calldata.substring(10);
  
  // First parameter: to address (32 bytes/64 hex chars, padded)
  const toPadded = params.substring(0, 64);
  const to = '0x' + toPadded.substring(24);
  
  // Second parameter: amount (32 bytes/64 hex chars)
  const amountHex = params.substring(64, 128);
  const amount = BigInt('0x' + amountHex).toString();
  
  return {
    name: "transfer",
    signature: "transfer(address,uint256)",
    params: [
      { name: "_to", type: "address", value: to },
      { name: "_value", type: "uint256", value: amount }
    ]
  };
}

/**
 * Parse the batch operations
 */
function parseOperations() {
  try {
    // The data layout is:
    // [32 bytes] - Offset to the array (always 32)
    // [at offset] - Array length (N)
    // [array of offsets to each tuple]
    // [tuple 1] - (address, uint256, bytes)
    // ...
    // [tuple N]
    
    // First 32 bytes (64 hex chars) is the offset to the start of the array
    const arrayOffset = parseInt(data.substring(0, 64), 16) * 2; // Convert to nibbles
    
    // At the offset, get the array length (32 bytes / 64 hex chars)
    const arrayLengthHex = data.substring(arrayOffset, arrayOffset + 64);
    const arrayLength = parseInt(arrayLengthHex, 16);
    
    console.log(`Found ${arrayLength} operations in batch`);
    
    const operations = [];
    
    // After the array length, we have an array of offsets to each tuple
    // Each offset is 32 bytes / 64 hex chars
    for (let i = 0; i < arrayLength; i++) {
      // Get the offset position for this tuple
      const offsetPosition = arrayOffset + 64 + (i * 64);
      const offsetHex = data.substring(offsetPosition, offsetPosition + 64);
      
      // The correct way: offset is relative to the start of data
      const tupleOffset = parseInt(offsetHex, 16) * 2;
      console.log(`Operation ${i}: offset=${tupleOffset}`);
      
      // Start parsing tuple data at this offset
      // First 32 bytes (64 hex chars) is the address (padded to 32 bytes)
      const addressPadded = data.substring(tupleOffset, tupleOffset + 64);
      // Extract the 20-byte address from the 32-byte field (addresses are padded with zeros)
      const address = '0x' + addressPadded.substring(24);
      
      // Next 32 bytes (64 hex chars) is the value
      const valueHex = data.substring(tupleOffset + 64, tupleOffset + 128);
      const value = BigInt('0x' + valueHex).toString();
      
      // Next 32 bytes (64 hex chars) is the offset to the bytes data within this tuple
      const bytesOffsetHex = data.substring(tupleOffset + 128, tupleOffset + 192);
      const bytesOffsetInTuple = parseInt(bytesOffsetHex, 16) * 2; // Convert to nibbles
      const bytesOffset = tupleOffset + bytesOffsetInTuple; // Absolute position in data
      
      // At the bytes offset, first 32 bytes (64 hex chars) is the length of the bytes
      const bytesLengthHex = data.substring(bytesOffset, bytesOffset + 64);
      const bytesLength = parseInt(bytesLengthHex, 16) * 2; // Convert to nibbles
      
      // After the length, the actual bytes data follows
      const callData = '0x' + data.substring(bytesOffset + 64, bytesOffset + 64 + bytesLength);
      
      // Create and add the operation to our array
      const operation = {
        to: address,
        value,
        callData
      };
      
      // If this is an ERC20 transfer, decode it 
      if (callData.startsWith('0xa9059cbb')) {
        operation.decoded = decodeERC20Transfer(callData);
      }
      
      operations.push(operation);
    }
    
    return operations;
  } catch (error) {
    console.error("Error parsing operations:", error);
    return [];
  }
}

// Parse the operations
const operations = parseOperations();

// Display the operations
console.log('\n=== Parsed BatchExecutor Operations ===\n');
operations.forEach((op, index) => {
  console.log(`Operation ${index + 1}:`);
  console.log(`  To: ${op.to} (${formatAddress(op.to)})`);
  console.log(`  Value: ${op.value} wei (${weiToEther(op.value)} ETH)`);
  console.log(`  Calldata: ${op.callData.slice(0, 50)}...${op.callData.slice(-10)}`);
  
  if (op.decoded) {
    console.log('  Decoded Function:');
    console.log(`    Name: ${op.decoded.name}`);
    console.log(`    Signature: ${op.decoded.signature}`);
    
    op.decoded.params.forEach(param => {
      let valueDisplay = param.value;
      if (param.type === 'address') {
        valueDisplay = `${param.value} (${formatAddress(param.value)})`;
      } else if (param.type === 'uint256' && param.value.length > 10) {
        const ethValue = weiToEther(param.value);
        valueDisplay = `${param.value} (${ethValue} ETH)`;
      }
      console.log(`    ${param.name} (${param.type}): ${valueDisplay}`);
    });
  }
  
  console.log(''); // Empty line for spacing
});

console.log('=== Verification ===');
console.log('1. Are addresses correct?', 
  operations[0]?.to === '0x5dd9fdf2310b5dac8dced8a100fb4952546ae7bd' && 
  operations[1]?.to === '0x5dd9fdf2310b5dac8dced8a100fb4952546ae7bd'
    ? 'PASS' : 'FAIL');
console.log('2. Is first transfer to the correct recipient?',
  operations[0]?.decoded?.params[0]?.value === '0xbb6e6d6dabd150c4a000d1fd8a7de46a750477f4'
    ? 'PASS' : 'FAIL');
console.log('3. Is first transfer amount 1 ETH?',
  weiToEther(operations[0]?.decoded?.params[1]?.value) === '1'
    ? 'PASS' : 'FAIL');
console.log('4. Is second transfer to the correct recipient?',
  operations[1]?.decoded?.params[0]?.value === '0xbb6e6d6dabd150c4a000d1fd8a7de46a750477f4'
    ? 'PASS' : 'FAIL');
console.log('5. Is second transfer amount 2 ETH?',
  weiToEther(operations[1]?.decoded?.params[1]?.value) === '2'
    ? 'PASS' : 'FAIL'); 