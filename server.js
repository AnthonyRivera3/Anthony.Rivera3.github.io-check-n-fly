// server.js
// Load environment variables from .env file (such as API keys and secrets)
// require('dotenv').config();

// Import necessary modules for the server
// const express = require('express'); // Express framework to handle routing and requests
// const mysql = require('mysql2'); // MySQL module to interact with the MySQL database
// const axios = require('axios'); // Axios library for making HTTP requests to external APIs

// Initialize the Express app
// const app = express();
// const port = 5000;  // Define the port the server will run on

// Middleware to parse incoming JSON requests
// app.use(express.json());

// MySQL connection setup to connect to the flight_search database
// const db = mysql.createConnection({
//     host: 'localhost', // Host where MySQL is running (e.g., localhost or an external server)
//     user: 'root',  // Replace with your MySQL username
//     password: '',  // Replace with your MySQL password
//     database: 'flight_search'  // The name of the MySQL database
// });

// Function to fetch access token for Amadeus API using OAuth2
// async function getAccessToken() {
//     // Make a POST request to Amadeus API to get an OAuth2 token
//     const response = await axios.post('https://test.api.amadeus.com/v1/security/oauth2/token', new URLSearchParams({
//         grant_type: 'client_credentials',  // The type of OAuth flow
//         client_id: process.env.API_KEY,    // API key (client ID) from the .env file
//         client_secret: process.env.API_SECRET // API secret (client secret) from the .env file
//     }));
    
//     // Return the access token from the response
//     return response.data.access_token;
// }

// Define the flight search endpoint for POST requests
// app.post('/search-flights', async (req, res) => {
//     // Extract necessary data from the request body
//     const { origin, destination, departureDate, adults, children } = req.body;
    
//     try {
//         // Get the access token for authenticating the request to Amadeus API
//         const accessToken = await getAccessToken();

//         // Build the URL for the flight search request to Amadeus API
//         const url = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destination}&departureDate=${departureDate}&adults=${adults}&children=${children}&travelClass=ECONOMY&currencyCode=USD&maxPrice=500&max=10`;

//         // Make a GET request to the Amadeus API using the access token in the authorization header
//         const response = await axios.get(url, {
//             headers: {
//                 'Authorization': `Bearer ${accessToken}`  // Include the access token in the Authorization header
//             }
//         });

//         // Extract the flight offers data from the response
//         const flightOffers = response.data.data;

//         // Iterate over each flight offer and save it to the MySQL database
//         flightOffers.forEach(offer => {
//             // Insert each flight offer into the MySQL database
//             db.query(
//                 'INSERT INTO flights (origin, destination, departure_date, adults, children, flight_details, price) VALUES (?, ?, ?, ?, ?, ?, ?)', 
//                 [
//                     origin,               // Origin location (e.g., airport code)
//                     destination,          // Destination location (e.g., airport code)
//                     departureDate,       // Departure date
//                     adults,               // Number of adults
//                     children,             // Number of children
//                     JSON.stringify(offer), // Flight offer details in JSON format
//                     offer.price.total      // Total price of the flight
//                 ],
//                 (err, results) => {
//                     if (err) {
//                         console.error('Error inserting into database:', err);  // Log any database insertion errors
//                     }
//                 }
//             );
//         });

//         // Send the flight offers back to the client (frontend) as a JSON response
//         res.json(flightOffers);
//     } catch (error) {
//         // Handle any errors that occur during the flight search process
//         console.error('Error searching flights:', error);  // Log the error
//         // Respond with a 500 status and a message indicating an error occurred
//         res.status(500).json({ message: 'Error fetching flight data' });
//     }
// });

// Start the server and listen for incoming HTTP requests on the specified port
// app.listen(port, () => {
//     console.log(`Backend server running on http://localhost:${port}`);  // Log a message indicating the server is running
// });