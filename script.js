// Game State
let currentLevel = 1;
let score = 0;
let achievements = 0;

// Balloon Game State
let balloonsPopped = 0;
let balloonInterval;

// Catcher Game State
let caughtItems = 0;
let lives = 3;
let catcherX = 50;
let fallingInterval;

// Memory Game State
let memoryCards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let canFlip = true;

// Wish Game State
let wishesCollected = 0;
let wishInterval;

// Boss Game State
let bossHealth = 100;
let candlesBlown = 0;

// Initialize Game
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    updateHUD();
});

// Particle Canvas Animation
function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            size: Math.random() * 3 + 1
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(0, 255, 255, 0.5)';

        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });

        requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// Update HUD
function updateHUD() {
    document.getElementById('level').textContent = currentLevel;
    document.getElementById('score').textContent = score;
    document.getElementById('achievements').textContent = `${achievements}/5`;

    const progress = (currentLevel / 7) * 100;
    document.getElementById('progressBar').style.width = `${progress}%`;
}

// Start Game
function startGame() {
    currentLevel = 2;
    updateHUD();
    goToLevel(2);
    playSound();
    initBalloonGame();
}

// Navigate Levels
function goToLevel(levelNum) {
    const levels = document.querySelectorAll('.level');
    levels.forEach(level => level.classList.remove('active'));

    const targetLevel = document.getElementById(`level${levelNum}`);
    targetLevel.classList.add('active');

    createLevelTransition();
}

// Complete Level
function completeLevel(levelNum) {
    score += 1000;
    achievements++;
    currentLevel = levelNum + 1;
    updateHUD();

    createExplosion();
    playSound();

    setTimeout(() => {
        if (levelNum === 2) {
            goToLevel(3);
            initCatcherGame();
        } else if (levelNum === 3) {
            goToLevel(4);
            initMemoryGame();
        } else if (levelNum === 4) {
            goToLevel(5);
            initWishGame();
        } else if (levelNum === 5) {
            goToLevel(6);
            initBossGame();
        } else if (levelNum === 6) {
            goToLevel(7);
            showVictory();
        }
    }, 1000);
}

// === BALLOON GAME ===
function initBalloonGame() {
    balloonsPopped = 0;
    const gameArea = document.getElementById('balloonGame');
    gameArea.innerHTML = '';

    balloonInterval = setInterval(() => {
        if (balloonsPopped < 10) {
            createBalloon();
        } else {
            clearInterval(balloonInterval);
        }
    }, 1000);
}

function createBalloon() {
    const balloons = ['🎈', '🎀', '🎁', '🎊', '🎉'];
    const balloon = document.createElement('div');
    balloon.className = 'balloon';
    balloon.textContent = balloons[Math.floor(Math.random() * balloons.length)];
    balloon.style.left = Math.random() * 80 + '%';
    balloon.style.bottom = '-50px';

    balloon.addEventListener('click', () => {
        popBalloon(balloon);
    });

    document.getElementById('balloonGame').appendChild(balloon);

    setTimeout(() => {
        if (balloon.parentNode) {
            balloon.remove();
        }
    }, 4000);
}

function popBalloon(balloon) {
    balloonsPopped++;
    score += 100;
    updateHUD();

    document.getElementById('balloonCount').textContent = `Balloons: ${balloonsPopped}/10`;

    balloon.style.transform = 'scale(2)';
    balloon.style.opacity = '0';

    setTimeout(() => balloon.remove(), 300);

    if (balloonsPopped >= 10) {
        clearInterval(balloonInterval);
        document.getElementById('nextLevel2').style.display = 'inline-block';
        createExplosion();
    }
}

// === CATCHER GAME ===
function initCatcherGame() {
    caughtItems = 0;
    lives = 3;
    catcherX = 50;

    const gameArea = document.getElementById('catcherGame');
    const catcher = document.getElementById('catcher');

    document.getElementById('caughtCount').textContent = '0';
    document.getElementById('livesCount').textContent = '❤️❤️❤️';

    gameArea.addEventListener('mousemove', (e) => {
        const rect = gameArea.getBoundingClientRect();
        catcherX = ((e.clientX - rect.left) / rect.width) * 100;
        catcher.style.left = Math.max(0, Math.min(95, catcherX)) + '%';
    });

    fallingInterval = setInterval(() => {
        if (caughtItems < 15 && lives > 0) {
            createFallingItem();
        } else if (caughtItems >= 15 || lives <= 0) {
            clearInterval(fallingInterval);
            if (caughtItems >= 15) {
                document.getElementById('nextLevel3').style.display = 'inline-block';
            }
        }
    }, 1500);
}

