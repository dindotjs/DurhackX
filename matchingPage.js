// --- Firebase config ---
const firebaseConfig = {
    apiKey: "AIzaSyDpevND_wFdc4ecj0SdSRjBrsnh_Tl6OS8",
    authDomain: "urhackx.firebaseapp.com",
    projectId: "durhackx"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// --- Card & swipe ---
const container = document.getElementById("cardContainer");
const likedList = document.getElementById("likedList");

let isDragging = false;
let startX = 0;
let currentCard = null;

// Keep track of liked users for right panel
let likedUsers = [];

// Example current user info (replace with actual login user)
const currentUserTopArtists = ["Taylor Swift","Ed Sheeran","Thornhill"];
const currentUserLat = 53.8008;
const currentUserLng = 1.5491;

// --- Firestore: fetch matching users ---
function getMatchingUsers() {
    return db.collection("users").get().then(snapshot => {
        const matches = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            if (!data.topArtists) return;
            const commonArtists = data.topArtists.filter(artist => currentUserTopArtists.includes(artist));
            if (commonArtists.length > 0) {
                matches.push({ uid: doc.id, ...data, commonArtists });
            }
        });
        return matches;
    });
}

// --- Ticketmaster API ---
function getConcertsForArtist(artistName, lat, lng) {
    const apiKey = "DWbXcaoALGAXEjMEACxmxaXwrTw6kzRy";
    const radiusKm = 500;
    const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${apiKey}&keyword=${encodeURIComponent(artistName)}&latlong=${lat},${lng}&radius=${radiusKm}&unit=km&countryCode=GB`;
    return fetch(url)
        .then(res => res.json())
        .then(data => {
            if (!data._embedded || !data._embedded.events) return [];
            return data._embedded.events.map(e => ({
                name: e.name,
                date: e.dates.start.localDate,
                venue: e._embedded.venues[0].name,
                city: e._embedded.venues[0].city.name,
                url: e.url
            }));
        }).catch(err => {
            console.error("Ticketmaster API error:", err);
            return [];
        });
}

// --- Build cards ---
function buildCards() {
    getMatchingUsers().then(matches => {
        matches.reverse().forEach((user, i) => {
            const card = document.createElement("div");
            card.className = "card";
            card.user = user; // attach user object for swipe
            card.innerHTML = `
                <div class="card-content">
                    <h2>${user.name}</h2>
                    <p>Bio: ${user.bio || "No bio"}</p>
                    <p>Common Artists: ${user.commonArtists.join(", ")}</p>
                    <p id="concert-${i}">Loading concert...</p>
                </div>
            `;
            container.appendChild(card);

            getConcertsForArtist(user.commonArtists[0], currentUserLat, currentUserLng).then(events => {
                const el = document.getElementById(`concert-${i}`);
                if (events.length) {
                    el.innerHTML = `Next concert: <a href="${events[0].url}" target="_blank">${events[0].name}</a> at ${events[0].venue} on ${events[0].date}`;
                    card.user.concert = events[0]; // save concert for panel
                } else {
                    el.innerHTML = "No upcoming concerts found";
                    card.user.concert = null;
                }
            });
        });
    });
}

// --- Swipe logic ---
function getTopCard() { return container.querySelector(".card:last-child"); }

document.addEventListener("mousedown", e => {
    currentCard = getTopCard();
    if (!currentCard) return;
    isDragging = true;
    startX = e.clientX;
    currentCard.style.transition = "none";
});

document.addEventListener("mousemove", e => {
    if (!isDragging || !currentCard) return;
    const deltaX = e.clientX - startX;
    currentCard.style.transform = `translateX(${deltaX}px) rotate(${deltaX/10}deg)`;
});

document.addEventListener("mouseup", e => {
    if (!isDragging || !currentCard) return;
    const deltaX = e.clientX - startX;
    handleSwipe(deltaX);
});

function handleSwipe(deltaX) {
    const sensitivity = 50;
    if (Math.abs(deltaX) > sensitivity) {
        currentCard.style.transition = "transform 0.4s ease, opacity 0.4s ease";
        currentCard.style.transform = `translateX(${deltaX>0?1000:-1000}px) rotate(${deltaX>0?45:-45}deg)`;

        if (deltaX > 0) {
            likedUsers.push(currentCard.user);
            renderLikedPanel();
        }

        setTimeout(() => { currentCard.remove(); currentCard=null; }, 400);
    } else {
        currentCard.style.transition = "transform 0.3s ease";
        currentCard.style.transform = "translateX(0) rotate(0)";
    }
    isDragging = false;
}

// --- Render liked users on right panel ---
function renderLikedPanel() {
    likedList.innerHTML = "";
    likedUsers.forEach(u => {
        const div = document.createElement("div");
        div.className = "liked-item";
        div.innerHTML = `
            <strong>${u.name}</strong><br>
            ${u.instagram ? `IG: <a href="https://instagram.com/${u.instagram}" target="_blank">${u.instagram}</a><br>` : ""}
            ${u.concert ? `Concert: <a href="${u.concert.url}" target="_blank">${u.concert.name}</a> at ${u.concert.venue} on ${u.concert.date}` : "No concert"}
        `;
        likedList.appendChild(div);
    });
}

// --- Initialize ---
buildCards();
