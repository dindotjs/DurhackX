const image = document.getElementById('scrollImageHome');

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const scale = 1 + scrollY / 1000; // Adjust scale factor as needed
    image.style.transform = `scale(${scale})`;
    });