function createFallingItem() {
    const goodItems = ['🎂', '🍰', '🧁', '🍪', '🍩', '🎁'];
    const badItems = ['💣', '☠️'];
    const isBad = Math.random() < 0.2;
    const items = isBad ? badItems : goodItems;

    const item = document.createElement('div');
    item.className = 'falling-item';
    item.textContent = items[Math.floor(Math.random() * items.length)];
    item.dataset.bad = isBad;
    item.style.left = Math.random() * 90 + '%';
    item.style.top = '-50px';

    document.getElementById('catcherGame').appendChild(item);

    const checkCollision = setInterval(() => {
        const itemRect = item.getBoundingClientRect();
        const catcher = document.getElementById('catcher');
        const catcherRect = catcher.getBoundingClientRect();

        if (itemRect.bottom >= catcherRect.top &&
            itemRect.left < catcherRect.right &&
            itemRect.right > catcherRect.left) {

            clearInterval(checkCollision);

            if (item.dataset.bad === 'true') {
                lives--;
                document.getElementById('livesCount').textContent = '❤️'.repeat(lives);
                if (lives <= 0) {
                    clearInterval(fallingInterval);
                    setTimeout(() => {
                        alert('Game Over! But you can still continue to the next level! 🎮');
                        document.getElementById('nextLevel3').style.display = 'inline-block';
                    }, 500);
                }
            } else {
                caughtItems++;
                score += 50;
                updateHUD();
                document.getElementById('caughtCount').textContent = caughtItems;
            }

            item.remove();
        }
    }, 50);

    setTimeout(() => {
        clearInterval(checkCollision);
        if (item.parentNode) item.remove();
    }, 3000);
}

// === MEMORY GAME ===
function initMemoryGame() {
    const emojis = ['🎂', '🎈', '🎁', '🎉', '🎊', '🎀', '⭐', '🌟'];
    const cardEmojis = [...emojis, ...emojis];
    cardEmojis.sort(() => Math.random() - 0.5);

    memoryCards = [];
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    canFlip = true;

    const grid = document.getElementById('memoryGrid');
    grid.innerHTML = '';

    cardEmojis.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.emoji = emoji;
        card.dataset.index = index;
        card.textContent = '?';

        card.addEventListener('click', () => flipCard(card));

        grid.appendChild(card);
        memoryCards.push(card);
    });

    document.getElementById('moves').textContent = '0';
    document.getElementById('pairs').textContent = '0/8';
}

function flipCard(card) {
    if (!canFlip || card.classList.contains('flipped') || card.classList.contains('matched')) {
        return;
    }

    card.classList.add('flipped');
    card.textContent = card.dataset.emoji;
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        canFlip = false;
        moves++;
        document.getElementById('moves').textContent = moves;

        setTimeout(() => checkMatch(), 800);
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;

    if (card1.dataset.emoji === card2.dataset.emoji) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        matchedPairs++;
        score += 200;
        updateHUD();

        document.getElementById('pairs').textContent = `${matchedPairs}/8`;

        if (matchedPairs === 8) {
            document.getElementById('nextLevel4').style.display = 'inline-block';
            createExplosion();
        }
    } else {
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
        card1.textContent = '?';
        card2.textContent = '?';
    }

    flippedCards = [];
    canFlip = true;
}

// === WISH COLLECTION GAME ===
function initWishGame() {
    wishesCollected = 0;
    const gameArea = document.getElementById('wishGame');
    gameArea.innerHTML = '';

    wishInterval = setInterval(() => {
        if (wishesCollected < 20) {
            createWish();
        } else {
            clearInterval(wishInterval);
        }
    }, 800);
}

function createWish() {
    const wishes = ['⭐', '✨', '🌟', '💫', '🌠'];
    const wish = document.createElement('div');
    wish.className = 'wish-item';
    wish.textContent = wishes[Math.floor(Math.random() * wishes.length)];
    wish.style.left = Math.random() * 85 + '%';
    wish.style.top = Math.random() * 80 + '%';
    wish.style.animationDelay = Math.random() * 2 + 's';

    wish.addEventListener('click', () => {
        collectWish(wish);
    });

    document.getElementById('wishGame').appendChild(wish);

    setTimeout(() => {
        if (wish.parentNode) wish.remove();
    }, 3000);
}

