# 🌿 CleanTrack - Smart Waste Management System

## 🏆 SIH 2025 Hackathon Project

**Team:** CleanTrack Team  
**Problem Statement:** Smart Waste Management for Railway Travelers and City Citizens  
**Technology Stack:** Node.js, Express, Socket.IO, Leaflet.js, HTML5, CSS3, JavaScript  

---

## 🎯 Project Overview

CleanTrack is an innovative smart waste management system designed to help railway travelers and city citizens efficiently locate waste disposal points, track garbage collection vehicles in real-time, and report waste-related issues. The system promotes environmental consciousness through gamification and multi-language support.

### 🌟 Key Features

- **🗺️ Interactive Real-time Map** - Live tracking of dustbins, recycling centers, and garbage trucks
- **📍 Smart Bin Locator** - Find nearest available bins using GPS location
- **🚛 Live Vehicle Tracking** - Real-time garbage truck movement and status updates
- **⚠️ Issue Reporting System** - Report overflow, odour, and stray garbage incidents
- **🎮 Gamification** - Earn eco-points for responsible waste disposal and reporting
- **🌐 Multi-language Support** - Available in English, Hindi, and Kannada
- **📊 Live Analytics Dashboard** - Real-time statistics and monitoring
- **🎨 Modern Glassmorphism UI** - Futuristic design with smooth animations

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Abhishekjc19/SIH-2025.git
   cd SIH-2025
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the application**
   ```bash
   npm start
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

---

## 🏗️ Project Structure

```
SIH-2025/
├── public/                 # Frontend files
│   ├── index.html         # Main HTML file
│   ├── styles.css         # Glassmorphism styling
│   └── app.js            # Frontend JavaScript
├── server.js             # Backend server
├── package.json          # Dependencies & scripts
└── README.md            # Project documentation
```

---

## 🛠️ Technology Stack

### Frontend
- **HTML5** - Semantic markup and structure
- **CSS3** - Glassmorphism design with animations
- **JavaScript (ES6+)** - Interactive functionality
- **Leaflet.js** - Interactive mapping
- **Socket.IO Client** - Real-time communication

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **Socket.IO** - WebSocket communication
- **CORS** - Cross-origin resource sharing

### APIs & Services
- **OpenStreetMap** - Map tiles and data
- **Geolocation API** - User location services
- **Google Maps** - Navigation integration

---

## 🎮 Features Demonstration

### 1. Real-time Bin Monitoring
- **Color-coded fill levels**: Green (0-50%), Yellow (50-80%), Red (80-100%)
- **Live updates** every 3 seconds
- **Smart notifications** for full bins

### 2. Vehicle Tracking
- **Live truck positions** with route information
- **Status indicators**: Collecting, Moving, Idle
- **Speed and efficiency metrics**

### 3. Issue Reporting
- **One-click reporting** with GPS coordinates
- **Issue categories**: Overflow, Odour, Stray Garbage, Damaged Bin
- **Instant hotspot creation** on map

### 4. Gamification System
- **Eco-points rewards** for reporting and proper disposal
- **Achievement system** to encourage participation
- **Leaderboard functionality** (future enhancement)

---

## 🌐 Multi-language Support

| Language | Code | Status |
|----------|------|--------|
| English  | en   | ✅ Complete |
| Hindi    | hi   | ✅ Complete |
| Kannada  | kn   | ✅ Complete |

---

## 📱 Responsive Design

- **Desktop**: Full-featured dashboard with sidebar
- **Tablet**: Optimized layout with collapsible panels
- **Mobile**: Touch-friendly interface with bottom navigation

---

## 🔧 API Endpoints

### REST API
- `GET /api/state` - Get current system state
- `POST /api/report` - Submit waste issue report
- `GET /api/nearest-bin` - Find nearest available bin

### WebSocket Events
- `initialState` - Initial data load
- `liveUpdate` - Real-time updates
- `hotspotReported` - New issue reported
- `statsUpdate` - Statistics refresh

---

## 🎨 Design Philosophy

### Glassmorphism UI
- **Frosted glass effects** with backdrop blur
- **Subtle transparency** for depth perception
- **Neon accent colors** for modern appeal
- **Smooth animations** for enhanced UX

### Color Palette
- **Primary**: `#00ff87` (Neon Green)
- **Secondary**: `#60efff` (Cyan Blue)
- **Background**: `#0c0c0c` to `#16213e` (Dark Gradient)
- **Glass**: `rgba(255, 255, 255, 0.1)` with blur

---

## 🏆 Hackathon Impact

### Problem Solved
- **Waste overflow prevention** through predictive monitoring
- **Efficient resource allocation** for garbage collection
- **Citizen engagement** in waste management
- **Environmental awareness** through gamification

### Target Users
- **Railway travelers** looking for disposal points
- **City residents** managing household waste
- **Municipal authorities** monitoring collection efficiency
- **Environmental activists** promoting clean cities

### Scalability
- **Multi-city deployment** ready
- **IoT sensor integration** compatible
- **Machine learning** ready data structure
- **Cloud deployment** optimized

---

## 🚀 Future Enhancements

- [ ] **IoT Integration** - Real sensor data from smart bins
- [ ] **AI Predictions** - Waste generation forecasting
- [ ] **Route Optimization** - AI-powered collection routes
- [ ] **Blockchain Rewards** - Cryptocurrency eco-points
- [ ] **AR Navigation** - Augmented reality bin finder
- [ ] **Voice Commands** - Accessibility improvements

---

## 👥 Team Members

- **Abhishek JC** - Full Stack Developer & Team Lead
- **[Add team member names]** - [Roles]

---

## 📄 License

This project is developed for SIH 2025 hackathon. All rights reserved.

---

## 🤝 Contributing

This is a hackathon project. For suggestions or improvements, please create an issue or contact the team.

---

## 📞 Contact

- **GitHub**: [Abhishekjc19](https://github.com/Abhishekjc19)
- **Project Repository**: [SIH-2025](https://github.com/Abhishekjc19/SIH-2025)

---

## 🎯 Demo Instructions

### For Judges (5-minute demo)

1. **Open application** - Show loading animation and glassmorphism UI
2. **Live map demonstration** - Point out moving trucks and color-coded bins
3. **Report issue feature** - Click on map, submit report, show hotspot creation
4. **Find nearest bin** - Use geolocation, show navigation integration
5. **Real-time updates** - Show live statistics and truck movement
6. **Multi-language switch** - Demonstrate Hindi/Kannada support
7. **Mobile responsiveness** - Show tablet/phone layouts

### Key Talking Points
- **Real-time simulation** shows production readiness
- **Glassmorphism design** demonstrates modern UI/UX skills
- **Multi-language support** shows inclusivity for Indian users
- **Gamification** encourages citizen participation
- **Scalable architecture** ready for IoT integration

---

**Made with 💚 for a cleaner, smarter India**