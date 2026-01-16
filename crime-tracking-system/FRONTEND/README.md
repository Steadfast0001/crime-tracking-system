# Track-It-Down: Crime Tracking Web Application

A comprehensive crime reporting and tracking system with role-based dashboards for Citizens, Police Officers, and Administrators.

## Features

### 🎯 Citizen Features
- **Report Crimes**: Submit crime reports with location, type, description, and evidence
- **Automatic Geocoding**: Convert addresses to coordinates using Nominatim
- **Nearest Station Assignment**: Automatically assigns reports to nearest police station
- **Crime Map**: View all reported crimes on an interactive Leaflet map
- **Messaging System**: Text and voice messaging with police stations
- **Report History**: View and track your submitted reports

### 👮 Police Features
- **Case Management**: View and manage crime reports in a queue
- **Interactive Map**: See crime locations and navigate to them
- **Reporter Messaging**: Communicate with crime reporters
- **Route Planning**: Calculate routes to nearest crimes using OSRM
- **Analytics Dashboard**: View crime statistics with Chart.js visualizations
- **Status Updates**: Update case status (new → in-progress → resolved)

### 👑 Admin Features
- **User Management**: Manage system users (citizens, police, admins)
- **Station Management**: Configure police stations
- **System Analytics**: View system-wide statistics and health
- **Audit Logs**: Monitor all system activities
- **Data Export**: Export system data for analysis

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Maps**: Leaflet.js with OpenStreetMap tiles
- **Routing**: OSRM (Open Source Routing Machine)
- **Geocoding**: Nominatim (OpenStreetMap)
- **Charts**: Chart.js for data visualization
- **Storage**: Browser localStorage (client-side persistence)
- **Icons**: Font Awesome
- **Styling**: Custom CSS with responsive design

## Project Structure
track-it-down/
├── index.html # Main application HTML
├── style.css # Global styles
├── app.js # Main application router
├── auth.js # Authentication module
├── map.js # Map functionality (Leaflet)
├── citizen.js # Citizen role functionality
├── police.js # Police role functionality
├── admin.js # Admin role functionality
├── README.md # This documentation
└── assets/ # Static assets
└── logo.png # Application logo


## Setup and Installation

1. **Clone or download** the project files
2. **No build process required** - this is a static web application
3. **Open `index.html`** in a modern web browser

### Alternative: Run with Local Server
```bash
# Using Python
python3 -m http.server 8000

# Using Node.js with http-server
npx http-server


## How to Run the Application:

1. **Save all files** in a folder structure as shown above
2. **Place a logo image** in the `assets` folder (or keep the emoji placeholder)
3. **Open `index.html`** in your web browser
4. **Use demo credentials** to log in:
   - Citizen: `670000001` (any password)
   - Police: `670000002` (any password)
   - Admin: `670000003` (any password)

## Features to Test:

### Citizen Workflow:
1. Login as Citizen (670000001)
2. Go to "Report Crime"
3. Enter a location (e.g., "Kigali, Rwanda")
4. Select crime type and add description
5. Submit report
6. Check "My Reports" to see your submission
7. Go to "Messages" to chat with police

### Police Workflow:
1. Login as Police (670000002)
2. Check "Case Queue" to see reported crimes
3. Update case status
4. Go to "Police Map" to see crime locations
5. Use "Navigate to Nearest" for routing
6. Go to "Messages" to chat with reporters
7. Check "Analytics" for crime statistics

### Admin Workflow:
1. Login as Admin (670000003)
2. Check system stats on dashboard
3. Go to "Manage Users" to see user list
4. Go to "Manage Stations" to configure stations
5. Check "System Analytics" for overview
6. View "Audit Logs" for activity tracking

## Important Notes:

1. **Geocoding requires internet connection** - Uses free Nominatim service
2. **Routing uses OSRM demo server** - May have rate limits
3. **All data is stored in browser** - Clearing cache will erase data
4. **Voice recording works on HTTPS/localhost** - Chrome allows on localhost
5. **Use modern browsers** for best experience

The application is fully functional with all requested features implemented!

Demo Credentials
Role	Phone Number	Password
Citizen	670000001	any
Police	670000002	any
Admin	670000003	any
Note: Any password is accepted for demo purposes.

Key Features Implementation
1. Geocoding & Location Services
Uses Nominatim (OpenStreetMap) for address-to-coordinate conversion

Automatic nearest police station calculation using distance formula

User location detection via browser geolocation API

2. Interactive Maps
Leaflet.js for interactive crime maps

Custom markers for crimes and police stations

OSRM routing for navigation between points

Search functionality with geocoding integration

3. Crime Reporting
Form-based crime submission with validation

Multiple crime type selection

Evidence and description fields

Automatic timestamp and status assignment

4. Messaging System
Real-time messaging between citizens and police

Voice recording support (converted to base64 data URLs)

Conversation history persistence

Unread message indicators

5. Data Persistence
All data stored in browser's localStorage

Structured data with JSON serialization

Data persistence across browser sessions

Automatic data initialization on first load

6. Analytics & Reporting
Chart.js integration for visual statistics

Crime type distribution charts

Case status tracking

Performance metrics for police stations

Browser Compatibility
✅ Chrome (recommended)

✅ Firefox

✅ Safari

✅ Edge

Note: Voice recording requires HTTPS in production. For local development, Chrome allows microphone access on localhost.

Limitations & Known Issues
Client-side Storage: All data is stored locally in the browser

Data is not shared between devices

Clearing browser data removes all reports

Maximum storage limit applies

Geocoding & Routing Services:

Uses free public services with rate limits

No guaranteed uptime or response times

For production, use paid services or self-host

Voice Recording:

Audio stored as base64 data URLs

Large recordings may exceed localStorage limits

Production should use server storage or IndexedDB

Authentication:

Demo uses hardcoded credentials

No password hashing or encryption

No server-side validation

Development Guidelines
Adding New Features
New Page:

Add menu item in appropriate template

Create page loading function in corresponding module

Add route in app.js

New Crime Type:

Add to crimeTypes array in citizen.js

Update analytics if needed

New Police Station:

Add to default stations in app.js

Station data persists in localStorage

Code Structure
Modular Design: Each role has its own module

Event-Driven: Uses event listeners for user interactions

Responsive: Mobile-first CSS approach

Accessible: Semantic HTML with ARIA labels where needed

API Services Used
1. Nominatim Geocoding
Endpoint: https://nominatim.openstreetmap.org/search

Usage: Convert addresses to latitude/longitude

Rate Limits: 1 request per second recommended

2. OSRM Routing
Endpoint: https://router.project-osrm.org/route/v1

Usage: Calculate routes between coordinates

Note: Demo server - not for production

3. OpenStreetMap Tiles
Endpoint: https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png

Usage: Base map layer

License: Open Database License (ODbL)

Deployment Considerations
For Production:
Replace demo services with production APIs

Implement backend (Node.js/Express, Python/Django, etc.)

Add database (PostgreSQL, MongoDB, etc.)

Implement proper authentication (JWT, sessions)

Use HTTPS for geolocation and microphone access

Add data backup and synchronization

Implement user registration and verification

Add email/SMS notifications

Security Improvements:
Server-side validation of all inputs

Encrypt sensitive data

Implement rate limiting

Add audit logging

Regular security updates

Contributing
Fork the repository

Create a feature branch

Make your changes

Test thoroughly

Submit a pull request

License
This project is for educational purposes. For production use, ensure proper licensing of all services and components.

Support
For issues or questions:

Check the browser console for errors

Verify internet connectivity for API services

Clear localStorage if data corruption is suspected

Test with different browsers