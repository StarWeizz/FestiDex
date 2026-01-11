
const creationDateMin = document.getElementById('creation-date-min');
const creationDateMax = document.getElementById('creation-date-max');
const membersMin = document.getElementById('members-min');
const membersMax = document.getElementById('members-max');
const applyButton = document.getElementById('apply-filters');
const resetButton = document.getElementById('reset-filters');
const artistsContainer = document.getElementById('artists-container');

let allArtistCards = [];

if (artistsContainer) {
    allArtistCards = Array.from(artistsContainer.querySelectorAll('.artist-card'));

    if (applyButton) {
        applyButton.addEventListener('click', applyFilters);
    }

    if (resetButton) {
        resetButton.addEventListener('click', () => {
            if (creationDateMin) creationDateMin.value = '';
            if (creationDateMax) creationDateMax.value = '';
            if (membersMin) membersMin.value = '';
            if (membersMax) membersMax.value = '';

            applyFilters();
        });
    }
}

function applyFilters() {
    if (!allArtistCards || allArtistCards.length === 0) {
        return;
    }

    const filters = {
        creationDateMin: creationDateMin ? parseInt(creationDateMin.value) || 0 : 0,
        creationDateMax: creationDateMax ? parseInt(creationDateMax.value) || 9999 : 9999,
        membersMin: membersMin ? parseInt(membersMin.value) || 0 : 0,
        membersMax: membersMax ? parseInt(membersMax.value) || 999 : 999
    };

    let visibleCount = 0;

    allArtistCards.forEach(card => {
        const creationDate = parseInt(card.dataset.creationDate) || 0;
        const membersCount = parseInt(card.dataset.membersCount) || 0;

        const matchesCreationDate = creationDate >= filters.creationDateMin &&
                                   creationDate <= filters.creationDateMax;

        const matchesMembers = membersCount >= filters.membersMin &&
                              membersCount <= filters.membersMax;

        const shouldBeVisible = matchesCreationDate && matchesMembers;

        if (shouldBeVisible) {
            visibleCount++;
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });

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
        }
    } else {
        if (noResultsMessage) {
            noResultsMessage.remove();
        }
    }
}

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
