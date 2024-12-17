// flights.js
document.getElementById('flight-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const origin = document.getElementById('origin').value;
  const destination = document.getElementById('destination').value;
  const departure_date = document.getElementById('departure_date').value;
  const adults = document.getElementById('adults').value;
  const children = document.getElementById('children').value;
  const price = document.getElementById('price').value;

  const flightData = {
    origin,
    destination,
    departure_date,
    adults,
    children,
    price,
  };

  try {
    const response = await fetch('http://localhost:3000/add-flight', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(flightData),
    });

    const result = await response.text();
    console.log(result);  // Log response from server
    alert(result);  // Display success message in alert box

  } catch (error) {
    console.error('Error adding flight:', error);
    alert('Failed to add flight data');
  }
});

// Function to search flights (from frontend)
document.getElementById('search-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const origin = document.getElementById('search-origin').value;
  const destination = document.getElementById('search-destination').value;
  const departure_date = document.getElementById('search-departure_date').value;

  const searchData = {
    origin,
    destination,
    departure_date,
  };

  try {
    const response = await fetch('http://localhost:3000/search-flights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchData),
    });

    const flights = await response.json();
    console.log(flights);  // Log results
    displayFlights(flights);  // Display flights on the webpage

  } catch (error) {
    console.error('Error searching flights:', error);
    alert('Failed to search flights');
  }
});

// Function to display flights on the webpage
function displayFlights(flights) {
  const resultsContainer = document.getElementById('results');
  resultsContainer.innerHTML = '';  // Clear any previous results

  if (flights.length === 0) {
    resultsContainer.innerHTML = '<p>No flights found.</p>';
  } else {
    flights.forEach(flight => {
      const flightElement = document.createElement('div');
      flightElement.classList.add('flight');
      flightElement.innerHTML = `
        <h3>${flight.origin} to ${flight.destination}</h3>
        <p>Departure Date: ${flight.departure_date}</p>
        <p>Price: $${flight.price}</p>
        <p>Adults: ${flight.adults}, Children: ${flight.children}</p>
      `;
      resultsContainer.appendChild(flightElement);
    });
  }
}
