// CleanTrack Application
class CleanTrackApp {
    constructor() {
        this.currentUser = null;
        this.isAdmin = false;
        this.reports = [];
        this.users = [];
        this.map = null;
        this.adminMap = null;
        this.markers = [];
        this.adminMarkers = [];
        this.selectedRating = 0;
        
        this.initializeApp();
    }

    initializeApp() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.initializeSampleData();
        this.updateUI();
    }

    // Local Storage Management
    loadFromStorage() {
        const userData = localStorage.getItem('cleantrack_user');
        const reportsData = localStorage.getItem('cleantrack_reports');
        const usersData = localStorage.getItem('cleantrack_users');

        if (userData) {
            this.currentUser = JSON.parse(userData);
        }

        if (reportsData) {
            this.reports = JSON.parse(reportsData);
        }

        if (usersData) {
            this.users = JSON.parse(usersData);
        }
    }

    saveToStorage() {
        if (this.currentUser) {
            localStorage.setItem('cleantrack_user', JSON.stringify(this.currentUser));
        }
        localStorage.setItem('cleantrack_reports', JSON.stringify(this.reports));
        localStorage.setItem('cleantrack_users', JSON.stringify(this.users));
    }

    // Initialize sample data
    initializeSampleData() {
        if (this.reports.length === 0) {
            this.reports = [
                {
                    id: 1,
                    userId: 'user1',
                    userName: 'Rajesh Kumar',
                    category: 'overflowing-bin',
                    location: 'MG Road, Bangalore',
                    coordinates: { lat: 12.9716, lng: 77.5946 },
                    description: 'Dustbin near bus stop is overflowing with garbage',
                    priority: 'high',
                    status: 'pending',
                    photos: ['https://images.pexels.com/photos/3735218/pexels-photo-3735218.jpeg'],
                    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: 2,
                    userId: 'user2',
                    userName: 'Priya Sharma',
                    category: 'illegal-dumping',
                    location: 'Koramangala 4th Block',
                    coordinates: { lat: 12.9352, lng: 77.6245 },
                    description: 'Construction waste dumped on the roadside',
                    priority: 'medium',
                    status: 'in-progress',
                    photos: ['https://images.pexels.com/photos/2827392/pexels-photo-2827392.jpeg'],
                    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                    adminNotes: 'Cleanup crew assigned, work in progress'
                },
                {
                    id: 3,
                    userId: 'user3',
                    userName: 'Amit Patel',
                    category: 'street-litter',
                    location: 'Brigade Road',
                    coordinates: { lat: 12.9698, lng: 77.6205 },
                    description: 'Plastic bottles and food waste scattered on street',
                    priority: 'low',
                    status: 'resolved',
                    photos: ['https://images.pexels.com/photos/2827392/pexels-photo-2827392.jpeg'],
                    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                    adminNotes: 'Area cleaned and additional bins installed',
                    resolvedPhoto: 'https://images.pexels.com/photos/761297/pexels-photo-761297.jpeg'
                }
            ];
        }

        if (this.users.length === 0) {
            this.users = [
                {
                    id: 'user1',
                    name: 'Rajesh Kumar',
                    email: 'rajesh@example.com',
                    phone: '+91 9876543210',
                    joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                    reportsCount: 5,
                    points: 250
                },
                {
                    id: 'user2',
                    name: 'Priya Sharma',
                    email: 'priya@example.com',
                    phone: '+91 9876543211',
                    joinedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
                    reportsCount: 8,
                    points: 400
                },
                {
                    id: 'user3',
                    name: 'Amit Patel',
                    email: 'amit@example.com',
                    phone: '+91 9876543212',
                    joinedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
                    reportsCount: 12,
                    points: 600
                }
            ];
        }

        this.saveToStorage();
    }

    // Event Listeners
    setupEventListeners() {
        // Form submissions
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('signupForm').addEventListener('submit', (e) => this.handleSignup(e));
        document.getElementById('adminLoginForm').addEventListener('submit', (e) => this.handleAdminLogin(e));
        document.getElementById('reportForm').addEventListener('submit', (e) => this.handleReportSubmission(e));
        document.getElementById('feedbackForm').addEventListener('submit', (e) => this.handleFeedbackSubmission(e));

        // File upload
        document.getElementById('issuePhoto').addEventListener('change', (e) => this.handlePhotoUpload(e));

        // Rating stars
        document.querySelectorAll('.star').forEach(star => {
            star.addEventListener('click', (e) => this.handleRatingClick(e));
        });

        // Modal close
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('reportModal');
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    // Authentication
    handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        // Simple validation (in real app, this would be server-side)
        if (email && password) {
            const user = this.users.find(u => u.email === email);
            if (user) {
                this.currentUser = user;
                this.isAdmin = false;
                this.saveToStorage();
                this.showNotification('Login successful!', 'success');
                this.showPage('dashboard');
                this.updateUI();
            } else {
                // Create new user if not exists (for demo)
                const newUser = {
                    id: 'user_' + Date.now(),
                    name: email.split('@')[0],
                    email: email,
                    phone: '',
                    joinedAt: new Date().toISOString(),
                    reportsCount: 0,
                    points: 0
                };
                this.users.push(newUser);
                this.currentUser = newUser;
                this.isAdmin = false;
                this.saveToStorage();
                this.showNotification('Account created and logged in!', 'success');
                this.showPage('dashboard');
                this.updateUI();
            }
        }
    }

    handleSignup(e) {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const phone = document.getElementById('signupPhone').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match!', 'error');
            return;
        }

        // Check if user already exists
        if (this.users.find(u => u.email === email)) {
            this.showNotification('User already exists!', 'error');
            return;
        }

        const newUser = {
            id: 'user_' + Date.now(),
            name: name,
            email: email,
            phone: phone,
            joinedAt: new Date().toISOString(),
            reportsCount: 0,
            points: 0
        };

        this.users.push(newUser);
        this.currentUser = newUser;
        this.isAdmin = false;
        this.saveToStorage();
        this.showNotification('Account created successfully!', 'success');
        this.showPage('dashboard');
        this.updateUI();
    }

    handleAdminLogin(e) {
        e.preventDefault();
        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;
        const adminCode = document.getElementById('adminCode').value;

        // Simple admin validation (in real app, this would be server-side)
        if (email === 'admin@bbmp.gov.in' && password === 'admin123' && adminCode === 'BBMP2024') {
            this.currentUser = {
                id: 'admin',
                name: 'BBMP Admin',
                email: email,
                role: 'admin'
            };
            this.isAdmin = true;
            this.saveToStorage();
            this.showNotification('Admin login successful!', 'success');
            this.showPage('admin-dashboard');
            this.updateUI();
        } else {
            this.showNotification('Invalid admin credentials!', 'error');
        }
    }

    logout() {
        this.currentUser = null;
        this.isAdmin = false;
        localStorage.removeItem('cleantrack_user');
        this.showNotification('Logged out successfully!', 'success');
        this.showPage('home');
        this.updateUI();
    }

    // Report Management
    handleReportSubmission(e) {
        e.preventDefault();
        
        if (!this.currentUser) {
            this.showNotification('Please login first!', 'error');
            return;
        }

        const category = document.getElementById('issueCategory').value;
        const location = document.getElementById('issueLocation').value;
        const description = document.getElementById('issueDescription').value;
        const priority = document.getElementById('priority').value;
        const photoFiles = document.getElementById('issuePhoto').files;

        // Convert photos to base64 (in real app, upload to Firebase Storage)
        const photos = [];
        for (let file of photoFiles) {
            // For demo, use placeholder images
            photos.push('https://images.pexels.com/photos/3735218/pexels-photo-3735218.jpeg');
        }

        const newReport = {
            id: Date.now(),
            userId: this.currentUser.id,
            userName: this.currentUser.name,
            category: category,
            location: location,
            coordinates: this.getRandomCoordinates(), // In real app, use geolocation
            description: description,
            priority: priority,
            status: 'pending',
            photos: photos,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.reports.push(newReport);
        
        // Update user stats
        const user = this.users.find(u => u.id === this.currentUser.id);
        if (user) {
            user.reportsCount++;
            user.points += 50; // Award points for reporting
            this.currentUser.reportsCount = user.reportsCount;
            this.currentUser.points = user.points;
        }

        this.saveToStorage();
        this.showNotification('Report submitted successfully! +50 points earned.', 'success');
        
        // Reset form
        document.getElementById('reportForm').reset();
        document.getElementById('photoPreview').innerHTML = '';
        
        // Refresh reports display
        this.loadMyReports();
        this.updateUserStats();
    }

    getRandomCoordinates() {
        // Random coordinates around Bangalore
        const baseLat = 12.9716;
        const baseLng = 77.5946;
        const randomLat = baseLat + (Math.random() - 0.5) * 0.1;
        const randomLng = baseLng + (Math.random() - 0.5) * 0.1;
        return { lat: randomLat, lng: randomLng };
    }

    getCurrentLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    
                    // Reverse geocoding (in real app, use Google Maps API)
                    document.getElementById('issueLocation').value = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
                    this.showNotification('Location captured!', 'success');
                },
                (error) => {
                    this.showNotification('Unable to get location. Please enter manually.', 'warning');
                }
            );
        } else {
            this.showNotification('Geolocation not supported by this browser.', 'error');
        }
    }

    handlePhotoUpload(e) {
        const files = e.target.files;
        const preview = document.getElementById('photoPreview');
        preview.innerHTML = '';

        for (let file of files) {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.style.width = '100px';
                    img.style.height = '100px';
                    img.style.objectFit = 'cover';
                    img.style.borderRadius = '8px';
                    img.style.border = '2px solid #e1e5e9';
                    img.style.marginRight = '10px';
                    preview.appendChild(img);
                };
                reader.readAsDataURL(file);
            }
        }
    }

    // UI Management
    showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Show selected page
        const targetPage = document.getElementById(pageId + 'Page');
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // Initialize page-specific content
        if (pageId === 'dashboard' && this.currentUser) {
            this.initializeDashboard();
        } else if (pageId === 'admin-dashboard' && this.isAdmin) {
            this.initializeAdminDashboard();
        }
    }

    updateUI() {
        const loginLink = document.getElementById('loginLink');
        const signupLink = document.getElementById('signupLink');
        const dashboardLink = document.getElementById('dashboardLink');
        const logoutLink = document.getElementById('logoutLink');

        if (this.currentUser) {
            loginLink.classList.add('hidden');
            signupLink.classList.add('hidden');
            dashboardLink.classList.remove('hidden');
            logoutLink.classList.remove('hidden');
            
            if (this.isAdmin) {
                dashboardLink.textContent = 'Admin Dashboard';
                dashboardLink.onclick = () => this.showPage('admin-dashboard');
            } else {
                dashboardLink.textContent = 'Dashboard';
                dashboardLink.onclick = () => this.showPage('dashboard');
            }
        } else {
            loginLink.classList.remove('hidden');
            signupLink.classList.remove('hidden');
            dashboardLink.classList.add('hidden');
            logoutLink.classList.add('hidden');
        }
    }

    initializeDashboard() {
        this.updateUserStats();
        this.loadMyReports();
        this.loadLeaderboard();
        this.showDashboardSection('report');
    }

    initializeAdminDashboard() {
        this.updateAdminStats();
        this.loadAllReports();
        this.loadUsers();
        this.showAdminSection('reports');
    }

    showDashboardSection(sectionId) {
        // Update menu items
        document.querySelectorAll('.dashboard-sidebar .menu-item').forEach(item => {
            item.classList.remove('active');
        });
        event.target.classList.add('active');

        // Show section
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId + 'Section').classList.add('active');

        // Initialize section-specific content
        if (sectionId === 'map') {
            setTimeout(() => this.initializeMap(), 100);
        }
    }

    showAdminSection(sectionId) {
        // Update menu items
        document.querySelectorAll('.admin-sidebar .menu-item').forEach(item => {
            item.classList.remove('active');
        });
        event.target.classList.add('active');

        // Show section
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId + 'AdminSection').classList.add('active');

        // Initialize section-specific content
        if (sectionId === 'map-admin') {
            setTimeout(() => this.initializeAdminMap(), 100);
        } else if (sectionId === 'analytics') {
            this.loadAnalytics();
        }
    }

    updateUserStats() {
        if (!this.currentUser) return;

        const user = this.users.find(u => u.id === this.currentUser.id);
        if (user) {
            document.getElementById('userName').textContent = user.name;
            document.getElementById('userReports').textContent = user.reportsCount || 0;
            document.getElementById('userPoints').textContent = user.points || 0;
            
            const resolvedCount = this.reports.filter(r => 
                r.userId === this.currentUser.id && r.status === 'resolved'
            ).length;
            document.getElementById('resolvedReports').textContent = resolvedCount;
        }
    }

    updateAdminStats() {
        const totalReports = this.reports.length;
        const pendingReports = this.reports.filter(r => r.status === 'pending').length;
        const inProgressReports = this.reports.filter(r => r.status === 'in-progress').length;
        const resolvedReports = this.reports.filter(r => r.status === 'resolved').length;

        document.getElementById('totalReports').textContent = totalReports;
        document.getElementById('pendingReports').textContent = pendingReports;
        document.getElementById('inProgressReports').textContent = inProgressReports;
        document.getElementById('resolvedReportsAdmin').textContent = resolvedReports;
    }

    loadMyReports() {
        if (!this.currentUser) return;

        const userReports = this.reports.filter(r => r.userId === this.currentUser.id);
        const container = document.getElementById('reportsContainer');
        
        if (userReports.length === 0) {
            container.innerHTML = '<p class="text-center">No reports submitted yet. Submit your first report to get started!</p>';
            return;
        }

        container.innerHTML = userReports.map(report => this.createReportCard(report)).join('');
    }

    loadAllReports() {
        const container = document.getElementById('adminReportsContainer');
        container.innerHTML = this.reports.map(report => this.createAdminReportCard(report)).join('');
    }

    createReportCard(report) {
        const statusClass = `status-${report.status.replace(' ', '-')}`;
        const priorityClass = `priority-${report.priority}`;
        const timeAgo = this.getTimeAgo(report.createdAt);

        return `
            <div class="report-card" onclick="showReportDetails(${report.id})">
                <div class="report-header">
                    <div>
                        <div class="report-title">${this.getCategoryName(report.category)}</div>
                        <div class="report-meta">Reported ${timeAgo}</div>
                    </div>
                    <div>
                        <span class="status-badge ${statusClass}">${report.status.replace('-', ' ')}</span>
                        <span class="priority-badge ${priorityClass}">${report.priority}</span>
                    </div>
                </div>
                <div class="report-description">${report.description}</div>
                <div class="report-footer">
                    <div class="report-location">${report.location}</div>
                    ${report.photos && report.photos.length > 0 ? '<span>📷 ' + report.photos.length + ' photo(s)</span>' : ''}
                </div>
            </div>
        `;
    }

    createAdminReportCard(report) {
        const statusClass = `status-${report.status.replace(' ', '-')}`;
        const priorityClass = `priority-${report.priority}`;
        const timeAgo = this.getTimeAgo(report.createdAt);

        return `
            <div class="report-card">
                <div class="report-header">
                    <div>
                        <div class="report-title">${this.getCategoryName(report.category)}</div>
                        <div class="report-meta">By ${report.userName} • ${timeAgo}</div>
                    </div>
                    <div>
                        <span class="status-badge ${statusClass}">${report.status.replace('-', ' ')}</span>
                        <span class="priority-badge ${priorityClass}">${report.priority}</span>
                    </div>
                </div>
                <div class="report-description">${report.description}</div>
                <div class="report-footer">
                    <div class="report-location">${report.location}</div>
                    <div>
                        <select onchange="updateReportStatus(${report.id}, this.value)" style="margin-right: 10px;">
                            <option value="pending" ${report.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="in-progress" ${report.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                            <option value="resolved" ${report.status === 'resolved' ? 'selected' : ''}>Resolved</option>
                        </select>
                        <button class="btn btn-secondary btn-small" onclick="showReportDetails(${report.id})">View Details</button>
                    </div>
                </div>
            </div>
        `;
    }

    loadLeaderboard() {
        const sortedUsers = [...this.users].sort((a, b) => (b.points || 0) - (a.points || 0));
        const container = document.getElementById('leaderboardContainer');
        
        container.innerHTML = sortedUsers.slice(0, 10).map((user, index) => `
            <div class="leaderboard-item">
                <div class="leaderboard-rank">${index + 1}</div>
                <div class="leaderboard-info">
                    <div class="leaderboard-name">${user.name}</div>
                    <div class="leaderboard-stats">${user.reportsCount || 0} reports submitted</div>
                </div>
                <div class="leaderboard-points">${user.points || 0} pts</div>
            </div>
        `).join('');
    }

    loadUsers() {
        const container = document.getElementById('usersContainer');
        
        container.innerHTML = this.users.map(user => `
            <div class="user-card">
                <div class="user-info">
                    <h4>${user.name}</h4>
                    <p>${user.email}</p>
                    <p>Joined: ${new Date(user.joinedAt).toLocaleDateString()}</p>
                </div>
                <div class="user-stats">
                    <div class="user-stat">
                        <div class="user-stat-number">${user.reportsCount || 0}</div>
                        <div class="user-stat-label">Reports</div>
                    </div>
                    <div class="user-stat">
                        <div class="user-stat-number">${user.points || 0}</div>
                        <div class="user-stat-label">Points</div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    loadAnalytics() {
        // Simple analytics display (in real app, use Chart.js or similar)
        const categoryChart = document.getElementById('categoryChart');
        const categories = {};
        this.reports.forEach(report => {
            categories[report.category] = (categories[report.category] || 0) + 1;
        });
        
        categoryChart.innerHTML = Object.entries(categories)
            .map(([category, count]) => `<div>${this.getCategoryName(category)}: ${count}</div>`)
            .join('');

        // Other charts would be implemented similarly
        document.getElementById('resolutionChart').innerHTML = 'Average resolution time: 3.2 days';
        document.getElementById('trendsChart').innerHTML = 'Reports increased by 15% this month';
        document.getElementById('areasChart').innerHTML = 'Top area: MG Road (12 reports)';
    }

    // Map functionality
    initializeMap() {
        if (this.map) return;

        this.map = L.map('map').setView([12.9716, 77.5946], 12);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        this.updateMapMarkers();
    }

    initializeAdminMap() {
        if (this.adminMap) return;

        this.adminMap = L.map('adminMap').setView([12.9716, 77.5946], 12);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.adminMap);

        this.updateAdminMapMarkers();
    }

    updateMapMarkers() {
        if (!this.map) return;

        // Clear existing markers
        this.markers.forEach(marker => this.map.removeLayer(marker));
        this.markers = [];

        // Add markers for all reports
        this.reports.forEach(report => {
            const color = this.getStatusColor(report.status);
            const marker = L.circleMarker([report.coordinates.lat, report.coordinates.lng], {
                color: color,
                fillColor: color,
                fillOpacity: 0.7,
                radius: 8
            }).addTo(this.map);

            marker.bindPopup(`
                <strong>${this.getCategoryName(report.category)}</strong><br>
                Status: ${report.status}<br>
                Location: ${report.location}<br>
                Priority: ${report.priority}
            `);

            this.markers.push(marker);
        });
    }

    updateAdminMapMarkers() {
        if (!this.adminMap) return;

        // Clear existing markers
        this.adminMarkers.forEach(marker => this.adminMap.removeLayer(marker));
        this.adminMarkers = [];

        // Add markers for all reports
        this.reports.forEach(report => {
            const color = this.getStatusColor(report.status);
            const marker = L.circleMarker([report.coordinates.lat, report.coordinates.lng], {
                color: color,
                fillColor: color,
                fillOpacity: 0.7,
                radius: 8
            }).addTo(this.adminMap);

            marker.bindPopup(`
                <strong>${this.getCategoryName(report.category)}</strong><br>
                Reported by: ${report.userName}<br>
                Status: ${report.status}<br>
                Location: ${report.location}<br>
                Priority: ${report.priority}<br>
                <button onclick="showReportDetails(${report.id})" class="btn btn-primary btn-small">View Details</button>
            `);

            this.adminMarkers.push(marker);
        });
    }

    getStatusColor(status) {
        switch (status) {
            case 'pending': return '#ffc107';
            case 'in-progress': return '#007bff';
            case 'resolved': return '#28a745';
            default: return '#6c757d';
        }
    }

    // Utility functions
    getCategoryName(category) {
        const categories = {
            'overflowing-bin': 'Overflowing Dustbin',
            'illegal-dumping': 'Illegal Dumping',
            'broken-bin': 'Broken Dustbin',
            'street-litter': 'Street Litter',
            'construction-waste': 'Construction Waste',
            'other': 'Other'
        };
        return categories[category] || category;
    }

    getTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return '1 day ago';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
        return `${Math.ceil(diffDays / 30)} months ago`;
    }

    // Feedback handling
    handleFeedbackSubmission(e) {
        e.preventDefault();
        
        const type = document.getElementById('feedbackType').value;
        const message = document.getElementById('feedbackMessage').value;
        
        // In real app, this would be sent to server
        this.showNotification('Thank you for your feedback!', 'success');
        document.getElementById('feedbackForm').reset();
        this.selectedRating = 0;
        document.querySelectorAll('.star').forEach(star => star.classList.remove('active'));
    }

    handleRatingClick(e) {
        const rating = parseInt(e.target.dataset.rating);
        this.selectedRating = rating;
        
        document.querySelectorAll('.star').forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    // Notification system
    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        const notificationText = notification.querySelector('.notification-text');
        const notificationIcon = notification.querySelector('.notification-icon');

        // Set icon and style based on type
        notification.className = `notification ${type}`;
        switch (type) {
            case 'success':
                notificationIcon.textContent = '✅';
                break;
            case 'error':
                notificationIcon.textContent = '❌';
                break;
            case 'warning':
                notificationIcon.textContent = '⚠️';
                break;
            default:
                notificationIcon.textContent = 'ℹ️';
        }

        notificationText.textContent = message;
        notification.classList.remove('hidden');
        notification.classList.add('show');

        // Hide after 4 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            notification.classList.add('hidden');
        }, 4000);
    }

    // Modal functions
    showReportDetails(reportId) {
        const report = this.reports.find(r => r.id === reportId);
        if (!report) return;

        const modal = document.getElementById('reportModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');

        modalTitle.textContent = `Report #${report.id} - ${this.getCategoryName(report.category)}`;
        
        modalBody.innerHTML = `
            <div class="report-details">
                <div class="detail-row">
                    <strong>Reported by:</strong> ${report.userName}
                </div>
                <div class="detail-row">
                    <strong>Date:</strong> ${new Date(report.createdAt).toLocaleString()}
                </div>
                <div class="detail-row">
                    <strong>Location:</strong> ${report.location}
                </div>
                <div class="detail-row">
                    <strong>Category:</strong> ${this.getCategoryName(report.category)}
                </div>
                <div class="detail-row">
                    <strong>Priority:</strong> <span class="priority-badge priority-${report.priority}">${report.priority}</span>
                </div>
                <div class="detail-row">
                    <strong>Status:</strong> <span class="status-badge status-${report.status.replace(' ', '-')}">${report.status.replace('-', ' ')}</span>
                </div>
                <div class="detail-row">
                    <strong>Description:</strong>
                    <p style="margin-top: 10px; line-height: 1.6;">${report.description}</p>
                </div>
                ${report.photos && report.photos.length > 0 ? `
                    <div class="detail-row">
                        <strong>Photos:</strong>
                        <div style="display: flex; gap: 10px; margin-top: 10px; flex-wrap: wrap;">
                            ${report.photos.map(photo => `<img src="${photo}" style="width: 150px; height: 150px; object-fit: cover; border-radius: 8px; border: 1px solid #e1e5e9;">`).join('')}
                        </div>
                    </div>
                ` : ''}
                ${report.adminNotes ? `
                    <div class="detail-row">
                        <strong>Admin Notes:</strong>
                        <p style="margin-top: 10px; line-height: 1.6; background: #f8f9fa; padding: 15px; border-radius: 8px;">${report.adminNotes}</p>
                    </div>
                ` : ''}
                ${report.resolvedPhoto ? `
                    <div class="detail-row">
                        <strong>Resolution Photo:</strong>
                        <div style="margin-top: 10px;">
                            <img src="${report.resolvedPhoto}" style="width: 200px; height: 200px; object-fit: cover; border-radius: 8px; border: 1px solid #e1e5e9;">
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        modal.style.display = 'block';
    }

    closeModal() {
        document.getElementById('reportModal').style.display = 'none';
    }
}

