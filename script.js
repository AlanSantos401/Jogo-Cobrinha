const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{ x: 10, y: 10 }];
let direction = { x: 0, y: 0 };
let food = { x: 5, y: 5 };
let obstacles = [];
let gameOver = false;

let speed = 300;
let score = 0;
let highScore = parseInt(localStorage.getItem("snakeHighScore")) || 0;
let pulseSize = gridSize / 2;
let pulseDirection = 1;

function gameLoop() {
	if (gameOver) return;

	const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
	snake.unshift(head);

	if (head.x === food.x && head.y === food.y) {
		placeFood();
		score++;

		if (score > highScore) {
			highScore = score;
			localStorage.setItem("snakeHighScore", highScore);
		  }
		  

		if (score > highScore) {
			highScore = score;
		}

		if (score % 10 === 0) {
			placeObstacle();
		}

		if (speed > 100) speed -= 5;
	} else {
		snake.pop();
	}

	if (
		head.x < 0 ||
		head.x >= tileCount ||
		head.y < 0 ||
		head.y >= tileCount ||
		obstacles.some((obs) => obs.x === head.x && obs.y === head.y) ||
		snake
			.slice(1)
			.some((segment) => segment.x === head.x && segment.y === head.y)
	) {
		gameOver = true;
		document.getElementById("finalScore").textContent = "Pontuação: " + score;
		document.getElementById("gameOverMessage").classList.remove("hidden");

		return;
	}

	drawGame();
	setTimeout(gameLoop, speed);
}

function drawGame() {
	for (let x = 0; x < tileCount; x++) {
		for (let y = 0; y < tileCount; y++) {
			ctx.fillStyle = (x + y) % 2 === 0 ? "#0a4d0a" : "#0f660f";
			ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
		}
	}

	ctx.strokeStyle = "#0066cc";
	const bodyWidth = gridSize / 1.8;
	ctx.lineCap = "round";
	ctx.lineJoin = "round";
	ctx.lineWidth = bodyWidth;

	for (let i = 0; i < snake.length - 1; i++) {
		const current = snake[i];
		const next = snake[i + 1];

		const x1 = current.x * gridSize + gridSize / 2;
		const y1 = current.y * gridSize + gridSize / 2;
		const x2 = next.x * gridSize + gridSize / 2;
		const y2 = next.y * gridSize + gridSize / 2;

		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.stroke();

		const midX = (x1 + x2) / 2;
		const midY = (y1 + y2) / 2;
		ctx.fillStyle = "#3399ff";
		ctx.beginPath();
		ctx.moveTo(midX, midY - 2);
		ctx.lineTo(midX + 2, midY);
		ctx.lineTo(midX, midY + 2);
		ctx.lineTo(midX - 2, midY);
		ctx.closePath();
		ctx.fill();
	}

	const head = snake[0];
	const headX = head.x * gridSize + gridSize / 2;
	const headY = head.y * gridSize + gridSize / 2;
	const headRadius = gridSize / 2.3;

	let angle = 0;
	if (direction.x === 1) angle = Math.PI / 2;
	else if (direction.x === -1) angle = -Math.PI / 2;
	else if (direction.y === -1) angle = 0;
	else if (direction.y === 1) angle = Math.PI;

	ctx.save();
	ctx.translate(headX, headY);
	ctx.rotate(angle);

	ctx.fillStyle = "#0066cc";
	ctx.beginPath();
	ctx.arc(0, 0, headRadius, 0, Math.PI * 2);
	ctx.fill();

	ctx.fillStyle = "black";
	ctx.beginPath();
	ctx.arc(-4, -4, 2, 0, Math.PI * 2);
	ctx.arc(4, -4, 2, 0, Math.PI * 2);
	ctx.fill();

	const tongueLength = gridSize * 0.2;
	const tongueStartY = -gridSize / 2.3;
	ctx.strokeStyle = "#FF4444";
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(0, tongueStartY);
	ctx.lineTo(0, tongueStartY - tongueLength);
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(0, tongueStartY - tongueLength);
	ctx.lineTo(-1.5, tongueStartY - tongueLength - 2);
	ctx.moveTo(0, tongueStartY - tongueLength);
	ctx.lineTo(1.5, tongueStartY - tongueLength - 2);
	ctx.stroke();

	ctx.restore();

	ctx.fillStyle = "red";
	ctx.beginPath();
	ctx.arc(
		food.x * gridSize + gridSize / 2,
		food.y * gridSize + gridSize / 2,
		pulseSize,
		0,
		Math.PI * 2,
	);
	ctx.fill();

	pulseSize += pulseDirection * 0.3;
	if (pulseSize >= gridSize / 2) pulseDirection = -1;
	if (pulseSize <= gridSize / 3) pulseDirection = 1;

	ctx.fillStyle = "white";
	ctx.font = "16px Arial";
	ctx.fillText("Score: " + score, 10, 20);

	ctx.fillStyle = "white";
	ctx.font = "14px Arial";
	ctx.fillText("Recorde: " + highScore, 10, 40);

	obstacles.forEach((obs) => {
		const x = obs.x * gridSize;
		const y = obs.y * gridSize;

		ctx.fillStyle = "#7b4a2f";
		ctx.fillRect(x, y, gridSize, gridSize);

		ctx.fillStyle = "#5c3523";
		ctx.beginPath();
		ctx.moveTo(x, y + gridSize);
		ctx.lineTo(x, y + gridSize - 4);
		ctx.lineTo(x + gridSize - 4, y + gridSize);
		ctx.closePath();
		ctx.fill();

		ctx.fillStyle = "#a77b5d";
		ctx.fillRect(x + 2, y + 2, gridSize - 4, gridSize - 4);
	});
}

