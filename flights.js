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
            method: "POST",  // POST method because we're sending data to get the token
            headers: {
                "Content-Type": "application/x-www-form-urlencoded", // Content-Type for sending URL-encoded form data
            },
            body: credentials, // Pass URLSearchParams to body
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
    event.preventDefault(); // Prevent the form from reloading the page
    const origin = document.getElementById('origin').value;
    const destination = document.getElementById('destination').value;
    const departureDate = document.getElementById('departure').value;
    searchFlights(origin, destination, departureDate); // Call the searchFlights function
});

// Function to search flights based on user input
async function searchFlights(origin, destination, departureDate) {
    const url = "https://test.api.amadeus.com/v2/shopping/flight-offers"; // URL without query string

    const requestData = {
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDate: departureDate,
        adults: 1,
        travelClass: "ECONOMY",
        currencyCode: "USD",
    };

    try {
        const response = await fetch(url, {
            method: "POST",  // POST method because you're sending data to request flight offers
            headers: {
                "Content-Type": "application/json", // Sending JSON data
                Authorization: `Bearer ${accessToken}`, // Authorization header with the token
            },
            body: JSON.stringify(requestData), // Send the requestData as JSON
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Flight data fetched successfully:", data);
        displayFlightResults(data); // Display the flight results
    } catch (error) {
        console.error("Error searching flights:", error);
    }
}

// Function to display flight results on the page
function displayFlightResults(data) {
    const resultsDiv = document.getElementById("flight-results");
    resultsDiv.innerHTML = ""; // Clear previous results

    if (data && data.data && data.data.length > 0) {
        const sortedOffers = data.data.sort((a, b) => parseFloat(a.price.total) - parseFloat(b.price.total));

        sortedOffers.forEach((offer) => {
            const div = document.createElement("div");
            div.className = "flight-offer";
            div.innerHTML = `
                <p><strong>Price:</strong> ${offer.price.total} ${offer.price.currency}</p>
                <p><strong>Itinerary:</strong></p>
                <ul>
                    ${offer.itineraries.map(itinerary => `
                        <li>
                            <strong>From:</strong> ${itinerary.segments[0].departure.iataCode}
                            <strong>To:</strong> ${itinerary.segments[itinerary.segments.length - 1].arrival.iataCode}
                            <strong>Date:</strong> ${itinerary.segments[0].departure.at.split("T")[0]}
                        </li>`).join("")}
                </ul>
            `;
            resultsDiv.appendChild(div);
        });
    } else {
        resultsDiv.innerHTML = "<p>No flights found.</p>";
    }
}

// Fetch access token when the script loads
getAccessToken();



