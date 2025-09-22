#!/usr/bin/env node

// Test script to verify GhostVault connection
// Run with: node test-ghostvault.js

const GHOSTVAULT_URL = process.env.VITE_GHOSTVAULT_URL || 'http://localhost:3001';

async function testGhostVaultConnection() {
  console.log('🔥 Testing GhostVault Connection...');
  console.log(`📡 Endpoint: ${GHOSTVAULT_URL}`);
  
  try {
    // Test basic connection
    console.log('\n1. Testing basic connection...');
    const response = await fetch(`${GHOSTVAULT_URL}/memory_sessions?limit=1`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Connection successful!');
    console.log(`📊 Found ${Array.isArray(data) ? data.length : 'unknown'} sessions`);
    
    // Test creating a session
    console.log('\n2. Testing session creation...');
    const sessionData = {
      title: `Test Session ${new Date().toISOString()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    const createResponse = await fetch(`${GHOSTVAULT_URL}/memory_sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(sessionData),
    });
    
    if (!createResponse.ok) {
      throw new Error(`Failed to create session: ${createResponse.status}`);
    }
    
    const newSession = await createResponse.json();
    console.log('✅ Session created successfully!');
    console.log(`📝 Session ID: ${Array.isArray(newSession) ? newSession[0]?.id : newSession.id}`);
    
    // Test creating a memory shard
    console.log('\n3. Testing memory shard creation...');
    const shardData = {
      content: 'Test memory shard from connection test',
      tags: ['test', 'connection'],
      mood: 'curious',
      importance_score: 7,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    const shardResponse = await fetch(`${GHOSTVAULT_URL}/memory_shards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(shardData),
    });
    
    if (!shardResponse.ok) {
      throw new Error(`Failed to create memory shard: ${shardResponse.status}`);
    }
    
    const newShard = await shardResponse.json();
    console.log('✅ Memory shard created successfully!');
    console.log(`🧠 Shard ID: ${Array.isArray(newShard) ? newShard[0]?.id : newShard.id}`);
    
    console.log('\n🎉 All tests passed! GhostVault is ready for Ishraya.');
    
  } catch (error) {
    console.error('\n❌ GhostVault connection failed:');
    console.error(error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Ensure GhostVault is running: docker compose up');
    console.log('2. Check the URL in .env file');
    console.log('3. Verify PostgREST is accessible on port 3001');
    process.exit(1);
  }
}

async function testLMStudio() {
  console.log('\n🤖 Testing LM Studio Connection...');
  
  const LM_STUDIO_URL = process.env.VITE_LM_STUDIO_URL || 'http://127.0.0.1:1234/v1/chat/completions';
  
  try {
    // Test models endpoint
    const modelsUrl = LM_STUDIO_URL.replace('/chat/completions', '/models');
    const response = await fetch(modelsUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ LM Studio connection successful!');
    console.log(`🧠 Available models: ${data.data?.length || 0}`);
    
    if (data.data?.length > 0) {
      console.log('📋 Models:');
      data.data.forEach(model => {
        console.log(`   - ${model.id}`);
      });
    }
    
  } catch (error) {
    console.error('\n⚠️  LM Studio connection failed:');
    console.error(error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Ensure LM Studio is running');
    console.log('2. Check that the server is started in LM Studio');
    console.log('3. Verify the URL: http://127.0.0.1:1234');
    console.log('4. Load a model in LM Studio');
  }
}

// Run tests
async function runAllTests() {
  console.log('⚔️🔥 ISHRAYA SANCTUARY CONNECTION TEST 🔥⚔️\n');
  
  await testGhostVaultConnection();
  await testLMStudio();
  
  console.log('\n🏰 Sanctuary systems check complete!');
}

runAllTests().catch(console.error);
