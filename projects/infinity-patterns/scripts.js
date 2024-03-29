let squares = [];
let targets = [];
let colors = [];
let squareColors = [];
let lastTransitionType = -1;
let canvas;

const transitions = {
  random: function (i) {
    console.log("random");
    return {
      x: random(width - 10),
      y: random(height - 10),
    };
  },
  sriYantra: function (i) {
    console.log("sriYantra");
    let layers = 10;
    let triangles = 1;
    let layer = i % layers;
    let triangle = floor(i / layers) % triangles;
    let angleOffset = (TWO_PI / triangles) * triangle;
    let angle =
      angleOffset +
      (TWO_PI / triangles) * (i / (squares.length / triangles)) +
      frameCount * 0.02;
    let radius = 30 + layer * 30;
    return {
      x: width / 2 + cos(angle) * radius,
      y: height / 2 + sin(angle) * radius,
    };
  },
  flowerOfLife: function (i) {
    console.log("flowerOfLife");
    let numPetals = 100;
    let angle = (TWO_PI / numPetals) * (i % numPetals) + frameCount * 0.02;
    let radius = 100 * (1 + floor(i / numPetals));
    return {
      x: width / 2 + cos(angle) * radius,
      y: height / 2 + sin(angle) * radius,
    };
  },
  bounce: function (i) {
    console.log("bounce");
    return {
      x: (i % floor(width / 10)) * 10,
      y: height / 2 + sin(i * 0.2) * height * 0.2,
    };
  },
  dna: function (i) {
    console.log("dna");
    return {
      x: width / 2 + sin(i * 0.1 + frameCount * 0.1) * 80,
      y: i * (height / squares.length),
    };
  },
  dharmachakra: function (i) {
    console.log("darmachakra");
    return {
      x: width / 2 + cos(i * 0.3 + frameCount * 0.05) * i * 0.5,
      y: height / 2 + sin(i * 0.3 + frameCount * 0.05) * i * 0.5,
    };
  },
  expandingSeedOfLife: function (i) {
    console.log("seedOfLife");
    let angle = map(i, 0, squares.length, 0, TWO_PI);
    let radius = 150 + sin(frameCount * 0.05 + i * 0.3) * 50;
    return {
      x: width / 2 + cos(angle * 6) * radius,
      y: height / 2 + sin(angle * 6) * radius,
    };
  },
  fibonacciSpiral: function (i) {
    console.log("fibonacciSpiral");
    let goldenAngle = PI * (3 - sqrt(5)); // Golden angle
    let growthFactor = 8;
    let radius = growthFactor * sqrt(i);
    let theta = goldenAngle * i;
    let x = width / 2 + cos(theta) * radius;
    let y = height / 2 + sin(theta) * radius;
    return {
      x: x,
      y: y,
    };
  },
};

function initializeColors() {
  let numColors = floor(random(1, 11));
  colors = [];
  let colorContainerContent = `Number of colors: ${numColors} <br>Color Palette: &nbsp;`;

  for (let i = 0; i < numColors; i++) {
    let col = color(random(255), random(255), random(255));
    colors.push(col);
    colorContainerContent += `<div class="colorSquare" style="background-color:${col};"></div>`;
  }

  document.getElementById("colorContainer").innerHTML = colorContainerContent;
}

function setup() {
  if (canvas) {
    canvas.remove();
  }

  squares = [];
  targets = [];
  squareColors = [];

  let canvasContainerElem = document.getElementById("canvasContainer");
  canvas = createCanvas(
    canvasContainerElem.clientWidth,
    canvasContainerElem.clientHeight
  );
  canvas.parent("canvasContainer");

  initializeColors();

  let numSquaresX, numSquaresY;

  if (windowWidth >= 1200) {
    numSquaresX = 35;
    numSquaresY = 35;
  } else {
    numSquaresX = 20;
    numSquaresY = 20;
  }

  for (let x = 0; x < numSquaresX; x++) {
    for (let y = 0; y < numSquaresY; y++) {
      squares.push({
        x: x * 10,
        y: y * 10,
      });
      targets.push({
        x: x * 10,
        y: y * 10,
      });
      squareColors.push(colors[floor(random(colors.length))]);
    }
  }

  setNewTargets();
}

let regenerateButton = document.getElementById("regenerateButton");
if (regenerateButton) {
  regenerateButton.addEventListener("click", function () {
    setup();
  });
}

window.addEventListener("DOMContentLoaded", (event) => {
  let regenerateButton = document.getElementById("regenerateButton");
  if (regenerateButton) {
    regenerateButton.addEventListener("click", function () {
      setup();
    });
  }
});

let lastChangeTime = 0;
const changeInterval = 3000;

function draw() {
  background(255);
  drawSquares();
  moveSquares();

  if (millis() - lastChangeTime > changeInterval) {
    setNewTargets();
    lastChangeTime = millis();
  }
}

function drawSquares() {
  for (let i = 0; i < squares.length; i++) {
    fill(squareColors[i]);
    noStroke();
    rect(squares[i].x, squares[i].y, 10, 10);
  }
}

function moveSquares() {
  for (let i = 0; i < squares.length; i++) {
    squares[i].x = lerp(squares[i].x, targets[i].x, 0.05);
    squares[i].y = lerp(squares[i].y, targets[i].y, 0.05);
  }
}

let resizeTimer;
function windowResized() {
  let canvasContainerElem = document.getElementById("canvasContainer");
  console.log(
    "New Dimensions:",
    canvasContainerElem.clientWidth,
    canvasContainerElem.clientHeight
  );
  resizeCanvas(
    canvasContainerElem.clientWidth,
    canvasContainerElem.clientHeight
  );

  // Debounce to avoid too many calls to recalculatePositions() during resize
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    recalculatePositions(); // Recalculate positions without resetting everything
  }, 200);
}

function recalculatePositions() {
  let numSquaresX, numSquaresY;

  if (windowWidth >= 1200) {
    numSquaresX = 30;
    numSquaresY = 30;
  } else {
    numSquaresX = 15;
    numSquaresY = 15;
  }

  squares = [];
  targets = [];
  squareColors = []; // Resetting squareColors array

  for (let x = 0; x < numSquaresX; x++) {
    for (let y = 0; y < numSquaresY; y++) {
      squares.push({
        x: x * 10,
        y: y * 10,
      });
      targets.push({
        x: x * 10,
        y: y * 10,
      });
      squareColors.push(colors[floor(random(colors.length))]); // Recalculate colors for the new squares
    }
  }

  setNewTargets();
}

function setNewTargets() {
  let transitionNames = Object.keys(transitions);
  let transitionType;

  do {
    transitionType = floor(random(transitionNames.length));
  } while (transitionType === lastTransitionType);

  lastTransitionType = transitionType;
  let transitionName = transitionNames[transitionType];

  for (let i = 0; i < targets.length; i++) {
    let newTarget = transitions[transitionName](i);
    targets[i].x = constrain(newTarget.x, 0, width - 10);
    targets[i].y = constrain(newTarget.y, 0, height - 10);
  }
}

// Console.log only on localhost //

// Backup the original console.log function
const originalConsoleLog = console.log;

if (
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1"
) {
  // If not on localhost, disable console.log
  console.log = function () {};
} else {
  // If on localhost, use the original console.log function
  console.log = originalConsoleLog;
}

// Now you can use console.log as usual. It will only work on localhost.
console.log("This will only log if you're on localhost!");

/*Written by Collin Mirsky 2023
collinmirsky.gitbhub.io*/
