const API_KEY = "XfOTmlIO5vADAxyv87F2obUSRcy84qq2";
const API_SECRET = "X3yjzEGmyUB9vNeo";
let accessToken = "";

// Airline website mapping
const airlineWebsites = {
    // North American Airlines
    AA: "https://www.aa.com", // American Airlines
    DL: "https://www.delta.com", // Delta Airlines
    UA: "https://www.united.com", // United Airlines
    B6: "https://www.jetblue.com", // JetBlue Airways
    AC: "https://www.aircanada.com", // Air Canada
    WN: "https://www.southwest.com", // Southwest Airlines
    NK: "https://www.spirit.com", // Spirit Airlines
    AS: "https://www.alaskaair.com", // Alaska Airlines
    F9: "https://www.flyfrontier.com", // Frontier Airlines
    HA: "https://www.hawaiianairlines.com", // Hawaiian Airlines

    // European Airlines
    BA: "https://www.britishairways.com", // British Airways
    AF: "https://www.airfrance.com", // Air France
    LH: "https://www.lufthansa.com", // Lufthansa
    KL: "https://www.klm.com", // KLM Royal Dutch Airlines
    IB: "https://www.iberia.com", // Iberia
    U2: "https://www.easyjet.com", // EasyJet
    FR: "https://www.ryanair.com", // Ryanair
    LO: "https://www.lot.com", // LOT Polish Airlines
    AZ: "https://www.itaspa.com", // ITA Airways (formerly Alitalia)
    LX: "https://www.swiss.com", // Swiss International Air Lines

    // Asian Airlines
    SQ: "https://www.singaporeair.com", // Singapore Airlines
    CX: "https://www.cathaypacific.com", // Cathay Pacific Airways
    NH: "https://www.ana.co.jp", // ANA (All Nippon Airways)
    JL: "https://www.jal.co.jp", // Japan Airlines
    KE: "https://www.koreanair.com", // Korean Air
    OZ: "https://www.flyasiana.com", // Asiana Airlines
    TG: "https://www.thaiairways.com", // Thai Airways
    MH: "https://www.malaysiaairlines.com", // Malaysia Airlines

    // Middle Eastern Airlines
    EK: "https://www.emirates.com", // Emirates
    QR: "https://www.qatarairways.com", // Qatar Airways
    EY: "https://www.etihad.com", // Etihad Airways
    WY: "https://www.omanair.com", // Oman Air
    RJ: "https://www.rj.com", // Royal Jordanian Airlines

    // Australian Airlines
    QF: "https://www.qantas.com", // Qantas Airways
    VA: "https://www.virginaustralia.com", // Virgin Australia

    // African Airlines
    ET: "https://www.ethiopianairlines.com", // Ethiopian Airlines
    MS: "https://www.egyptair.com", // EgyptAir
    KQ: "https://www.kenya-airways.com", // Kenya Airways

    // Low-Cost Airlines
    VY: "https://www.vueling.com", // Vueling Airlines
    G4: "https://www.allegiantair.com", // Allegiant Air
    W6: "https://wizzair.com", // Wizz Air
    PC: "https://www.flypgs.com", // Pegasus Airlines
    SY: "https://www.suncountry.com", // Sun Country Airlines
    F9: "https://www.flyfrontier.com", // Frontier Airlines
};


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

// Function to fetch airline details
async function getAirlineName(carrierCode) {
    const url = `https://test.api.amadeus.com/v1/reference-data/airlines?airlineCodes=${carrierCode}`;
    const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    if (!response.ok) {
        console.error(`Failed to fetch airline data: ${response.statusText}`);
        return carrierCode;  // Fallback to carrier code if fetch fails
    }
    const data = await response.json();
    return data.data[0].businessName || data.data[0].commonName;  // Adjust based on actual API response
}

// Event listener for flight search form submission
document.getElementById('flight-search-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const origin = document.getElementById('origin').value.toUpperCase().trim();
    const destination = document.getElementById('destination').value.toUpperCase().trim();
    const departureDate = document.getElementById('departure').value;
    const adults = document.getElementById('adults').value;
    const children = document.getElementById('children').value;

    if (origin.length !== 3 || destination.length !== 3) {
        alert("Both origin and destination codes must be exactly 3 letters.");
        return; // Stop the function if validation fails
    }

    const flightOffers = await searchFlights(origin, destination, departureDate, adults, children);
    displayFlightResults(flightOffers);
});

// Function to search flights based on user input
async function searchFlights(origin, destination, departureDate, adults, children) {
    toggleLoadingIndicator(true);  // Show loading indicator
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

        return await response.json();
    } catch (error) {
        console.error("Error searching flights:", error);
        return null;  // Return null in case of error
    } finally {
        toggleLoadingIndicator(false);  // Hide loading indicator
    }
}

// Function to toggle loading indicator
function toggleLoadingIndicator(show) {
    document.getElementById("loadingIndicator").style.display = show ? "block" : "none";
}

// Function to display flight results on the page
async function displayFlightResults(data) {
    const resultsDiv = document.getElementById("flight-results");
    resultsDiv.innerHTML = "";

    if (data && data.data && data.data.length > 0) {
        for (const offer of data.data) {
            const airlineNames = await Promise.all(offer.itineraries.flatMap(itinerary =>
                itinerary.segments.map(segment => getAirlineName(segment.carrierCode))
            ));

            const card = document.createElement("div");
            card.className = "card mb-3";

            let itineraries = offer.itineraries.map(itinerary =>
                itinerary.segments.map(segment => {
                    const airlineCode = segment.carrierCode;
                    const airlineWebsite = airlineWebsites[airlineCode] || "#";

                    return `
                        <li class="list-group-item">
                            <strong>From:</strong> ${segment.departure.iataCode}
                            <strong>To:</strong> ${segment.arrival.iataCode}
                            <div class="flight-times">
                                <strong>Takeoff:</strong> <span>${new Date(segment.departure.at).toLocaleString()}</span>
                                <strong>Arrival:</strong> <span>${new Date(segment.arrival.at).toLocaleString()}</span>
                            </div>
                            <strong>Airline:</strong> ${airlineNames[itinerary.segments.indexOf(segment)]} 
                            <a href="${airlineWebsite}" target="_blank" class="airline-link">(Website)</a>
                        </li>
                    `;
                }).join("")
            ).join("");

            card.innerHTML = `
                <div class="card-header">Price: ${offer.price.total} ${offer.price.currency}</div>
                <div class="card-body">
                    <h5 class="card-title">Flight Details</h5>
                    <ul class="list-group list-group-flush">${itineraries}</ul>
                </div>
            `;
            resultsDiv.appendChild(card);
        }
    } else {
        resultsDiv.innerHTML = "<p class='alert alert-warning'>No flights found.</p>";
    }
}

// Fetch access token when the script loads
getAccessToken();