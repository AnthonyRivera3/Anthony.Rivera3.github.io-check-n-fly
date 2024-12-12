const API_KEY = "XfOTmlIO5vADAxyv87F2obUSRcy84qq2";
const API_SECRET = "X3yjzEGmyUB9vNeo";
let accessToken = "";

// Function to fetch access token
async function getAccessToken() {
    const url = "https://test.api.amadeus.com/v1/security/oauth2/token";
    const credentials = new URLSearchParams({
        grant_type: "client_credentials",
        client_id: API_KEY,
        client_secret: API_SECRET,
    });

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: credentials,
        });
        const data = await response.json();
        if (data.access_token) {
            console.log("Access token fetched successfully.");
            accessToken = data.access_token;
        } else {
            console.error("Failed to fetch access token:", data);
        }
    } catch (error) {
        console.error("Error fetching access token:", error);
    }
}

// Example airports data for autocomplete
const airports = [
    { code: "JFK", name: "John F. Kennedy International Airport" },
    { code: "LAX", name: "Los Angeles International Airport" },
    { code: "CDG", name: "Charles de Gaulle Airport" },
    { code: "SFO", name: "San Francisco International Airport" },
    // Add more airports as needed
];

// Setup autocomplete functionality
function setupAutocomplete(inputElement, suggestionsElement) {
    inputElement.addEventListener('input', function() {
        const value = this.value.toUpperCase();
        suggestionsElement.innerHTML = '';
        if (!value) return;

        const filteredAirports = airports.filter(airport =>
            airport.code.includes(value) || airport.name.toUpperCase().includes(value)
        );

        filteredAirports.forEach(airport => {
            const div = document.createElement('div');
            div.textContent = `${airport.code} - ${airport.name}`;
            div.addEventListener('click', () => {
                inputElement.value = airport.code; // Set the input to the selected airport code
                suggestionsElement.innerHTML = ''; // Clear suggestions
            });
            suggestionsElement.appendChild(div);
        });
    });

    document.addEventListener('click', function(event) {
        if (event.target !== inputElement) {
            suggestionsElement.innerHTML = '';
        }
    });
}

setupAutocomplete(document.getElementById('origin'), document.getElementById('originSuggestions'));
setupAutocomplete(document.getElementById('destination'), document.getElementById('destinationSuggestions'));

// Remainder of your JavaScript code...