function collectWish(wish) {
    wishesCollected++;
    score += 75;
    updateHUD();

    document.getElementById('wishCount').textContent = `Wishes: ${wishesCollected}/20`;

    wish.style.transform = 'scale(2) rotate(720deg)';
    wish.style.opacity = '0';

    setTimeout(() => wish.remove(), 500);

    if (wishesCollected >= 20) {
        clearInterval(wishInterval);
        document.getElementById('nextLevel5').style.display = 'inline-block';
        createExplosion();
    }
}

// === BOSS BATTLE ===
function initBossGame() {
    bossHealth = 100;
    candlesBlown = 0;

    const gameArea = document.getElementById('candleGame');
    gameArea.innerHTML = '<img src="https://media.giphy.com/media/l0HlDtKDqfGwzBNqU/giphy.gif" alt="Balloons" class="boss-decoration">';

    document.getElementById('bossHealth').style.width = '100%';
    document.getElementById('healthValue').textContent = '100';

    for (let i = 0; i < 10; i++) {
        createBossCandle();
    }
}

function createBossCandle() {
    const candle = document.createElement('div');
    candle.className = 'boss-candle';
    candle.textContent = '🕯️';

    candle.addEventListener('click', () => {
        blowBossCandle(candle);
    });

    document.getElementById('candleGame').appendChild(candle);
}

function blowBossCandle(candle) {
    if (candle.classList.contains('blown')) return;

    candle.classList.add('blown');
    candlesBlown++;
    bossHealth -= 10;
    score += 150;
    updateHUD();

    document.getElementById('bossHealth').style.width = bossHealth + '%';
    document.getElementById('healthValue').textContent = bossHealth;

    setTimeout(() => candle.remove(), 500);

    if (bossHealth <= 0) {
        document.getElementById('nextLevel6').style.display = 'inline-block';
        createMegaExplosion();
    }
}

// === VICTORY ===
function showVictory() {
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalAchievements').textContent = '5/5';
    createMegaExplosion();
}

// === UTILITY FUNCTIONS ===
function createExplosion() {
    const emojis = ['🎉', '🎊', '✨', '⭐', '💫', '🎈'];

    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const explosion = document.createElement('div');
            explosion.style.position = 'fixed';
            explosion.style.left = Math.random() * 100 + '%';
            explosion.style.top = Math.random() * 100 + '%';
            explosion.style.fontSize = '3em';
            explosion.style.zIndex = '10000';
            explosion.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            explosion.style.pointerEvents = 'none';

            document.body.appendChild(explosion);

            explosion.animate([
                { transform: 'scale(0) rotate(0deg)', opacity: 1 },
                { transform: 'scale(2) rotate(360deg)', opacity: 0 }
            ], {
                duration: 1000,
                easing: 'ease-out'
            });

            setTimeout(() => explosion.remove(), 1000);
        }, i * 50);
    }
}

function createMegaExplosion() {
    const emojis = ['🎉', '🎊', '✨', '⭐', '💫', '🎈', '🎀', '🎁', '🌟', '🔥'];

    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const explosion = document.createElement('div');
            explosion.style.position = 'fixed';
            explosion.style.left = Math.random() * 100 + '%';
            explosion.style.top = Math.random() * 100 + '%';
            explosion.style.fontSize = Math.random() * 3 + 2 + 'em';
            explosion.style.zIndex = '10000';
            explosion.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            explosion.style.pointerEvents = 'none';

            document.body.appendChild(explosion);

            explosion.animate([
                { transform: 'scale(0) rotate(0deg)', opacity: 1 },
                { transform: `scale(${Math.random() * 2 + 1}) rotate(${Math.random() * 720}deg)`, opacity: 0 }
            ], {
                duration: Math.random() * 1000 + 1000,
                easing: 'ease-out'
            });

            setTimeout(() => explosion.remove(), 2000);
        }, i * 30);
    }
}

function createLevelTransition() {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.background = 'rgba(0, 255, 255, 0.3)';
    overlay.style.zIndex = '9999';
    overlay.style.pointerEvents = 'none';

    document.body.appendChild(overlay);

    overlay.animate([
        { opacity: 0 },
        { opacity: 1 },
        { opacity: 0 }
    ], {
        duration: 800,
        easing: 'ease-in-out'
    });

    setTimeout(() => overlay.remove(), 800);
}

function playSound() {
    // Sound effect placeholder - can add Web Audio API sounds
    console.log('🎮 LEVEL UP!');
}

function restartGame() {
    currentLevel = 1;
    score = 0;
    achievements = 0;
    updateHUD();
    goToLevel(1);
}
