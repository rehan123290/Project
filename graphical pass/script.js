const grid = document.getElementById('grid');
const submitBtn = document.getElementById('submit-btn');
const message = document.getElementById('message');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const attemptsDisplay = document.getElementById('attempts');

const GRID_SIZE = 3;
let selectedCells = [];
let mode = 'auth'; // 'auth' for login, 'set' for register
let attempts = 0;

function renderGrid() {
    grid.innerHTML = '';
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
        const cell = document.createElement('div');
        cell.classList.add('grid-cell');
        cell.dataset.index = i;
        cell.addEventListener('click', () => toggleCell(i, cell));
        grid.appendChild(cell);
    }
}

function toggleCell(index, cell) {
    if (selectedCells.includes(index)) {
        selectedCells = selectedCells.filter(i => i !== index);
        cell.classList.remove('selected');
    } else {
        selectedCells.push(index);
        cell.classList.add('selected');
    }
}

function clearSelection() {
    selectedCells = [];
    document.querySelectorAll('.grid-cell').forEach(cell => cell.classList.remove('selected'));
}

function savePassword() {
    if (selectedCells.length < 3) {
        message.style.color = '#e11d48';
        message.textContent = 'Select at least 3 cells for your password.';
        return;
    }
    localStorage.setItem('graphicalPassword', JSON.stringify(selectedCells));
    message.style.color = '#22c55e';
    message.textContent = 'Password set! You can now login.';
    attempts = 0;
    updateAttempts();
    switchMode('auth');
    clearSelection();
}

function authenticate() {
    const stored = JSON.parse(localStorage.getItem('graphicalPassword') || '[]');
    if (selectedCells.length === 0) {
        message.style.color = '#e11d48';
        message.textContent = 'Select your password pattern.';
        return;
    }
    attempts++;
    updateAttempts();
    if (JSON.stringify(stored) === JSON.stringify(selectedCells)) {
        message.style.color = '#22c55e';
        message.textContent = `Authentication successful! Attempts: ${attempts}`;
    } else {
        message.style.color = '#e11d48';
        message.textContent = 'Authentication failed. Try again.';
    }
    clearSelection();
}

function updateAttempts() {
    if (mode === 'auth') {
        attemptsDisplay.textContent = `Attempts: ${attempts}`;
    } else {
        attemptsDisplay.textContent = '';
    }
}

function switchMode(newMode) {
    mode = newMode;
    clearSelection();
    if (mode === 'auth') {
        loginBtn.classList.add('active');
        registerBtn.classList.remove('active');
        message.style.color = '#333';
        message.textContent = 'Enter your graphical password.';
        updateAttempts();
    } else {
        registerBtn.classList.add('active');
        loginBtn.classList.remove('active');
        message.style.color = '#333';
        message.textContent = 'Set your graphical password.';
        attempts = 0;
        updateAttempts();
    }
}

submitBtn.addEventListener('click', () => {
    if (mode === 'set') {
        savePassword();
    } else {
        authenticate();
    }
});

loginBtn.addEventListener('click', () => {
    switchMode('auth');
});

registerBtn.addEventListener('click', () => {
    switchMode('set');
});

function init() {
    renderGrid();
    if (localStorage.getItem('graphicalPassword')) {
        switchMode('auth');
    } else {
        switchMode('set');
    }
}

init(); 