function placeFood() {
	let newFood;
	do {
		newFood = {
			x: Math.floor(Math.random() * tileCount),
			y: Math.floor(Math.random() * tileCount),
		};
	} while (
		snake.some((s) => s.x === newFood.x && s.y === newFood.y) ||
		obstacles.some((obs) => obs.x === newFood.x && obs.y === newFood.y)
	);
	food = newFood;
}

function placeObstacle() {
	let newObstacle;
	do {
		newObstacle = {
			x: Math.floor(Math.random() * tileCount),
			y: Math.floor(Math.random() * tileCount),
		};
	} while (
		snake.some((s) => s.x === newObstacle.x && s.y === newObstacle.y) ||
		(food.x === newObstacle.x && food.y === newObstacle.y)
	);
	obstacles.push(newObstacle);
}

function resetGame() {
	snake = [{ x: 10, y: 10 }];
	direction = { x: 0, y: 0 };
	food = { x: 5, y: 5 };
	speed = 300;
	score = 0;
	gameOver = false;
	obstacles = [];
	setTimeout(gameLoop, speed);

	document.getElementById("gameOverMessage").classList.add("hidden");
}

document.addEventListener("keydown", (e) => {
	const keysToPrevent = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "];
	if (keysToPrevent.includes(e.key)) {
		e.preventDefault();
	}

	switch (e.key) {
		case "ArrowUp":
			if (direction.y === 0) direction = { x: 0, y: -1 };
			break;
		case "ArrowDown":
			if (direction.y === 0) direction = { x: 0, y: 1 };
			break;
		case "ArrowLeft":
			if (direction.x === 0) direction = { x: -1, y: 0 };
			break;
		case "ArrowRight":
			if (direction.x === 0) direction = { x: 1, y: 0 };
			break;
		case "Enter":
			if (gameOver) resetGame();
			break;
	}
}, { passive: false }); 


setTimeout(gameLoop, speed);

document.getElementById("up").addEventListener("click", () => {
	if (direction.y === 0) direction = { x: 0, y: -1 };
});
document.getElementById("down").addEventListener("click", () => {
	if (direction.y === 0) direction = { x: 0, y: 1 };
});
document.getElementById("left").addEventListener("click", () => {
	if (direction.x === 0) direction = { x: -1, y: 0 };
});
document.getElementById("right").addEventListener("click", () => {
	if (direction.x === 0) direction = { x: 1, y: 0 };
});
