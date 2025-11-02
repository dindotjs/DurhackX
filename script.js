const client_id = "1732f6ea9de34d09a9d1d7c1b0384b20";

async function linkSpotify() {
    var base_url = "https://accounts.spotify.com/authorize";
    var redirect_uri = "http://localhost:8888/callback";
    var scope = "user-top-read";
    var auth_url = base_url + "?response_type=code" +
        "&client_id=" + encodeURIComponent(client_id) +
        "&scope=" + encodeURIComponent(scope) +
        "&redirect_uri=" + encodeURIComponent(redirect_uri);
    
    const authWindow = window.open(auth_url, "_blank", "width=500,height=700");
    
    window.addEventListener("message", (event) => {
        if (event.origin !== "http://localhost:8888") {
            console.log("Ignored message from:", event.origin);
            return;
        }
        
        console.log("Received data:", event.data);
        
        if (event.data.access_token) {
            console.log("Access Token:", event.data.access_token);
            document.getElementById('output').textContent = "Successfully authenticated!";
            localStorage.setItem('spotify_access_token', event.data.access_token);
            
            //document.getElementById('getTopArtists').disabled = false;
        }
    }, { once: true });
}

async function getTopArtists(timeRange = 'medium_term') {
    const accessToken = localStorage.getItem('spotify_access_token');
    
    if (!accessToken) {
        document.getElementById('output').textContent = "Please login first!";
        return;
    }
    
    try {
        //document.getElementById('output').textContent = "Loading top artists...";
        
        const response = await fetch(`http://localhost:8888/top-artists?access_token=${encodeURIComponent(accessToken)}&time_range=${timeRange}&limit=20`);
        const data = await response.json();
        
        if (data.error) {
            document.getElementById('output').textContent = "Error: " + JSON.stringify(data.error);
            return;
        }
        
        //displayTopArtists(data.items);
        return data.items;
    } catch (error) {
        console.error("Error:", error);
        document.getElementById('output').textContent = "Error fetching top artists: " + error.message;
    }
}

function displayTopArtists(artists) {
    const output = document.getElementById('output');
    output.innerHTML = '<h2>Your Top Artists:</h2>';
    
    const list = document.createElement('ol');
    
    artists.forEach(artist => {
        const listItem = document.createElement('li');
        listItem.style.marginBottom = '15px';
        
        const artistInfo = `
            <strong>${artist.name}</strong><br>
            Genres: ${artist.genres.join(', ') || 'N/A'}<br>
            Popularity: ${artist.popularity}/100<br>
            Followers: ${artist.followers.total.toLocaleString()}<br>
            ${artist.images[0] ? `<img src="${artist.images[0].url}" width="100" style="margin-top: 5px;">` : ''}
        `;
        
        listItem.innerHTML = artistInfo;
        list.appendChild(listItem);
    });
    
    output.appendChild(list);
}