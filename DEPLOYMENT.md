# 🚀 CleanTrack Deployment Guide

## 🌐 Deployment Options

### 1. Local Development
```bash
npm install
npm start
# Access at http://localhost:3000
```

### 2. Heroku Deployment

#### Prerequisites
- Heroku CLI installed
- Git repository initialized

#### Steps
```bash
# Login to Heroku
heroku login

# Create Heroku app
heroku create cleantrack-sih2025

# Set environment variables
heroku config:set NODE_ENV=production

# Deploy
git add .
git commit -m "Deploy CleanTrack to Heroku"
git push heroku main

# Open app
heroku open
```

#### Heroku Configuration
Add to `package.json`:
```json
{
  "engines": {
    "node": "18.x",
    "npm": "9.x"
  }
}
```

### 3. Railway Deployment

#### Steps
1. Connect GitHub repository to Railway
2. Set environment variables:
   - `NODE_ENV=production`
   - `PORT=3000`
3. Deploy automatically on push

### 4. Vercel Deployment

#### For Static Version
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts
```

### 5. DigitalOcean App Platform

#### Steps
1. Create new app from GitHub
2. Set build command: `npm install`
3. Set run command: `npm start`
4. Deploy

### 6. AWS EC2 Deployment

#### Setup Script
```bash
# Update system
sudo apt update
sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone https://github.com/Abhishekjc19/SIH-2025.git
cd SIH-2025

# Install dependencies
npm install

# Install PM2 for process management
sudo npm install -g pm2

# Start application
pm2 start server.js --name "cleantrack"

# Setup PM2 startup
pm2 startup
pm2 save

# Setup Nginx (optional)
sudo apt install nginx
```

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 7. Docker Deployment

#### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

USER node

CMD ["npm", "start"]
```

#### Docker Commands
```bash
# Build image
docker build -t cleantrack .

# Run container
docker run -p 3000:3000 cleantrack

# Docker Compose (optional)
version: '3.8'
services:
  cleantrack:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
```

## 🔧 Environment Variables

### Required Variables
```env
NODE_ENV=production
PORT=3000
```

### Optional Variables
```env
# For enhanced features
GOOGLE_MAPS_API_KEY=your_api_key
MONGODB_URI=your_mongodb_connection
REDIS_URL=your_redis_url
```

## 📊 Performance Optimization

### Production Optimizations
```javascript
// In server.js, add:
if (process.env.NODE_ENV === 'production') {
  // Enable compression
  app.use(require('compression')());
  
  // Security headers
  app.use(require('helmet')());
  
  // Rate limiting
  const rateLimit = require('express-rate-limit');
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  }));
}
```

### CDN Integration
Replace local assets with CDN versions:
```html
<!-- Leaflet from CDN -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
```

## 🔒 Security Considerations

### HTTPS Setup
```bash
# Using Let's Encrypt with Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Security Headers
```javascript
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});
```

## 📈 Monitoring & Analytics

### Health Check Endpoint
```javascript
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

### Logging Setup
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## 🚀 CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
      
    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{secrets.HEROKU_API_KEY}}
        heroku_app_name: "cleantrack-sih2025"
        heroku_email: "your-email@example.com"
```

## 📱 Mobile App Deployment

### PWA Configuration
```json
// public/manifest.json
{
  "name": "CleanTrack",
  "short_name": "CleanTrack",
  "description": "Smart Waste Management System",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0c0c0c",
  "theme_color": "#00ff87",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

## 🔍 Troubleshooting

### Common Issues
1. **Port already in use**: Change PORT in environment variables
2. **Socket.IO connection failed**: Check CORS settings
3. **Map not loading**: Verify internet connection and API keys
4. **Mobile responsiveness**: Test viewport meta tag

### Debug Mode
```bash
DEBUG=* npm start
```

## 📞 Support

For deployment issues:
- Check server logs: `heroku logs --tail`
- Monitor performance: Use built-in health checks
- Contact team: Create GitHub issue

---

**Ready to deploy CleanTrack to production! 🚀**