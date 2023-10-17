let ants = [];
let splatters = [];
let paths = [];
let chargeStartTime = 0;
let charging = false;
let gameEnded = false;
let defaultNames = [
  "Gertrude",
  "Bertha",
  "Wilbur",
  "Mildred",
  "Clarence",
  "Edna",
  "Rufus",
  "Myrtle",
  "Eugene",
  "Agnes",
];
let playerInputs = [];
let startButton;
let shareButton;

let namesFromQueryString = getNamesFromQueryString();

// Use names from the query string if available, otherwise use default names
let ANT_NAMES =
  namesFromQueryString.length > 0 ? namesFromQueryString : defaultNames;

function getNamesFromQueryString() {
  let params = new URLSearchParams(window.location.search);
  let names = params.get("names");
  return names ? names.split(",") : [];
}

function setup() {
  let canvas = createCanvas(420, 420);
  canvas.parent("ant-farm-canvas");
  frameRate(30);
  setupPlayersColumn();
  fillAntNamesRandomly();

  shareButton = createButton("SHARE");
  shareButton.parent(playersColumn);
  shareButton.mousePressed(shareGame);
}

function setupPlayersColumn() {
  playersColumn = select("#players-column");
  let header = createElement("h1", "Players");
  header.parent(playersColumn);

  for (let i = 0; i < 10; i++) {
    let input = createInput("");
    input.class("ant-name-input");
    input.attribute("placeholder", "Player " + (i + 1));
    input.parent(playersColumn);
    playerInputs.push(input);
  }

  startButton = createButton("START");
  startButton.parent(playersColumn);
  startButton.mousePressed(startGame);
}

function draw() {
  background(255);
  fill(139, 69, 19);
  rect(0, 0, width, 20);
  rect(0, 0, 20, height);
  rect(width - 20, 0, 20, height);
  rect(0, height - 20, width, 20);
  noStroke();
  fill(210, 180, 140);
  rect(20, 20, width - 40, height - 40);
  fill(255, 255, 255);
  for (const path of paths) {
    ellipse(path.x, path.y, 10, 10);
  }
  for (const ant of ants) {
    ant.move();
    ant.display();
  }
  fill(139, 0, 0, 150);
  for (const s of splatters) {
    beginShape();
    for (const vertexPoint of s.vertices) {
      vertex(vertexPoint.x, vertexPoint.y);
    }
    endShape(CLOSE);
  }
  for (let i = 0; i < ants.length; i++) {
    for (let j = i + 1; j < ants.length; j++) {
      let d = dist(ants[i].pos.x, ants[i].pos.y, ants[j].pos.x, ants[j].pos.y);
      if (d < 15) {
        createSplatterBetween(ants[i], ants[j]);
        if (random() < 0.5) {
          ants.splice(i, 1);
        } else {
          ants.splice(j, 1);
        }
        break;
      }
    }
  }

  // Handling charging
  if (!charging && frameCount % (5 * 30) === 0) {
    initiateCharging();
  } else if (charging && millis() - chargeStartTime > 2000) {
    stopCharging();
  }

  if (ants.length === 1 && !gameEnded) {
    endGame();
  }
}

function createSplatterBetween(ant1, ant2) {
  let splatterVertices = [];
  let x = (ant1.pos.x + ant2.pos.x) / 2;
  let y = (ant1.pos.y + ant2.pos.y) / 2;

  let detail = 0.1; // Adjust this value to control the smoothness of the splatter

  beginShape();
  for (let a = 0; a < TWO_PI; a += detail) {
    let r = noise(x * 0.05, y * 0.05, a * 0.5) * 25; // Adjust the multiplier for size and detail
    let sx = x + cos(a) * r;
    let sy = y + sin(a) * r;
    splatterVertices.push(createVector(sx, sy));
    vertex(sx, sy);
  }
  endShape(CLOSE);

  // Randomly generate a blood-like color
  let splatterColor = color(random(100, 255), 0, 0, random(100, 255)); // Shades of red

  // Create an object to represent the splatter with vertices and color
  let splatter = {
    vertices: splatterVertices,
    color: splatterColor,
  };

  splatters.push(splatter);
}

