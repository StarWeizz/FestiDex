package main

import (
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"strconv"
	"strings"
)

const (
	apiURL          = "https://groupietrackers.herokuapp.com/api"
	artistsURL      = apiURL + "/artists"
	locationsURL    = apiURL + "/locations"
	datesURL        = apiURL + "/dates"
	relationsURL    = apiURL + "/relation"
)

// Artist représente un artiste ou groupe
type Artist struct {
	ID           int      `json:"id"`
	Image        string   `json:"image"`
	Name         string   `json:"name"`
	Members      []string `json:"members"`
	CreationDate int      `json:"creationDate"`
	FirstAlbum   string   `json:"firstAlbum"`
	Locations    string   `json:"locations"`
	ConcertDates string   `json:"concertDates"`
	Relations    string   `json:"relations"`
}

// Location représente les lieux de concerts
type Location struct {
	ID        int      `json:"id"`
	Locations []string `json:"locations"`
	Dates     string   `json:"dates"`
}

// LocationsList représente la liste complète des locations
type LocationsList struct {
	Index []Location `json:"index"`
}

// Date représente les dates de concerts
type Date struct {
	ID    int      `json:"id"`
	Dates []string `json:"dates"`
}

// DatesList représente la liste complète des dates
type DatesList struct {
	Index []Date `json:"index"`
}

// Relation relie les artistes, dates et lieux
type Relation struct {
	ID             int                 `json:"id"`
	DatesLocations map[string][]string `json:"datesLocations"`
}

// RelationsList représente la liste complète des relations
type RelationsList struct {
	Index []Relation `json:"index"`
}

// ArtistDetails combine toutes les informations d'un artiste
type ArtistDetails struct {
	Artist         Artist
	Locations      []string
	Dates          []string
	DatesLocations map[string][]string
}

// PageData contient toutes les données pour les templates
type PageData struct {
	Artists        []Artist
	ArtistDetails  ArtistDetails
	SearchResults  []SearchResult
	Error          string
}

// SearchResult représente un résultat de recherche
type SearchResult struct {
	Name string
	Type string
	ID   int
}

var (
	artists   []Artist
	locations LocationsList
	dates     DatesList
	relations RelationsList
	templates *template.Template
)

func main() {
	// Charger les templates
	var err error
	templates, err = template.ParseGlob("src/templates/*.html")
	if err != nil {
		log.Fatal("Erreur lors du chargement des templates:", err)
	}

	// Charger les données de l'API
	if err := loadAPIData(); err != nil {
		log.Fatal("Erreur lors du chargement des données:", err)
	}

	// Configuration des routes
	http.HandleFunc("/", homeHandler)
	http.HandleFunc("/artists", artistsHandler)
	http.HandleFunc("/artist/", artistDetailsHandler)
	http.HandleFunc("/search", searchHandler)
	http.HandleFunc("/api/search", apiSearchHandler)

	// Servir les fichiers statiques
	fs := http.FileServer(http.Dir("src/assets"))
	http.Handle("/assets/", http.StripPrefix("/assets/", fs))

	// Démarrer le serveur
	port := ":8080"
	fmt.Println("🎵 FestiDex démarré sur http://localhost" + port)
	log.Fatal(http.ListenAndServe(port, nil))
}

// loadAPIData charge toutes les données depuis l'API
func loadAPIData() error {
	// Charger les artistes
	if err := fetchJSON(artistsURL, &artists); err != nil {
		return fmt.Errorf("erreur lors du chargement des artistes: %v", err)
	}

	// Charger les locations
	if err := fetchJSON(locationsURL, &locations); err != nil {
		return fmt.Errorf("erreur lors du chargement des locations: %v", err)
	}

	// Charger les dates
	if err := fetchJSON(datesURL, &dates); err != nil {
		return fmt.Errorf("erreur lors du chargement des dates: %v", err)
	}

	// Charger les relations
	if err := fetchJSON(relationsURL, &relations); err != nil {
		return fmt.Errorf("erreur lors du chargement des relations: %v", err)
	}

	fmt.Println("✅ Données chargées avec succès:", len(artists), "artistes")
	return nil
}

// fetchJSON récupère et décode du JSON depuis une URL
func fetchJSON(url string, target interface{}) error {
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("erreur HTTP: %d", resp.StatusCode)
	}

	return json.NewDecoder(resp.Body).Decode(target)
}

// homeHandler gère la page d'accueil
func homeHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		errorHandler(w, http.StatusNotFound)
		return
	}

	data := PageData{
		Artists: artists,
	}

	if err := templates.ExecuteTemplate(w, "index.html", data); err != nil {
		log.Println("Erreur template:", err)
		errorHandler(w, http.StatusInternalServerError)
	}
}

// artistsHandler gère la page des artistes
func artistsHandler(w http.ResponseWriter, r *http.Request) {
	data := PageData{
		Artists: artists,
	}

	if err := templates.ExecuteTemplate(w, "Artistes.html", data); err != nil {
		log.Println("Erreur template:", err)
		errorHandler(w, http.StatusInternalServerError)
	}
}

