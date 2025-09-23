// API Key Validation Script
// This script tests various API keys to verify they are working correctly

const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

console.log(`${colors.cyan}===== API Key Validation Tool =====\n${colors.reset}`);

// Helper function to test an API key
async function testApiKey(name, testFunction) {
  process.stdout.write(`Testing ${name}... `);
  try {
    const result = await testFunction();
    if (result) {
      console.log(`${colors.green}✓ Valid${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}✗ Invalid or missing${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}✗ Error: ${error.message}${colors.reset}`);
    return false;
  }
}

// Test OpenAI API Key
async function testOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return false;
  
  const response = await fetch('https://api.openai.com/v1/models', {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  });
  
  return response.ok;
}

// Test Anthropic API Key
async function testAnthropic() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return false;
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Hello' }],
    }),
  });
  
  return response.ok;
}

// Test Tavily API Key
async function testTavily() {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return false;
  
  const response = await fetch('https://api.tavily.com/health', {
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
    },
  });
  
  return response.ok;
}

// Test Exa API Key
async function testExa() {
  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) return false;
  
  const response = await fetch('https://api.exa.ai/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({
      query: 'test query',
      numResults: 1,
    }),
  });
  
  return response.ok;
}

// Test Daytona API Key
async function testDaytona() {
  const apiKey = process.env.DAYTONA_API_KEY;
  if (!apiKey) return false;
  
  // Daytona doesn't have a simple endpoint to test, so we'll just check if the key exists
  return apiKey.length > 10;
}

// Test Google Generative AI API Key
async function testGoogleAI() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) return false;
  
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + apiKey);
  return response.ok;
}

// Run all tests
async function runTests() {
  console.log(`${colors.yellow}Testing AI API Keys:${colors.reset}`);
  const openaiResult = await testApiKey('OpenAI API Key', testOpenAI);
  const anthropicResult = await testApiKey('Anthropic API Key', testAnthropic);
  const googleAIResult = await testApiKey('Google Generative AI API Key', testGoogleAI);
  
  console.log(`\n${colors.yellow}Testing Search API Keys:${colors.reset}`);
  const tavilyResult = await testApiKey('Tavily API Key', testTavily);
  const exaResult = await testApiKey('Exa API Key', testExa);
  
  console.log(`\n${colors.yellow}Testing Development API Keys:${colors.reset}`);
  const daytonaResult = await testApiKey('Daytona API Key', testDaytona);
  
  // Summary
  console.log(`\n${colors.cyan}===== Summary =====\n${colors.reset}`);
  const total = [openaiResult, anthropicResult, googleAIResult, tavilyResult, exaResult, daytonaResult].filter(Boolean).length;
  const required = [openaiResult, tavilyResult].filter(Boolean).length;
  
  console.log(`${colors.magenta}${total}/6 API keys are valid${colors.reset}`);
  
  if (required < 2) {
    console.log(`${colors.red}⚠️ Missing critical API keys for search functionality!${colors.reset}`);
    console.log(`${colors.yellow}At minimum, you need valid OpenAI and Tavily API keys for basic search.${colors.reset}`);
  } else if (total < 4) {
    console.log(`${colors.yellow}⚠️ Some API keys are missing. Search functionality may be limited.${colors.reset}`);
  } else {
    console.log(`${colors.green}✓ You have enough valid API keys for search functionality.${colors.reset}`);
  }
}

runTests().catch(console.error);