function initiateCharging() {
  charging = true;
  chargeStartTime = millis();
  for (let i = 0; i < ants.length; i++) {
    ants[i].setTarget(ants[(i + 1) % ants.length]);
  }
}

function stopCharging() {
  charging = false;
  for (const ant of ants) {
    ant.clearTarget();
  }
}

class Ant {
  constructor(x, y, name) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(2.5);
    this.target = null;
    this.name = name;
    this.walkCycle = 0;
  }

  setTarget(targetAnt) {
    this.target = targetAnt;
  }

  clearTarget() {
    this.target = null;
  }

  move() {
    if (gameEnded) return; // Stop updating position if game has ended

    if (this.target) {
      let dir = p5.Vector.sub(this.target.pos, this.pos).normalize().mult(2.5);
      this.vel.lerp(dir, 0.2);
    } else {
      this.vel.add(p5.Vector.random2D().mult(0.5));
    }
    this.vel.limit(2.5);
    this.pos.add(this.vel);
    this.pos.x = constrain(this.pos.x, 30, width - 30);
    this.pos.y = constrain(this.pos.y, 30, height - 30);

    this.walkCycle += 0.5; // Increased from 0.1 to 0.5 for 5x speed

    // Add the current position to the trails array
    paths.push(this.pos.copy());
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading() + HALF_PI);

    // Body and head
    fill(0);
    ellipse(0, 0, 6, 14);
    ellipse(0, -9, 6, 6);

    // Antennae
    stroke(0);
    line(0, -9, 2, -15);
    line(0, -9, -2, -15);

    // Legs with joints and walking motion
    // Legs with joints and walking motion
    for (let i = -1; i <= 1; i += 1) {
      let upperLegLength = 6;
      let lowerLegLength = 6;

      // The multiplier affects how much the leg moves
      let multiplier = i === 0 ? 0.2 : 0.4;

      let offset = i === 0 ? HALF_PI : 0; // This offset will ensure the middle legs move half forward and half back

      let upperAngle =
        i === 1
          ? -sin(this.walkCycle + i + offset) * multiplier
          : sin(this.walkCycle + i + offset) * multiplier;
      let lowerAngle =
        i === 1
          ? -sin(this.walkCycle + i) * 0.5 + PI / 4
          : sin(this.walkCycle + i) * 0.5 - PI / 4;

      // Right legs
      let x1 = cos(upperAngle) * upperLegLength;
      let y1 = sin(upperAngle) * upperLegLength;
      let x2 = x1 + cos(lowerAngle + upperAngle) * lowerLegLength;
      let y2 = y1 + sin(lowerAngle + upperAngle) * lowerLegLength;
      line(0, i * 5, x1, y1 + i * 5);
      line(x1, y1 + i * 5, x2, y2 + i * 5);

      // Left legs (mirrored)
      line(0, i * 5, -x1, y1 + i * 5);
      line(-x1, y1 + i * 5, -x2, y2 + i * 5);
    }

    pop();

    // Name
    fill(0);
    textSize(12);
    text(this.name, this.pos.x, this.pos.y - 20);
  }

  move() {
    if (gameEnded) return; // Stop updating position if game has ended

    if (this.target) {
      let dir = p5.Vector.sub(this.target.pos, this.pos).normalize().mult(2.5);
      this.vel.lerp(dir, 0.2);
    } else {
      this.vel.add(p5.Vector.random2D().mult(0.5));
    }
    this.vel.limit(2.5);
    this.pos.add(this.vel);
    this.pos.x = constrain(this.pos.x, 30, width - 30);
    this.pos.y = constrain(this.pos.y, 30, height - 30);

    this.walkCycle += 0.5; // Increased from 0.1 to 0.5 for 5x speed

    // Add the current position to the trails array
    paths.push(this.pos.copy());
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading() + HALF_PI);

    // Body and head
    fill(0);
    ellipse(0, 0, 6, 14);
    ellipse(0, -9, 6, 6);

    // Antennae
    stroke(0);
    line(0, -9, 2, -15);
    line(0, -9, -2, -15);

    // Legs with joints and walking motion
    // Legs with joints and walking motion
    for (let i = -1; i <= 1; i += 1) {
      let upperLegLength = 6;
      let lowerLegLength = 6;

      // The multiplier affects how much the leg moves
      let multiplier = i === 0 ? 0.2 : 0.4;

      let offset = i === 0 ? HALF_PI : 0; // This offset will ensure the middle legs move half forward and half back

      let upperAngle =
        i === 1
          ? -sin(this.walkCycle + i + offset) * multiplier
          : sin(this.walkCycle + i + offset) * multiplier;
      let lowerAngle =
        i === 1
          ? -sin(this.walkCycle + i) * 0.5 + PI / 4
          : sin(this.walkCycle + i) * 0.5 - PI / 4;

      // Right legs
      let x1 = cos(upperAngle) * upperLegLength;
      let y1 = sin(upperAngle) * upperLegLength;
      let x2 = x1 + cos(lowerAngle + upperAngle) * lowerLegLength;
      let y2 = y1 + sin(lowerAngle + upperAngle) * lowerLegLength;
      line(0, i * 5, x1, y1 + i * 5);
      line(x1, y1 + i * 5, x2, y2 + i * 5);

      // Left legs (mirrored)
      line(0, i * 5, -x1, y1 + i * 5);
      line(-x1, y1 + i * 5, -x2, y2 + i * 5);
    }

    pop();

    // Name
    fill(0);
    textSize(12);
    text(this.name, this.pos.x, this.pos.y - 20);
  }

  setTarget(targetAnt) {
    this.target = targetAnt;
  }

  clearTarget() {
    this.target = null;
  }
}

