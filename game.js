// game.js

const CONFIG = {
  canvasWidth: 800,
  canvasHeight: 600,
  paddle: { w: 120, h: 18, speed: 8, color: '#2b63ff' },
  ball: { radius: 10, speed: 5, color: '#ff3333' },
  blocks: { rows: 5, cols: 10, padding: 8, topOffset: 60, leftOffset: 40, blockHeight: 20, blockColor: '#6f001a' },
  bgColor: '#0b1220'
};

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = CONFIG.canvasWidth;
canvas.height = CONFIG.canvasHeight;

let leftPressed = false, rightPressed = false;

const paddle = {
  w: CONFIG.paddle.w,
  h: CONFIG.paddle.h,
  x: (canvas.width - CONFIG.paddle.w) / 2,
  y: canvas.height - CONFIG.paddle.h - 24,
  speed: CONFIG.paddle.speed,
  color: CONFIG.paddle.color
};

const ball = {
  r: CONFIG.ball.radius,
  x: canvas.width / 2,
  y: paddle.y - CONFIG.ball.radius - 2,
  vx: CONFIG.ball.speed * (Math.random() < 0.5 ? -1 : 1),
  vy: -CONFIG.ball.speed,
  color: CONFIG.ball.color
};

let blocks = [];
function generateBlocks() {
  blocks = [];
  const cols = CONFIG.blocks.cols;
  const rows = CONFIG.blocks.rows;
  const totalPaddingX = (cols - 1) * CONFIG.blocks.padding;
  const availableWidth = canvas.width - CONFIG.blocks.leftOffset * 2 - totalPaddingX;
  const blockW = Math.floor(availableWidth / cols);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const bx = CONFIG.blocks.leftOffset + c * (blockW + CONFIG.blocks.padding);
      const by = CONFIG.blocks.topOffset + r * (CONFIG.blocks.blockHeight + CONFIG.blocks.padding);
      blocks.push({ x: bx, y: by, w: blockW, h: CONFIG.blocks.blockHeight, alive: true, color: CONFIG.blocks.blockColor });
    }
  }
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function circleRectCollision(cx, cy, r, rx, ry, rw, rh) {
  const nearestX = clamp(cx, rx, rx + rw);
  const nearestY = clamp(cy, ry, ry + rh);
  const dx = cx - nearestX;
  const dy = cy - nearestY;
  return (dx * dx + dy * dy) <= (r * r);
}

function update() {
  if (leftPressed) paddle.x -= paddle.speed;
  if (rightPressed) paddle.x += paddle.speed;
  paddle.x = clamp(paddle.x, 0, canvas.width - paddle.w);

  ball.x += ball.vx;
  ball.y += ball.vy;

  if (ball.x - ball.r <= 0) { ball.x = ball.r; ball.vx *= -1; }
  if (ball.x + ball.r >= canvas.width) { ball.x = canvas.width - ball.r; ball.vx *= -1; }
  if (ball.y - ball.r <= 0) { ball.y = ball.r; ball.vy *= -1; }

  if (ball.y - ball.r > canvas.height) resetBall();

  if (circleRectCollision(ball.x, ball.y, ball.r, paddle.x, paddle.y, paddle.w, paddle.h)) {
    ball.y = paddle.y - ball.r - 0.1;
    ball.vy = -Math.abs(ball.vy);
    const hitPos = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
    const maxAngle = (75 * Math.PI / 180);
    const angle = hitPos * maxAngle;
    const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
    ball.vx = speed * Math.sin(angle);
    ball.vy = -Math.abs(speed * Math.cos(angle));
  }

  for (let b of blocks) {
    if (!b.alive) continue;
    if (circleRectCollision(ball.x, ball.y, ball.r, b.x, b.y, b.w, b.h)) {
      b.alive = false;
      const overlapX = (ball.x - (b.x + b.w / 2)) / (b.w / 2);
      const overlapY = (ball.y - (b.y + b.h / 2)) / (b.h / 2);
      if (Math.abs(overlapX) > Math.abs(overlapY)) {
        ball.vx *= -1;
      } else {
        ball.vy *= -1;
      }
      break;
    }
  }
}

function draw() {
  ctx.fillStyle = CONFIG.bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let b of blocks) {
    if (!b.alive) continue;
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, b.y, b.w, b.h);
  }

  ctx.fillStyle = paddle.color;
  ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);

  ctx.beginPath();
  ctx.fillStyle = ball.color;
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.fill();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = paddle.y - ball.r - 2;
  ball.vx = CONFIG.ball.speed * (Math.random() < 0.5 ? -1 : 1);
  ball.vy = -CONFIG.ball.speed;
}

function resetGame() {
  paddle.x = (canvas.width - paddle.w) / 2;
  resetBall();
  generateBlocks();
}

generateBlocks();
resetGame();
requestAnimationFrame(loop);

window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') leftPressed = true;
  if (e.key === 'ArrowRight') rightPressed = true;
  if (e.key.toLowerCase() === 'r') resetGame();
});
window.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft') leftPressed = false;
  if (e.key === 'ArrowRight') rightPressed = false;
});

document.getElementById('restart').addEventListener('click', resetGame);
