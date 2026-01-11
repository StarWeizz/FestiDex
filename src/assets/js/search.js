
const searchBar = document.getElementById('search-bar');
const suggestionsBox = document.getElementById('search-suggestions');
let searchTimeout;

if (searchBar && suggestionsBox) {
    searchBar.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();

        clearTimeout(searchTimeout);

        if (query.length === 0) {
            suggestionsBox.classList.remove('active');
            suggestionsBox.innerHTML = '';
            return;
        }

        searchTimeout = setTimeout(() => {
            searchArtists(query);
        }, 300);
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search')) {
            suggestionsBox.classList.remove('active');
        }
    });

    searchBar.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchBar.value.trim();
            if (query.length > 0) {
                window.location.href = `/search?q=${encodeURIComponent(query)}`;
            }
        }
    });
}

function searchArtists(query) {
    if (!allArtists || allArtists.length === 0) {
        return;
    }

    const results = [];
    const seen = new Set();

    allArtists.forEach(artist => {
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

        suggestionsBox.appendChild(item);
    });

    suggestionsBox.classList.add('active');
}

function highlightMatch(text, query) {
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<strong>$1</strong>');
}

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
