const express = require('express');
const path = require('path');
const { inject } = require('@vercel/analytics/server');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Vercel Analytics middleware - injects analytics into HTML responses
app.use((req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Only inject analytics for HTML responses
    if (res.get('Content-Type')?.includes('text/html') && typeof data === 'string') {
      try {
        // Inject Vercel Analytics script into HTML
        data = inject(data);
      } catch (error) {
        console.error('Error injecting analytics:', error);
      }
    }
    return originalSend.call(this, data);
  };
  
  next();
});

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Main API endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Speech Generator Backend API',
    version: '1.0.0',
    analytics: 'Vercel Analytics enabled'
  });
});

// Example HTML page with analytics
app.get('/demo', (req, res) => {
  res.type('html').send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Speech Generator Backend</title>
    </head>
    <body>
      <h1>Speech Generator Backend API</h1>
      <p>This page includes Vercel Web Analytics.</p>
      <p>Analytics will be automatically injected when deployed to Vercel.</p>
    </body>
    </html>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Vercel Analytics is configured and will be active when deployed`);
});
