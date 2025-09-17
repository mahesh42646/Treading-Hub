#!/usr/bin/env node

const express = require('express');
const { exec } = require('child_process');
const crypto = require('crypto');

const app = express();
const PORT = 3009; // Different port to avoid conflicts
const WEBHOOK_SECRET = 'trading-hub-deploy-2024'; // Simple secret key
const PROJECT_PATH = '/var/www/Ubuntu/Treading-Hub';

app.use(express.json());

// Simple webhook endpoint
app.post('/deploy', async (req, res) => {
  console.log('🚀 Deployment triggered!');
  
  // Send immediate response
  res.status(200).json({ success: true, message: 'Deployment started' });
  
  // Execute deployment commands in background
  exec('cd /var/www/Ubuntu/Treading-Hub && git pull && npm run build && pm2 restart all && sudo systemctl reload nginx', 
    (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Deployment failed:', error);
        console.error('Stderr:', stderr);
      } else {
        console.log('✅ Deployment successful!');
        console.log(stdout);
      }
    }
  );
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Webhook server running on port 3009' });
});

app.listen(PORT, () => {
  console.log(`🎣 Webhook server running on http://localhost:${PORT}`);
  console.log(`📡 Deploy URL: http://your-server-ip:${PORT}/deploy`);
});
