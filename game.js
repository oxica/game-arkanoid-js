const KEYS = {
  LEFT: 37,
  RIGHT: 39,
  SPACE: 32,
};

let game = {
  running: true,
  ctx: null,
  platform: null,
  ball: null,
  blocks: [],
  score:0,
  rows: 4,
  cols: 8,
  width: 640,
  height: 360,
  sprites: {
    background: null,
    ball: null,
    platform: null,
    block: null,
  },
  init: function () {
    this.ctx = document.getElementById("mycanvas").getContext("2d");
    this.setEvents();
  },
  setEvents() {
    window.addEventListener("keydown", (e) => {
      if (e.keyCode === KEYS.SPACE) {
        this.platform.fire();
      } else if (e.keyCode === KEYS.LEFT || e.keyCode === KEYS.RIGHT) {
        this.platform.start(e.keyCode);
      }
    });
    window.addEventListener("keyup", (e) => {
      this.platform.stop();
    });
  },
  preload(callback) {
    let loaded = 0;
    let required = Object.keys(this.sprites).length;
    let onImageLoad = () => {
      ++loaded;
      if (loaded >= required) {
        callback();
      }
    };

    for (let key in this.sprites) {
      this.sprites[key] = new Image();
      this.sprites[key].src = "img/" + key + ".png";
      this.sprites[key].addEventListener("load", onImageLoad);
    }
  },
  create() {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        this.blocks.push({
          active: true,
          width: 60,
          height: 20,
          x: 64 * col + 65,
          y: 24 * row + 35,
        });
      }
    }
  },
  update() {
    this.collideBlocks();
    this.collidePlatform();
    this.ball.collideWorldBounds();
    this.platform.collideWorldBounds();
    this.platform.move();
    this.ball.move();
  },

  addScore() {
    ++this.score;

    if (this.score >= this.blocks.length) {
      this.end('You are win!')
    }
  },
  collideBlocks() {
    for (let block of this.blocks) {
      if (block.active && this.ball.collide(block)) {
        this.ball.bumpBlock(block);
        this.addScore();
      }
    }
  },
  collidePlatform() {
    if (this.ball.collide(this.platform)) {
      this.ball.bumpPlatform(this.platform);
    }
  },
  run() {
    if (this.running) {
      window.requestAnimationFrame(() => {
        this.update();
        this.render();
        this.run();
      });
    }
  },
  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.drawImage(this.sprites.background, 0, 0);
    this.ctx.drawImage(
      this.sprites.ball,
      0,
      0,
      this.ball.width,
      this.ball.height,
      this.ball.x,
      this.ball.y,
      this.ball.width,
      this.ball.height
    );
    this.ctx.drawImage(this.sprites.platform, this.platform.x, this.platform.y);
    this.renderBlocks();
  },
  renderBlocks() {
    for (let block of this.blocks) {
      if (block.active) {
        this.ctx.drawImage(this.sprites.block, block.x, block.y);
      }
    }
  },
  start: function () {
    this.init();
    this.preload(() => {
      this.create();
      this.run();
    });
  },
  end(message) {
    this.running = false;
    alert(message);
    window.location.reload();
   },
  random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  },
};

game.ball = {
  dx: 0,
  dy: 0,
  velocity: 3,
  x: 320,
  y: 280,
  width: 20,
  height: 20,
  start() {
    this.dy = -this.velocity;
    this.dx = game.random(-this.velocity, this.velocity);
  },
  move() {
    if (this.dy) {
      this.y += this.dy;
    }
    if (this.dx) {
      this.x += this.dx;
    }
  },
  collide(element) {
    let x = this.x + this.dx;
    let y = this.y + this.dy;

    if (
      x + this.width > element.x &&
      x < element.x + element.width &&
      y + this.height > element.y &&
      y < element.y + element.height
    ) {
      return true;
    }
    return false;
  },
  collideWorldBounds() {
    let x = this.x + this.dx;
    let y = this.y + this.dy;

    let ballLeft = x;
    let ballRight = ballLeft + this.width;
    let ballTop = y;
    let ballBottom = ballTop + this.height;

    let worldLeft = 0;
    let worldRight = game.width;
    let worldTop = 0;
    let worldBottom = game.height;

    if (ballLeft < worldLeft) {
      this.x = 0;
      this.dx = this.velocity;
    } else if (ballRight > worldRight) {
      this.x = worldRight - this.width;
      this.dx = -this.velocity;
    } else if (ballTop < worldTop) {
      this.y = 0;
      this.dy = this.velocity;
    } else if (ballBottom > worldBottom) {
      game.end("Game over!");
    }
  },

  bumpBlock(block) {
    this.dy *= -1;
    block.active = false;

  },
  bumpPlatform(platform) {
    if (platform.dx) {
      this.dx += platform.dx;
    }

    if (this.dy > 0) {
      this.dy = -this.velocity;
      let touchX = this.x + this.width / 2;
      this.dx = this.velocity * platform.getTouchOffset(touchX);
    }
  },
};

game.platform = {
  velocity: 6,
  dx: 0,
  x: 280,
  y: 300,
  width: 100,
  height: 14,
  ball: game.ball,
  fire() {
    if (this.ball) {
      this.ball.start();
      this.ball = null;
    }
  },
  start(direction) {
    if (direction === KEYS.LEFT) {
      this.dx = -this.velocity;
    } else if (direction === KEYS.RIGHT) {
      this.dx = this.velocity;
    }
  },
  stop() {
    this.dx = 0;
  },
  move() {
    if (this.dx) {
      this.x += this.dx;
      if (this.ball) {
        this.ball.x += this.dx;
      }
    }
  },
  getTouchOffset(x) {
    let diff = this.x + this.width - x;
    let offset = this.width - diff;
    let result = (2 * offset) / this.width;
    return result - 1;
  },

  collideWorldBounds() {
    let x = this.x + this.dx;
    let platformLeft = x;
    let platformRight = platformLeft + this.width;
    let worldLeft = 0;
    let worldRight = game.width;

    if (platformLeft < worldLeft || platformRight > worldRight) {
      this.dx = 0;
    }
  },
};

window.addEventListener("load", () => {
  game.start();
});