// Global functions for HTML onclick handlers
function showPage(pageId) {
    app.showPage(pageId);
}

function showDashboardSection(sectionId) {
    app.showDashboardSection(sectionId);
}

function showAdminSection(sectionId) {
    app.showAdminSection(sectionId);
}

function logout() {
    app.logout();
}

function showReportDetails(reportId) {
    app.showReportDetails(reportId);
}

function closeModal() {
    app.closeModal();
}

function updateReportStatus(reportId, newStatus) {
    const report = app.reports.find(r => r.id === reportId);
    if (report) {
        report.status = newStatus;
        report.updatedAt = new Date().toISOString();
        
        if (newStatus === 'in-progress') {
            report.adminNotes = 'Status updated to in progress';
        } else if (newStatus === 'resolved') {
            report.adminNotes = 'Issue has been resolved';
            // Award points to user
            const user = app.users.find(u => u.id === report.userId);
            if (user) {
                user.points = (user.points || 0) + 25;
            }
        }
        
        app.saveToStorage();
        app.updateAdminStats();
        app.showNotification(`Report #${reportId} status updated to ${newStatus}`, 'success');
    }
}

function filterReports() {
    const statusFilter = document.getElementById('statusFilter').value;
    const reportCards = document.querySelectorAll('#reportsContainer .report-card');
    
    reportCards.forEach(card => {
        if (statusFilter === 'all') {
            card.style.display = 'block';
        } else {
            const statusBadge = card.querySelector('.status-badge');
            const cardStatus = statusBadge.textContent.toLowerCase().replace(' ', '-');
            card.style.display = cardStatus === statusFilter ? 'block' : 'none';
        }
    });
}

