// Recherche avec suggestions pour FestiDex

const searchBar = document.getElementById('search-bar');
const suggestionsBox = document.getElementById('search-suggestions');
let searchTimeout;

if (searchBar && suggestionsBox) {
    // Gérer la saisie dans la barre de recherche
    searchBar.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();

        // Effacer le timeout précédent
        clearTimeout(searchTimeout);

        if (query.length === 0) {
            suggestionsBox.classList.remove('active');
            suggestionsBox.innerHTML = '';
            return;
        }

        // Attendre 300ms avant de chercher (debounce)
        searchTimeout = setTimeout(() => {
            searchArtists(query);
        }, 300);
    });

    // Fermer les suggestions si on clique ailleurs
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search')) {
            suggestionsBox.classList.remove('active');
        }
    });

    // Gérer la touche Entrée
    searchBar.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchBar.value.trim();
            if (query.length > 0) {
                window.location.href = `/search?q=${encodeURIComponent(query)}`;
            }
        }
    });
}

// Fonction pour rechercher les artistes
function searchArtists(query) {
    if (!allArtists || allArtists.length === 0) {
        return;
    }

    const results = [];
    const seen = new Set();

    allArtists.forEach(artist => {
        // Recherche par nom d'artiste
        if (artist.name.toLowerCase().includes(query)) {
            const key = `${artist.name}-artist`;
            if (!seen.has(key)) {
                results.push({
                    name: artist.name,
                    type: 'artist/band',
                    id: artist.id
                });
                seen.add(key);
            }
        }

        // Recherche par membres
        if (artist.members) {
            artist.members.forEach(member => {
                if (member.toLowerCase().includes(query)) {
                    const key = `${member}-member`;
                    if (!seen.has(key)) {
                        results.push({
                            name: member,
                            type: 'member',
                            id: artist.id
                        });
                        seen.add(key);
                    }
                }
            });
        }

        // Recherche par date de création
        if (artist.creationDate && artist.creationDate.toString().includes(query)) {
            const key = `${artist.name}-creation`;
            if (!seen.has(key)) {
                results.push({
                    name: `${artist.name} (créé en ${artist.creationDate})`,
                    type: 'creation date',
                    id: artist.id
                });
                seen.add(key);
            }
        }

        // Recherche par premier album
        if (artist.firstAlbum && artist.firstAlbum.toLowerCase().includes(query)) {
            const key = `${artist.name}-album`;
            if (!seen.has(key)) {
                results.push({
                    name: `${artist.name} (premier album: ${artist.firstAlbum})`,
                    type: 'first album',
                    id: artist.id
                });
                seen.add(key);
            }
        }
    });

    displaySuggestions(results.slice(0, 10)); // Limiter à 10 résultats
}

// Fonction pour afficher les suggestions
function displaySuggestions(results) {
    if (results.length === 0) {
        suggestionsBox.classList.remove('active');
        suggestionsBox.innerHTML = '';
        return;
    }

    suggestionsBox.innerHTML = '';
    results.forEach(result => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.innerHTML = `
            <span class="suggestion-name">${highlightMatch(result.name, searchBar.value)}</span>
            <span class="suggestion-type">${result.type}</span>
        `;

        item.addEventListener('click', () => {
            window.location.href = `/artist/${result.id}`;
        });

        // Animation GSAP pour chaque suggestion
        gsap.from(item, {
            x: -20,
            opacity: 0,
            duration: 0.3,
            ease: 'power2.out'
        });

        suggestionsBox.appendChild(item);
    });

    suggestionsBox.classList.add('active');
}

// Fonction pour surligner le texte correspondant
function highlightMatch(text, query) {
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<strong>$1</strong>');
}

// Échapper les caractères spéciaux pour regex
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
