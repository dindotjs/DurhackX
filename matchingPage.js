// --- Firebase config ---
const firebaseConfig = {
    apiKey: "AIzaSyDpevND_wFdc4ecj0SdSRjBrsnh_Tl6OS8",
    authDomain: "urhackx.firebaseapp.com",
    projectId: "durhackx"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// --- Swipe variables ---
const container = document.getElementById("cardContainer");
let isDragging = false;
let startX = 0;
let currentCard = null;

// --- Swipe functions ---
function getTopCard() {
    return container.querySelector(".card:last-child");
}

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
        console.log(deltaX>0 ? "Like" : "Dislike");
        setTimeout(() => { currentCard.remove(); currentCard=null; }, 400);
    } else {
        currentCard.style.transition = "transform 0.3s ease";
        currentCard.style.transform = "translateX(0) rotate(0)";
    }
    isDragging = false;
}

// --- Firestore helpers ---
function getMatchingUsers(currentUserTopArtists) {
    return db.collection("users").get().then(snapshot => {
        const matches = [];
        snapshot.forEach(doc => {
            const userData = doc.data();
            if (!userData.topArtists) return;
            const commonArtists = userData.topArtists.filter(artist => currentUserTopArtists.includes(artist));
            if (commonArtists.length > 0) {
                matches.push({ uid: doc.id, ...userData, commonArtists });
            }
        });
        return matches;
    });
}

// --- Ticketmaster API ---
function getConcertsForArtist(artistName, lat, lng) {
    const apiKey = "YOUR_TICKETMASTER_KEY";
    const radiusKm = 50;
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
function buildCards(currentUserTopArtists, currentUserLat, currentUserLng) {
    getMatchingUsers(currentUserTopArtists).then(matches => {
        matches.reverse().forEach((user, i) => {
            const card = document.createElement("div");
            card.className = "card";
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
                } else {
                    el.innerHTML = "No upcoming concerts found";
                }
            });
        });
    });
}

// --- Example usage ---
const currentUserTopArtists = ["Taylor Swift","Ed Sheeran", "Thornhill"];
const currentUserLat = 53.8008;
const currentUserLng = 1.5491;

buildCards(currentUserTopArtists, currentUserLat, currentUserLng);


/*const container = document.getElementById("cardContainer");
let isDragging = false;
let startX = 0;
let currentCard = null;

const cardColors = "#AAAAAA";
for (let i = 10; i >= 1; i--) {
  const card = document.createElement("div");
  card.className = "card";
  card.style.backgroundColor = cardColors;
  cardContent = document.createElement("div");
  cardContent.className = "card-content";
  cardContent.innerHTML = `
    <div class="profile">
      <img class="profile-pic" src="Profile${i}.jpg" alt="Profile ${i}">
      <div class="profile-info">
        <h2></h2>
        <p id="age">Age: ${20 + i}</p>
        <p id="location">Location: City ${i}</p>
        <p id=bio>Bio: Enthusiastic developer and designer.</p>
      </div>
    </div>
  `;
  card.appendChild(cardContent);
  container.appendChild(card);
}

function getTopCard() {
  return container.querySelector(".card:last-child");
}
document.addEventListener("mousedown", (e) => {
  currentCard = getTopCard();
  if (!currentCard) return;
  isDragging = true;
  startX = e.clientX;
  currentCard.style.transition = "none";
  console.log("Mouse down on card");
});
document.addEventListener("mousemove", (e) => {
  if (!isDragging || !currentCard) return;
  const deltaX = e.clientX - startX;
  currentCard.style.transform = `translateX${deltaX}px) rotate(${
    deltaX / 10
  }deg)`;
  console.log("Mouse move on card");
});

document.addEventListener("mouseup", (e) => {
  if (!isDragging || !currentCard) return;
  const deltaX = e.clientX - startX;
  handleSwipe(deltaX);
  console.log("Mouse up on card");
});
container.addEventListener("touchstart", (e) => {
  currentCard = getTopCard();
  if (!currentCard) return;
  isDragging = true;
  startX = e.touches[0].clientX;
  currentCard.style.transition = "none";
  console.log("Touch start on card");
});

container.addEventListener("touchmove", (e) => {
  if (!isDragging || !currentCard) return;
  const deltaX = e.touches[0].clientX - startX;
  currentCard.style.transform = `translateX(${deltaX}px) rotate(${
    deltaX / 10
  }deg)`;

  console.log("Touch move on card");
});
container.addEventListener("touchend", (e) => {
  
  if (!isDragging || !currentCard) return;
  const deltaX = e.changedTouches[0].clientX - startX;
  handleSwipe(deltaX);
  console.log("Touch end on card");
});

function handleSwipe(deltaX) {
  console.log("Handling swipe with deltaX:", deltaX);
  const sensitivity = 50;
  if (Math.abs(deltaX) > sensitivity) {
    currentCard.style.transition = "transform 0.4s ease, opacity 0.4s ease";
    currentCard.style.transform = `translateX(${
      deltaX > 0 ? 1000 : -1000
    }px) rotate(${deltaX > 0 ? 45 : -45}deg)`;
    currentCard.style.opacity = 1;
    if (yesOrNo(deltaX)){
    console.log("Like");
    } else {
    console.log("Dislike");
    }
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
function yesOrNo(deltaX){
  if (deltaX > 0) {
    return true;
  }
  return false;
}
function handleYes(){
  const currentCard = getTopCard();
  if (!currentCard) return;
}
function handleNo(){
  const currentCard = getTopCard();
  if (!currentCard) return;
}*/