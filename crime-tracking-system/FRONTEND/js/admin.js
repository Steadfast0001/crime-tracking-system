// Admin module
class AdminModule {
    constructor() {
        this.currentUser = getCurrentUser();
    }

    async loadDashboard() {
        const content = document.getElementById('page-content');
        
        const systemStats = this.getSystemStats();
        
        content.innerHTML = `
            <div class="page-header">
                <h2><i class="fas fa-cog"></i> Admin Dashboard</h2>
                <div class="dashboard-actions">
                    <button onclick="app.loadPage('manage-users')" class="btn-primary">
                        <i class="fas fa-users-cog"></i> Manage Users
                    </button>
                </div>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${systemStats.totalUsers}</div>
                    <div class="stat-label">Total Users</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${systemStats.activeReports}</div>
                    <div class="stat-label">Active Reports</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${systemStats.policeStations}</div>
                    <div class="stat-label">Police Stations</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${systemStats.messages}</div>
                    <div class="stat-label">Messages Today</div>
                </div>
            </div>
            
            <div class="admin-actions">
                <h3><i class="fas fa-tools"></i> System Actions</h3>
                <div class="actions-grid">
                    <div class="action-card" onclick="app.loadPage('manage-users')">
                        <i class="fas fa-users"></i>
                        <h4>Manage Users</h4>
                        <p>Add, edit, or remove users</p>
                    </div>
                    <div class="action-card" onclick="app.loadPage('manage-stations')">
                        <i class="fas fa-police-box"></i>
                        <h4>Manage Stations</h4>
                        <p>Configure police stations</p>
                    </div>
                    <div class="action-card" onclick="app.loadPage('system-analytics')">
                        <i class="fas fa-chart-pie"></i>
                        <h4>System Analytics</h4>
                        <p>View system-wide statistics</p>
                    </div>
                    <div class="action-card" onclick="app.loadPage('audit-logs')">
                        <i class="fas fa-clipboard-check"></i>
                        <h4>Audit Logs</h4>
                        <p>Review system activity</p>
                    </div>
                </div>
            </div>
            
            <div class="system-health">
                <h3><i class="fas fa-heartbeat"></i> System Health</h3>
                <div class="health-metrics">
                    <div class="metric">
                        <span class="metric-label">Storage Usage</span>
                        <div class="metric-bar">
                            <div class="metric-fill" style="width: ${systemStats.storageUsage}%"></div>
                        </div>
                        <span class="metric-value">${systemStats.storageUsage}%</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">API Status</span>
                        <span class="metric-status ${systemStats.apiStatus}">
                            <i class="fas fa-circle"></i> ${systemStats.apiStatus}
                        </span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Last Backup</span>
                        <span class="metric-value">${systemStats.lastBackup}</span>
                    </div>
                </div>
            </div>
        `;
    }

