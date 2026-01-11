
let map;
let markers = [];

function initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement || !artistData || !artistData.locations || artistData.locations.length === 0) {
        if (mapElement) {
            mapElement.style.display = 'none';
        }
        return;
    }

    map = L.map('map').setView([48.8566, 2.3522], 4);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(map);

    artistData.locations.forEach(concert => {
        geocodeLocation(concert.location, concert.dates);
    });
}

async function geocodeLocation(location, dates) {
    try {
        const formattedLocation = formatLocationForGeocoding(location);

        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formattedLocation)}&limit=1`,
            {
                headers: {
                    'User-Agent': 'FestiDex/1.0'
                }
            }
        );

        const data = await response.json();

        if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);

            addMarker(lat, lon, location, dates);

            if (markers.length > 0) {
                const group = L.featureGroup(markers);
                map.fitBounds(group.getBounds().pad(0.1));
            }
        } else {
            console.warn(`Impossible de géolocaliser: ${location}`);
        }
    } catch (error) {
        console.error(`Erreur de géocodage pour ${location}:`, error);
    }
}

function formatLocationForGeocoding(location) {
    let formatted = location.replace(/[-_]/g, ' ');

    formatted = formatted.split(' ').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    return formatted;
}

function addMarker(lat, lon, location, dates) {
    const popupContent = `
        <div style="min-width: 200px;">
            <h3 style="margin: 0 0 10px; color: #7263FF; font-size: 1.2em;">
                ${formatLocationForGeocoding(location)}
            </h3>
            <div style="max-height: 150px; overflow-y: auto;">
                ${dates.map(date => `<p style="margin: 5px 0; color: #333;">${date}</p>`).join('')}
            </div>
        </div>
    `;

    const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
            <div style="
                background: #7263FF;
                width: 30px;
                height: 30px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                border: 3px solid white;
                box-shadow: 0 3px 10px rgba(0,0,0,0.3);
            ">
                <div style="
                    width: 10px;
                    height: 10px;
                    background: white;
                    border-radius: 50%;
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(45deg);
                "></div>
            </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30]
    });

    const marker = L.marker([lat, lon], { icon: customIcon })
        .addTo(map)
        .bindPopup(popupContent);

    markers.push(marker);
}

if (document.getElementById('map')) {
    initMap();
}

const style = document.createElement('style');
style.textContent = `
    .custom-marker {
        background: transparent;
        border: none;
    }

    .leaflet-popup-content-wrapper {
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    }

    .leaflet-popup-tip {
        background: white;
    }
`;
document.head.appendChild(style);
