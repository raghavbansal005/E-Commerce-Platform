#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Subscribify E-commerce Platform...\n');

// Check if .env files exist
const backendEnvPath = path.join(__dirname, 'backend', '.env');
const frontendEnvPath = path.join(__dirname, 'frontend', '.env');

if (!fs.existsSync(backendEnvPath)) {
  console.log('⚠️  Backend .env file not found. Please copy .env.example to .env and configure your environment variables.');
  console.log('   Location: backend/.env\n');
}

if (!fs.existsSync(frontendEnvPath)) {
  console.log('⚠️  Frontend .env file not found. Please copy .env.example to .env and configure your environment variables.');
  console.log('   Location: frontend/.env\n');
}

// Check if node_modules exist
const backendNodeModules = path.join(__dirname, 'backend', 'node_modules');
const frontendNodeModules = path.join(__dirname, 'frontend', 'node_modules');

if (!fs.existsSync(backendNodeModules) || !fs.existsSync(frontendNodeModules)) {
  console.log('📦 Installing dependencies...');
  console.log('   Run: npm run install-all\n');
  return;
}

console.log('✅ Environment files found');
console.log('✅ Dependencies installed');
console.log('\n🔧 Starting development servers...\n');

// Start backend server
const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'pipe',
  shell: true
});

// Start frontend server
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'pipe',
  shell: true
});

// Handle backend output
backend.stdout.on('data', (data) => {
  console.log(`[Backend] ${data.toString().trim()}`);
});

backend.stderr.on('data', (data) => {
  console.error(`[Backend Error] ${data.toString().trim()}`);
});

// Handle frontend output
frontend.stdout.on('data', (data) => {
  console.log(`[Frontend] ${data.toString().trim()}`);
});

frontend.stderr.on('data', (data) => {
  console.error(`[Frontend Error] ${data.toString().trim()}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down servers...');
  backend.kill();
  frontend.kill();
  process.exit(0);
});

backend.on('close', (code) => {
  console.log(`Backend process exited with code ${code}`);
});

frontend.on('close', (code) => {
  console.log(`Frontend process exited with code ${code}`);
});

console.log('🌐 Application will be available at:');
console.log('   Frontend: http://localhost:5173');
console.log('   Backend:  http://localhost:5000');
console.log('\n💡 Press Ctrl+C to stop the servers');