    async loadManageUsers() {
        const content = document.getElementById('page-content');
        
        // Simulated user data
        const users = [
            { id: 1, phone: '670000001', name: 'John Citizen', role: 'citizen', status: 'active', joined: '2024-01-15' },
            { id: 2, phone: '670000002', name: 'Officer Smith', role: 'police', status: 'active', joined: '2024-01-10' },
            { id: 3, phone: '670000003', name: 'Admin User', role: 'admin', status: 'active', joined: '2024-01-01' },
            { id: 4, phone: '670000004', name: 'Jane Doe', role: 'citizen', status: 'inactive', joined: '2024-01-20' },
            { id: 5, phone: '670000005', name: 'Officer Johnson', role: 'police', status: 'active', joined: '2024-01-12' }
        ];
        
        content.innerHTML = `
            <div class="page-header">
                <h2><i class="fas fa-users-cog"></i> Manage Users</h2>
                <div class="user-actions">
                    <button onclick="showAddUserModal()" class="btn-primary">
                        <i class="fas fa-user-plus"></i> Add User
                    </button>
                </div>
            </div>
            
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Phone</th>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(user => `
                            <tr>
                                <td>${user.id}</td>
                                <td>${user.phone}</td>
                                <td>${user.name}</td>
                                <td>
                                    <span class="role-badge ${user.role}">${user.role}</span>
                                </td>
                                <td>
                                    <span class="status-badge ${user.status}">${user.status}</span>
                                </td>
                                <td>${user.joined}</td>
                                <td>
                                    <button onclick="editUser(${user.id})" class="action-btn">
                                        <i class="fas fa-edit"></i> Edit
                                    </button>
                                    <button onclick="deleteUser(${user.id})" class="action-btn danger">
                                        <i class="fas fa-trash"></i> Delete
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="user-filters">
                <h3>Filter Users</h3>
                <div class="filter-options">
                    <select id="filter-role" class="filter-select">
                        <option value="all">All Roles</option>
                        <option value="citizen">Citizen</option>
                        <option value="police">Police</option>
                        <option value="admin">Admin</option>
                    </select>
                    <select id="filter-status" class="filter-select">
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    <button onclick="filterUsers()" class="btn-secondary">
                        <i class="fas fa-filter"></i> Apply Filter
                    </button>
                </div>
            </div>
        `;
    }

    async loadManageStations() {
        const content = document.getElementById('page-content');
        const stations = JSON.parse(localStorage.getItem('policeStations') || '[]');
        
        content.innerHTML = `
            <div class="page-header">
                <h2><i class="fas fa-police-box"></i> Manage Police Stations</h2>
                <div class="station-actions">
                    <button onclick="showAddStationModal()" class="btn-primary">
                        <i class="fas fa-plus"></i> Add Station
                    </button>
                </div>
            </div>
            
            <div class="stations-grid">
                ${stations.map(station => `
                    <div class="station-card">
                        <div class="station-header">
                            <h3>${station.name}</h3>
                            <span class="station-id">ID: ${station.id}</span>
                        </div>
                        <div class="station-details">
                            <p><i class="fas fa-phone"></i> ${station.phone}</p>
                            <p><i class="fas fa-map-marker-alt"></i> ${station.lat.toFixed(4)}, ${station.lng.toFixed(4)}</p>
                        </div>
                        <div class="station-actions">
                            <button onclick="editStation(${station.id})" class="action-btn">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button onclick="viewStationOnMap(${station.id})" class="action-btn">
                                <i class="fas fa-map"></i> View Map
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="station-stats">
                <h3>Station Statistics</h3>
                <div class="stats-cards">
                    <div class="stat-card">
                        <div class="stat-value">${stations.length}</div>
                        <div class="stat-label">Total Stations</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${this.getAverageCasesPerStation()}</div>
                        <div class="stat-label">Avg Cases/Station</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${this.getBusiestStation(stations)}</div>
                        <div class="stat-label">Busiest Station</div>
                    </div>
                </div>
            </div>
        `;
    }

    async loadSystemAnalytics() {
        const content = document.getElementById('page-content');
        
        content.innerHTML = `
            <div class="page-header">
                <h2><i class="fas fa-chart-pie"></i> System Analytics</h2>
                <div class="analytics-actions">
                    <button onclick="exportSystemData()" class="btn-secondary">
                        <i class="fas fa-download"></i> Export All Data
                    </button>
                </div>
            </div>
            
            <div class="analytics-dashboard">
                <div class="chart-container">
                    <h3><i class="fas fa-chart-bar"></i> User Growth</h3>
                    <canvas id="userGrowthChart"></canvas>
                </div>
                
                <div class="chart-container">
                    <h3><i class="fas fa-chart-line"></i> System Activity</h3>
                    <canvas id="activityChart"></canvas>
                </div>
                
                <div class="data-summary">
                    <h3><i class="fas fa-database"></i> Data Summary</h3>
                    <div class="summary-grid">
                        <div class="summary-item">
                            <span class="summary-label">Total Crimes</span>
                            <span class="summary-value">${this.getTotalCrimes()}</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">Total Messages</span>
                            <span class="summary-value">${this.getTotalMessages()}</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">Active Sessions</span>
                            <span class="summary-value">${this.getActiveSessions()}</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">Storage Used</span>
                            <span class="summary-value">${this.getStorageUsed()}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Render charts
        this.renderSystemCharts();
    }

    async loadAuditLogs() {
        const content = document.getElementById('page-content');
        const logs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
        
        content.innerHTML = `
            <div class="page-header">
                <h2><i class="fas fa-clipboard-check"></i> Audit Logs</h2>
                <div class="log-actions">
                    <button onclick="clearLogs()" class="btn-secondary">
                        <i class="fas fa-trash"></i> Clear Logs
                    </button>
                </div>
            </div>
            
            <div class="log-filters">
                <input type="date" id="log-date" class="filter-input">
                <select id="log-type" class="filter-select">
                    <option value="all">All Actions</option>
                    <option value="login">Login</option>
                    <option value="logout">Logout</option>
                    <option value="crime_report">Crime Report</option>
                    <option value="message_sent">Message Sent</option>
                </select>
                <button onclick="filterLogs()" class="btn-secondary">
                    <i class="fas fa-filter"></i> Filter
                </button>
            </div>
            
            <div class="log-container">
                ${logs.length === 0 ? `
                    <div class="empty-logs">
                        <i class="fas fa-clipboard-list fa-3x"></i>
                        <h3>No Audit Logs</h3>
                        <p>No system activities have been logged yet.</p>
                    </div>
                ` : `
                    <div class="log-list">
                        ${logs.map(log => `
                            <div class="log-item">
                                <div class="log-timestamp">
                                    ${new Date(log.timestamp).toLocaleString()}
                                </div>
                                <div class="log-user">
                                    <i class="fas fa-user"></i> ${log.user}
                                </div>
                                <div class="log-action ${log.action}">
                                    ${log.action.replace('_', ' ')}
                                </div>
                                <div class="log-details">
                                    ${log.details}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
            
            <div class="log-stats">
                <div class="stat-card">
                    <div class="stat-value">${logs.length}</div>
                    <div class="stat-label">Total Logs</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${this.getUniqueUsers(logs)}</div>
                    <div class="stat-label">Unique Users</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${this.getMostActiveUser(logs)}</div>
                    <div class="stat-label">Most Active User</div>
                </div>
            </div>
        `;
    }

    getSystemStats() {
        const crimes = JSON.parse(localStorage.getItem('crimes') || '[]');
        const messages = JSON.parse(localStorage.getItem('messages') || '[]');
        const stations = JSON.parse(localStorage.getItem('policeStations') || '[]');
        
        // Calculate storage usage (approximate)
        const storageUsed = JSON.stringify(localStorage).length;
        const storageLimit = 5 * 1024 * 1024; // 5MB typical limit
        const storageUsage = Math.round((storageUsed / storageLimit) * 100);
        
        return {
            totalUsers: this.getTotalUsers(),
            activeReports: crimes.filter(c => c.status === 'new' || c.status === 'in-progress').length,
            policeStations: stations.length,
            messages: messages.filter(msg => 
                new Date(msg.timestamp).toDateString() === new Date().toDateString()
            ).length,
            storageUsage: storageUsage > 100 ? 100 : storageUsage,
            apiStatus: 'online', // Simulated
            lastBackup: new Date().toLocaleDateString()
        };
    }

    getTotalUsers() {
        // Count unique users from crimes and messages
        const crimes = JSON.parse(localStorage.getItem('crimes') || '[]');
        const messages = JSON.parse(localStorage.getItem('messages') || '[]');
        
        const userSet = new Set();
        
        crimes.forEach(crime => {
            if (crime.reporterPhone) userSet.add(crime.reporterPhone);
        });
        
        messages.forEach(msg => {
            userSet.add(msg.sender);
            userSet.add(msg.recipient);
        });
        
        return userSet.size;
    }

    getAverageCasesPerStation() {
        const crimes = JSON.parse(localStorage.getItem('crimes') || '[]');
        const stations = JSON.parse(localStorage.getItem('policeStations') || '[]');
        
        if (stations.length === 0) return 0;
        
        const casesPerStation = {};
        crimes.forEach(crime => {
            if (crime.stationId) {
                casesPerStation[crime.stationId] = (casesPerStation[crime.stationId] || 0) + 1;
            }
        });
        
        const totalCases = Object.values(casesPerStation).reduce((sum, count) => sum + count, 0);
        return Math.round(totalCases / stations.length);
    }

    getBusiestStation(stations) {
        const crimes = JSON.parse(localStorage.getItem('crimes') || '[]');
        
        const stationCases = {};
        crimes.forEach(crime => {
            if (crime.stationId) {
                stationCases[crime.stationId] = (stationCases[crime.stationId] || 0) + 1;
            }
        });
        
        if (Object.keys(stationCases).length === 0) return 'None';
        
        const busiestId = Object.entries(stationCases).sort((a, b) => b[1] - a[1])[0][0];
        const station = stations.find(s => s.id === parseInt(busiestId));
        return station ? station.name : 'Unknown';
    }

    renderSystemCharts() {
        // User growth chart (simulated)
        const userGrowthCtx = document.getElementById('userGrowthChart').getContext('2d');
        new Chart(userGrowthCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Users',
                    data: [10, 25, 45, 60, 85, 120],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
        
        // Activity chart (simulated)
        const activityCtx = document.getElementById('activityChart').getContext('2d');
        new Chart(activityCtx, {
            type: 'bar',
            data: {
                labels: ['Logins', 'Reports', 'Messages', 'Updates'],
                datasets: [{
                    label: 'Daily Activities',
                    data: [45, 28, 62, 15],
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    getTotalCrimes() {
        const crimes = JSON.parse(localStorage.getItem('crimes') || '[]');
        return crimes.length;
    }

    getTotalMessages() {
        const messages = JSON.parse(localStorage.getItem('messages') || '[]');
        return messages.length;
    }

    getActiveSessions() {
        // Simulated active sessions
        return Math.floor(Math.random() * 10) + 1;
    }

    getStorageUsed() {
        const storageUsed = JSON.stringify(localStorage).length;
        return `${Math.round(storageUsed / 1024)} KB`;
    }

    getUniqueUsers(logs) {
        const userSet = new Set();
        logs.forEach(log => userSet.add(log.user));
        return userSet.size;
    }

    getMostActiveUser(logs) {
        const userCounts = {};
        logs.forEach(log => {
            userCounts[log.user] = (userCounts[log.user] || 0) + 1;
        });
        
        if (Object.keys(userCounts).length === 0) return 'None';
        
        return Object.entries(userCounts).sort((a, b) => b[1] - a[1])[0][0];
    }
}

// Initialize admin module
let adminModule = null;

// Load admin dashboard
async function loadAdminDashboard() {
    if (!adminModule) {
        adminModule = new AdminModule();
    }
    await adminModule.loadDashboard();
}

// Load manage users
async function loadManageUsers() {
    if (!adminModule) {
        adminModule = new AdminModule();
    }
    await adminModule.loadManageUsers();
}

// Load manage stations
async function loadManageStations() {
    if (!adminModule) {
        adminModule = new AdminModule();
    }
    await adminModule.loadManageStations();
}

// Load system analytics
async function loadSystemAnalytics() {
    if (!adminModule) {
        adminModule = new AdminModule();
    }
    await adminModule.loadSystemAnalytics();
}

// Load audit logs
async function loadAuditLogs() {
    if (!adminModule) {
        adminModule = new AdminModule();
    }
    await adminModule.loadAuditLogs();
}

// Global admin helper functions
window.showAddUserModal = function() {
    alert('Add User feature would open a modal in a real application.');
};

window.editUser = function(userId) {
    alert(`Edit User ${userId} - This would open an edit form.`);
};

window.deleteUser = function(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        alert(`User ${userId} deleted (simulated).`);
        showNotification('User deleted successfully', 'success');
    }
};

window.filterUsers = function() {
    alert('Filter applied (simulated).');
};

window.showAddStationModal = function() {
    alert('Add Station feature would open a modal in a real application.');
};

window.editStation = function(stationId) {
    alert(`Edit Station ${stationId} - This would open an edit form.`);
};

window.viewStationOnMap = function(stationId) {
    alert(`View Station ${stationId} on map - This would open the map.`);
};

window.exportSystemData = function() {
    const data = {
        crimes: JSON.parse(localStorage.getItem('crimes') || '[]'),
        messages: JSON.parse(localStorage.getItem('messages') || '[]'),
        stations: JSON.parse(localStorage.getItem('policeStations') || '[]'),
        logs: JSON.parse(localStorage.getItem('activityLogs') || '[]'),
        exportDate: new Date().toISOString()
    };
    
    const json = JSON.stringify(data, null, 2);
    downloadJSON(json, 'system-export.json');
    showNotification('System data exported successfully', 'success');
};

window.clearLogs = function() {
    if (confirm('Are you sure you want to clear all audit logs?')) {
        localStorage.setItem('activityLogs', JSON.stringify([]));
        showNotification('Audit logs cleared', 'success');
        app.loadPage('audit-logs');
    }
};

window.filterLogs = function() {
    alert('Log filter applied (simulated).');
};

// Export functions
window.loadAdminDashboard = loadAdminDashboard;
window.loadManageUsers = loadManageUsers;
window.loadManageStations = loadManageStations;
window.loadSystemAnalytics = loadSystemAnalytics;
window.loadAuditLogs = loadAuditLogs;

// Add styles for admin pages
const adminStyles = document.createElement('style');
adminStyles.textContent = `
.admin-actions {
    margin: 40px 0;
}

.admin-actions h3 {
    margin-bottom: 20px;
    color: #333;
    display: flex;
    align-items: center;
    gap: 10px;
}

.system-health {
    background: white;
    padding: 30px;
    border-radius: 15px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.system-health h3 {
    margin-bottom: 20px;
    color: #333;
    display: flex;
    align-items: center;
    gap: 10px;
}

.health-metrics {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.metric {
    display: flex;
    align-items: center;
    gap: 20px;
}

.metric-label {
    width: 150px;
    font-weight: 600;
    color: #555;
}

.metric-bar {
    flex: 1;
    height: 10px;
    background: #e0e0e0;
    border-radius: 5px;
    overflow: hidden;
}

.metric-fill {
    height: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 5px;
    transition: width 0.3s;
}

.metric-value {
    width: 80px;
    text-align: right;
    font-weight: 600;
    color: #667eea;
}

.metric-status {
    padding: 5px 15px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 5px;
}

.metric-status.online {
    background: #d4edda;
    color: #155724;
}

.metric-status.offline {
    background: #f8d7da;
    color: #721c24;
}

.role-badge, .status-badge {
    padding: 5px 15px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
}

.role-badge.citizen { background: #e3f2fd; color: #1565c0; }
.role-badge.police { background: #e8f5e8; color: #2e7d32; }
.role-badge.admin { background: #f3e5f5; color: #7b1fa2; }

.status-badge.active { background: #d4edda; color: #155724; }
.status-badge.inactive { background: #f8d7da; color: #721c24; }

.action-btn.danger {
    background: #dc3545;
}

.action-btn.danger:hover {
    background: #c82333;
}

.user-filters, .log-filters {
    background: white;
    padding: 20px;
    border-radius: 10px;
    margin: 20px 0;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.user-filters h3, .log-filters h3 {
    margin-bottom: 15px;
    color: #333;
}

.filter-options {
    display: flex;
    gap: 15px;
    align-items: center;
}

.filter-input {
    padding: 10px 15px;
    border: 2px solid #e0e0e0;
    border-radius: 5px;
    background: white;
    font-size: 14px;
}

.stations-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin: 30px 0;
}

.station-card {
    background: white;
    padding: 25px;
    border-radius: 15px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    transition: all 0.3s;
}

.station-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
}

.station-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 15px;
}

.station-header h3 {
    margin: 0;
    color: #333;
}

.station-id {
    background: #667eea;
    color: white;
    padding: 3px 10px;
    border-radius: 10px;
    font-size: 12px;
}

.station-details {
    margin-bottom: 20px;
}

.station-details p {
    margin: 8px 0;
    color: #666;
    display: flex;
    align-items: center;
    gap: 10px;
}

.station-actions {
    display: flex;
    gap: 10px;
}

.station-stats {
    background: white;
    padding: 30px;
    border-radius: 15px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    margin-top: 30px;
}

.station-stats h3 {
    margin-bottom: 20px;
    color: #333;
}

.stats-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
}

.analytics-dashboard {
    display: flex;
    flex-direction: column;
    gap: 30px;
}

.data-summary {
    background: white;
    padding: 30px;
    border-radius: 15px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.data-summary h3 {
    margin-bottom: 20px;
    color: #333;
    display: flex;
    align-items: center;
    gap: 10px;
}

.summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
}

.summary-item {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.summary-label {
    font-size: 14px;
    color: #666;
}

.summary-value {
    font-size: 24px;
    font-weight: 700;
    color: #667eea;
}

.log-container {
    background: white;
    padding: 30px;
    border-radius: 15px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    margin: 20px 0;
    min-height: 400px;
}

.empty-logs {
    text-align: center;
    padding: 80px 20px;
}

.empty-logs i {
    color: #667eea;
    margin-bottom: 20px;
}

.empty-logs h3 {
    margin-bottom: 10px;
    color: #333;
}

.empty-logs p {
    color: #666;
}

.log-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
    max-height: 500px;
    overflow-y: auto;
}

.log-item {
    display: grid;
    grid-template-columns: 200px 150px 150px 1fr;
    gap: 20px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 10px;
    align-items: center;
}

.log-timestamp {
    font-family: monospace;
    font-size: 14px;
    color: #666;
}

.log-user {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #333;
}

.log-action {
    padding: 5px 10px;
    border-radius: 15px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    text-align: center;
}

.log-action.login { background: #d4edda; color: #155724; }
.log-action.logout { background: #fff3cd; color: #856404; }
.log-action.crime_report { background: #f8d7da; color: #721c24; }
.log-action.message_sent { background: #d1ecf1; color: #0c5460; }

.log-details {
    color: #666;
    font-size: 14px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.log-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
}
`;
document.head.appendChild(adminStyles);