// artistDetailsHandler gère la page de détails d'un artiste
func artistDetailsHandler(w http.ResponseWriter, r *http.Request) {
	// Extraire l'ID de l'URL
	idStr := strings.TrimPrefix(r.URL.Path, "/artist/")
	id, err := strconv.Atoi(idStr)
	if err != nil || id < 1 || id > len(artists) {
		errorHandler(w, http.StatusNotFound)
		return
	}

	// Récupérer les détails de l'artiste
	artist := artists[id-1]
	details := ArtistDetails{
		Artist: artist,
	}

	// Ajouter les locations
	if id <= len(locations.Index) {
		details.Locations = locations.Index[id-1].Locations
	}

	// Ajouter les dates
	if id <= len(dates.Index) {
		details.Dates = dates.Index[id-1].Dates
	}

	// Ajouter les relations
	if id <= len(relations.Index) {
		details.DatesLocations = relations.Index[id-1].DatesLocations
	}

	data := PageData{
		ArtistDetails: details,
	}

	if err := templates.ExecuteTemplate(w, "artist-details.html", data); err != nil {
		log.Println("Erreur template:", err)
		errorHandler(w, http.StatusInternalServerError)
	}
}

// searchHandler gère la recherche
func searchHandler(w http.ResponseWriter, r *http.Request) {
	query := strings.ToLower(r.URL.Query().Get("q"))
	if query == "" {
		http.Redirect(w, r, "/artists", http.StatusSeeOther)
		return
	}

	results := performSearch(query)
	data := PageData{
		SearchResults: results,
	}

	if err := templates.ExecuteTemplate(w, "search.html", data); err != nil {
		log.Println("Erreur template:", err)
		errorHandler(w, http.StatusInternalServerError)
	}
}

// apiSearchHandler retourne les résultats de recherche en JSON
func apiSearchHandler(w http.ResponseWriter, r *http.Request) {
	query := strings.ToLower(r.URL.Query().Get("q"))
	if query == "" {
		json.NewEncoder(w).Encode([]SearchResult{})
		return
	}

	results := performSearch(query)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}

// performSearch effectue la recherche dans les données
func performSearch(query string) []SearchResult {
	var results []SearchResult
	seen := make(map[string]bool)

	for _, artist := range artists {
		// Recherche par nom d'artiste
		if strings.Contains(strings.ToLower(artist.Name), query) {
			key := artist.Name + "-artist"
			if !seen[key] {
				results = append(results, SearchResult{
					Name: artist.Name,
					Type: "artist/band",
					ID:   artist.ID,
				})
				seen[key] = true
			}
		}

		// Recherche par membres
		for _, member := range artist.Members {
			if strings.Contains(strings.ToLower(member), query) {
				key := member + "-member"
				if !seen[key] {
					results = append(results, SearchResult{
						Name: member,
						Type: "member",
						ID:   artist.ID,
					})
					seen[key] = true
				}
			}
		}

		// Recherche par date de création
		if strings.Contains(strconv.Itoa(artist.CreationDate), query) {
			key := artist.Name + "-creation"
			if !seen[key] {
				results = append(results, SearchResult{
					Name: artist.Name + " (créé en " + strconv.Itoa(artist.CreationDate) + ")",
					Type: "creation date",
					ID:   artist.ID,
				})
				seen[key] = true
			}
		}

		// Recherche par premier album
		if strings.Contains(strings.ToLower(artist.FirstAlbum), query) {
			key := artist.Name + "-album"
			if !seen[key] {
				results = append(results, SearchResult{
					Name: artist.Name + " (premier album: " + artist.FirstAlbum + ")",
					Type: "first album",
					ID:   artist.ID,
				})
				seen[key] = true
			}
		}

		// Recherche par locations
		if artist.ID <= len(locations.Index) {
			for _, location := range locations.Index[artist.ID-1].Locations {
				if strings.Contains(strings.ToLower(location), query) {
					key := location + "-location"
					if !seen[key] {
						results = append(results, SearchResult{
							Name: formatLocation(location),
							Type: "location",
							ID:   artist.ID,
						})
						seen[key] = true
					}
				}
			}
		}
	}

	return results
}

// formatLocation formate une location pour l'affichage
func formatLocation(location string) string {
	parts := strings.Split(location, "-")
	for i, part := range parts {
		if len(part) > 0 {
			parts[i] = strings.ToUpper(string(part[0])) + part[1:]
		}
	}
	return strings.Join(parts, ", ")
}

// errorHandler gère les erreurs HTTP
func errorHandler(w http.ResponseWriter, status int) {
	w.WriteHeader(status)
	data := PageData{
		Error: http.StatusText(status),
	}
	if err := templates.ExecuteTemplate(w, "error.html", data); err != nil {
		http.Error(w, "Erreur interne", http.StatusInternalServerError)
	}
}
