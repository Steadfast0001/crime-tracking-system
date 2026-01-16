// Police module
class PoliceModule {
    constructor() {
        this.currentUser = getCurrentUser();
        this.selectedReporter = null;
        this.crimeStats = null;
    }

    async loadDashboard() {
        const content = document.getElementById('page-content');
        this.crimeStats = this.getCrimeStats();
        
        content.innerHTML = `
            <div class="page-header">
                <h2><i class="fas fa-shield-alt"></i> Police Dashboard</h2>
                <div class="dashboard-actions">
                    <button onclick="app.loadPage('case-queue')" class="btn-primary">
                        <i class="fas fa-clipboard-list"></i> View Case Queue
                    </button>
                </div>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${this.crimeStats.totalCases}</div>
                    <div class="stat-label">Total Cases</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${this.crimeStats.newCases}</div>
                    <div class="stat-label">New Cases</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${this.crimeStats.inProgress}</div>
                    <div class="stat-label">In Progress</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${this.crimeStats.resolved}</div>
                    <div class="stat-label">Resolved</div>
                </div>
            </div>
            
            <div class="charts-section">
                <h3><i class="fas fa-chart-bar"></i> Crime Statistics</h3>
                <div class="chart-container">
                    <canvas id="crimeChart"></canvas>
                </div>
            </div>
            
            <div class="recent-cases">
                <h3><i class="fas fa-history"></i> Recent Cases</h3>
                <div class="cases-list">
                    ${this.getRecentCases()}
                </div>
            </div>
        `;
        
        // Render chart
        this.renderCrimeChart();
    }

    async loadCaseQueue() {
        const content = document.getElementById('page-content');
        const cases = this.getPoliceCases();
        
        content.innerHTML = `
            <div class="page-header">
                <h2><i class="fas fa-clipboard-list"></i> Case Queue</h2>
                <div class="queue-filters">
                    <select id="case-filter" class="filter-select">
                        <option value="all">All Cases</option>
                        <option value="new">New Cases</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                    </select>
                    <button id="refresh-cases" class="btn-secondary">
                        <i class="fas fa-sync"></i> Refresh
                    </button>
                </div>
            </div>
            
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Case ID</th>
                            <th>Crime Type</th>
                            <th>Location</th>
                            <th>Reporter</th>
                            <th>Reported</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="cases-table-body">
                        ${cases.map(crime => `
                            <tr data-case-id="${crime.id}">
                                <td>#${crime.id}</td>
                                <td><strong>${crime.type}</strong></td>
                                <td>${crime.location}</td>
                                <td>
                                    <div class="reporter-info">
                                        <strong>${crime.reporter}</strong><br>
                                        <small>${crime.reporterPhone}</small>
                                    </div>
                                </td>
                                <td>${new Date(crime.timestamp).toLocaleDateString()}</td>
                                <td>
                                    <select class="status-select" data-case-id="${crime.id}">
                                        <option value="new" ${crime.status === 'new' ? 'selected' : ''}>New</option>
                                        <option value="in-progress" ${crime.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                                        <option value="resolved" ${crime.status === 'resolved' ? 'selected' : ''}>Resolved</option>
                                    </select>
                                </td>
                                <td>
                                    <button onclick="selectReporter('${crime.reporterPhone}', '${crime.reporter}')" class="action-btn">
                                        <i class="fas fa-comment"></i> Message
                                    </button>
                                    <button onclick="viewOnMap(${crime.lat}, ${crime.lng})" class="action-btn">
                                        <i class="fas fa-map-marker-alt"></i> Map
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="case-actions">
                <button onclick="app.loadPage('police-map')" class="btn-primary">
                    <i class="fas fa-route"></i> Navigate to Nearest Case
                </button>
                <button onclick="exportCases()" class="btn-secondary">
                    <i class="fas fa-download"></i> Export Cases
                </button>
            </div>
        `;
        
        // Initialize case queue handlers
        this.initCaseQueue();
    }

    initCaseQueue() {
        // Filter cases
        document.getElementById('case-filter').addEventListener('change', (e) => {
            this.filterCases(e.target.value);
        });
        
        // Refresh button
        document.getElementById('refresh-cases').addEventListener('click', () => {
            app.loadPage('case-queue');
        });
        
        // Status change handlers
        document.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const caseId = parseInt(e.target.dataset.caseId);
                const newStatus = e.target.value;
                this.updateCaseStatus(caseId, newStatus);
            });
        });
    }

    filterCases(status) {
        const rows = document.querySelectorAll('#cases-table-body tr');
        
        rows.forEach(row => {
            if (status === 'all') {
                row.style.display = '';
            } else {
                const select = row.querySelector('.status-select');
                const currentStatus = select ? select.value : 'new';
                row.style.display = currentStatus === status ? '' : 'none';
            }
        });
    }

    updateCaseStatus(caseId, newStatus) {
        const crimes = JSON.parse(localStorage.getItem('crimes') || '[]');
        const crimeIndex = crimes.findIndex(c => c.id === caseId);
        
        if (crimeIndex !== -1) {
            crimes[crimeIndex].status = newStatus;
            crimes[crimeIndex].updatedAt = new Date().toISOString();
            localStorage.setItem('crimes', JSON.stringify(crimes));
            
            // Log activity
            logActivity('case_update', `Updated case #${caseId} to ${newStatus}`);
            
            showNotification(`Case status updated to ${newStatus}`, 'success');
        }
    }

