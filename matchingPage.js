const container = document.getElementById("cardContainer");
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
        <p>Age: ${20 + i}</p>
        <p>Location: City ${i}</p>
        <p>Bio: Enthusiastic developer and designer.</p>
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