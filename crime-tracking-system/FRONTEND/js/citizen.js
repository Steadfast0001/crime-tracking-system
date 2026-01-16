// Citizen module
class CitizenModule {
    constructor() {
        this.currentUser = getCurrentUser();
        this.audioRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
    }

    async loadDashboard() {
        const content = document.getElementById('page-content');
        
        const stats = this.getCitizenStats();
        
        content.innerHTML = `
            <div class="page-header">
                <h2><i class="fas fa-home"></i> Citizen Dashboard</h2>
                <div class="dashboard-actions">
                    <button onclick="app.loadPage('report-crime')" class="btn-primary">
                        <i class="fas fa-exclamation-circle"></i> Report New Crime
                    </button>
                </div>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${stats.totalReports}</div>
                    <div class="stat-label">Crimes Reported</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.pendingCases}</div>
                    <div class="stat-label">Pending Cases</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.messages}</div>
                    <div class="stat-label">Unread Messages</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.nearestStation}</div>
                    <div class="stat-label">Nearest Station</div>
                </div>
            </div>
            
            <div class="quick-actions">
                <h3><i class="fas fa-bolt"></i> Quick Actions</h3>
                <div class="actions-grid">
                    <div class="action-card" onclick="app.loadPage('report-crime')">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h4>Report Crime</h4>
                        <p>Report a new crime incident</p>
                    </div>
                    <div class="action-card" onclick="app.loadPage('citizen-map')">
                        <i class="fas fa-map"></i>
                        <h4>View Crime Map</h4>
                        <p>See reported crimes in your area</p>
                    </div>
                    <div class="action-card" onclick="app.loadPage('citizen-messages')">
                        <i class="fas fa-comments"></i>
                        <h4>Messages</h4>
                        <p>Check messages from police</p>
                    </div>
                    <div class="action-card" onclick="app.loadPage('my-reports')">
                        <i class="fas fa-history"></i>
                        <h4>My Reports</h4>
                        <p>View your reported crimes</p>
                    </div>
                </div>
            </div>
            
            <div class="recent-activity">
                <h3><i class="fas fa-history"></i> Recent Activity</h3>
                <div class="activity-list">
                    ${this.getRecentActivity()}
                </div>
            </div>
        `;
    }

    async loadReportCrimePage() {
        const content = document.getElementById('page-content');
        
        const crimeTypes = [
            'Theft', 'Burglary', 'Assault', 'Vandalism', 'Drug Activity',
            'Suspicious Activity', 'Traffic Violation', 'Missing Person',
            'Domestic Violence', 'Fraud', 'Cyber Crime', 'Other'
        ];
        
        content.innerHTML = `
            <div class="page-header">
                <h2><i class="fas fa-exclamation-circle"></i> Report Crime</h2>
            </div>
            
            <div class="form-container">
                <div class="form-card">
                    <form id="crime-report-form">
                        <div class="form-row">
                            <div class="form-col">
                                <label for="crime-type">Crime Type *</label>
                                <div class="crime-types">
                                    ${crimeTypes.map(type => `
                                        <label class="crime-type">
                                            <input type="radio" name="crime-type" value="${type}" required>
                                            <span>${type}</span>
                                        </label>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-col">
                                <label for="location">Location *</label>
                                <input type="text" id="location" placeholder="Enter address or landmark" required>
                                <small>Enter an address and press Enter to geocode</small>
                            </div>
                            <div class="form-col">
                                <label for="police-station">Assigned Police Station</label>
                                <select id="police-station" disabled>
                                    <option value="">Select a location first</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-col">
                                <label for="crime-description">Description *</label>
                                <textarea id="crime-description" placeholder="Describe the crime in detail..." required></textarea>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-col">
                                <label for="evidence">Evidence/Additional Info</label>
                                <textarea id="evidence" placeholder="Any evidence, witnesses, vehicle details, etc."></textarea>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-col">
                                <label for="reporter-name">Your Name</label>
                                <input type="text" id="reporter-name" placeholder="Optional">
                            </div>
                            <div class="form-col">
                                <label for="reporter-phone">Your Phone *</label>
                                <input type="text" id="reporter-phone" value="${this.currentUser.phone}" required>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-paper-plane"></i> Submit Report
                            </button>
                            <button type="button" class="btn-secondary" onclick="app.loadPage('citizen-dashboard')">
                                <i class="fas fa-times"></i> Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        // Initialize form handlers
        this.initReportForm();
    }

