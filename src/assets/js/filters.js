// Filtres pour la page des artistes

const creationDateMin = document.getElementById('creation-date-min');
const creationDateMax = document.getElementById('creation-date-max');
const membersMin = document.getElementById('members-min');
const membersMax = document.getElementById('members-max');
const locationFilter = document.getElementById('location-filter');
const resetButton = document.getElementById('reset-filters');
const artistsContainer = document.getElementById('artists-container');

// Stocker les cartes d'artistes originales
let allArtistCards = [];

if (artistsContainer) {
    allArtistCards = Array.from(artistsContainer.querySelectorAll('.artist-card'));

    // Ajouter les événements de filtre
    if (creationDateMin) creationDateMin.addEventListener('input', applyFilters);
    if (creationDateMax) creationDateMax.addEventListener('input', applyFilters);
    if (membersMin) membersMin.addEventListener('input', applyFilters);
    if (membersMax) membersMax.addEventListener('input', applyFilters);
    if (locationFilter) {
        let locationTimeout;
        locationFilter.addEventListener('input', () => {
            clearTimeout(locationTimeout);
            locationTimeout = setTimeout(applyFilters, 300);
        });
    }

    // Bouton de réinitialisation
    if (resetButton) {
        resetButton.addEventListener('click', () => {
            if (creationDateMin) creationDateMin.value = '';
            if (creationDateMax) creationDateMax.value = '';
            if (membersMin) membersMin.value = '';
            if (membersMax) membersMax.value = '';
            if (locationFilter) locationFilter.value = '';
            applyFilters();

            // Animation de réinitialisation
            gsap.from(resetButton, {
                rotation: 360,
                duration: 0.5,
                ease: 'power2.out'
            });
        });
    }
}

// Fonction pour appliquer les filtres
function applyFilters() {
    const filters = {
        creationDateMin: creationDateMin ? parseInt(creationDateMin.value) || 0 : 0,
        creationDateMax: creationDateMax ? parseInt(creationDateMax.value) || 9999 : 9999,
        membersMin: membersMin ? parseInt(membersMin.value) || 0 : 0,
        membersMax: membersMax ? parseInt(membersMax.value) || 999 : 999,
        location: locationFilter ? locationFilter.value.toLowerCase().trim() : ''
    };

    let visibleCount = 0;

    allArtistCards.forEach(card => {
        const creationDate = parseInt(card.dataset.creationDate) || 0;
        const membersCount = parseInt(card.dataset.membersCount) || 0;

        // Vérifier les filtres de date de création
        const matchesCreationDate = creationDate >= filters.creationDateMin &&
                                   creationDate <= filters.creationDateMax;

        // Vérifier les filtres de nombre de membres
        const matchesMembers = membersCount >= filters.membersMin &&
                              membersCount <= filters.membersMax;

        // Vérifier le filtre de location (si implémenté côté serveur)
        let matchesLocation = true;
        if (filters.location) {
            // Pour l'instant, on ne peut pas filtrer par location côté client
            // car on n'a pas les données de location dans les cards
            // Cette fonctionnalité nécessiterait d'ajouter les locations en data-attributes
            matchesLocation = true;
        }

        // Afficher ou masquer la carte
        if (matchesCreationDate && matchesMembers && matchesLocation) {
            card.style.display = '';
            visibleCount++;

            // Animation d'apparition
            gsap.from(card, {
                scale: 0.8,
                opacity: 0,
                duration: 0.4,
                ease: 'power2.out'
            });
        } else {
            // Animation de disparition
            gsap.to(card, {
                scale: 0.8,
                opacity: 0,
                duration: 0.3,
                ease: 'power2.in',
                onComplete: () => {
                    card.style.display = 'none';
                }
            });
        }
    });

    // Afficher un message si aucun résultat
    let noResultsMessage = document.querySelector('.no-results-message');

    if (visibleCount === 0) {
        if (!noResultsMessage) {
            noResultsMessage = document.createElement('div');
            noResultsMessage.className = 'no-results-message';
            noResultsMessage.style.cssText = `
                grid-column: 1 / -1;
                text-align: center;
                padding: 60px 20px;
                color: #b8b8b8;
                font-size: 1.5em;
            `;
            noResultsMessage.textContent = 'Aucun artiste ne correspond aux filtres sélectionnés';
            artistsContainer.appendChild(noResultsMessage);

            gsap.from(noResultsMessage, {
                y: 30,
                opacity: 0,
                duration: 0.5,
                ease: 'power2.out'
            });
        }
    } else {
        if (noResultsMessage) {
            gsap.to(noResultsMessage, {
                opacity: 0,
                duration: 0.3,
                onComplete: () => noResultsMessage.remove()
            });
        }
    }
}

// Validation des entrées numériques
function validateNumericInput(input, min, max) {
    if (input) {
        input.addEventListener('input', () => {
            let value = parseInt(input.value);
            if (value < min) input.value = min;
            if (value > max) input.value = max;
        });
    }
}

if (creationDateMin) validateNumericInput(creationDateMin, 1900, 2025);
if (creationDateMax) validateNumericInput(creationDateMax, 1900, 2025);
if (membersMin) validateNumericInput(membersMin, 1, 20);
if (membersMax) validateNumericInput(membersMax, 1, 20);