    async loadMessages() {
        const content = document.getElementById('page-content');
        const user = getCurrentUser();
        
        content.innerHTML = `
            <div class="page-header">
                <h2><i class="fas fa-comments"></i> Police Messages</h2>
                <div class="message-actions">
                    <button onclick="startBroadcast()" class="btn-secondary">
                        <i class="fas fa-bullhorn"></i> Broadcast
                    </button>
                </div>
            </div>
            
            <div class="messages-container">
                <div class="contacts-list">
                    <div class="contacts-header">
                        <i class="fas fa-users"></i> Reporters & Contacts
                    </div>
                    <div id="reporter-contacts">
                        <!-- Reporter contacts will be loaded here -->
                    </div>
                </div>
                
                <div class="chat-container">
                    <div class="chat-header" id="chat-header">
                        Select a reporter to start chatting
                    </div>
                    <div class="chat-messages" id="chat-messages">
                        <!-- Messages will be loaded here -->
                    </div>
                    <div class="chat-input">
                        <textarea id="message-input" placeholder="Type your message..." rows="2"></textarea>
                        <div class="voice-controls">
                            <button id="record-btn" class="record-btn">
                                <i class="fas fa-microphone"></i> Record
                            </button>
                            <button id="send-btn" class="btn-primary">
                                <i class="fas fa-paper-plane"></i> Send
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Load reporter contacts
        this.loadReporterContacts();
        
        // Initialize messaging
        this.initPoliceMessaging();
    }

    loadReporterContacts() {
        const contactsDiv = document.getElementById('reporter-contacts');
        const crimes = JSON.parse(localStorage.getItem('crimes') || '[]');
        const user = getCurrentUser();
        
        // Get unique reporters
        const reportersMap = new Map();
        crimes.forEach(crime => {
            if (crime.reporterPhone && crime.reporter) {
                reportersMap.set(crime.reporterPhone, {
                    phone: crime.reporterPhone,
                    name: crime.reporter,
                    lastReport: crime.timestamp,
                    stationId: crime.stationId
                });
            }
        });
        
        const reporters = Array.from(reportersMap.values())
            .sort((a, b) => new Date(b.lastReport) - new Date(a.lastReport));
        
        contactsDiv.innerHTML = reporters.map(reporter => `
            <div class="contact-item" data-phone="${reporter.phone}" data-name="${reporter.name}">
                <strong>${reporter.name}</strong><br>
                <small>Phone: ${reporter.phone}</small><br>
                <small>Station: ${reporter.stationId}</small>
            </div>
        `).join('');
        
        // Add click handlers
        document.querySelectorAll('.contact-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.contact-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                
                const phone = item.dataset.phone;
                const name = item.dataset.name;
                this.loadPoliceChat(phone, name);
            });
        });
    }

    loadPoliceChat(recipientPhone, recipientName) {
        const chatHeader = document.getElementById('chat-header');
        const chatMessages = document.getElementById('chat-messages');
        const user = getCurrentUser();
        
        chatHeader.textContent = `Chatting with ${recipientName}`;
        this.selectedReporter = { phone: recipientPhone, name: recipientName };
        
        // Load messages
        const messages = JSON.parse(localStorage.getItem('messages') || '[]');
        const filteredMessages = messages.filter(msg => 
            (msg.sender === user.phone && msg.recipient === recipientPhone) ||
            (msg.sender === recipientPhone && msg.recipient === user.phone)
        ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        chatMessages.innerHTML = filteredMessages.map(msg => `
            <div class="message ${msg.sender === user.phone ? 'sent' : 'received'}">
                <div class="message-content">
                    ${msg.type === 'audio' ? 
                        `<audio controls src="${msg.content}"></audio>` : 
                        msg.content
                    }
                </div>
                <div class="message-time">
                    ${new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        `).join('');
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Mark messages as read
        this.markMessagesAsRead(recipientPhone);
        
        // Update send button handler
        const sendBtn = document.getElementById('send-btn');
        sendBtn.onclick = () => this.sendPoliceMessage(recipientPhone);
        
        // Update record button handler
        const recordBtn = document.getElementById('record-btn');
        recordBtn.onclick = () => this.togglePoliceRecording(recipientPhone);
    }

    initPoliceMessaging() {
        // Initialize recording
        this.audioRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
    }

    async togglePoliceRecording(recipientPhone) {
        const recordBtn = document.getElementById('record-btn');
        
        if (!this.isRecording) {
            // Start recording
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                this.audioRecorder = new MediaRecorder(stream);
                this.audioChunks = [];
                
                this.audioRecorder.ondataavailable = (event) => {
                    this.audioChunks.push(event.data);
                };
                
                this.audioRecorder.onstop = () => {
                    const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                    const reader = new FileReader();
                    
                    reader.onloadend = () => {
                        const base64data = reader.result;
                        this.sendPoliceMessage(recipientPhone, base64data);
                    };
                    
                    reader.readAsDataURL(audioBlob);
                    
                    // Stop all tracks
                    stream.getTracks().forEach(track => track.stop());
                };
                
                this.audioRecorder.start();
                this.isRecording = true;
                recordBtn.classList.add('recording');
                recordBtn.innerHTML = '<i class="fas fa-stop"></i> Stop';
                
                // Auto stop after 30 seconds
                setTimeout(() => {
                    if (this.isRecording) {
                        this.stopPoliceRecording();
                    }
                }, 30000);
                
            } catch (error) {
                console.error('Recording error:', error);
                showNotification('Error accessing microphone', 'error');
            }
        } else {
            // Stop recording
            this.stopPoliceRecording();
            recordBtn.classList.remove('recording');
            recordBtn.innerHTML = '<i class="fas fa-microphone"></i> Record';
        }
    }

    stopPoliceRecording() {
        if (this.audioRecorder && this.isRecording) {
            this.audioRecorder.stop();
            this.isRecording = false;
        }
    }

    sendPoliceMessage(recipientPhone, audioBlob = null) {
        const user = getCurrentUser();
        const messageInput = document.getElementById('message-input');
        const content = audioBlob || messageInput.value.trim();
        
        if (!content && !audioBlob) return;
        
        const message = {
            id: Date.now(),
            sender: user.phone,
            senderName: user.name || 'Police Officer',
            recipient: recipientPhone,
            content: audioBlob || content,
            type: audioBlob ? 'audio' : 'text',
            timestamp: new Date().toISOString(),
            read: false
        };
        
        // Save message
        const messages = JSON.parse(localStorage.getItem('messages') || '[]');
        messages.push(message);
        localStorage.setItem('messages', JSON.stringify(messages));
        
        // Log activity
        logActivity('police_message', `Sent message to ${recipientPhone}`);
        
        // Clear input if text message
        if (!audioBlob) {
            messageInput.value = '';
        }
        
        // Reload chat
        this.loadPoliceChat(recipientPhone, this.selectedReporter?.name || recipientPhone);
        
        showNotification('Message sent!', 'success');
    }

    markMessagesAsRead(senderPhone) {
        const messages = JSON.parse(localStorage.getItem('messages') || '[]');
        const user = getCurrentUser();
        
        messages.forEach(msg => {
            if (msg.sender === senderPhone && msg.recipient === user.phone && !msg.read) {
                msg.read = true;
            }
        });
        
        localStorage.setItem('messages', JSON.stringify(messages));
    }

    async loadAnalytics() {
        const content = document.getElementById('page-content');
        this.crimeStats = this.getCrimeStats();
        
        content.innerHTML = `
            <div class="page-header">
                <h2><i class="fas fa-chart-bar"></i> Analytics Dashboard</h2>
                <div class="analytics-actions">
                    <button onclick="exportAnalytics()" class="btn-secondary">
                        <i class="fas fa-download"></i> Export Data
                    </button>
                </div>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${this.crimeStats.totalCases}</div>
                    <div class="stat-label">Total Cases</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${this.crimeStats.clearanceRate}%</div>
                    <div class="stat-label">Clearance Rate</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${this.crimeStats.avgResponseTime}h</div>
                    <div class="stat-label">Avg Response Time</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${this.crimeStats.topCrimeType}</div>
                    <div class="stat-label">Most Common Crime</div>
                </div>
            </div>
            
            <div class="charts-row">
                <div class="chart-container">
                    <h3><i class="fas fa-chart-pie"></i> Crime Types Distribution</h3>
                    <canvas id="crimeTypesChart"></canvas>
                </div>
                <div class="chart-container">
                    <h3><i class="fas fa-chart-line"></i> Cases Over Time</h3>
                    <canvas id="casesOverTimeChart"></canvas>
                </div>
            </div>
            
            <div class="analytics-table">
                <h3><i class="fas fa-table"></i> Station Performance</h3>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Station</th>
                                <th>Total Cases</th>
                                <th>New</th>
                                <th>In Progress</th>
                                <th>Resolved</th>
                                <th>Clearance Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.getStationPerformance()}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        // Render charts
        this.renderAnalyticsCharts();
    }