    initReportForm() {
        const form = document.getElementById('crime-report-form');
        const locationInput = document.getElementById('location');
        const stationSelect = document.getElementById('police-station');
        
        // Load police stations
        this.loadPoliceStations(stationSelect);
        
        // Geocode on location input
        let geocodeTimeout;
        locationInput.addEventListener('input', () => {
            clearTimeout(geocodeTimeout);
            geocodeTimeout = setTimeout(() => {
                if (locationInput.value.trim().length > 3) {
                    this.geocodeLocation(locationInput.value, stationSelect);
                }
            }, 500);
        });
        
        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitCrimeReport();
        });
    }

    async geocodeLocation(query, stationSelect) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
            );
            const data = await response.json();
            
            if (data.length > 0) {
                const result = data[0];
                const lat = parseFloat(result.lat);
                const lng = parseFloat(result.lon);
                
                // Find nearest police station
                const nearestStation = this.findNearestStation(lat, lng);
                
                // Update station select
                if (stationSelect) {
                    stationSelect.innerHTML = '';
                    const option = document.createElement('option');
                    option.value = nearestStation.id;
                    option.textContent = `${nearestStation.name} (${nearestStation.distance.toFixed(1)} km away)`;
                    stationSelect.appendChild(option);
                    stationSelect.disabled = false;
                }
                
                // Store coordinates in form data attribute
                const form = document.getElementById('crime-report-form');
                form.dataset.latitude = lat;
                form.dataset.longitude = lng;
                
                showNotification(`Location found: ${result.display_name.split(',')[0]}`, 'success');
                
                return { lat, lng, address: result.display_name };
            }
        } catch (error) {
            console.error('Geocoding error:', error);
            showNotification('Error finding location', 'error');
        }
        return null;
    }

    findNearestStation(lat, lng) {
        const stations = JSON.parse(localStorage.getItem('policeStations') || '[]');
        let nearest = null;
        let minDistance = Infinity;
        
        stations.forEach(station => {
            const distance = calculateDistance(lat, lng, station.lat, station.lng);
            if (distance < minDistance) {
                minDistance = distance;
                nearest = { ...station, distance };
            }
        });
        
        return nearest || stations[0];
    }

    loadPoliceStations(selectElement) {
        const stations = JSON.parse(localStorage.getItem('policeStations') || '[]');
        if (selectElement) {
            selectElement.innerHTML = stations.map(station => 
                `<option value="${station.id}">${station.name}</option>`
            ).join('');
        }
    }

    async submitCrimeReport() {
        const form = document.getElementById('crime-report-form');
        const formData = new FormData(form);
        
        // Get form values
        const crimeType = form.querySelector('input[name="crime-type"]:checked')?.value;
        const location = document.getElementById('location').value;
        const description = document.getElementById('crime-description').value;
        const evidence = document.getElementById('evidence').value;
        const reporterName = document.getElementById('reporter-name').value || this.currentUser.name || 'Anonymous';
        const reporterPhone = document.getElementById('reporter-phone').value;
        const stationId = document.getElementById('police-station').value;
        
        // Get coordinates from form data
        const lat = parseFloat(form.dataset.latitude);
        const lng = parseFloat(form.dataset.longitude);
        
        if (!lat || !lng) {
            showNotification('Please select a valid location first', 'error');
            return;
        }
        
        // Create crime report
        const crime = {
            id: Date.now(),
            type: crimeType,
            description,
            location,
            lat,
            lng,
            evidence,
            reporter: reporterName,
            reporterPhone,
            stationId: parseInt(stationId),
            status: 'new',
            timestamp: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Save to localStorage
        const crimes = JSON.parse(localStorage.getItem('crimes') || '[]');
        crimes.push(crime);
        localStorage.setItem('crimes', JSON.stringify(crimes));
        
        // Log activity
        logActivity('crime_report', `Reported ${crimeType} at ${location}`);
        
        // Show success message
        showNotification('Crime report submitted successfully!', 'success');
        
        // Reset form
        form.reset();
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
            app.loadPage('citizen-dashboard');
        }, 2000);
    }

    async loadMessages() {
        const content = document.getElementById('page-content');
        const user = getCurrentUser();
        
        content.innerHTML = `
            <div class="page-header">
                <h2><i class="fas fa-comments"></i> Messages</h2>
            </div>
            
            <div class="messages-container">
                <div class="contacts-list">
                    <div class="contacts-header">
                        <i class="fas fa-user-shield"></i> Police Contacts
                    </div>
                    <div id="police-contacts">
                        <!-- Police contacts will be loaded here -->
                    </div>
                </div>
                
                <div class="chat-container">
                    <div class="chat-header" id="chat-header">
                        Select a police officer to start chatting
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
        
        // Load police contacts
        this.loadPoliceContacts();
        
        // Initialize messaging
        this.initMessaging();
    }

    initMessaging() {
        const sendBtn = document.getElementById('send-btn');
        const messageInput = document.getElementById('message-input');
        const recordBtn = document.getElementById('record-btn');

        if (!sendBtn && !messageInput && !recordBtn) return;

        if (sendBtn) {
            sendBtn.onclick = () => {
                const active = document.querySelector('.contact-item.active');
                if (!active) {
                    showNotification('Please select a contact to message', 'error');
                    return;
                }
                const recipientPhone = active.dataset.phone;
                this.sendMessage(recipientPhone);
            };
        }

        if (messageInput) {
            messageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    const active = document.querySelector('.contact-item.active');
                    if (!active) {
                        showNotification('Please select a contact to message', 'error');
                        return;
                    }
                    const recipientPhone = active.dataset.phone;
                    this.sendMessage(recipientPhone);
                }
            });
        }

        if (recordBtn) {
            recordBtn.onclick = () => {
                const active = document.querySelector('.contact-item.active');
                if (!active) {
                    showNotification('Please select a contact to message', 'error');
                    return;
                }
                const recipientPhone = active.dataset.phone;
                this.toggleRecording(recipientPhone);
            };
        }
    }

    loadPoliceContacts() {
        const contactsDiv = document.getElementById('police-contacts');
        const stations = JSON.parse(localStorage.getItem('policeStations') || '[]');
        
        contactsDiv.innerHTML = stations.map(station => `
            <div class="contact-item" data-station="${station.id}" data-phone="${station.phone}">
                <strong>${station.name}</strong><br>
                <small>Phone: ${station.phone}</small>
            </div>
        `).join('');
        
        // Add click handlers
        document.querySelectorAll('.contact-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.contact-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                
                const stationId = item.dataset.station;
                const phone = item.dataset.phone;
                this.loadChat(phone, `Police Station ${stationId}`);
            });
        });
    }

    loadChat(recipientPhone, recipientName) {
        const chatHeader = document.getElementById('chat-header');
        const chatMessages = document.getElementById('chat-messages');
        const user = getCurrentUser();
        
        chatHeader.textContent = `Chatting with ${recipientName}`;
        
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
        
        // Update send button handler
        const sendBtn = document.getElementById('send-btn');
        sendBtn.onclick = () => this.sendMessage(recipientPhone);
        
        // Update record button handler
        const recordBtn = document.getElementById('record-btn');
        recordBtn.onclick = () => this.toggleRecording(recipientPhone);
    }

    sendMessage(recipientPhone, audioBlob = null) {
        const user = getCurrentUser();
        const messageInput = document.getElementById('message-input');
        const content = audioBlob || messageInput.value.trim();
        
        if (!content && !audioBlob) return;
        
        const message = {
            id: Date.now(),
            sender: user.phone,
            senderName: user.name,
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
        logActivity('message_sent', `Sent ${message.type} message to ${recipientPhone}`);
        
        // Clear input if text message
        if (!audioBlob) {
            messageInput.value = '';
        }
        
        // Reload chat
        this.loadChat(recipientPhone, `Police Station ${recipientPhone}`);
        
        showNotification('Message sent!', 'success');
    }

    async toggleRecording(recipientPhone) {
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
                        this.sendMessage(recipientPhone, base64data);
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
                        this.stopRecording();
                    }
                }, 30000);
                
            } catch (error) {
                console.error('Recording error:', error);
                showNotification('Error accessing microphone', 'error');
            }
        } else {
            // Stop recording
            this.stopRecording();
            recordBtn.classList.remove('recording');
            recordBtn.innerHTML = '<i class="fas fa-microphone"></i> Record';
        }
    }

    stopRecording() {
        if (this.audioRecorder && this.isRecording) {
            this.audioRecorder.stop();
            this.isRecording = false;
        }
    }

    async loadMyReports() {
        const content = document.getElementById('page-content');
        const user = getCurrentUser();
        
        // Get user's crime reports
        const allCrimes = JSON.parse(localStorage.getItem('crimes') || '[]');
        const myCrimes = allCrimes.filter(crime => crime.reporterPhone === user.phone);
        
        content.innerHTML = `
            <div class="page-header">
                <h2><i class="fas fa-history"></i> My Reports</h2>
                <div class="header-actions">
                    <button onclick="app.loadPage('report-crime')" class="btn-primary">
                        <i class="fas fa-plus"></i> New Report
                    </button>
                </div>
            </div>
            
            ${myCrimes.length === 0 ? `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list fa-3x"></i>
                    <h3>No Reports Yet</h3>
                    <p>You haven't reported any crimes yet.</p>
                    <button onclick="app.loadPage('report-crime')" class="btn-primary">
                        Report Your First Crime
                    </button>
                </div>
            ` : `
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Crime Type</th>
                                <th>Location</th>
                                <th>Status</th>
                                <th>Assigned Station</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${myCrimes.map(crime => `
                                <tr>
                                    <td>${new Date(crime.timestamp).toLocaleDateString()}</td>
                                    <td><strong>${crime.type}</strong></td>
                                    <td>${crime.location}</td>
                                    <td><span class="status ${crime.status}">${crime.status}</span></td>
                                    <td>Station ${crime.stationId}</td>
                                    <td>
                                        <button onclick="viewCrimeDetails(${crime.id})" class="action-btn">
                                            <i class="fas fa-eye"></i> View
                                        </button>
                                        <button onclick="messageStation(${crime.stationId})" class="action-btn">
                                            <i class="fas fa-comment"></i> Message
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `}
        `;
    }

    getCitizenStats() {
        const user = getCurrentUser();
        const allCrimes = JSON.parse(localStorage.getItem('crimes') || '[]');
        const myCrimes = allCrimes.filter(crime => crime.reporterPhone === user.phone);
        const messages = JSON.parse(localStorage.getItem('messages') || '[]');
        const unreadMessages = messages.filter(msg => 
            msg.recipient === user.phone && !msg.read
        ).length;
        
        // Get nearest station (simulated)
        const stations = JSON.parse(localStorage.getItem('policeStations') || '[]');
        const nearestStation = stations.length > 0 ? stations[0].name.split(' ')[0] : 'None';
        
        return {
            totalReports: myCrimes.length,
            pendingCases: myCrimes.filter(c => c.status === 'new' || c.status === 'in-progress').length,
            messages: unreadMessages,
            nearestStation: nearestStation
        };
    }

    getRecentActivity() {
        const logs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
        const user = getCurrentUser();
        const userLogs = logs.filter(log => log.user === user.phone).slice(0, 5);
        
        if (userLogs.length === 0) {
            return '<p class="no-activity">No recent activity</p>';
        }
        
        return userLogs.map(log => `
            <div class="activity-item">
                <i class="fas fa-circle"></i>
                <div class="activity-details">
                    <strong>${log.action}</strong>
                    <small>${new Date(log.timestamp).toLocaleString()}</small>
                </div>
            </div>
        `).join('');
    }
}

