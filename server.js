const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initial data state
let gameState = {
  bins: [
    { id: 1, lat: 12.9716, lng: 77.5946, fillLevel: 30, type: 'dustbin', name: 'City Railway Station - Platform 1' },
    { id: 2, lat: 12.9756, lng: 77.5946, fillLevel: 60, type: 'recycling', name: 'Recycling Center - Main Exit' },
    { id: 3, lat: 12.9726, lng: 77.5986, fillLevel: 85, type: 'dustbin', name: 'Food Court Area' },
    { id: 4, lat: 12.9696, lng: 77.5926, fillLevel: 15, type: 'dustbin', name: 'Parking Area' },
    { id: 5, lat: 12.9776, lng: 77.5966, fillLevel: 70, type: 'recycling', name: 'Shopping Complex' },
    { id: 6, lat: 12.9746, lng: 77.5906, fillLevel: 45, type: 'dustbin', name: 'Bus Stop Junction' },
    { id: 7, lat: 12.9706, lng: 77.5966, fillLevel: 90, type: 'dustbin', name: 'Market Street' },
    { id: 8, lat: 12.9786, lng: 77.5926, fillLevel: 25, type: 'recycling', name: 'Office Complex' }
  ],
  trucks: [
    { id: 1, lat: 12.9736, lng: 77.5936, route: 'Route-A', status: 'collecting', speed: 2 },
    { id: 2, lat: 12.9766, lng: 77.5956, route: 'Route-B', status: 'moving', speed: 3 },
    { id: 3, lat: 12.9696, lng: 77.5976, route: 'Route-C', status: 'collecting', speed: 1.5 }
  ],
  hotspots: [
    { id: 1, lat: 12.9726, lng: 77.5976, type: 'overflow', severity: 'high', reportedBy: 'citizen_001' },
    { id: 2, lat: 12.9756, lng: 77.5916, type: 'odour', severity: 'medium', reportedBy: 'citizen_002' }
  ],
  stats: {
    totalBins: 8,
    fullBins: 0,
    activeTrucks: 3,
    totalHotspots: 2,
    ecoPoints: 1250
  }
};

// Calculate stats
function updateStats() {
  gameState.stats.fullBins = gameState.bins.filter(bin => bin.fillLevel > 80).length;
  gameState.stats.totalBins = gameState.bins.length;
  gameState.stats.activeTrucks = gameState.trucks.length;
  gameState.stats.totalHotspots = gameState.hotspots.length;
}

// Simulate truck movement
function moveTrucks() {
  gameState.trucks.forEach(truck => {
    // Random movement within bounds
    const latChange = (Math.random() - 0.5) * 0.001 * truck.speed;
    const lngChange = (Math.random() - 0.5) * 0.001 * truck.speed;
    
    truck.lat = Math.max(12.960, Math.min(12.985, truck.lat + latChange));
    truck.lng = Math.max(77.580, Math.min(77.610, truck.lng + lngChange));
    
    // Randomly change status
    if (Math.random() < 0.1) {
      truck.status = Math.random() < 0.5 ? 'collecting' : 'moving';
    }
  });
}

// Simulate bin fill level changes
function updateBinLevels() {
  gameState.bins.forEach(bin => {
    // Randomly increase/decrease fill level
    const change = Math.floor(Math.random() * 10) - 4; // -4 to +5
    bin.fillLevel = Math.max(0, Math.min(100, bin.fillLevel + change));
  });
}

// API Routes
app.get('/api/state', (req, res) => {
  updateStats();
  res.json(gameState);
});

app.post('/api/report', (req, res) => {
  const { lat, lng, type, description } = req.body;
  
  const newHotspot = {
    id: Date.now(),
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    type: type || 'overflow',
    severity: 'medium',
    reportedBy: `citizen_${Date.now()}`,
    description: description || 'Reported issue'
  };
  
  gameState.hotspots.push(newHotspot);
  gameState.stats.ecoPoints += 50; // Reward for reporting
  
  // Broadcast to all clients
  io.emit('hotspotReported', newHotspot);
  io.emit('statsUpdate', gameState.stats);
  
  res.json({ success: true, ecoPoints: 50, hotspot: newHotspot });
});

app.get('/api/nearest-bin', (req, res) => {
  const { lat, lng } = req.query;
  const userLat = parseFloat(lat);
  const userLng = parseFloat(lng);
  
  // Calculate distances and find nearest available bin
  const availableBins = gameState.bins
    .filter(bin => bin.fillLevel < 90)
    .map(bin => ({
      ...bin,
      distance: Math.sqrt(
        Math.pow(bin.lat - userLat, 2) + Math.pow(bin.lng - userLng, 2)
      )
    }))
    .sort((a, b) => a.distance - b.distance);
  
  res.json(availableBins[0] || null);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Send initial state
  socket.emit('initialState', gameState);
  
  socket.on('requestUpdate', () => {
    updateStats();
    socket.emit('stateUpdate', gameState);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start simulation intervals
setInterval(() => {
  moveTrucks();
  updateBinLevels();
  updateStats();
  io.emit('liveUpdate', {
    trucks: gameState.trucks,
    bins: gameState.bins,
    stats: gameState.stats
  });
}, 3000); // Update every 3 seconds

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 CleanTrack server running on http://localhost:${PORT}`);
  console.log('📱 Open in browser to start the demo!');
});