document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('hotel-search-form');
    const resultsDiv = document.getElementById('results');

    // Fetch a valid access token
    getAccessToken().then(() => {
        form.addEventListener('submit', function (event) {
            event.preventDefault();

            // Retrieve user inputs
            const hotelIds = document.getElementById('hotelIds').value.trim().split(',').map(id => id.trim());
            const checkInDate = document.getElementById('checkInDate').value;
            const checkOutDate = document.getElementById('checkOutDate').value;
            const adults = document.getElementById('adults').value;

            // Validate user inputs
            if (!hotelIds || hotelIds.some(id => id.length !== 8)) {
                alert('Please enter valid 8-character hotel IDs.');
                return;
            }
            if (!checkInDate || !checkOutDate || new Date(checkInDate) >= new Date(checkOutDate)) {
                alert('Please provide valid check-in and check-out dates.');
                return;
            }
            if (adults < 1 || adults > 9) {
                alert('Number of adults must be between 1 and 9.');
                return;
            }

            // Display a loading message
            resultsDiv.innerHTML = '<p>Loading...</p>';

            // Fetch hotel offers
            fetchHotelOffers(hotelIds, checkInDate, checkOutDate, adults);
        });
    });

    async function fetchHotelOffers(hotelIds, checkInDate, checkOutDate, adults) {
        const url = `https://test.api.amadeus.com/v3/shopping/hotel-offers?hotelIds=${hotelIds.join(',')}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}&adults=${adults}&roomQuantity=1&currency=USD`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                const errorDetails = await response.json();
                console.error('API Error:', errorDetails);
                throw new Error(`Failed to fetch hotels: ${response.status}`);
            }

            const data = await response.json();
            displayHotelOffers(data);
        } catch (error) {
            console.error('Error:', error);
            resultsDiv.innerHTML = `<p>Error: ${error.message}</p>`;
        }
    }

    function displayHotelOffers(data) {
        resultsDiv.innerHTML = '';

        if (data.data && data.data.length > 0) {
            data.data.forEach(hotel => {
                const address = hotel.hotel.address.lines ? hotel.hotel.address.lines.join(', ') : 'No address available';
                const cityName = hotel.hotel.address.cityName || 'Unknown city';

                const hotelDiv = document.createElement('div');
                hotelDiv.className = 'hotel-card p-3 mb-3 border rounded';
                hotelDiv.innerHTML = `
                    <h4>${hotel.hotel.name}</h4>
                    <p><strong>Address:</strong> ${address}, ${cityName}</p>
                    <p><strong>Available:</strong> ${hotel.available ? 'Yes' : 'No'}</p>
                `;
                resultsDiv.appendChild(hotelDiv);
            });
        } else {
            resultsDiv.innerHTML = '<p>No hotels found.</p>';
        }
    }

    async function getAccessToken() {
        const tokenUrl = 'https://test.api.amadeus.com/v1/security/oauth2/token';
        const body = new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: API_KEY,
            client_secret: API_SECRET,
        });

        try {
            const response = await fetch(tokenUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: body,
            });

            if (!response.ok) {
                throw new Error('Failed to retrieve access token');
            }

            const data = await response.json();
            accessToken = data.access_token;
            console.log('Access Token:', accessToken);
        } catch (error) {
            console.error('Error fetching access token:', error);
            alert('Error fetching access token.');
        }
    }
});

