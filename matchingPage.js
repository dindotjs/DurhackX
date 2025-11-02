// Initialize Firebase compat SDKs in HTML (firebase-app-compat.js, firebase-auth-compat.js, firebase-firestore-compat.js)

const auth = firebase.auth();
const db = firebase.firestore();
const container = document.getElementById("cardContainer");
let currentUserData = null;

// Use auth state listener instead of checking currentUser immediately
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    alert("Not logged in!");
    window.location.href = "login.html"; // redirect to login
    return;
  }

  try {
    // Get current user's Firestore document
    const userDoc = await db.collection("users").doc(user.uid).get();
    if (!userDoc.exists) {
      alert("User data not found!");
      return;
    }
    currentUserData = userDoc.data();

    // Find potential matches
    const matches = await getMatches(currentUserData.topArtists, user.uid);

    // For each match, get a nearby concert
    for (const match of matches) {
      const concert = await getNearbyConcert(match, currentUserData.lat, currentUserData.lng);
      addCard(match, concert);
    }
  } catch (err) {
    console.error(err);
    alert("Error initializing matching page: " + err.message);
  }
});

// Get users with overlapping top artists
async function getMatches(topArtists, currentUserId) {
  const matches = [];
  const usersSnapshot = await db.collection("users").get();
  usersSnapshot.forEach(doc => {
    const data = doc.data();
    if (doc.id === currentUserId) return;
    const commonArtists = data.topArtists.filter(artist => topArtists.includes(artist));
    if (commonArtists.length > 0) {
      matches.push({ uid: doc.id, name: data.name, commonArtists, lat: data.lat, lng: data.lng });
    }
  });
  return matches;
}

// Fetch a nearby concert from Ticketmaster
async function getNearbyConcert(match, userLat, userLng) {
  try {
    const apiKey = "DWbXcaoALGAXEjMEACxmxaXwrTw6kzRy";
    const radiusKm = 200;
    const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${apiKey}&latlong=${userLat},${userLng}&radius=${radiusKm}&unit=km&countryCode=GB`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data._embedded || !data._embedded.events) return null;
    const event = data._embedded.events[0];
    return {
      name: event.name,
      date: event.dates.start.localDate,
      venue: event._embedded.venues[0].name,
      city: event._embedded.venues[0].city.name,
      url: event.url
    };
  } catch (err) {
    console.error("Ticketmaster fetch failed:", err);
    return null;
  }
}

// Add swipeable card
function addCard(match, concert) {
  const card = document.createElement("div");
  card.className = "card";
  card.style.backgroundColor = "#AAAAAA";

  const content = document.createElement("div");
  content.className = "card-content";

  const concertText = concert
    ? `<p>Concert: <a href="${concert.url}" target="_blank">${concert.name}</a> at ${concert.venue}, ${concert.city} on ${concert.date}</p>`
    : "<p>No concerts nearby</p>";

  content.innerHTML = `
    <div class="profile">
      <div class="profile-info">
        <h2>${match.name}</h2>
        <p>Common Artists: ${match.commonArtists.join(", ")}</p>
        ${concertText}
      </div>
    </div>
  `;

  card.appendChild(content);
  container.appendChild(card);
}

// --- Swipe functionality ---
let isDragging = false;
let startX = 0;
let currentCard = null;

function getTopCard() {
  return container.querySelector(".card:last-child");
}

document.addEventListener("mousedown", (e) => {
  currentCard = getTopCard();
  if (!currentCard) return;
  isDragging = true;
  startX = e.clientX;
  currentCard.style.transition = "none";
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging || !currentCard) return;
  const deltaX = e.clientX - startX;
  currentCard.style.transform = `translateX(${deltaX}px) rotate(${deltaX / 10}deg)`;
});

document.addEventListener("mouseup", (e) => {
  if (!isDragging || !currentCard) return;
  const deltaX = e.clientX - startX;
  handleSwipe(deltaX);
});

function handleSwipe(deltaX) {
  const sensitivity = 50;
  if (Math.abs(deltaX) > sensitivity) {
    currentCard.style.transition = "transform 0.4s ease, opacity 0.4s ease";
    currentCard.style.transform = `translateX(${deltaX > 0 ? 1000 : -1000}px) rotate(${deltaX > 0 ? 45 : -45}deg)`;
    setTimeout(() => {
      currentCard.remove();
      currentCard = null;
    }, 400);
  } else {
    currentCard.style.transition = "transform 0.3s ease";
    currentCard.style.transform = "translateX(0) rotate(0)";
  }
  isDragging = false;
}
