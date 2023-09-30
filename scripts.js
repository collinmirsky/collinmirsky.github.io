// Main JS
const heroH1 = document.querySelector("#hero h1");

function typeText(text, index, callback) {
  if (index < text.length) {
    const span = document.createElement("span");
    span.textContent = text[index];
    heroH1.appendChild(span);
    setTimeout(() => typeText(text, index + 1, callback), 100); // 100ms delay between each letter
  } else {
    callback();
  }
}

function deleteText(callback) {
  if (heroH1.children.length > 0) {
    heroH1.removeChild(heroH1.lastChild);
    setTimeout(() => deleteText(callback), 100); // 100ms delay between each letter
  } else {
    callback();
  }
}

function animateText() {
  typeText("Hello!", 0, () => {
    setTimeout(() => {
      deleteText(() => {
        typeText("Nice to meet you!", 0, () => {
          setTimeout(() => {
            deleteText(animateText);
          }, 5000);
        });
      });
    }, 5000);
  });
}

animateText();

// Block Game JS
const blockGameSketch = (p) => {
  let fallingShape,
    landedBlocks = [],
    gameOver = false,
    flashCounter = 0,
    pixelSize = 10,
    fallSpeed = 10,
    lastShapeIndex,
    lastAngle;

  p.setup = () => {
    let cnv = p
      .createCanvas(400, 600)
      .parent("blockGame-container")
      .id("blochGameCanvas")
      .style("background-color", "rgba(0,0,0,0)");
  };

  p.draw = () => {
    p.drawGame();
    if (p.frameCount % fallSpeed === 0 && fallingShape) fallingShape.fall();
  };

  p.drawGame = () => {
    const drawShadow = (offsetX, offsetY, blur, color) => {
      p.drawingContext.shadowOffsetX = offsetX;
      p.drawingContext.shadowOffsetY = offsetY;
      p.drawingContext.shadowBlur = blur;
      p.drawingContext.shadowColor = color;
    };

    drawShadow(1, 1, 4, "rgba(0, 0, 0, 1)");
    p.fill([213, 211, 186]).rect(50, 50, 300, 500, 0, 0, 50, 0);

    drawShadow(0, 0, 0, "rgba(0, 0, 0, 0)");
    p.fill([48, 60, 70]).rect(75, 75, 250, 200);
    p.fill(0).rect(100, 100, 200, 150);

    drawShadow(2, 2, 2, "rgba(0, 0, 0, 0.5)");
    const dPad = { x: 85, y: 350, w: 75, h: 75 };
    p.fill([29, 34, 37])
      .rect(dPad.x, dPad.y, dPad.w, 20)
      .rect(dPad.x + 28, dPad.y - 28, 20, dPad.h);
    p.fill(150, 75).ellipse(dPad.x + 38, dPad.y + 10, 20);

    const buttons = [
      {
        x: 300,
        y: 340,
        r: 20,
        label: "A",
        labelOffsetX: -4,
        labelOffsetY: 40,
        color: [120, 29, 81],
      },
      {
        x: 260,
        y: 370,
        r: 20,
        label: "B",
        labelOffsetX: -4,
        labelOffsetY: 40,
        color: [120, 29, 81],
      },
      {
        x: 155,
        y: 455,
        r: 10,
        label: "Select",
        labelOffsetX: 1,
        labelOffsetY: 25,
        color: [192, 183, 163],
      },
      {
        x: 200,
        y: 455,
        r: 10,
        label: "Start",
        labelOffsetX: 4,
        labelOffsetY: 25,
        color: [192, 183, 163],
      },
    ];

    buttons.forEach(({ x, y, r, label, labelOffsetX, labelOffsetY, color }) => {
      p.drawingContext.shadowOffsetX = 2;
      p.drawingContext.shadowOffsetY = 2;
      p.drawingContext.shadowBlur = 2;
      p.drawingContext.shadowColor = "rgba(0, 0, 0, 0.5)";
      p.fill(color);
      if (label === "Start" || label === "Select")
        p.rect(x, y, r * 3, r * 1, 3);
      else p.ellipse(x, y, r * 2);

      p.drawingContext.shadowOffsetX = 0;
      p.drawingContext.shadowOffsetY = 0;
      p.drawingContext.shadowBlur = 0;
      p.fill([50, 44, 133])
        .textSize(label === "Start" || label === "Select" ? 10 : 16)
        .text(label, x + labelOffsetX, y + labelOffsetY);
    });

    drawShadow(0, 0, 0, "rgba(0, 0, 0, 0)");
    p.push();
    p.translate(310, 510);
    p.rotate(p.PI / 5);
    p.fill(0);
    for (let y = -20; y <= 20; y += 10)
      for (let x = -20; x <= 20; x += 10) p.ellipse(x, y, 4);
    p.pop();

    if (gameOver) {
      if (flashCounter < 150) {
        p.fill(255, 0, 0)
          .textSize(25)
          .textAlign(p.CENTER, p.CENTER)
          .text("GAME OVER!", 200, 175);
        p.textAlign(p.LEFT, p.BASELINE); // Resetting the text alignment
        flashCounter++;
      } else p.resetGame();
      return;
    }

    if (!fallingShape || fallingShape.landed) {
      fallingShape = p.createRandomShape();
      if (fallingShape.willCollide(fallingShape.x, fallingShape.y))
        gameOver = true;
    }

    if (p.frameCount % fallSpeed === 0) fallingShape.fall();
    fallingShape.display();
    p.displayLandedBlocks();
  };

  p.resetGame = () => {
    [gameOver, flashCounter, landedBlocks, fallingShape] = [false, 0, [], null];
  };

  p.createRandomShape = () => {
    const shapes = [
      {
        blocks: [
          [0, 0],
          [1, 0],
          [2, 0],
          [3, 0],
        ],
        color: [0, 255, 255],
      },
      {
        blocks: [
          [0, 0],
          [1, 0],
          [0, 1],
          [1, 1],
        ],
        color: [255, 255, 0],
      },
      {
        blocks: [
          [1, 0],
          [0, 1],
          [1, 1],
          [2, 1],
        ],
        color: [128, 0, 128],
      },
      {
        blocks: [
          [1, 0],
          [2, 0],
          [0, 1],
          [1, 1],
        ],
        color: [0, 255, 0],
      },
      {
        blocks: [
          [0, 0],
          [1, 0],
          [1, 1],
          [2, 1],
        ],
        color: [255, 0, 0],
      },
      {
        blocks: [
          [0, 0],
          [0, 1],
          [1, 1],
          [2, 1],
        ],
        color: [0, 0, 255],
      },
      {
        blocks: [
          [2, 0],
          [0, 1],
          [1, 1],
          [2, 1],
        ],
        color: [255, 165, 0],
      },
    ];

    let shapeIndex;
    do shapeIndex = p.floor(p.random(shapes.length));
    while (shapeIndex === lastShapeIndex);
    lastShapeIndex = shapeIndex;

    const shape = shapes[shapeIndex];
    let angle;
    do angle = p.random([90, 180, 270, 360]);
    while (angle === lastAngle);
    lastAngle = angle;

    const rotatedBlocks = shape.blocks.map(([bx, by]) => {
      const rad = p.radians(angle);
      return [
        bx * p.cos(rad) - by * p.sin(rad),
        bx * p.sin(rad) + by * p.cos(rad),
      ];
    });

    const minX = Math.min(...rotatedBlocks.map(([x]) => x));
    const maxX = Math.max(...rotatedBlocks.map(([x]) => x));
    const minY = Math.min(...rotatedBlocks.map(([, y]) => y));

    let x = p.floor(p.random(0, 190) / pixelSize) * pixelSize + 100;
    if (x + maxX * pixelSize > 290) x = 290 - maxX * pixelSize;
    if (x + minX * pixelSize < 100) x = 100 - minX * pixelSize;

    let y = 100 - minY * pixelSize;

    return new blockGameShape(x, y, rotatedBlocks, shape.color);
  };

  p.displayLandedBlocks = () => {
    landedBlocks.forEach(({ x, y, color }) =>
      p.fill(color).rect(x, y, pixelSize, pixelSize)
    );
  };

  class blockGameShape {
    constructor(x, y, blocks, color) {
      this.x = x;
      this.y = y;
      this.blocks = blocks;
      this.color = color;
      this.landed = false;
    }

    fall() {
      let newY = this.y + pixelSize;
      if (
        this.willCollide(this.x, newY) ||
        newY + this.getMaxHeight() * pixelSize >= 250
      ) {
        this.landed = true;
        this.addBlocksToLanded();
      } else this.y = newY;
    }

    willCollide(x, y) {
      return this.blocks.some(([bx, by]) => {
        const blockX = x + bx * pixelSize;
        const blockY = y + by * pixelSize;
        return landedBlocks.some(
          (block) => block.x === blockX && block.y === blockY
        );
      });
    }

    addBlocksToLanded() {
      this.blocks.forEach(([bx, by]) => {
        landedBlocks.push({
          x: this.x + bx * pixelSize,
          y: this.y + by * pixelSize,
          color: this.color,
        });
      });
    }

    display() {
      p.fill(this.color);
      this.blocks.forEach(([bx, by]) =>
        p.rect(
          this.x + bx * pixelSize,
          this.y + by * pixelSize,
          pixelSize,
          pixelSize
        )
      );
    }

    getMaxHeight() {
      return Math.max(...this.blocks.map(([, by]) => by));
    }
  }
};

new p5(blockGameSketch);
