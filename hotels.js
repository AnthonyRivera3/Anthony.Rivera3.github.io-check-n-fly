console.log("Hotel functionality coming soon!");

function searchHotels() {
    const input = document.getElementById('searchInput').value;
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = ''; // Clear previous results

    // Example: Fetch data from an API (you'll need to replace this URL with your actual API endpoint)
    fetch(`https://api.example.com/hotels/search?query=${encodeURIComponent(input)}`)
        .then(response => response.json())
        .then(data => {
            data.forEach(hotel => {
                const div = document.createElement('div');
                div.innerHTML = `<h4>${hotel.name}</h4>
                                 <p>Rating: ${hotel.rating}</p>
                                 <p>Location: ${hotel.location}</p>`;
                resultsDiv.appendChild(div);
            });
        })
        .catch(error => console.error('Error fetching hotels:', error));
}
