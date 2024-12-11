// flights.js
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
    accessToken = data.access_token;
  } catch (error) {
    console.error("Error fetching access token:", error);
  }
}

// Function to search flights
async function searchFlights(origin, destination, departureDate) {
  const url = "https://test.api.amadeus.com/v2/shopping/flight-offers";

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
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) throw new Error(`Error: ${response.statusText}`);

    const data = await response.json();
    displayFlightResults(data);
  } catch (error) {
    console.error("Error searching flights:", error);
  }
}

// Function to display flight results
function displayFlightResults(data) {
  const resultsDiv = document.getElementById("flight-results");
  resultsDiv.innerHTML = ""; // Clear previous results

  if (data && data.data && data.data.length > 0) {
    data.data.forEach((offer) => {
      const div = document.createElement("div");
      div.className = "flight-offer";
      div.innerHTML = `
        <p><strong>Price:</strong> ${offer.price.total} ${offer.price.currency}</p>
        <p><strong>Itinerary:</strong></p>
        <ul>
          ${offer.itineraries
            .map(
              (itinerary) => `
            <li>
              <strong>From:</strong> ${itinerary.segments[0].departure.iataCode}
              <strong>To:</strong> ${
                itinerary.segments[itinerary.segments.length - 1].arrival.iataCode
              }
              <strong>Date:</strong> ${
                itinerary.segments[0].departure.at.split("T")[0]
              }
            </li>
          `
            )
            .join("")}
        </ul>
      `;
      resultsDiv.appendChild(div);
    });
  } else {
    resultsDiv.innerHTML = "<p>No flights found.</p>";
  }
}

// Initialize by fetching access token
getAccessToken();
