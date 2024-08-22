const gemTypes = ['redgem.png', 'greengem.png', 'bluegem.png', 'berry.png', 'cherry.png', 'fruit.png', 'dog.png', 'fish.png'];
const boardWidth = 7;
const boardHeight = 10;
let score = 0;
let selectedGem = null;
let isDragging = false;
let startPos = { row: -1, col: -1 };

function createBoard() {
    const board = document.getElementById('game-board');
    board.innerHTML = '';

    for (let row = 0; row < boardHeight; row++) {
        for (let col = 0; col < boardWidth; col++) {
            const gem = document.createElement('div');
            gem.classList.add('gem', 'falling');
            gem.setAttribute('data-row', row);
            gem.setAttribute('data-col', col);
            gem.style.backgroundImage = `url(${getRandomGem()})`;
            gem.addEventListener('mousedown', handleMouseDown);
            gem.addEventListener('touchstart', handleTouchStart);
            board.appendChild(gem);
        }
    }

    setTimeout(() => {
        checkMatches();
    }, 500);
}

function getRandomGem() {
    const randomIndex = Math.floor(Math.random() * gemTypes.length);
    return gemTypes[randomIndex];
}

function handleMouseDown(event) {
    const gem = event.currentTarget;
    startPos.row = parseInt(gem.getAttribute('data-row'));
    startPos.col = parseInt(gem.getAttribute('data-col'));
    isDragging = true;
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
}

function handleTouchStart(event) {
    const gem = event.currentTarget;
    startPos.row = parseInt(gem.getAttribute('data-row'));
    startPos.col = parseInt(gem.getAttribute('data-col'));
    isDragging = true;
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
}