    renderCrimeChart() {
        const ctx = document.getElementById('crimeChart').getContext('2d');
        const stats = this.crimeStats;
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['New', 'In Progress', 'Resolved'],
                datasets: [{
                    label: 'Cases',
                    data: [stats.newCases, stats.inProgress, stats.resolved],
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#4BC0C0'
                    ],
                    borderColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#4BC0C0'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    renderAnalyticsCharts() {
        // Crime types chart
        const crimes = JSON.parse(localStorage.getItem('crimes') || '[]');
        const crimeTypes = {};
        
        crimes.forEach(crime => {
            crimeTypes[crime.type] = (crimeTypes[crime.type] || 0) + 1;
        });
        
        const typesCtx = document.getElementById('crimeTypesChart').getContext('2d');
        new Chart(typesCtx, {
            type: 'pie',
            data: {
                labels: Object.keys(crimeTypes),
                datasets: [{
                    data: Object.values(crimeTypes),
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                        '#9966FF', '#FF9F40', '#8AC926', '#1982C4',
                        '#6A4C93', '#FF595E'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
        
        // Cases over time chart
        const casesByDate = {};
        crimes.forEach(crime => {
            const date = new Date(crime.timestamp).toLocaleDateString();
            casesByDate[date] = (casesByDate[date] || 0) + 1;
        });
        
        const dates = Object.keys(casesByDate).sort();
        const caseCounts = dates.map(date => casesByDate[date]);
        
        const timeCtx = document.getElementById('casesOverTimeChart').getContext('2d');
        new Chart(timeCtx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Cases',
                    data: caseCounts,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    getCrimeStats() {
        const crimes = JSON.parse(localStorage.getItem('crimes') || '[]');
        const stations = JSON.parse(localStorage.getItem('policeStations') || '[]');
        
        const totalCases = crimes.length;
        const newCases = crimes.filter(c => c.status === 'new').length;
        const inProgress = crimes.filter(c => c.status === 'in-progress').length;
        const resolved = crimes.filter(c => c.status === 'resolved').length;
        
        // Calculate clearance rate
        const clearanceRate = totalCases > 0 ? Math.round((resolved / totalCases) * 100) : 0;
        
        // Find most common crime type
        const crimeTypes = {};
        crimes.forEach(crime => {
            crimeTypes[crime.type] = (crimeTypes[crime.type] || 0) + 1;
        });
        const topCrimeType = Object.keys(crimeTypes).length > 0 
            ? Object.entries(crimeTypes).sort((a, b) => b[1] - a[1])[0][0]
            : 'None';
        
        // Calculate average response time (simulated)
        const avgResponseTime = totalCases > 0 ? Math.round(Math.random() * 24) : 0;
        
        return {
            totalCases,
            newCases,
            inProgress,
            resolved,
            clearanceRate,
            avgResponseTime,
            topCrimeType
        };
    }

    getPoliceCases() {
        const crimes = JSON.parse(localStorage.getItem('crimes') || '[]');
        // For demo, show all crimes. In real app, filter by station
        return crimes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    getRecentCases() {
        const cases = this.getPoliceCases().slice(0, 5);
        
        if (cases.length === 0) {
            return '<p class="no-cases">No recent cases</p>';
        }
        
        return cases.map(crime => `
            <div class="case-item">
                <div class="case-type ${crime.status}">
                    <i class="fas fa-exclamation-circle"></i>
                </div>
                <div class="case-details">
                    <strong>${crime.type}</strong>
                    <p>${crime.location}</p>
                    <small>Reported by ${crime.reporter} • ${new Date(crime.timestamp).toLocaleDateString()}</small>
                </div>
                <div class="case-status">
                    <span class="status ${crime.status}">${crime.status}</span>
                </div>
            </div>
        `).join('');
    }

    getStationPerformance() {
        const crimes = JSON.parse(localStorage.getItem('crimes') || '[]');
        const stations = JSON.parse(localStorage.getItem('policeStations') || '[]');
        
        return stations.map(station => {
            const stationCrimes = crimes.filter(c => c.stationId === station.id);
            const total = stationCrimes.length;
            const newCount = stationCrimes.filter(c => c.status === 'new').length;
            const inProgressCount = stationCrimes.filter(c => c.status === 'in-progress').length;
            const resolvedCount = stationCrimes.filter(c => c.status === 'resolved').length;
            const clearanceRate = total > 0 ? Math.round((resolvedCount / total) * 100) : 0;
            
            return `
                <tr>
                    <td>${station.name}</td>
                    <td>${total}</td>
                    <td>${newCount}</td>
                    <td>${inProgressCount}</td>
                    <td>${resolvedCount}</td>
                    <td>
                        <div class="clearance-bar">
                            <div class="bar-fill" style="width: ${clearanceRate}%"></div>
                            <span>${clearanceRate}%</span>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }
}

// Initialize police module
let policeModule = null;

// Load police dashboard
async function loadPoliceDashboard() {
    if (!policeModule) {
        policeModule = new PoliceModule();
    }
    await policeModule.loadDashboard();
}

// Load case queue
async function loadCaseQueue() {
    if (!policeModule) {
        policeModule = new PoliceModule();
    }
    await policeModule.loadCaseQueue();
}

// Load police messages
async function loadPoliceMessages() {
    if (!policeModule) {
        policeModule = new PoliceModule();
    }
    await policeModule.loadMessages();
}

// Load analytics
async function loadAnalytics() {
    if (!policeModule) {
        policeModule = new PoliceModule();
    }
    await policeModule.loadAnalytics();
}

// Global helper functions for police
window.selectReporter = function(phone, name) {
    app.loadPage('police-messages');
    setTimeout(() => {
        const contact = document.querySelector(`.contact-item[data-phone="${phone}"]`);
        if (contact) {
            contact.click();
        }
    }, 500);
};

window.viewOnMap = function(lat, lng) {
    app.loadPage('police-map');
    setTimeout(() => {
        if (policeMap && policeMap.map) {
            policeMap.map.setView([lat, lng], 15);
            L.marker([lat, lng]).addTo(policeMap.map)
                .bindPopup('Selected Case Location')
                .openPopup();
        }
    }, 500);
};

window.exportCases = function() {
    const crimes = JSON.parse(localStorage.getItem('crimes') || '[]');
    const csv = convertToCSV(crimes);
    downloadCSV(csv, 'police-cases.csv');
    showNotification('Cases exported successfully', 'success');
};

window.exportAnalytics = function() {
    const crimes = JSON.parse(localStorage.getItem('crimes') || '[]');
    const analytics = policeModule.getCrimeStats();
    const data = {
        analytics: analytics,
        totalCases: crimes.length,
        exportDate: new Date().toISOString()
    };
    
    const json = JSON.stringify(data, null, 2);
    downloadJSON(json, 'analytics-export.json');
    showNotification('Analytics exported successfully', 'success');
};

window.startBroadcast = function() {
    const message = prompt('Enter broadcast message:');
    if (message) {
        // Get all unique reporters
        const crimes = JSON.parse(localStorage.getItem('crimes') || '[]');
        const reporters = new Set();
        crimes.forEach(crime => {
            if (crime.reporterPhone) {
                reporters.add(crime.reporterPhone);
            }
        });
        
        // Send message to all reporters (simulated)
        showNotification(`Broadcast sent to ${reporters.size} reporters`, 'success');
        logActivity('broadcast', `Broadcasted: "${message}"`);
    }
};

// Helper functions for export
function convertToCSV(data) {
    const headers = Object.keys(data[0] || {});
    const rows = data.map(row => 
        headers.map(header => JSON.stringify(row[header] || '')).join(',')
    );
    return [headers.join(','), ...rows].join('\n');
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

function downloadJSON(json, filename) {
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Export functions
window.loadPoliceDashboard = loadPoliceDashboard;
window.loadCaseQueue = loadCaseQueue;
window.loadPoliceMessages = loadPoliceMessages;
window.loadAnalytics = loadAnalytics;

// Add styles for police pages
const policeStyles = document.createElement('style');
policeStyles.textContent = `
.charts-section {
    background: white;
    padding: 30px;
    border-radius: 15px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    margin: 40px 0;
    height: 400px;
}

.charts-section h3 {
    margin-bottom: 20px;
    color: #333;
    display: flex;
    align-items: center;
    gap: 10px;
}

.recent-cases {
    background: white;
    padding: 30px;
    border-radius: 15px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.recent-cases h3 {
    margin-bottom: 20px;
    color: #333;
    display: flex;
    align-items: center;
    gap: 10px;
}

.cases-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.case-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 10px;
    transition: all 0.3s;
}

.case-item:hover {
    background: #e9ecef;
    transform: translateX(5px);
}

.case-type {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
}

.case-type.new { background: #ffeaa7; color: #d35400; }
.case-type.in-progress { background: #a29bfe; color: #6c5ce7; }
.case-type.resolved { background: #55efc4; color: #00b894; }

.case-details {
    flex: 1;
}

.case-details strong {
    display: block;
    margin-bottom: 5px;
    color: #333;
}

.case-details p {
    margin: 0;
    color: #666;
    font-size: 14px;
}

.case-details small {
    color: #999;
    font-size: 12px;
}

.no-cases {
    text-align: center;
    color: #999;
    padding: 40px;
}

.queue-filters {
    display: flex;
    gap: 15px;
    align-items: center;
}

.filter-select {
    padding: 10px 15px;
    border: 2px solid #e0e0e0;
    border-radius: 5px;
    background: white;
    font-size: 14px;
}

.case-actions {
    display: flex;
    gap: 15px;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 2px solid #e0e0e0;
}

.reporter-info {
    line-height: 1.4;
}

.reporter-info small {
    color: #666;
    font-size: 12px;
}

.status-select {
    padding: 5px 10px;
    border: 2px solid #e0e0e0;
    border-radius: 5px;
    background: white;
    font-size: 14px;
    cursor: pointer;
}

.status-select:focus {
    outline: none;
    border-color: #667eea;
}

.charts-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
    margin: 40px 0;
}

.analytics-table {
    background: white;
    padding: 30px;
    border-radius: 15px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.analytics-table h3 {
    margin-bottom: 20px;
    color: #333;
    display: flex;
    align-items: center;
    gap: 10px;
}

.clearance-bar {
    height: 20px;
    background: #e0e0e0;
    border-radius: 10px;
    position: relative;
    overflow: hidden;
}

.bar-fill {
    height: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 10px;
    transition: width 0.3s;
}

.clearance-bar span {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 12px;
    font-weight: bold;
}
`;
document.head.appendChild(policeStyles);