function filterAdminReports() {
    const statusFilter = document.getElementById('adminStatusFilter').value;
    const categoryFilter = document.getElementById('adminCategoryFilter').value;
    const reportCards = document.querySelectorAll('#adminReportsContainer .report-card');
    
    reportCards.forEach(card => {
        let showCard = true;
        
        if (statusFilter !== 'all') {
            const statusBadge = card.querySelector('.status-badge');
            const cardStatus = statusBadge.textContent.toLowerCase().replace(' ', '-');
            if (cardStatus !== statusFilter) showCard = false;
        }
        
        if (categoryFilter !== 'all' && showCard) {
            const titleElement = card.querySelector('.report-title');
            const cardCategory = titleElement.textContent.toLowerCase();
            const filterCategory = app.getCategoryName(categoryFilter).toLowerCase();
            if (cardCategory !== filterCategory) showCard = false;
        }
        
        card.style.display = showCard ? 'block' : 'none';
    });
}

function toggleMobileMenu() {
    const navMenu = document.getElementById('navMenu');
    navMenu.classList.toggle('active');
}

function toggleHeatmap() {
    app.showNotification('Heatmap feature coming soon!', 'warning');
}

function toggleAdminHeatmap() {
    app.showNotification('Admin heatmap feature coming soon!', 'warning');
}

function filterMapMarkers() {
    app.showNotification('Map filtering feature coming soon!', 'warning');
}

function filterAdminMapMarkers() {
    app.showNotification('Admin map filtering feature coming soon!', 'warning');
}

// Initialize the app
const app = new CleanTrackApp();