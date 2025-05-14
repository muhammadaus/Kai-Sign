import { ethers } from 'ethers';

// Test signing and verification functions
async function testEthereumSignatures() {
  console.log('🔐 ETHEREUM SIGNATURE TEST 🔐');
  console.log('==============================\n');

  try {
    // Create a random wallet for testing
    const wallet = ethers.Wallet.createRandom();
    console.log(`🔑 Created test wallet: ${wallet.address}\n`);

    // Test message to sign
    const message = 'Hello, this is a test message for Ethereum signatures!';
    console.log(`📝 Message to sign: "${message}"\n`);

    // Sign the message
    console.log('Signing message...');
    const signature = await wallet.signMessage(message);
    console.log(`✅ Signature created: ${signature}\n`);

    // Verify the signature
    console.log('Verifying signature...');
    const recoveredAddress = ethers.verifyMessage(message, signature);
    
    // Check if the verification is successful
    const isValid = recoveredAddress.toLowerCase() === wallet.address.toLowerCase();
    
    console.log(`📋 Recovered address: ${recoveredAddress}`);
    console.log(`🔍 Original address:  ${wallet.address}`);
    console.log(`🔎 Signature valid:   ${isValid ? '✅ YES' : '❌ NO'}\n`);

    if (isValid) {
      console.log('✅ TEST PASSED: Signature verification successful!');
    } else {
      console.log('❌ TEST FAILED: Signature verification failed!');
    }

    // Now let's test with a tampered message
    console.log('\n📌 TESTING TAMPERED MESSAGE:');
    const tamperedMessage = message + ' (tampered)';
    console.log(`📝 Tampered message: "${tamperedMessage}"\n`);

    // Verify with tampered message
    console.log('Verifying signature with tampered message...');
    const recoveredAddressFromTampered = ethers.verifyMessage(tamperedMessage, signature);
    
    // This should fail
    const isTamperedValid = recoveredAddressFromTampered.toLowerCase() === wallet.address.toLowerCase();
    
    console.log(`📋 Recovered address: ${recoveredAddressFromTampered}`);
    console.log(`🔍 Original address:  ${wallet.address}`);
    console.log(`🔎 Signature valid:   ${isTamperedValid ? '❌ UNEXPECTEDLY VALID (ERROR)' : '✅ INVALID (EXPECTED)'}\n`);

    if (!isTamperedValid) {
      console.log('✅ TEST PASSED: Tampered message correctly failed verification!');
    } else {
      console.log('❌ TEST FAILED: Tampered message unexpectedly passed verification!');
    }

    // Test EIP-712 typed data signing
    console.log('\n📌 TESTING EIP-712 TYPED DATA SIGNING:');
    
    const domain = {
      name: 'Kai-Sign',
      version: '1',
      chainId: 1,
      verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
    };
    
    const types = {
      Person: [
        { name: 'name', type: 'string' },
        { name: 'wallet', type: 'address' }
      ],
      Document: [
        { name: 'title', type: 'string' },
        { name: 'content', type: 'string' },
        { name: 'from', type: 'Person' },
        { name: 'timestamp', type: 'uint256' }
      ]
    };
    
    const value = {
      title: 'Test Document',
      content: 'This is a test document for EIP-712 signing',
      from: {
        name: 'Test User',
        wallet: wallet.address
      },
      timestamp: Math.floor(Date.now() / 1000)
    };
    
    console.log(`📝 Typed data to sign:`, JSON.stringify(value, null, 2), '\n');
    
    // Sign the typed data
    console.log('Signing typed data...');
    const typedDataSignature = await wallet.signTypedData(domain, types, value);
    console.log(`✅ Typed data signature created: ${typedDataSignature}\n`);
    
    // Verify the typed data signature
    console.log('Verifying typed data signature...');
    const recoveredAddressFromTypedData = ethers.verifyTypedData(domain, types, value, typedDataSignature);
    
    // Check if the verification is successful
    const isTypedDataValid = recoveredAddressFromTypedData.toLowerCase() === wallet.address.toLowerCase();
    
    console.log(`📋 Recovered address: ${recoveredAddressFromTypedData}`);
    console.log(`🔍 Original address:  ${wallet.address}`);
    console.log(`🔎 Signature valid:   ${isTypedDataValid ? '✅ YES' : '❌ NO'}\n`);
    
    if (isTypedDataValid) {
      console.log('✅ TEST PASSED: Typed data signature verification successful!');
    } else {
      console.log('❌ TEST FAILED: Typed data signature verification failed!');
    }

    // Final result
    console.log('\n==============================');
    if (isValid && !isTamperedValid && isTypedDataValid) {
      console.log('🎉 ALL TESTS PASSED! The signature implementation works correctly.');
    } else {
      console.log('❌ SOME TESTS FAILED! There might be issues with the signature implementation.');
    }
    
  } catch (error) {
    console.error('\n❌ TEST ERROR:', error);
  }
}

// Run the test
testEthereumSignatures(); 