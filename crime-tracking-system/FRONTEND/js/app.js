// Main application router and initializer
class App {
    constructor() {
        this.currentUser = null;
        this.currentPage = null;
        this.initializeApp();
    }

    initializeApp() {
        this.setupEventListeners();
        this.checkAuthState();
        this.initializeData();
    }

    setupEventListeners() {
        // Login form
        document.getElementById('login-btn').addEventListener('click', () => this.handleLogin());
        
        // Role selection
        document.querySelectorAll('.role-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
                // Ensure we add active to the button element even if inner icon/span is clicked
                const targetBtn = e.currentTarget || e.target.closest('.role-btn');
                if (targetBtn) targetBtn.classList.add('active');
            });
        });
        
        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => this.handleLogout());
        
        // Allow Enter key for login
        document.getElementById('password').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleLogin();
            }
        });
    }

    handleLogin() {
        const phone = document.getElementById('phone').value.trim();
        const role = document.querySelector('.role-btn.active').dataset.role;
        
        if (!phone) {
            alert('Please enter a phone number');
            return;
        }
        
        // Login user
        login(phone, role);
        this.currentUser = getCurrentUser();
        
        // Show dashboard
        this.showDashboard();
        this.loadRoleDashboard(role);
    }

    handleLogout() {
        logout();
        this.showLogin();
        this.currentUser = null;
    }

    showDashboard() {
        document.getElementById('login-screen').classList.remove('active');
        document.getElementById('dashboard').classList.add('active');
        
        // Update user info in header
        const user = getCurrentUser();
        if (user) {
            document.getElementById('current-role').textContent = 
                user.role.charAt(0).toUpperCase() + user.role.slice(1);
            document.getElementById('current-phone').textContent = user.phone;
        }
    }

    showLogin() {
        document.getElementById('login-screen').classList.add('active');
        document.getElementById('dashboard').classList.remove('active');
    }

    loadRoleDashboard(role) {
        const sidebar = document.getElementById('sidebar');
        const template = document.getElementById(`${role}-menu`);
        
        if (!template) return;
        
        sidebar.innerHTML = '';
        sidebar.appendChild(template.content.cloneNode(true));
        
        // Setup menu click handlers
        sidebar.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.closest('a').dataset.page;
                this.loadPage(page);
                
                // Update active menu item
                sidebar.querySelectorAll('a').forEach(a => a.classList.remove('active'));
                e.target.closest('a').classList.add('active');
            });
        });
        
        // Load default page for role
        const defaultPages = {
            citizen: 'citizen-dashboard',
            police: 'police-dashboard',
            admin: 'admin-dashboard'
        };
        
        this.loadPage(defaultPages[role]);
        
        // Set first menu item as active
        const firstLink = sidebar.querySelector('a');
        if (firstLink) {
            firstLink.classList.add('active');
        }
    }

    async loadPage(page) {
        console.log(`Loading page: ${page}`);
        this.currentPage = page;
        const content = document.getElementById('page-content');
        content.innerHTML = '';
        
        // Show loading
        content.innerHTML = '<div class="loading">Loading...</div>';
        
        try {
            switch(page) {
                case 'citizen-dashboard':
                    await loadCitizenDashboard();
                    break;
                case 'report-crime':
                    await loadReportCrimePage();
                    break;
                case 'citizen-map':
                    await loadCitizenMap();
                    break;
                case 'citizen-messages':
                    await loadCitizenMessages();
                    break;
                case 'my-reports':
                    await loadMyReports();
                    break;
                case 'police-dashboard':
                    await loadPoliceDashboard();
                    break;
                case 'case-queue':
                    await loadCaseQueue();
                    break;
                case 'police-map':
                    await loadPoliceMap();
                    break;
                case 'police-messages':
                    await loadPoliceMessages();
                    break;
                case 'analytics':
                    await loadAnalytics();
                    break;
                case 'admin-dashboard':
                    await loadAdminDashboard();
                    break;
                case 'manage-users':
                    await loadManageUsers();
                    break;
                case 'manage-stations':
                    await loadManageStations();
                    break;
                case 'system-analytics':
                    await loadSystemAnalytics();
                    break;
                case 'audit-logs':
                    await loadAuditLogs();
                    break;
                default:
                    content.innerHTML = '<h1>Page not found</h1>';
            }
        } catch (error) {
            console.error('Error loading page:', error);
            content.innerHTML = `<div class="error">Error loading page: ${error.message}</div>`;
        }
    }

    checkAuthState() {
        const user = getCurrentUser();
        if (user) {
            this.currentUser = user;
            this.showDashboard();
            this.loadRoleDashboard(user.role);
        } else {
            this.showLogin();
        }
    }

    initializeData() {
        // Initialize localStorage with default data if empty
        if (!localStorage.getItem('crimes')) {
            localStorage.setItem('crimes', JSON.stringify([]));
        }
        
        if (!localStorage.getItem('messages')) {
            localStorage.setItem('messages', JSON.stringify([]));
        }
        
        if (!localStorage.getItem('policeStations')) {
            // Default police stations (Demo locations)
            const stations = [
                { id: 1, name: "Central Police Station", lat: -1.9536, lng: 30.0603, phone: "670100001" },
                { id: 2, name: "Kicukiro Station", lat: -1.9611, lng: 30.0640, phone: "670100002" },
                { id: 3, name: "Nyamirambo Station", lat: -1.9660, lng: 30.0410, phone: "670100003" },
                { id: 4, name: "Remera Station", lat: -1.9371, lng: 30.1244, phone: "670100004" }
            ];
            localStorage.setItem('policeStations', JSON.stringify(stations));
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

// Helper function to show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
    
    // Close button handler
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
}

// Add notification styles
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    padding: 15px 20px;
    border-radius: 10px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    z-index: 9999;
    animation: slideIn 0.3s ease;
    max-width: 400px;
}

@keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

.notification-success {
    border-left: 4px solid #28a745;
}

.notification-error {
    border-left: 4px solid #dc3545;
}

.notification-info {
    border-left: 4px solid #17a2b8;
}

.notification-content {
    display: flex;
    align-items: center;
    gap: 10px;
}

.notification-content i {
    font-size: 20px;
}

.notification-success i { color: #28a745; }
.notification-error i { color: #dc3545; }
.notification-info i { color: #17a2b8; }

.notification-close {
    background: none;
    border: none;
    color: #999;
    cursor: pointer;
    font-size: 16px;
    padding: 5px;
}

.notification-close:hover {
    color: #666;
}
`;
document.head.appendChild(notificationStyles);