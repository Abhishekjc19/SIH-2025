// CleanTrack Frontend Application
class CleanTrackApp {
    constructor() {
        this.map = null;
        this.socket = null;
        this.markers = {
            bins: {},
            trucks: {},
            hotspots: {}
        };
        this.userLocation = null;
        this.filters = {
            showBins: true,
            showTrucks: true,
            showHotspots: true,
            showRecycling: true
        };
        this.translations = {
            en: {
                dustbin: 'Dustbin',
                recycling: 'Recycling Center',
                truck: 'Garbage Truck',
                hotspot: 'Waste Hotspot',
                navigate: 'Navigate Here',
                report: 'Report Issue',
                fillLevel: 'Fill Level'
            },
            hi: {
                dustbin: 'कूड़ादान',
                recycling: 'रीसाइक्लिंग केंद्र',
                truck: 'कचरा ट्रक',
                hotspot: 'कचरा हॉटस्पॉट',
                navigate: 'यहाँ नेविगेट करें',
                report: 'समस्या रिपोर्ट करें',
                fillLevel: 'भराव स्तर'
            },
            kn: {
                dustbin: 'ಕಸದ ಪೆಟ್ಟಿಗೆ',
                recycling: 'ಮರುಬಳಕೆ ಕೇಂದ್ರ',
                truck: 'ಕಸ ಟ್ರಕ್',
                hotspot: 'ಕಸ ಹಾಟ್‌ಸ್ಪಾಟ್',
                navigate: 'ಇಲ್ಲಿ ನ್ಯಾವಿಗೇಟ್ ಮಾಡಿ',
                report: 'ಸಮಸ್ಯೆ ವರದಿ ಮಾಡಿ',
                fillLevel: 'ತುಂಬುವಿಕೆ ಮಟ್ಟ'
            }
        };
        this.currentLang = 'en';
        
        this.initializeApp();
    }

    async initializeApp() {
        try {
            this.showLoading(true);
            await this.initializeMap();
            this.initializeSocket();
            this.setupEventListeners();
            this.getUserLocation();
            this.showLoading(false);
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showNotification('Failed to load CleanTrack. Please refresh the page.', 'error');
        }
    }

