class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  plus(other) {
    return new Vector(this.x + other.x, this.y + other.y);
  }

  times(scale) {
    return new Vector(this.x * scale, this.y * scale);
  }
}

class Player {
  constructor(pos) {
    this.pos = pos;
    this.size = new Vector(2, 2);
    this.speed = new Vector(0, 0);
  }

  moveY(step, keys) {
    this.speed.y += step * gravity;
    const motion = new Vector(0, this.speed.y * step);
    const newPos = this.pos.plus(motion);
    if (newPos.y < 0) {
      this.speed.y = 0;
      this.pos.y = 0;
    } else if (newPos.y > gameHeight - this.size.y) {
      this.speed.y = 0;
      this.pos.y = gameHeight - this.size.y;
    } else {
      this.pos = newPos;
    }
  }

  act(step, keys) {
    this.moveY(step, keys);
    if ((keys.up || keys.space) && this.speed.y == 0) {
      this.speed.y = -jumpSpeed;
    }
  }
}

class Enemy {
  constructor(pos) {
    this.pos = pos;
    this.size = new Vector(2, 2);
    this.speed = new Vector(-2 * gameSpeed, 0);  // Multiplier par gameSpeed
  }

  act(step) {
    const motion = this.speed.times(step);
    this.pos = this.pos.plus(motion);
  }
}

let gravity = 80;
let jumpSpeed = 28;
const gameHeight = 400 / 15;
let gameSpeed = 10;  // Vitesse du jeu, ajustez cette valeur pour changer la vitesse
let score = 0;  // Variable pour suivre le score
let backgroundPosition = 0; // Position du background pour l'animation
let nbEnemiesAboveLine = 0;

const player = new Player(new Vector(1, gameHeight));
const enemies = [];
let lastEnemyTime = 0;
let jumpPressed = false;  // Variable pour suivre l'état du bouton de saut

const keys = trackKeys({ 38: 'up', 32: 'space' });

function trackKeys(codes) {
  const pressed = Object.create(null);
  function handler(event) {
    if (codes.hasOwnProperty(event.keyCode)) {
      const down = event.type == 'keydown';
      pressed[codes[event.keyCode]] = down;
      event.preventDefault();
    }
  }
  addEventListener('keydown', handler);
  addEventListener('keyup', handler);
  return pressed;
}

function createEnemy(yAxe = null) {
    var i = Math.floor(Math.random() * 15);
    if (yAxe) {
        i = yAxe;
    }
    let pos = new Vector(100, i > 2 ? gameHeight - i : gameHeight - 2);
    nbEnemiesAboveLine += i > 3 ? 1 : 0;
    enemies.push(new Enemy(pos));
}

function runAnimation(frameFunc) {
  let lastTime = null;
  function frame(time) {
    let stop = false;
    if (lastTime != null) {
      const timeStep = Math.min(time - lastTime, 100) / 1000;
      stop = frameFunc(timeStep) === false;
    }
    lastTime = time;
    if (!stop) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function update(step) {
  // Mettre à jour l'état du saut en fonction de la variable jumpPressed
  keys.up = jumpPressed;

  player.act(step, keys);

  if (Math.random() < 0.10 && Date.now() - lastEnemyTime > 650) {
    createEnemy();
    lastEnemyTime = Date.now();
  }

  if (nbEnemiesAboveLine > 3) {
    createEnemy(2);
    nbEnemiesAboveLine = 0;
  }

  enemies.forEach((enemy, index) => {
    enemy.act(step);
    if (enemy.pos.x < -1) {
      enemies.splice(index, 1);
      score += 50 * gameSpeed / 20;
    }
  });

  score += gameSpeed / 60;
  console.log('score', Math.floor(score))
  if (checkCollision(player, enemies)) {
    alert(`Vous avez été touché par un ennemi ! Votre score: ${Math.floor(score)}`);
    resetGame();
  }

  draw();
}

function draw() {
  const game = document.querySelector('.game');
  game.innerHTML = '';

  // Mettre à jour la position de l'arrière-plan
  backgroundPosition -= gameSpeed / 10;
  game.style.backgroundPositionX = `${backgroundPosition}px`;

  const playerElem = document.createElement('div');
  playerElem.className = 'player';
  playerElem.style.left = player.pos.x * 15 + 'px';
  playerElem.style.top = player.pos.y * 15 + 'px';
  playerElem.style.width = player.size.x * 15 + 'px';
  playerElem.style.height = player.size.y * 15 + 'px';

  game.appendChild(playerElem);

  // Calculer dynamiquement la hauteur du sol
  const groundHeight = game.offsetHeight * 0.42; // Par exemple, 10% de la hauteur du jeu
  const groundElem = document.createElement('div');
  groundElem.className = 'ground';
  groundElem.style.height = `${groundHeight - 4}px`;
  groundElem.style.bottom = '0px';
  game.appendChild(groundElem);

  enemies.forEach((enemy) => {
    const enemyElem = document.createElement('div');
    enemyElem.className = 'enemy';
    enemyElem.style.left = enemy.pos.x * 15 + 'px';
    enemyElem.style.top = enemy.pos.y * 15 + 'px';
    enemyElem.style.width = enemy.size.x * 15 + 'px';
    enemyElem.style.height = enemy.size.y * 15 + 'px';
    game.appendChild(enemyElem);
  });

  // Afficher le score
  const scoreElem = document.createElement('div');
  scoreElem.className = 'score';
  scoreElem.textContent = `Score: ${Math.floor(score)}`;
  game.appendChild(scoreElem);
}

function checkCollision(player, enemies) {
  for (const enemy of enemies) {
    if (
      player.pos.x < enemy.pos.x + enemy.size.x &&
      player.pos.x + player.size.x > enemy.pos.x &&
      player.pos.y < enemy.pos.y + enemy.size.y &&
      player.pos.y + player.size.y > enemy.pos.y
    ) {
      return true;
    }
  }
  return false;
}

function resetGame() {
  // Réinitialiser le jeu
  player.pos = new Vector(1, gameHeight - 2);
  enemies.length = 0;
  lastEnemyTime = 0;
  score = 0; // Réinitialiser le score
}

function pollGamepads() {
  const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
  
  jumpPressed = false; // Réinitialiser l'état du saut à chaque frame

  for (let i = 0; i < gamepads.length; i++) {
    const gp = gamepads[i];
    if (gp) {
      for (let j = 0; j < gp.buttons.length; j++) {
        if (gp.buttons[j].pressed) {
          jumpPressed = true; // Enregistrer que le bouton de saut est pressé
          console.log(`Gamepad button pressed: Button ${j} on gamepad ${gp.index}`);
        }
      }
      const axisValue = gp.axes[0];
      if (Math.abs(axisValue) > 0.1) {
        gravity = transformAxisValue(axisValue);
      }
    }
  }

  requestAnimationFrame(pollGamepads);
}

function transformAxisValue(axisValue) {
  const minInput = -1;
  const maxInput = -0.75;
  const minOutput = 25;
  const maxOutput = 100;

  // Apply the linear transformation formula
  const newValue =
    minOutput +
    ((axisValue - minInput) / (maxInput - minInput)) * (maxOutput - minOutput);
  console.log('newValue', newValue)
  return newValue;
}

pollGamepads(); // Démarrer la surveillance des manettes

runAnimation(update);
