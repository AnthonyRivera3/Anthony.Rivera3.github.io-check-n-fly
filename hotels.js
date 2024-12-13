const API_KEY = "R5A8PBSIuzqnKG7Ih77yMZLmHY4HAN8i";
const API_SECRET = "8T3gfbhuGII6xNDG";
let accessToken = "aLrsG3R9SWZGzV3k9HuqvHSB4jhs"; // Initial token, will be refreshed if expired

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('hotel-search-form');
    const resultsDiv = document.getElementById('results');

    // Fetch access token when the script loads
    getAccessToken().then(() => {
        form.addEventListener('submit', function (event) {
            event.preventDefault();

            // Retrieve user input
            const hotelIds = document.getElementById('hotelIds').value.trim().split(',').map(id => id.trim()); // Parse hotelIds as an array
            const checkInDate = document.getElementById('checkInDate').value; // Check-in date
            const checkOutDate = document.getElementById('checkOutDate').value; // Check-out date
            const adults = document.getElementById('adults').value; // Number of adults

            // Validate input
            if (!hotelIds || hotelIds.length === 0 || hotelIds.some(id => id.length !== 8)) {
                alert('Please enter valid 8-character hotel IDs, separated by commas.');
                return;
            }
            if (!checkInDate || !checkOutDate) {
                alert('Please enter valid check-in and check-out dates.');
                return;
            }
            if (!adults || adults < 1 || adults > 9) {
                alert('Please specify the number of adults (1-9).');
                return;
            }

            resultsDiv.innerHTML = 'Loading...';
            fetchHotelsByHotelIds(hotelIds, checkInDate, checkOutDate, adults);
        });
    });

    function fetchHotelsByHotelIds(hotelIds, checkInDate, checkOutDate, adults) {
        // Convert hotelIds array to a comma-separated string
        const hotelIdsParam = hotelIds.join(',');

        // Construct the request URL
        const url = `https://test.api.amadeus.com/v3/shopping/hotel-offers?hotelIds=${encodeURIComponent(hotelIdsParam)}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}&adults=${adults}&roomQuantity=1&currency=USD&countryOfResidence=US`;

        const headers = {
            'Authorization': `Bearer ${accessToken}`, // Use the dynamic token
            'Content-Type': 'application/json'
        };

        console.log('Request URL:', url); // Log the request URL for debugging

        fetch(url, { method: 'GET', headers: headers })
            .then(response => {
                return response.json().then(data => {
                    if (!response.ok) {
                        console.error('API Error Details:', data.errors); // Log detailed error
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return data;
                });
            })
            .then(data => {
                displayHotels(data);
            })
            .catch(error => {
                console.error('Error fetching hotels:', error);
                resultsDiv.innerHTML = `<p>Error loading hotels: ${error.message}</p>`;
            });
    }

    function displayHotels(data) {
        resultsDiv.innerHTML = ''; // Clear previous results
        if (data && data.data && data.data.length > 0) {
            data.data.forEach(hotel => {
                const address = hotel.hotel.address.lines ? hotel.hotel.address.lines.join(', ') : 'No address available';
                const cityName = hotel.hotel.address.cityName || 'Unknown city';
                
                const div = document.createElement('div');
                div.className = 'hotel-info';
                div.innerHTML = `
                    <h4>${hotel.hotel.name}</h4>
                    <p>Address: ${address}, ${cityName}</p>
                    <p>Available: ${hotel.available ? 'Yes' : 'No'}</p>
                    <button onclick="getOfferDetails('${hotel.offers[0].id}')">View Details</button>
                `;
                resultsDiv.appendChild(div); // Append each hotel info to the results div
            });
        } else {
            resultsDiv.innerHTML = '<p>No hotels found.</p>'; // Display message if no hotels found
        }
    }

    function getOfferDetails(offerId) {
        const url = `https://test.api.amadeus.com/v3/shopping/hotel-offers/${offerId}`;
        const headers = {
            'Authorization': `Bearer ${accessToken}`, // Use the dynamic token
            'Content-Type': 'application/json'
        };

        fetch(url, { method: 'GET', headers: headers })
            .then(response => {
                return response.json().then(data => {
                    if (!response.ok) {
                        console.error('API Error Details:', data.errors);
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return data;
                });
            })
            .then(data => {
                console.log(data); // Log detailed data to the console
                alert('Details logged in the console');
            })
            .catch(error => {
                console.error('Error fetching offer details:', error);
                alert(`Error fetching offer details: ${error.message}`);
            });
    }

    async function getAccessToken() {
        const tokenUrl = "https://test.api.amadeus.com/v1/security/oauth2/token";
        const body = new URLSearchParams({
            grant_type: "client_credentials",
            client_id: API_KEY,
            client_secret: API_SECRET
        });

        try {
            const response = await fetch(tokenUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: body
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch access token: ${response.status}`);
            }

            const data = await response.json();
            accessToken = data.access_token; // Store the token for later use
            console.log("Access Token:", accessToken); // For debugging
        } catch (error) {
            console.error("Error fetching access token:", error);
            alert('Failed to fetch access token. Please check your API credentials.');
        }
    }
});