    initializeMap() {
        return new Promise((resolve, reject) => {
            try {
                // Initialize map centered on Bangalore
                this.map = L.map('map', {
                    zoomControl: false,
                    attributionControl: false
                }).setView([12.9716, 77.5946], 13);

                // Add custom zoom control
                L.control.zoom({
                    position: 'bottomright'
                }).addTo(this.map);

                // Dark theme tile layer
                L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                    attribution: '©OpenStreetMap, ©CartoDB',
                    subdomains: 'abcd',
                    maxZoom: 20
                }).addTo(this.map);

                // Setup map click event for reporting
                this.map.on('click', (e) => {
                    this.handleMapClick(e);
                });

                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    initializeSocket() {
        this.socket = io();

        this.socket.on('connect', () => {
            console.log('Connected to CleanTrack server');
            this.updateStatusIndicator(true);
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            this.updateStatusIndicator(false);
        });

        this.socket.on('initialState', (data) => {
            this.updateGameState(data);
        });

        this.socket.on('liveUpdate', (data) => {
            this.updateLiveData(data);
        });

        this.socket.on('hotspotReported', (hotspot) => {
            this.addHotspotMarker(hotspot);
            this.showNotification('Thank you for reporting! +50 Eco Points earned.', 'success');
        });

        this.socket.on('statsUpdate', (stats) => {
            this.updateStats(stats);
        });
    }

    setupEventListeners() {
        // Filter controls
        document.getElementById('showBins').addEventListener('change', (e) => {
            this.filters.showBins = e.target.checked;
            this.updateMapVisibility();
        });

        document.getElementById('showTrucks').addEventListener('change', (e) => {
            this.filters.showTrucks = e.target.checked;
            this.updateMapVisibility();
        });

        document.getElementById('showHotspots').addEventListener('change', (e) => {
            this.filters.showHotspots = e.target.checked;
            this.updateMapVisibility();
        });

        document.getElementById('showRecycling').addEventListener('change', (e) => {
            this.filters.showRecycling = e.target.checked;
            this.updateMapVisibility();
        });

        // Action buttons
        document.getElementById('findNearestBtn').addEventListener('click', () => {
            this.findNearestBin();
        });

        document.getElementById('reportIssueBtn').addEventListener('click', () => {
            this.openReportModal();
        });

        document.getElementById('ecoTipsBtn').addEventListener('click', () => {
            this.openEcoTipsModal();
        });

        // Language selector
        document.getElementById('languageSelect').addEventListener('change', (e) => {
            this.currentLang = e.target.value;
            this.updateLanguage();
        });

        // Modal controls
        this.setupModalControls();

        // Info card close
        document.getElementById('closeInfoCard').addEventListener('click', () => {
            this.hideInfoCard();
        });
    }

    setupModalControls() {
        // Report modal
        document.getElementById('closeReportModal').addEventListener('click', () => {
            this.closeReportModal();
        });

        document.getElementById('reportForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitReport();
        });

        // Eco tips modal
        document.getElementById('closeEcoTipsModal').addEventListener('click', () => {
            this.closeEcoTipsModal();
        });

        // Close modals on outside click
        window.addEventListener('click', (e) => {
            const reportModal = document.getElementById('reportModal');
            const ecoTipsModal = document.getElementById('ecoTipsModal');
            
            if (e.target === reportModal) {
                this.closeReportModal();
            }
            if (e.target === ecoTipsModal) {
                this.closeEcoTipsModal();
            }
        });
    }

    getUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    
                    // Add user marker
                    const userIcon = L.divIcon({
                        html: '📍',
                        className: 'user-location-marker',
                        iconSize: [30, 30]
                    });

                    L.marker([this.userLocation.lat, this.userLocation.lng], { icon: userIcon })
                        .addTo(this.map)
                        .bindPopup('Your Location')
                        .openPopup();
                },
                (error) => {
                    console.log('Geolocation error:', error);
                    this.showNotification('Location access denied. Using default location.', 'warning');
                }
            );
        }
    }

    updateGameState(data) {
        this.clearAllMarkers();
        
        // Add bin markers
        data.bins.forEach(bin => this.addBinMarker(bin));
        
        // Add truck markers
        data.trucks.forEach(truck => this.addTruckMarker(truck));
        
        // Add hotspot markers
        data.hotspots.forEach(hotspot => this.addHotspotMarker(hotspot));
        
        // Update stats
        this.updateStats(data.stats);
    }

    updateLiveData(data) {
        // Update truck positions
        data.trucks.forEach(truck => this.updateTruckMarker(truck));
        
        // Update bin levels
        data.bins.forEach(bin => this.updateBinMarker(bin));
        
        // Update stats
        this.updateStats(data.stats);
    }

    addBinMarker(bin) {
        const fillLevel = bin.fillLevel;
        let iconColor = '#00ff87'; // Green for empty
        
        if (fillLevel > 80) iconColor = '#ff453a'; // Red for full
        else if (fillLevel > 50) iconColor = '#ffc107'; // Yellow for half
        
        const icon = L.divIcon({
            html: `
                <div class="bin-marker" style="background-color: ${iconColor}">
                    ${bin.type === 'recycling' ? '♻️' : '🗑️'}
                    <div class="fill-indicator" style="height: ${fillLevel}%"></div>
                </div>
            `,
            className: 'custom-marker',
            iconSize: [40, 40]
        });

        const marker = L.marker([bin.lat, bin.lng], { icon })
            .addTo(this.map)
            .bindPopup(this.createBinPopup(bin))
            .on('click', () => this.showBinInfo(bin));

        this.markers.bins[bin.id] = marker;
    }

    addTruckMarker(truck) {
        const icon = L.divIcon({
            html: `
                <div class="truck-marker ${truck.status}">
                    🚛
                    <div class="truck-status">${truck.status}</div>
                </div>
            `,
            className: 'custom-marker',
            iconSize: [40, 40]
        });

        const marker = L.marker([truck.lat, truck.lng], { icon })
            .addTo(this.map)
            .bindPopup(this.createTruckPopup(truck))
            .on('click', () => this.showTruckInfo(truck));

        this.markers.trucks[truck.id] = marker;
    }

    addHotspotMarker(hotspot) {
        const severityColors = {
            low: '#ffc107',
            medium: '#ff9500',
            high: '#ff453a'
        };

        const icon = L.divIcon({
            html: `
                <div class="hotspot-marker" style="border-color: ${severityColors[hotspot.severity]}">
                    ⚠️
                    <div class="hotspot-pulse" style="border-color: ${severityColors[hotspot.severity]}"></div>
                </div>
            `,
            className: 'custom-marker',
            iconSize: [40, 40]
        });

        const marker = L.marker([hotspot.lat, hotspot.lng], { icon })
            .addTo(this.map)
            .bindPopup(this.createHotspotPopup(hotspot))
            .on('click', () => this.showHotspotInfo(hotspot));

        this.markers.hotspots[hotspot.id] = marker;
    }

    updateTruckMarker(truck) {
        const marker = this.markers.trucks[truck.id];
        if (marker) {
            // Animate marker movement
            marker.setLatLng([truck.lat, truck.lng]);
            
            // Update popup content
            marker.setPopupContent(this.createTruckPopup(truck));
        }
    }

    updateBinMarker(bin) {
        const marker = this.markers.bins[bin.id];
        if (marker) {
            // Update marker icon based on fill level
            const fillLevel = bin.fillLevel;
            let iconColor = '#00ff87';
            
            if (fillLevel > 80) iconColor = '#ff453a';
            else if (fillLevel > 50) iconColor = '#ffc107';
            
            const icon = L.divIcon({
                html: `
                    <div class="bin-marker" style="background-color: ${iconColor}">
                        ${bin.type === 'recycling' ? '♻️' : '🗑️'}
                        <div class="fill-indicator" style="height: ${fillLevel}%"></div>
                    </div>
                `,
                className: 'custom-marker',
                iconSize: [40, 40]
            });

            marker.setIcon(icon);
            marker.setPopupContent(this.createBinPopup(bin));
        }
    }

    createBinPopup(bin) {
        const t = this.translations[this.currentLang];
        const fillLevel = bin.fillLevel;
        let statusText = 'Available';
        let statusColor = '#00ff87';
        
        if (fillLevel > 90) {
            statusText = 'Full';
            statusColor = '#ff453a';
        } else if (fillLevel > 70) {
            statusText = 'Nearly Full';
            statusColor = '#ffc107';
        }

        return `
            <div class="popup-content">
                <h3>${bin.type === 'recycling' ? t.recycling : t.dustbin}</h3>
                <p><strong>Location:</strong> ${bin.name}</p>
                <p><strong>${t.fillLevel}:</strong> <span style="color: ${statusColor}">${fillLevel}% (${statusText})</span></p>
                <div class="popup-actions">
                    <a href="https://www.google.com/maps/dir/?api=1&destination=${bin.lat},${bin.lng}" 
                       target="_blank" class="info-btn">${t.navigate}</a>
                </div>
            </div>
        `;
    }

    createTruckPopup(truck) {
        const t = this.translations[this.currentLang];
        return `
            <div class="popup-content">
                <h3>${t.truck}</h3>
                <p><strong>Route:</strong> ${truck.route}</p>
                <p><strong>Status:</strong> ${truck.status}</p>
                <p><strong>Speed:</strong> ${truck.speed} km/h</p>
            </div>
        `;
    }

    createHotspotPopup(hotspot) {
        const t = this.translations[this.currentLang];
        return `
            <div class="popup-content">
                <h3>${t.hotspot}</h3>
                <p><strong>Issue Type:</strong> ${hotspot.type}</p>
                <p><strong>Severity:</strong> ${hotspot.severity}</p>
                <p><strong>Reported by:</strong> ${hotspot.reportedBy}</p>
            </div>
        `;
    }

    showBinInfo(bin) {
        const t = this.translations[this.currentLang];
        const infoCard = document.getElementById('infoCard');
        const infoTitle = document.getElementById('infoTitle');
        const infoDetails = document.getElementById('infoDetails');
        const infoActions = document.getElementById('infoActions');

        infoTitle.textContent = `${bin.type === 'recycling' ? t.recycling : t.dustbin}`;
        infoDetails.innerHTML = `
            <strong>Location:</strong> ${bin.name}<br>
            <strong>${t.fillLevel}:</strong> ${bin.fillLevel}%<br>
            <strong>Type:</strong> ${bin.type}
        `;
        infoActions.innerHTML = `
            <a href="https://www.google.com/maps/dir/?api=1&destination=${bin.lat},${bin.lng}" 
               target="_blank" class="info-btn">${t.navigate}</a>
        `;

        infoCard.classList.remove('hidden');
    }

    showTruckInfo(truck) {
        const t = this.translations[this.currentLang];
        const infoCard = document.getElementById('infoCard');
        const infoTitle = document.getElementById('infoTitle');
        const infoDetails = document.getElementById('infoDetails');
        const infoActions = document.getElementById('infoActions');

        infoTitle.textContent = t.truck;
        infoDetails.innerHTML = `
            <strong>Route:</strong> ${truck.route}<br>
            <strong>Status:</strong> ${truck.status}<br>
            <strong>Speed:</strong> ${truck.speed} km/h
        `;
        infoActions.innerHTML = '';

        infoCard.classList.remove('hidden');
    }

    showHotspotInfo(hotspot) {
        const t = this.translations[this.currentLang];
        const infoCard = document.getElementById('infoCard');
        const infoTitle = document.getElementById('infoTitle');
        const infoDetails = document.getElementById('infoDetails');
        const infoActions = document.getElementById('infoActions');

        infoTitle.textContent = t.hotspot;
        infoDetails.innerHTML = `
            <strong>Issue Type:</strong> ${hotspot.type}<br>
            <strong>Severity:</strong> ${hotspot.severity}<br>
            <strong>Reported by:</strong> ${hotspot.reportedBy}
        `;
        infoActions.innerHTML = '';

        infoCard.classList.remove('hidden');
    }

    hideInfoCard() {
        const infoCard = document.getElementById('infoCard');
        infoCard.classList.add('hidden');
    }

    async findNearestBin() {
        if (!this.userLocation) {
            this.showNotification('Please allow location access to find nearest bin.', 'warning');
            return;
        }

        try {
            const response = await fetch(`/api/nearest-bin?lat=${this.userLocation.lat}&lng=${this.userLocation.lng}`);
            const nearestBin = await response.json();

            if (nearestBin) {
                // Highlight the nearest bin
                this.map.setView([nearestBin.lat, nearestBin.lng], 16);
                
                // Show info about the nearest bin
                this.showBinInfo(nearestBin);
                
                this.showNotification(`Nearest available bin found: ${nearestBin.name}`, 'success');
            } else {
                this.showNotification('No available bins found nearby.', 'warning');
            }
        } catch (error) {
            console.error('Error finding nearest bin:', error);
            this.showNotification('Error finding nearest bin.', 'error');
        }
    }

    handleMapClick(e) {
        const reportBtn = document.getElementById('reportIssueBtn');
        
        // Store click location for potential reporting
        this.clickedLocation = e.latlng;
        
        // Briefly highlight the report button
        reportBtn.style.animation = 'pulse 0.5s ease-in-out';
        setTimeout(() => {
            reportBtn.style.animation = '';
        }, 500);
    }

    openReportModal() {
        const modal = document.getElementById('reportModal');
        const reportLat = document.getElementById('reportLat');
        const reportLng = document.getElementById('reportLng');

        // Use clicked location or user location
        const location = this.clickedLocation || this.userLocation || { lat: 12.9716, lng: 77.5946 };
        
        reportLat.value = location.lat;
        reportLng.value = location.lng;

        modal.style.display = 'block';
        modal.classList.add('fade-in');
    }

    closeReportModal() {
        const modal = document.getElementById('reportModal');
        modal.style.display = 'none';
    }

    async submitReport() {
        const issueType = document.getElementById('issueType').value;
        const issueDescription = document.getElementById('issueDescription').value;
        const reportLat = document.getElementById('reportLat').value;
        const reportLng = document.getElementById('reportLng').value;

        try {
            const response = await fetch('/api/report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    lat: reportLat,
                    lng: reportLng,
                    type: issueType,
                    description: issueDescription
                }),
            });

            const result = await response.json();

            if (result.success) {
                this.closeReportModal();
                this.showNotification(`Report submitted! +${result.ecoPoints} Eco Points earned.`, 'success');
                
                // Update eco points display
                document.getElementById('ecoPoints').textContent = 
                    parseInt(document.getElementById('ecoPoints').textContent) + result.ecoPoints;
                
                // Clear form
                document.getElementById('reportForm').reset();
            }
        } catch (error) {
            console.error('Error submitting report:', error);
            this.showNotification('Error submitting report. Please try again.', 'error');
        }
    }

    openEcoTipsModal() {
        const modal = document.getElementById('ecoTipsModal');
        modal.style.display = 'block';
        modal.classList.add('fade-in');
    }

    closeEcoTipsModal() {
        const modal = document.getElementById('ecoTipsModal');
        modal.style.display = 'none';
    }

    updateMapVisibility() {
        // Update bin markers visibility
        Object.values(this.markers.bins).forEach(marker => {
            const bin = marker.options.bin;
            const shouldShow = this.filters.showBins || 
                (this.filters.showRecycling && bin && bin.type === 'recycling');
            
            if (shouldShow) {
                this.map.addLayer(marker);
            } else {
                this.map.removeLayer(marker);
            }
        });

        // Update truck markers visibility
        Object.values(this.markers.trucks).forEach(marker => {
            if (this.filters.showTrucks) {
                this.map.addLayer(marker);
            } else {
                this.map.removeLayer(marker);
            }
        });

        // Update hotspot markers visibility
        Object.values(this.markers.hotspots).forEach(marker => {
            if (this.filters.showHotspots) {
                this.map.addLayer(marker);
            } else {
                this.map.removeLayer(marker);
            }
        });
    }

    updateStats(stats) {
        document.getElementById('totalBins').textContent = stats.totalBins;
        document.getElementById('fullBins').textContent = stats.fullBins;
        document.getElementById('activeTrucks').textContent = stats.activeTrucks;
        document.getElementById('totalHotspots').textContent = stats.totalHotspots;
        document.getElementById('ecoPoints').textContent = stats.ecoPoints;
    }

    updateLanguage() {
        // This would update all UI text based on selected language
        // For demo purposes, markers will update on next data refresh
        this.showNotification('Language updated successfully!', 'success');
    }

    updateStatusIndicator(connected) {
        const indicator = document.getElementById('statusIndicator');
        const dot = indicator.querySelector('.status-dot');
        const text = indicator.querySelector('span');

        if (connected) {
            dot.style.backgroundColor = '#00ff87';
            text.textContent = 'Live';
        } else {
            dot.style.backgroundColor = '#ff453a';
            text.textContent = 'Offline';
        }
    }

    showLoading(show) {
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (show) {
            loadingIndicator.style.display = 'block';
        } else {
            setTimeout(() => {
                loadingIndicator.style.display = 'none';
            }, 1000);
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        const notificationText = notification.querySelector('.notification-text');
        const notificationIcon = notification.querySelector('.notification-icon');

        // Set icon based on type
        switch (type) {
            case 'success':
                notificationIcon.textContent = '✅';
                notification.style.borderColor = 'rgba(0, 255, 135, 0.3)';
                notification.style.backgroundColor = 'rgba(0, 255, 135, 0.2)';
                break;
            case 'warning':
                notificationIcon.textContent = '⚠️';
                notification.style.borderColor = 'rgba(255, 193, 7, 0.3)';
                notification.style.backgroundColor = 'rgba(255, 193, 7, 0.2)';
                break;
            case 'error':
                notificationIcon.textContent = '❌';
                notification.style.borderColor = 'rgba(255, 69, 58, 0.3)';
                notification.style.backgroundColor = 'rgba(255, 69, 58, 0.2)';
                break;
            default:
                notificationIcon.textContent = 'ℹ️';
                notification.style.borderColor = 'rgba(96, 239, 255, 0.3)';
                notification.style.backgroundColor = 'rgba(96, 239, 255, 0.2)';
        }

        notificationText.textContent = message;
        notification.classList.remove('hidden');
        notification.classList.add('show');

        // Hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            notification.classList.add('hidden');
        }, 3000);
    }

    clearAllMarkers() {
        // Clear all existing markers
        Object.values(this.markers.bins).forEach(marker => this.map.removeLayer(marker));
        Object.values(this.markers.trucks).forEach(marker => this.map.removeLayer(marker));
        Object.values(this.markers.hotspots).forEach(marker => this.map.removeLayer(marker));

        this.markers = {
            bins: {},
            trucks: {},
            hotspots: {}
        };
    }
}

