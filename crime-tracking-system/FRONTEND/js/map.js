// Map module using Leaflet
class CrimeMap {
    constructor(containerId, role = 'citizen') {
        this.containerId = containerId;
        this.role = role;
        this.map = null;
        this.markers = [];
        this.routes = [];
        this.currentPosition = null;
        this.selectedStation = null;
        this.initMap();
    }

    initMap() {
        // Default center (Kigali, Rwanda)
        const defaultCenter = [-1.9706, 30.1044];
        
        // Create map
        this.map = L.map(this.containerId).setView(defaultCenter, 13);
        
        // Add tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(this.map);
        
        // Add scale control
        L.control.scale().addTo(this.map);
        
        // Initialize search
        this.initSearch();
        
        // Load existing crime reports
        this.loadCrimeMarkers();
        
        // Load police stations
        this.loadPoliceStations();
        
        // Add locate control
        this.addLocateControl();
    }

    initSearch() {
        const searchBox = document.getElementById('map-search');
        const searchBtn = document.getElementById('search-btn');
        
        if (searchBox && searchBtn) {
            searchBtn.addEventListener('click', () => this.searchLocation(searchBox.value));
            searchBox.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchLocation(searchBox.value);
                }
            });
        }
    }

    async searchLocation(query) {
        if (!query.trim()) return;
        
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
            );
            const data = await response.json();
            
            if (data.length > 0) {
                const result = data[0];
                const lat = parseFloat(result.lat);
                const lng = parseFloat(result.lon);
                
                this.map.setView([lat, lng], 15);
                
                // Add marker
                L.marker([lat, lng])
                    .addTo(this.map)
                    .bindPopup(`<b>${result.display_name}</b><br>Searched location`)
                    .openPopup();
                
                // Update info display
                const infoEl = document.getElementById('current-location');
                if (infoEl) {
                    infoEl.textContent = `Location: ${result.display_name.split(',')[0]}`;
                }
                
                showNotification(`Found: ${result.display_name}`, 'success');
                
                // If citizen, find nearest police station
                if (this.role === 'citizen' && window.findNearestStation) {
                    const nearest = window.findNearestStation(lat, lng);
                    this.selectedStation = nearest;
                    
                    // Show station on map
                    this.showStationOnMap(nearest);
                    
                    // Update station info in report form if exists
                    const stationSelect = document.getElementById('police-station');
                    if (stationSelect) {
                        stationSelect.value = nearest.id;
                    }
                }
            } else {
                showNotification('Location not found', 'error');
            }
        } catch (error) {
            console.error('Geocoding error:', error);
            showNotification('Error searching location', 'error');
        }
    }

    addCrimeMarker(crime) {
        const marker = L.marker([crime.lat, crime.lng])
            .addTo(this.map)
            .bindPopup(`
                <div class="crime-popup">
                    <h3>${crime.type}</h3>
                    <p><strong>Status:</strong> ${crime.status}</p>
                    <p><strong>Time:</strong> ${new Date(crime.timestamp).toLocaleString()}</p>
                    <p><strong>Description:</strong> ${crime.description}</p>
                    ${crime.reporter ? `<p><strong>Reporter:</strong> ${crime.reporter}</p>` : ''}
                    ${this.role === 'police' ? `<button onclick="selectReporter('${crime.reporterPhone}')">Message Reporter</button>` : ''}
                </div>
            `);
        
        this.markers.push({ crime, marker });
        this.updateMarkerCount();
        
        // If this is the latest crime, center map on it
        if (crime.id === Math.max(...this.markers.map(m => m.crime.id))) {
            this.map.setView([crime.lat, crime.lng], 15);
        }
    }

    loadCrimeMarkers() {
        const crimes = JSON.parse(localStorage.getItem('crimes') || '[]');
        crimes.forEach(crime => {
            if (crime.lat && crime.lng) {
                this.addCrimeMarker(crime);
            }
        });
    }

    loadPoliceStations() {
        const stations = JSON.parse(localStorage.getItem('policeStations') || '[]');
        stations.forEach(station => {
            L.circleMarker([station.lat, station.lng], {
                color: 'blue',
                fillColor: '#30f',
                fillOpacity: 0.5,
                radius: 8
            })
            .addTo(this.map)
            .bindPopup(`
                <div class="station-popup">
                    <h3>${station.name}</h3>
                    <p><strong>Phone:</strong> ${station.phone}</p>
                    <p><strong>ID:</strong> ${station.id}</p>
                </div>
            `);
        });
    }

    showStationOnMap(station) {
        // Clear previous station highlight
        this.clearStationHighlight();
        
        // Add highlighted station
        this.selectedStationMarker = L.circleMarker([station.lat, station.lng], {
            color: 'red',
            fillColor: '#f00',
            fillOpacity: 0.7,
            radius: 10
        })
        .addTo(this.map)
        .bindPopup(`<b>Nearest Station:</b> ${station.name}`)
        .openPopup();
    }

    clearStationHighlight() {
        if (this.selectedStationMarker) {
            this.map.removeLayer(this.selectedStationMarker);
        }
    }

    async calculateRoute(fromLat, fromLng, toLat, toLng) {
        try {
            // Using OSRM demo server
            const response = await fetch(
                `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`
            );
            const data = await response.json();
            
            if (data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                const routeCoordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
                
                // Draw route on map
                const routeLine = L.polyline(routeCoordinates, {
                    color: '#667eea',
                    weight: 4,
                    opacity: 0.7,
                    dashArray: '10, 10'
                }).addTo(this.map);
                
                this.routes.push(routeLine);
                
                // Fit map to route bounds
                const bounds = L.latLngBounds(routeCoordinates);
                this.map.fitBounds(bounds, { padding: [50, 50] });
                
                showNotification(`Route calculated: ${(route.distance / 1000).toFixed(1)} km`, 'success');
                
                return route;
            }
        } catch (error) {
            console.error('Routing error:', error);
            showNotification('Error calculating route', 'error');
        }
        return null;
    }

    addLocateControl() {
        const locateBtn = document.getElementById('locate-btn');
        if (locateBtn) {
            locateBtn.addEventListener('click', () => this.locateUser());
        }
    }

    locateUser() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    
                    this.currentPosition = { lat, lng };
                    this.map.setView([lat, lng], 15);
                    
                    // Add user location marker
                    L.marker([lat, lng], {
                        icon: L.divIcon({
                            className: 'user-location-marker',
                            html: '<div class="user-pulse"></div>',
                            iconSize: [20, 20]
                        })
                    })
                    .addTo(this.map)
                    .bindPopup('<b>Your Current Location</b>')
                    .openPopup();
                    
                    showNotification('Location found!', 'success');
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    showNotification('Unable to get your location', 'error');
                }
            );
        } else {
            showNotification('Geolocation not supported by your browser', 'error');
        }
    }

    updateMarkerCount() {
        const countEl = document.getElementById('marker-count');
        if (countEl) {
            countEl.textContent = `Markers: ${this.markers.length}`;
        }
    }

    clearRoutes() {
        this.routes.forEach(route => this.map.removeLayer(route));
        this.routes = [];
    }

    destroy() {
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
    }
}

