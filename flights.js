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

// Event listener for flight search form submission
document.getElementById('flight-search-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const origin = document.getElementById('origin').value.toUpperCase().trim();
    const destination = document.getElementById('destination').value.toUpperCase().trim();
    const departureDate = document.getElementById('departure').value;
    const adults = document.getElementById('adults').value;
    const children = document.getElementById('children').value;

    // Validate that airport codes are exactly 3 letters long
    if (origin.length !== 3 || destination.length !== 3) {
        alert("Both origin and destination codes must be exactly 3 letters.");
        return; // Stop the function if validation fails
    }

    searchFlights(origin, destination, departureDate, adults, children);
});

// Function to search flights based on user input
async function searchFlights(origin, destination, departureDate, adults, children) {
    const url = new URL("https://test.api.amadeus.com/v2/shopping/flight-offers");
    const params = {
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDate: departureDate,
        adults: adults,
        children: children,
        travelClass: "ECONOMY",
        nonStop: "false",
        currencyCode: "USD",
        maxPrice: "500",
        max: "10"
    };
    url.search = new URLSearchParams(params).toString();

    console.log("Making API request to:", url.toString());

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Failed to fetch flight data: ${errorText}`);
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Flight data fetched successfully:", data);
        displayFlightResults(data);
    } catch (error) {
        console.error("Error searching flights:", error);
    }
}

// Function to display flight results on the page
function displayFlightResults(data) {
    const resultsDiv = document.getElementById("flight-results");
    resultsDiv.innerHTML = "";

    if (data && data.data && data.data.length > 0) {
        const sortedOffers = data.data.sort((a, b) => parseFloat(a.price.total) - parseFloat(b.price.total));
        
        sortedOffers.forEach((offer) => {
            const card = document.createElement("div");
            card.className = "card mb-3";
            let itineraries = offer.itineraries.map(itinerary => `
                <li class="list-group-item">
                    <strong>From:</strong> ${itinerary.segments[0].departure.iataCode} 
                    <strong>To:</strong> ${itinerary.segments[itinerary.segments.length - 1].arrival.iataCode}
                    <strong>Date:</strong> ${itinerary.segments[0].departure.at.split("T")[0]}
                </li>
            `).join("");
            card.innerHTML = `
                <div class="card-header">Price: ${offer.price.total} ${offer.price.currency}</div>
                <div class="card-body">
                    <h5 class="card-title">Flight Details</h5>
                    <ul class="list-group list-group-flush">${itineraries}</ul>
                </div>
            `;
            resultsDiv.appendChild(card);
        });
    } else {
        resultsDiv.innerHTML = "<p class='alert alert-warning'>No flights found.</p>";
    }
}

// Fetch access token when the script loads
getAccessToken();
