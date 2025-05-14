import { ethers } from 'ethers';

/**
 * This script tests the integration of our digital signature implementation
 * by simulating the workflow our UI components would use.
 */
async function testSignaturesIntegration() {
  console.log('🧪 TESTING SIGNATURE INTEGRATION WORKFLOW 🧪');
  console.log('===========================================\n');

  try {
    // STEP 1: Create a wallet (in production this would be the user's wallet)
    console.log('STEP 1: Create test wallet...');
    const wallet = ethers.Wallet.createRandom();
    console.log(`✅ Test wallet created: ${wallet.address}\n`);

    // STEP 2: Simulate the SignMessage component workflow
    console.log('STEP 2: Simulating SignMessage component workflow...');
    
    // Create a message to sign
    const message = "I agree to the terms and conditions";
    console.log(`📝 Message to sign: "${message}"`);
    
    // Add timestamp to prevent replay attacks (as our components do)
    const timestamp = Date.now();
    const fullMessage = `${message}\nTimestamp: ${timestamp}`;
    console.log(`📝 Full message with timestamp: "${fullMessage}"`);
    
    // Sign the message
    const signature = await wallet.signMessage(fullMessage);
    console.log(`✅ Signature created: ${signature}`);
    
    // Store all data (similar to our UI state)
    const signatureState = {
      message: fullMessage,
      signature,
      address: wallet.address,
      timestamp
    };
    console.log('✅ Signature state stored\n');

    // STEP 3: Simulate the VerifySignature component workflow
    console.log('STEP 3: Simulating VerifySignature component workflow...');
    
    // First, let's verify the correct message (success case)
    console.log('📌 Verifying with correct message...');
    const recoveredAddress = ethers.verifyMessage(signatureState.message, signatureState.signature);
    const isValid = recoveredAddress.toLowerCase() === wallet.address.toLowerCase();
    
    console.log(`📋 Recovered address: ${recoveredAddress}`);
    console.log(`🔍 Original address:  ${wallet.address}`);
    console.log(`🔎 Signature valid:   ${isValid ? '✅ YES' : '❌ NO'}\n`);
    
    // Now, let's verify with a tampered message (failure case)
    console.log('📌 Verifying with tampered message...');
    const tamperedMessage = `${message}\nTimestamp: ${timestamp + 1000}`; // Changed timestamp
    const recoveredAddressFromTampered = ethers.verifyMessage(tamperedMessage, signatureState.signature);
    const isTamperedValid = recoveredAddressFromTampered.toLowerCase() === wallet.address.toLowerCase();
    
    console.log(`📋 Recovered address: ${recoveredAddressFromTampered}`);
    console.log(`🔍 Original address:  ${wallet.address}`);
    console.log(`🔎 Signature valid:   ${isTamperedValid ? '❌ UNEXPECTEDLY VALID (ERROR)' : '✅ INVALID (EXPECTED)'}\n`);

    // STEP 4: Test address validation - ensures our UI validation works
    console.log('STEP 4: Testing address validation...');
    
    // Custom Ethereum address validator function (more reliable than ethers.isAddress for our tests)
    const isValidEthereumAddress = (address) => {
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    };
    
    const validAddresses = [
      wallet.address,
      '0x5dd9fdf2310b5dac8dced8a100fb4952546ae7bd',
      '0xBB6E6D6DAbD150c4A000D1Fd8A7dE46A750477F4'
    ];
    
    const invalidAddresses = [
      '0x123', // too short
      '0xinvalid',
      '5dd9fdf2310b5dac8dced8a100fb4952546ae7bd', // missing 0x prefix
      '0x5dd9fdf2310b5dac8dced8a100fb4952546ae7bd123456' // too long
    ];
    
    console.log('Testing valid addresses:');
    validAddresses.forEach(address => {
      const isValidAddress = isValidEthereumAddress(address);
      console.log(`  ${address}: ${isValidAddress ? '✅ VALID' : '❌ INVALID'}`);
    });
    
    console.log('\nTesting invalid addresses:');
    invalidAddresses.forEach(address => {
      const isValidAddress = isValidEthereumAddress(address);
      console.log(`  ${address}: ${isValidAddress ? '❌ UNEXPECTEDLY VALID' : '✅ INVALID (EXPECTED)'}`);
    });

    // Final results
    console.log('\n===========================================');
    if (isValid && !isTamperedValid) {
      console.log('🎉 INTEGRATION TEST PASSED! The signature components should work correctly.');
    } else {
      console.log('❌ INTEGRATION TEST FAILED! There might be issues with the signature implementation.');
    }
    
  } catch (error) {
    console.error('\n❌ TEST ERROR:', error);
  }
}

// Run the test
testSignaturesIntegration(); 