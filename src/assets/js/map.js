// Carte interactive avec Leaflet pour la géolocalisation des concerts

let map;
let markers = [];

// Initialiser la carte
function initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement || !artistData || !artistData.locations || artistData.locations.length === 0) {
        if (mapElement) {
            mapElement.style.display = 'none';
        }
        return;
    }

    // Créer la carte centrée sur l'Europe par défaut
    map = L.map('map').setView([48.8566, 2.3522], 4);

    // Ajouter les tuiles OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(map);

    // Géolocaliser chaque lieu de concert
    artistData.locations.forEach(concert => {
        geocodeLocation(concert.location, concert.dates);
    });

    // Animation GSAP de la carte
    gsap.from(mapElement, {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: 'power2.out',
        delay: 0.5
    });
}

// Fonction pour géocoder une location (convertir adresse en coordonnées)
async function geocodeLocation(location, dates) {
    try {
        // Formater la location pour la recherche
        const formattedLocation = formatLocationForGeocoding(location);

        // Utiliser Nominatim (service de géocodage OpenStreetMap)
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

            // Ajouter un marqueur sur la carte
            addMarker(lat, lon, location, dates);

            // Ajuster la vue de la carte pour inclure tous les marqueurs
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

// Fonction pour formater la location pour le géocodage
function formatLocationForGeocoding(location) {
    // Remplacer les underscores et tirets par des espaces
    let formatted = location.replace(/[-_]/g, ' ');

    // Mettre en majuscule la première lettre de chaque mot
    formatted = formatted.split(' ').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    return formatted;
}

// Fonction pour ajouter un marqueur sur la carte
function addMarker(lat, lon, location, dates) {
    // Créer le contenu du popup
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

    // Créer une icône personnalisée
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

    // Ajouter le marqueur
    const marker = L.marker([lat, lon], { icon: customIcon })
        .addTo(map)
        .bindPopup(popupContent);

    markers.push(marker);

    // Animation du marqueur au clic
    marker.on('click', function() {
        const markerElement = this.getElement();
        if (markerElement) {
            gsap.fromTo(markerElement,
                { scale: 1 },
                {
                    scale: 1.3,
                    duration: 0.3,
                    yoyo: true,
                    repeat: 1,
                    ease: 'power2.inOut'
                }
            );
        }
    });
}

// Initialiser la carte au chargement de la page
if (document.getElementById('map')) {
    // Attendre un peu pour que les animations précédentes se terminent
    setTimeout(initMap, 500);
}

// Ajouter des styles CSS pour les marqueurs personnalisés
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