// Initialize citizen module
let citizenModule = null;

// Load citizen dashboard
async function loadCitizenDashboard() {
    if (!citizenModule) {
        citizenModule = new CitizenModule();
    }
    await citizenModule.loadDashboard();
}

// Load report crime page
async function loadReportCrimePage() {
    if (!citizenModule) {
        citizenModule = new CitizenModule();
    }
    await citizenModule.loadReportCrimePage();
}

// Load citizen messages
async function loadCitizenMessages() {
    if (!citizenModule) {
        citizenModule = new CitizenModule();
    }
    await citizenModule.loadMessages();
}

// Load my reports
async function loadMyReports() {
    if (!citizenModule) {
        citizenModule = new CitizenModule();
    }
    await citizenModule.loadMyReports();
}

// Global helper functions
window.viewCrimeDetails = function(crimeId) {
    const crimes = JSON.parse(localStorage.getItem('crimes') || '[]');
    const crime = crimes.find(c => c.id === crimeId);
    
    if (crime) {
        alert(`
            Crime Details:
            Type: ${crime.type}
            Location: ${crime.location}
            Description: ${crime.description}
            Status: ${crime.status}
            Reported: ${new Date(crime.timestamp).toLocaleString()}
            Evidence: ${crime.evidence || 'None'}
        `);
    }
};

