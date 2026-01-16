// Authentication module
let currentUser = null;

// Hardcoded user database for demo
const users = {
    '670000001': { phone: '670000001', role: 'citizen', name: 'John Citizen' },
    '670000002': { phone: '670000002', role: 'police', name: 'Officer Smith', stationId: 1 },
    '670000003': { phone: '670000003', role: 'admin', name: 'Admin User' },
    '670000004': { phone: '670000004', role: 'citizen', name: 'Jane Doe' },
    '670000005': { phone: '670000005', role: 'police', name: 'Officer Johnson', stationId: 2 }
};

function login(phone, selectedRole) {
    const user = users[phone];
    
    if (!user) {
        // Create new citizen user if not found
        currentUser = {
            phone,
            role: 'citizen',
            name: `User ${phone}`
        };
        // Save to localStorage
        const userKey = `user_${phone}`;
        localStorage.setItem(userKey, JSON.stringify(currentUser));
    } else {
        // Use existing user
        currentUser = { ...user };
    }
    
    // Override role if selected differently (for demo purposes)
    if (selectedRole && selectedRole !== currentUser.role) {
        currentUser.role = selectedRole;
    }
    
    // Store in localStorage
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Log login event
    logActivity('login', `User ${phone} logged in as ${currentUser.role}`);
    
    return currentUser;
}

function logout() {
    logActivity('logout', `User ${currentUser.phone} logged out`);
    currentUser = null;
    localStorage.removeItem('currentUser');
}

function getCurrentUser() {
    if (currentUser) return currentUser;
    
    // Try to get from localStorage
    const stored = localStorage.getItem('currentUser');
    if (stored) {
        currentUser = JSON.parse(stored);
        return currentUser;
    }
    
    return null;
}

function isAuthenticated() {
    return getCurrentUser() !== null;
}

function requireAuth(requiredRole = null) {
    const user = getCurrentUser();
    
    if (!user) {
        window.location.hash = '';
        return false;
    }
    
    if (requiredRole && user.role !== requiredRole) {
        alert(`Access denied. This page requires ${requiredRole} role.`);
        return false;
    }
    
    return true;
}

// Activity logging
function logActivity(action, details) {
    const logs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
    const log = {
        timestamp: new Date().toISOString(),
        user: currentUser ? currentUser.phone : 'anonymous',
        action,
        details
    };
    
    logs.unshift(log); // Add to beginning
    localStorage.setItem('activityLogs', JSON.stringify(logs.slice(0, 1000))); // Keep last 1000 logs
}

// Export functions
window.login = login;
window.logout = logout;
window.getCurrentUser = getCurrentUser;
window.isAuthenticated = isAuthenticated;
window.requireAuth = requireAuth;
window.logActivity = logActivity;