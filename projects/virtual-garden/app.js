const canvas = document.getElementById("galaxy");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Define the Star class
class Star {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 1 + 1;
    this.twinkleSpeed = Math.random() * 0.02;
    this.opacity = Math.random() * 1;
  }

  // Draw the star
  draw() {
    ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
    ctx.shadowBlur = 2;
    ctx.shadowColor = "white";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }

  // Update the star's opacity for twinkling effect
  update() {
    this.opacity += this.twinkleSpeed;
    if (this.opacity > 1 || this.opacity < 0) {
      this.twinkleSpeed = -this.twinkleSpeed;
    }
  }
}

// Create an array of stars
let stars = [];
for (let i = 0; i < 200; i++) {
  const star = new Star();
  stars.push(star);
}

// Define the Planet class
class Planet {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.angle = Math.random() * (2 * Math.PI);
    this.radius = 25;
    this.speed = 0.01 + Math.random() * 0.03;
    this.orbitRadius = (Math.random() * canvas.width) / 4;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }

  update() {
    this.angle += this.speed;
    this.x = canvas.width / 2 + this.orbitRadius * Math.cos(this.angle);
    this.y = canvas.height / 2 + this.orbitRadius * Math.sin(this.angle);
    this.draw();
  }
}

let planets = [];

function animate() {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  stars.forEach((star) => {
    star.draw();
    star.update();
  });

  planets.forEach((planet) => {
    planet.update();
  });
}

document.querySelectorAll(".planet").forEach((planet) => {
  planet.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData(
      "text/plain",
      getComputedStyle(planet).backgroundColor
    );
    planet.style.opacity = "0.5";
  });

  planet.addEventListener("dragend", () => {
    planet.style.opacity = "1";
  });

  planet.addEventListener("touchstart", (e) => {
    e.preventDefault();
    planet.style.opacity = "0.5";
    const color = getComputedStyle(planet).backgroundColor;
    planet.setAttribute("data-color", color);
  });

  planet.addEventListener("touchend", () => {
    planet.style.opacity = "1";
    planet.removeAttribute("data-color");
  });
});

canvas.addEventListener("dragover", (e) => {
  e.preventDefault();
});

canvas.addEventListener("drop", (e) => {
  e.preventDefault();
  const color = e.dataTransfer.getData("text/plain");
  const x = e.clientX;
  const y = e.clientY;
  const newPlanet = new Planet(x, y, color);
  planets.push(newPlanet);
});

canvas.addEventListener("touchend", (e) => {
  e.preventDefault();
  const touch = e.changedTouches[0];
  const touchedElement = document.elementFromPoint(
    touch.clientX,
    touch.clientY
  );
  const color = touchedElement.getAttribute("data-color");
  if (color) {
    const x = touch.clientX;
    const y = touch.clientY;
    const newPlanet = new Planet(x, y, color);
    planets.push(newPlanet);
  }
});

animate();