// Global map instances
let citizenMap = null;
let policeMap = null;

// Initialize citizen map
async function loadCitizenMap() {
    const content = document.getElementById('page-content');
    const template = document.getElementById('map-template');
    
    if (!template) {
        content.innerHTML = '<h2>Map Template Not Found</h2>';
        return;
    }
    
    content.innerHTML = '';
    content.appendChild(template.content.cloneNode(true));
    
    // Initialize map
    if (citizenMap) {
        citizenMap.destroy();
    }
    
    setTimeout(() => {
        citizenMap = new CrimeMap('map', 'citizen');
    }, 100);
}

// Initialize police map
async function loadPoliceMap() {
    const content = document.getElementById('page-content');
    const template = document.getElementById('map-template');
    
    if (!template) {
        content.innerHTML = '<h2>Map Template Not Found</h2>';
        return;
    }
    
    content.innerHTML = '';
    content.appendChild(template.content.cloneNode(true));
    
    // Add police-specific controls
    const mapControls = document.querySelector('.map-controls');
    const routeBtn = document.createElement('button');
    routeBtn.id = 'route-btn';
    routeBtn.className = 'btn-secondary';
    routeBtn.innerHTML = '<i class="fas fa-route"></i> Navigate to Nearest';
    mapControls.appendChild(routeBtn);
    
    // Initialize map
    if (policeMap) {
        policeMap.destroy();
    }
    
    setTimeout(() => {
        policeMap = new CrimeMap('map', 'police');
        
        // Add route button handler
        document.getElementById('route-btn').addEventListener('click', () => {
            calculateRouteToNearestCrime();
        });
    }, 100);
}