window.messageStation = function(stationId) {
    const stations = JSON.parse(localStorage.getItem('policeStations') || '[]');
    const station = stations.find(s => s.id === stationId);
    
    if (station) {
        app.loadPage('citizen-messages');
        // Focus on this station in messages
        setTimeout(() => {
            const contact = document.querySelector(`.contact-item[data-station="${stationId}"]`);
            if (contact) {
                contact.click();
            }
        }, 500);
    }
};

// Export functions
window.loadCitizenDashboard = loadCitizenDashboard;
window.loadReportCrimePage = loadReportCrimePage;
window.loadCitizenMessages = loadCitizenMessages;
window.loadMyReports = loadMyReports;

// Add styles for citizen pages
const citizenStyles = document.createElement('style');
citizenStyles.textContent = `
.quick-actions {
    margin: 40px 0;
}

.quick-actions h3 {
    margin-bottom: 20px;
    color: #333;
    display: flex;
    align-items: center;
    gap: 10px;
}

.actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
}

.action-card {
    background: white;
    padding: 25px;
    border-radius: 15px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.action-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
}

.action-card i {
    font-size: 40px;
    color: #667eea;
    margin-bottom: 15px;
}

.action-card h4 {
    margin: 10px 0;
    color: #333;
}

.action-card p {
    color: #666;
    font-size: 14px;
}

.recent-activity {
    background: white;
    padding: 30px;
    border-radius: 15px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.recent-activity h3 {
    margin-bottom: 20px;
    color: #333;
    display: flex;
    align-items: center;
    gap: 10px;
}

.activity-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.activity-item {
    display: flex;
    align-items: flex-start;
    gap: 15px;
    padding-bottom: 15px;
    border-bottom: 1px solid #eee;
}

.activity-item:last-child {
    border-bottom: none;
    padding-bottom: 0;
}

.activity-item i {
    color: #667eea;
    font-size: 10px;
    margin-top: 5px;
}

.activity-details strong {
    display: block;
    color: #333;
}

.activity-details small {
    color: #999;
    font-size: 12px;
}

.no-activity {
    text-align: center;
    color: #999;
    padding: 40px;
}

.empty-state {
    text-align: center;
    padding: 80px 20px;
    background: white;
    border-radius: 15px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.empty-state i {
    color: #667eea;
    margin-bottom: 20px;
}

.empty-state h3 {
    margin-bottom: 10px;
    color: #333;
}

.empty-state p {
    color: #666;
    margin-bottom: 30px;
}

.form-actions {
    display: flex;
    gap: 15px;
    margin-top: 30px;
}

.status.new { background: #ffeaa7; color: #d35400; }
.status.in-progress { background: #a29bfe; color: #6c5ce7; }
.status.resolved { background: #55efc4; color: #00b894; }
`;
document.head.appendChild(citizenStyles);