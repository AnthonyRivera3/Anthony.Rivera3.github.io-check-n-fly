const API_KEY = "XfOTmlIO5vADAxyv87F2obUSRcy84qq2";
const API_SECRET = "X3yjzEGmyUB9vNeo";
let accessToken = "";
let airports = []; // Cache for airports data

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
            fetchAirports(); // Fetch airports after getting the token
        } else {
            console.error("Failed to fetch access token:", data);
        }
    } catch (error) {
        console.error("Error fetching access token:", error);
    }
}

// Fetch airports data from an API or local source
async function fetchAirports() {
    try {
        // This URL should point to an API endpoint for airports data, or you can use a local JSON file
        const response = await fetch('API_URL_FOR_AIRPORTS', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Failed to fetch airports');
        const data = await response.json();
        airports = data.airports; // Adjust this according to the actual API response
        console.log("Airports fetched successfully.");
    } catch (error) {
        console.error('Error fetching airports:', error);
        airports = []; // Fallback to empty list on error
    }
}

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
                inputElement.value = airport.code;
                suggestionsElement.innerHTML = '';
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

document.getElementById('origin').addEventListener('focus', () => {
    if (airports.length === 0) {
        fetchAirports();
    }
    setupAutocomplete(document.getElementById('origin'), document.getElementById('originSuggestions'), airports);
});
document.getElementById('destination').addEventListener('focus', () => {
    if (airports.length === 0) {
        fetchAirports();
    }
    setupAutocomplete(document.getElementById('destination'), document.getElementById('destinationSuggestions'), airports);
});

// Fetch access token when the script loads
getAccessToken();