function handleMouseMove(event) {
    if (isDragging) {
        const board = document.getElementById('game-board');
        const rect = board.getBoundingClientRect();
        const col = Math.floor((event.clientX - rect.left) / 65);
        const row = Math.floor((event.clientY - rect.top) / 65);
        if (Math.abs(startPos.row - row) + Math.abs(startPos.col - col) === 1) {
            swapGems(startPos.row, startPos.col, row, col);
            isDragging = false;
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
    }
}

function handleTouchMove(event) {
    if (isDragging) {
        const board = document.getElementById('game-board');
        const rect = board.getBoundingClientRect();
        const col = Math.floor((event.touches[0].clientX - rect.left) / 65);
        const row = Math.floor((event.touches[0].clientY - rect.top) / 65);
        if (Math.abs(startPos.row - row) + Math.abs(startPos.col - col) === 1) {
            swapGems(startPos.row, startPos.col, row, col);
            isDragging = false;
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        }
    }
}

function handleMouseUp() {
    isDragging = false;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
}

function handleTouchEnd() {
    isDragging = false;
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', handleTouchEnd);
}

function swapGems(row1, col1, row2, col2) {
    const board = document.getElementById('game-board');
    const gems = Array.from(board.children);
    const gem1 = gems[row1 * boardWidth + col1];
    const gem2 = gems[row2 * boardWidth + col2];

    const tempTransform = gem1.style.transform;
    gem1.style.transform = `translate(${gem2.offsetLeft - gem1.offsetLeft}px, ${gem2.offsetTop - gem1.offsetTop}px)`;
    gem2.style.transform = `translate(${gem1.offsetLeft - gem2.offsetLeft}px, ${gem1.offsetTop - gem2.offsetTop}px)`;

    setTimeout(() => {
        const tempBackgroundImage = gem1.style.backgroundImage;
        gem1.style.backgroundImage = gem2.style.backgroundImage;
        gem2.style.backgroundImage = tempBackgroundImage;
        gem1.style.transform = '';
        gem2.style.transform = '';

        checkMatches();
    }, 200);
}

function checkMatches() {
    const board = document.getElementById('game-board');
    const gems = Array.from(board.children);
    const matches = [];
    const matches4 = [];

    // Check rows
    for (let row = 0; row < boardHeight; row++) {
        for (let col = 0; col <= boardWidth - 3; col++) {
            const index = row * boardWidth + col;
            if (gems[index].style.backgroundImage === gems[index + 1].style.backgroundImage &&
                gems[index].style.backgroundImage === gems[index + 2].style.backgroundImage) {
                matches.push(index, index + 1, index + 2);
                col += 2; // Skip the next 2 columns
            }
        }
    }

    // Check columns
    for (let col = 0; col < boardWidth; col++) {
        for (let row = 0; row <= boardHeight - 3; row++) {
            const index = row * boardWidth + col;
            if (gems[index].style.backgroundImage === gems[index + boardWidth].style.backgroundImage &&
                gems[index].style.backgroundImage === gems[index + 2 * boardWidth].style.backgroundImage) {
                matches.push(index, index + boardWidth, index + 2 * boardWidth);
                row += 2; // Skip the next 2 rows
            }
        }
    }

    // Check for matches of 4 or more
    for (let row = 0; row < boardHeight; row++) {
        for (let col = 0; col <= boardWidth - 4; col++) {
            const index = row * boardWidth + col;
            if (gems[index].style.backgroundImage === gems[index + 1].style.backgroundImage &&
                gems[index].style.backgroundImage === gems[index + 2].style.backgroundImage &&
                gems[index].style.backgroundImage === gems[index + 3].style.backgroundImage) {
                matches4.push(index, index + 1, index + 2, index + 3);
                col += 3; // Skip the next 3 columns
            }
        }
    }

    for (let col = 0; col < boardWidth; col++) {
        for (let row = 0; row <= boardHeight - 4; row++) {
            const index = row * boardWidth + col;
            if (gems[index].style.backgroundImage === gems[index + boardWidth].style.backgroundImage &&
                gems[index].style.backgroundImage === gems[index + 2 * boardWidth].style.backgroundImage &&
                gems[index].style.backgroundImage === gems[index + 3 * boardWidth].style.backgroundImage) {
                matches4.push(index, index + boardWidth, index + 2 * boardWidth, index + 3 * boardWidth);
                row += 3; // Skip the next 3 rows
            }
        }
    }

    if (matches4.length > 0) {
        removeMatches(matches4, true);
    } else if (matches.length > 0) {
        removeMatches(matches, false);
    }
}

function removeMatches(matches, isLargeMatch) {
    const board = document.getElementById('game-board');
    const gems = Array.from(board.children);

    matches.forEach(index => {
        const gem = gems[index];
        const explosion = document.createElement('div');
        explosion.classList.add(isLargeMatch ? 'large-explosion' : 'explosion');
        explosion.style.left = `${gem.offsetLeft}px`;
        explosion.style.top = `${gem.offsetTop}px`;
        board.appendChild(explosion);

        setTimeout(() => {
            board.removeChild(explosion);
            gem.style.backgroundImage = '';
        }, 500);
    });

    score += isLargeMatch ? matches.length * 3 : matches.length;
    document.getElementById('score-display').textContent = `Score: ${score}`;
    document.getElementById('score-display').style.animation = 'none';
    setTimeout(() => {
        document.getElementById('score-display').style.animation = '';
    }, 10);

    setTimeout(() => {
        shiftGemsDown();
    }, 500);
}

function shiftGemsDown() {
    const board = document.getElementById('game-board');
    const gems = Array.from(board.children);

    for (let col = 0; col < boardWidth; col++) {
        let emptySpots = 0;
        for (let row = boardHeight - 1; row >= 0; row--) {
            const index = row * boardWidth + col;
            if (gems[index].style.backgroundImage === '') {
                emptySpots++;
            } else if (emptySpots > 0) {
                gems[index].classList.add('falling');
                gems[index].style.transform = `translateY(${emptySpots * 65}px)`;
                gems[index + emptySpots * boardWidth].style.backgroundImage = gems[index].style.backgroundImage;
                gems[index].style.backgroundImage = '';
                gems[index].classList.remove('falling');
                gems[index].style.transform = '';
            }
        }

        for (let row = 0; row < emptySpots; row++) {
            const gem = gems[row * boardWidth + col];
            gem.style.backgroundImage = `url(${getRandomGem()})`;
            gem.classList.add('falling');
            gem.style.transform = `translateY(-${(emptySpots - row) * 65}px)`;
            setTimeout(() => {
                gem.classList.remove('falling');
                gem.style.transform = '';
            }, 500);
        }
    }

    setTimeout(() => {
        checkMatches();
    }, 500);
}

function createFallingChip() {
    const chipsContainer = document.querySelector('.falling-chips');
    const chip = document.createElement('div');
    chip.classList.add('falling-chip');
    chip.style.left = `${Math.random() * 100}vw`;
    chipsContainer.appendChild(chip);

    setTimeout(() => {
        chipsContainer.removeChild(chip);
    }, 3000);
}

setInterval(() => {
    if (Math.random() < 0.3) {
        createFallingChip();
    }
}, 15000);

createBoard();