function startGame() {
  let names = [];
  for (const input of playerInputs) {
    let name = input.value();
    if (name) {
      names.push(name);
    }
  }
  ants = [];
  paths = [];
  splatters = [];
  for (let i = 0; i < names.length; i++) {
    let x = random(40, width - 40);
    let y = random(40, height - 40);
    let ant = new Ant(x, y, names[i]);
    ants.push(ant);
  }
  winDanceStartTime = 0;
  for (let input of playerInputs) {
    input.attribute("disabled", "");
  }
  startButton.attribute("disabled", "");
}

function resetGame() {
  gameEnded = false;
  for (let input of playerInputs) {
    input.removeAttribute("disabled");
  }
  startButton.removeAttribute("disabled");
}

function fillAntNamesRandomly() {
  let shuffledNames = shuffle(ANT_NAMES);
  let inputs = selectAll(".ant-name-input");
  for (let i = 0; i < inputs.length; i++) {
    inputs[i].value(shuffledNames[i]);
  }
}

function endGame() {
  background(255); // Clear the background once

  displayWinner();

  // Re-enable all input fields and the start button
  for (let input of playerInputs) {
    input.removeAttribute("disabled");
  }
  startButton.removeAttribute("disabled");
}

function displayWinner() {
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(24);
  text(ants[0].name + " Wins! 🏆", width / 2, height / 2);
}

function shareGame() {
  let names = [];
  for (const input of playerInputs) {
    let name = input.value();
    if (name) {
      names.push(name);
    }
  }

  // Generate a URL with query string
  let queryString = `?names=${names.join(",")}`;
  let shareURL =
    window.location.origin + window.location.pathname + queryString;

  // Create a temporary input element to copy the URL to the clipboard
  let tempInput = document.createElement("input");
  tempInput.value = shareURL;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand("copy");
  document.body.removeChild(tempInput);

  // Show a popup to inform the user
  let popup = document.createElement("div");
  popup.textContent = "URL copied to clipboard! Share with your friends.";
  popup.style.position = "fixed";
  popup.style.top = "10px";
  popup.style.left = "10px";
  popup.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  popup.style.color = "#fff";
  popup.style.padding = "10px";
  popup.style.borderRadius = "5px";
  popup.style.zIndex = "999";
  document.body.appendChild(popup);
  setTimeout(() => {
    popup.remove();
  }, 5000);
}

/*Written by Collin Mirsky 2023
collinmirsky.gitbhub.io*/
