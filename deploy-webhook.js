#!/usr/bin/env node

const express = require('express');
const { exec } = require('child_process');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = 3001; // Use a different port for webhook
const WEBHOOK_SECRET = 'your-webhook-secret-key-here'; // Change this to a secure random string
const PROJECT_PATH = '/var/www/Ubuntu/Treading-Hub'; // Your project path on server

app.use(express.json());

// Verify GitHub webhook signature
function verifySignature(payload, signature) {
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  hmac.update(payload);
  const expectedSignature = 'sha256=' + hmac.digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

// Execute command and return promise
function execCommand(command, cwd = PROJECT_PATH) {
  return new Promise((resolve, reject) => {
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${command}`);
        console.error(`Error: ${error.message}`);
        console.error(`Stderr: ${stderr}`);
        reject(error);
      } else {
        console.log(`Command executed successfully: ${command}`);
        console.log(`Output: ${stdout}`);
        resolve(stdout);
      }
    });
  });
}

// Main deployment function
async function deploy() {
  console.log('🚀 Starting deployment process...');
  
  try {
    // Step 1: Pull latest changes
    console.log('📥 Pulling latest changes from GitHub...');
    await execCommand('git pull origin main');
    
    // Step 2: Install dependencies (if package.json changed)
    console.log('📦 Installing dependencies...');
    await execCommand('npm install');
    
    // Step 3: Build the application
    console.log('🔨 Building application...');
    await execCommand('npm run build');
    
    // Step 4: Restart PM2 processes
    console.log('🔄 Restarting PM2 processes...');
    await execCommand('pm2 restart all');
    
    // Step 5: Reload Nginx
    console.log('🌐 Reloading Nginx...');
    await execCommand('sudo systemctl reload nginx');
    
    console.log('✅ Deployment completed successfully!');
    return { success: true, message: 'Deployment completed successfully' };
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    return { success: false, message: `Deployment failed: ${error.message}` };
  }
}

// Webhook endpoint
app.post('/webhook', async (req, res) => {
  const signature = req.headers['x-hub-signature-256'];
  const payload = JSON.stringify(req.body);
  
  // Verify signature
  if (!verifySignature(payload, signature)) {
    console.log('❌ Invalid webhook signature');
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Check if it's a push to main branch
  if (req.body.ref === 'refs/heads/main') {
    console.log('📝 Push detected to main branch, starting deployment...');
    
    // Run deployment in background
    deploy().then(result => {
      console.log('Deployment result:', result);
    }).catch(error => {
      console.error('Deployment error:', error);
    });
    
    res.status(200).json({ message: 'Deployment started' });
  } else {
    console.log('ℹ️ Push detected to non-main branch, skipping deployment');
    res.status(200).json({ message: 'Push to non-main branch, deployment skipped' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Webhook server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎣 Webhook server running on port ${PORT}`);
  console.log(`📡 Webhook URL: http://your-server-ip:${PORT}/webhook`);
  console.log(`🔑 Webhook Secret: ${WEBHOOK_SECRET}`);
});

module.exports = app;