// Police: Calculate route to nearest crime
async function calculateRouteToNearestCrime() {
    if (!policeMap || !policeMap.currentPosition) {
        showNotification('Please enable location first', 'error');
        return;
    }
    
    const crimes = JSON.parse(localStorage.getItem('crimes') || '[]')
        .filter(crime => crime.status === 'new' || crime.status === 'in-progress');
    
    if (crimes.length === 0) {
        showNotification('No active cases found', 'info');
        return;
    }
    
    // Find nearest crime
    let nearestCrime = null;
    let minDistance = Infinity;
    
    crimes.forEach(crime => {
        const distance = calculateDistance(
            policeMap.currentPosition.lat,
            policeMap.currentPosition.lng,
            crime.lat,
            crime.lng
        );
        
        if (distance < minDistance) {
            minDistance = distance;
            nearestCrime = crime;
        }
    });
    
    if (nearestCrime) {
        policeMap.clearRoutes();
        await policeMap.calculateRoute(
            policeMap.currentPosition.lat,
            policeMap.currentPosition.lng,
            nearestCrime.lat,
            nearestCrime.lng
        );
    }
}

// Helper: Calculate distance between coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Global utility: find nearest police station to lat/lng
window.findNearestStation = function(lat, lng) {
    const stations = JSON.parse(localStorage.getItem('policeStations') || '[]');
    if (!stations || stations.length === 0) return null;
    let nearest = stations[0];
    let minDist = calculateDistance(lat, lng, stations[0].lat, stations[0].lng);
    stations.forEach(s => {
        const d = calculateDistance(lat, lng, s.lat, s.lng);
        if (d < minDist) {
            minDist = d;
            nearest = s;
        }
    });
    return { ...nearest, distance: minDist };
};

// Export functions
window.loadCitizenMap = loadCitizenMap;
window.loadPoliceMap = loadPoliceMap;
window.calculateRouteToNearestCrime = calculateRouteToNearestCrime;

// Add custom marker styles
const mapStyles = document.createElement('style');
mapStyles.textContent = `
.user-location-marker {
    background: none;
    border: none;
}

.user-pulse {
    width: 20px;
    height: 20px;
    background: #667eea;
    border-radius: 50%;
    position: relative;
    animation: pulse 1.5s infinite;
}

@keyframes pulse {
    0% {
        transform: scale(1);
        opacity: 1;
    }
    50% {
        transform: scale(1.5);
        opacity: 0.5;
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}

.crime-popup h3 {
    margin: 0 0 10px 0;
    color: #dc3545;
}

.crime-popup p {
    margin: 5px 0;
}

.crime-popup button {
    margin-top: 10px;
    padding: 5px 10px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 3px;
    cursor: pointer;
}

.station-popup h3 {
    margin: 0 0 10px 0;
    color: #30f;
}
`;
document.head.appendChild(mapStyles);