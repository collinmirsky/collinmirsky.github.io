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
  diagonal: function (i) {
    console.log("diagonal");
    return {
      x: (i % floor(width / 10)) * 10,
      y: (i * 10) % height,
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
    let radius = 50 + sin(frameCount * 0.05 + i * 0.3) * 50;
    return {
      x: width / 2 + cos(angle * 6) * radius,
      y: height / 2 + sin(angle * 6) * radius,
    };
  },
  fibonacciSpiral: function (i) {
    console.log("fibonacciSpiral");

    let goldenAngle = PI * (3 - sqrt(5)); // Golden angle

    // Setting a growth factor for the spiral's radius
    // This factor will determine the distance between points in the spiral
    let growthFactor = 8;

    // Calculating the radial position
    let radius = growthFactor * sqrt(i);

    // Calculating the angular position using golden angle
    let theta = goldenAngle * i;

    // Convert polar coordinates (radius, theta) to Cartesian (x, y)
    let x = width / 2 + cos(theta) * radius;
    let y = height / 2 + sin(theta) * radius;

    return {
      x: x,
      y: y,
    };
  },
};

function setup() {
  // If there's an existing canvas, remove it
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

  let numColors = floor(random(1, 11));
  colors = [];

  // Start building the content for the colorContainer div
  let colorContainerContent = `Number of colors: ${numColors} / Color Palette: &nbsp;`;

  for (let i = 0; i < numColors; i++) {
    let col = color(random(255), random(255), random(255));
    colors.push(col);

    colorContainerContent += `<div class="colorSquare" style="background-color:${col};"></div>`;
  }

  // Set the content of the colorContainer div
  document.getElementById("colorContainer").innerHTML = colorContainerContent;

  for (let x = 0; x < 50; x++) {
    for (let y = 0; y < 50; y++) {
      squares.push({
        x: x * 10,
        y: y * 10,
      });
      targets.push({
        x: x * 10,
        y: y * 10,
      });
      squareColors.push(colors[floor(random(numColors))]);
    }
  }

  setNewTargets();
}

/* Add Event Listener to Regenerate button if it is available */
let regenerateButton = document.getElementById("regenerateButton");
if (regenerateButton) {
  regenerateButton.addEventListener("click", function () {
    setup();
  });
}

// Only add this listener once, after the page has loaded
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

function windowResized() {
  let canvasContainerElem = document.getElementById("canvasContainer");
  console.log(
    "New Dimensions:",
    canvasContainerElem.clientWidth,
    canvasContainerElem.clientHeight
  ); // Log new dimensions
  resizeCanvas(
    canvasContainerElem.clientWidth,
    canvasContainerElem.clientHeight
  );
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