// Custom CSS for markers (injected dynamically)
const markerStyles = `
    <style>
        .custom-marker {
            background: none !important;
            border: none !important;
        }
        
        .bin-marker {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            position: relative;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            animation: bounce 0.5s ease-in-out;
        }
        
        .fill-indicator {
            position: absolute;
            bottom: 2px;
            left: 50%;
            transform: translateX(-50%);
            width: 6px;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 3px;
            transition: height 0.3s ease;
        }
        
        .truck-marker {
            width: 40px;
            height: 40px;
            background: rgba(96, 239, 255, 0.2);
            border: 2px solid #60efff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            position: relative;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            animation: moveAnimation 2s ease-in-out infinite;
        }
        
        .truck-status {
            position: absolute;
            bottom: -8px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 8px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 1px 4px;
            border-radius: 2px;
        }
        
        .hotspot-marker {
            width: 40px;
            height: 40px;
            background: rgba(255, 69, 58, 0.2);
            border: 2px solid #ff453a;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            position: relative;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            animation: pulse 2s infinite;
        }
        
        .hotspot-pulse {
            position: absolute;
            width: 60px;
            height: 60px;
            border: 2px solid;
            border-radius: 50%;
            top: -12px;
            left: -12px;
            animation: ripple 2s infinite;
        }
        
        .user-location-marker {
            background: none !important;
            border: none !important;
            font-size: 24px;
            animation: bounce 1s ease-in-out infinite;
        }
        
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        
        @keyframes moveAnimation {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
        
        @keyframes ripple {
            0% { transform: scale(0.5); opacity: 1; }
            100% { transform: scale(1.2); opacity: 0; }
        }
        
        .popup-content h3 {
            color: #00ff87;
            margin-bottom: 12px;
            font-size: 16px;
        }
        
        .popup-content p {
            margin-bottom: 8px;
            font-size: 14px;
        }
        
        .popup-actions {
            margin-top: 12px;
            display: flex;
            gap: 8px;
        }
    </style>
`;

// Inject marker styles
document.head.insertAdjacentHTML('beforeend', markerStyles);

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CleanTrackApp();
});