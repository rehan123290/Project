document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const registerBtn = document.getElementById('register-btn');
    const loginBtn = document.getElementById('login-btn');
    const gameModeBtn = document.getElementById('game-mode-btn');
    const usernameInput = document.getElementById('username');
    const gridContainer = document.querySelector('.grid-container');
    const patternInstruction = document.getElementById('pattern-instruction');
    const selectedImagesContainer = document.getElementById('selected-images');
    const clearBtn = document.getElementById('clear-btn');
    const submitBtn = document.getElementById('submit-btn');
    const messageContainer = document.getElementById('message-container');
    const themeButtons = document.querySelectorAll('.theme-btn');
    const difficultyContainer = document.getElementById('difficulty-container');
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    const enableAnimationsCheckbox = document.getElementById('enable-animations');
    const shuffleBtn = document.getElementById('shuffle-btn');
    const gameTimer = document.getElementById('game-timer');
    const timerValue = document.getElementById('timer-value');
    const hintBtn = document.getElementById('hint-btn');
    const hintsLeft = document.getElementById('hints-left');
    const achievementBanner = document.getElementById('achievement-banner');
    const achievementText = document.getElementById('achievement-text');
    const leaderboardContainer = document.getElementById('leaderboard-container');
    const leaderboardBody = document.getElementById('leaderboard-body');
    const confettiCanvas = document.getElementById('confetti-canvas');

    // State variables
    let isRegisterMode = true;
    let isGameMode = false;
    let selectedImages = [];
    let userAccounts = JSON.parse(localStorage.getItem('graphicalPasswords')) || {};
    let imageSet = [];
    let currentTheme = localStorage.getItem('theme') || 'default';
    let animationsEnabled = localStorage.getItem('animationsEnabled') !== 'false';
    let difficulty = localStorage.getItem('difficulty') || 'easy';
    let gameStartTime = 0;
    let gameTimerInterval = null;
    let hintsRemaining = 3;
    let achievements = JSON.parse(localStorage.getItem('achievements')) || {};
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    let patternToGuess = [];
    let currentLevel = 1;
    let streakCount = 0;
    let totalAttempts = 0;

    // Constants
    const MIN_PATTERN_LENGTH = 4;
    const MAX_PATTERN_LENGTH = 6;
    const TOTAL_IMAGES = 16;
    const DIFFICULTY_SETTINGS = {
        easy: { timeLimit: 60, imageCount: 12, patternLength: 4 },
        medium: { timeLimit: 45, imageCount: 16, patternLength: 5 },
        hard: { timeLimit: 30, imageCount: 20, patternLength: 6 }
    };
    
    // Achievement definitions
    const ACHIEVEMENTS = {
        firstLogin: { 
            id: 'firstLogin', 
            title: 'First Login!', 
            description: 'Successfully logged in for the first time',
            icon: 'fa-unlock'
        },
        speedyLogin: { 
            id: 'speedyLogin', 
            title: 'Lightning Fast!', 
            description: 'Logged in under 5 seconds',
            icon: 'fa-bolt'
        },
        patternMaster: { 
            id: 'patternMaster', 
            title: 'Pattern Master', 
            description: 'Created a 6-image pattern',
            icon: 'fa-crown'
        },
        themeExplorer: { 
            id: 'themeExplorer', 
            title: 'Theme Explorer', 
            description: 'Tried all available themes',
            icon: 'fa-palette'
        },
        gameWinner: { 
            id: 'gameWinner', 
            title: 'Game Winner', 
            description: 'Completed a game mode challenge',
            icon: 'fa-gamepad'
        },
        hardcoreGamer: { 
            id: 'hardcoreGamer', 
            title: 'Hardcore Gamer', 
            description: 'Completed hard difficulty',
            icon: 'fa-fire'
        },
        streakMaster: { 
            id: 'streakMaster', 
            title: 'Streak Master', 
            description: 'Achieved a 5-login streak',
            icon: 'fa-fire-flame-curved'
        }
    };

    // Initialize the application
    initApp();

    // Event Listeners
    registerBtn.addEventListener('click', () => switchMode('register'));
    loginBtn.addEventListener('click', () => switchMode('login'));
    gameModeBtn.addEventListener('click', () => switchMode('game'));
    clearBtn.addEventListener('click', clearSelection);
    submitBtn.addEventListener('click', handleSubmit);
    
    // Theme buttons
    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            setTheme(theme);
            
            // Check for theme explorer achievement
            const usedThemes = JSON.parse(localStorage.getItem('usedThemes')) || [];
            if (!usedThemes.includes(theme)) {
                usedThemes.push(theme);
                localStorage.setItem('usedThemes', JSON.stringify(usedThemes));
                
                if (usedThemes.length >= 4) { // All themes tried
                    unlockAchievement(ACHIEVEMENTS.themeExplorer);
                }
            }
        });
    });
    
    // Difficulty buttons
    difficultyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            difficultyButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            difficulty = btn.dataset.difficulty;
            localStorage.setItem('difficulty', difficulty);
            
            if (isGameMode) {
                resetGame();
            }
        });
    });
    
    // Animation toggle
    enableAnimationsCheckbox.addEventListener('change', () => {
        animationsEnabled = enableAnimationsCheckbox.checked;
        localStorage.setItem('animationsEnabled', animationsEnabled);
    });
    
    // Shuffle button
    shuffleBtn.addEventListener('click', () => {
        if (animationsEnabled) {
            document.querySelectorAll('.image-item').forEach(item => {
                item.classList.add('animate-shuffle');
                setTimeout(() => {
                    item.classList.remove('animate-shuffle');
                }, 500);
            });
        }
        generateImageGrid();
        clearSelection();
    });
    
    // Hint button
    hintBtn.addEventListener('click', () => {
        if (hintsRemaining > 0 && isGameMode) {
            hintsRemaining--;
            hintsLeft.textContent = `(${hintsRemaining} left)`;
            
            // Show hint by highlighting the next correct image
            const nextImageIndex = selectedImages.length;
            if (nextImageIndex < patternToGuess.length) {
                const correctImageId = patternToGuess[nextImageIndex];
                const imageElement = document.querySelector(`.image-item[data-id="${correctImageId}"]`);
                
                imageElement.classList.add('hint');
                setTimeout(() => {
                    imageElement.classList.remove('hint');
                }, 2000);
            }
            
            if (hintsRemaining === 0) {
                hintBtn.disabled = true;
            }
        }
    });

    // Functions
    function initApp() {
        // Set initial theme
        setTheme(currentTheme);
        
        // Set animation checkbox
        enableAnimationsCheckbox.checked = animationsEnabled;
        
        // Set active difficulty button
        document.querySelector(`.difficulty-btn[data-difficulty="${difficulty}"]`).classList.add('active');
        
        // Generate image grid
        generateImageGrid();
        
        // Update UI
        updateUI();
    }

    function generateImageGrid() {
        gridContainer.innerHTML = '';
        imageSet = [];
        
        // Determine number of images based on game mode and difficulty
        const totalImages = isGameMode ? DIFFICULTY_SETTINGS[difficulty].imageCount : TOTAL_IMAGES;
        
        // Generate a set of random images for the grid
        for (let i = 0; i < totalImages; i++) {
            // Generate a random color for each image
            const hue = Math.floor(Math.random() * 360);
            const saturation = 70 + Math.floor(Math.random() * 30);
            const lightness = 40 + Math.floor(Math.random() * 20);
            const backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
            
            // Create a unique pattern for each image
            const patternType = Math.floor(Math.random() * 5);
            let pattern;
            
            switch (patternType) {
                case 0:
                    pattern = createCirclePattern(hue);
                    break;
                case 1:
                    pattern = createSquarePattern(hue);
                    break;
                case 2:
                    pattern = createTrianglePattern(hue);
                    break;
                case 3:
                    pattern = createStarPattern(hue);
                    break;
                case 4:
                    pattern = createGridPattern(hue);
                    break;
            }
            
            // Store image data
            imageSet.push({
                id: i,
                backgroundColor,
                pattern
            });
            
            // Create image element
            const imageItem = document.createElement('div');
            imageItem.classList.add('image-item');
            if (animationsEnabled) {
                imageItem.classList.add('animate-in');
                // Stagger the animations
                imageItem.style.animationDelay = `${i * 0.05}s`;
            }
            imageItem.dataset.id = i;
            imageItem.style.backgroundColor = backgroundColor;
            
            // Add SVG pattern
            imageItem.innerHTML = pattern;
            
            // Add click event
            imageItem.addEventListener('click', () => selectImage(i));
            
            // Add to grid
            gridContainer.appendChild(imageItem);
        }
        
        // If in game mode, generate a pattern to guess
        if (isGameMode) {
            generatePatternToGuess();
        }
    }

    function createCirclePattern(hue) {
        const complementaryHue = (hue + 180) % 360;
        return `<svg width="100%" height="100%" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="30" fill="hsl(${complementaryHue}, 80%, 60%)" />
        </svg>`;
    }

    function createSquarePattern(hue) {
        const complementaryHue = (hue + 180) % 360;
        return `<svg width="100%" height="100%" viewBox="0 0 100 100">
            <rect x="25" y="25" width="50" height="50" fill="hsl(${complementaryHue}, 80%, 60%)" />
        </svg>`;
    }

    function createTrianglePattern(hue) {
        const complementaryHue = (hue + 180) % 360;
        return `<svg width="100%" height="100%" viewBox="0 0 100 100">
            <polygon points="50,20 80,80 20,80" fill="hsl(${complementaryHue}, 80%, 60%)" />
        </svg>`;
    }

    function createStarPattern(hue) {
        const complementaryHue = (hue + 180) % 360;
        return `<svg width="100%" height="100%" viewBox="0 0 100 100">
            <polygon points="50,10 61,35 90,35 65,55 75,80 50,65 25,80 35,55 10,35 39,35" fill="hsl(${complementaryHue}, 80%, 60%)" />
        </svg>`;
    }

    function createGridPattern(hue) {
        const complementaryHue = (hue + 180) % 360;
        return `<svg width="100%" height="100%" viewBox="0 0 100 100">
            <rect x="20" y="20" width="25" height="25" fill="hsl(${complementaryHue}, 80%, 60%)" />
            <rect x="55" y="20" width="25" height="25" fill="hsl(${complementaryHue}, 80%, 60%)" />
            <rect x="20" y="55" width="25" height="25" fill="hsl(${complementaryHue}, 80%, 60%)" />
            <rect x="55" y="55" width="25" height="25" fill="hsl(${complementaryHue}, 80%, 60%)" />
        </svg>`;
    }

    function switchMode(mode) {
        // Stop any running game timer
        if (gameTimerInterval) {
            clearInterval(gameTimerInterval);
            gameTimerInterval = null;
        }
        
        isRegisterMode = mode === 'register';
        isGameMode = mode === 'game';
        
        // Update button states
        registerBtn.classList.toggle('active', mode === 'register');
        loginBtn.classList.toggle('active', mode === 'login');
        gameModeBtn.classList.toggle('active', mode === 'game');
        
        // Show/hide game-specific elements
        difficultyContainer.style.display = isGameMode ? 'block' : 'none';
        gameTimer.style.display = isGameMode ? 'block' : 'none';
        hintBtn.style.display = isGameMode ? 'inline-block' : 'none';
        leaderboardContainer.style.display = isGameMode ? 'block' : 'none';
        
        // Update instruction text
        if (isGameMode) {
            patternInstruction.textContent = `Level ${currentLevel}: Memorize and reproduce the pattern`;
            resetGame();
            updateLeaderboard();
        } else {
            patternInstruction.textContent = isRegisterMode 
                ? `Select ${MIN_PATTERN_LENGTH}-${MAX_PATTERN_LENGTH} images in order as your password` 
                : 'Enter your graphical password pattern';
        }
        
        clearSelection();
        updateUI();
    }

    function selectImage(imageId) {
        // Check if image is already selected
        const existingIndex = selectedImages.findIndex(img => img === imageId);
        
        if (existingIndex !== -1) {
            // If already selected, remove it and all subsequent selections
            selectedImages = selectedImages.slice(0, existingIndex);
        } else {
            // If not selected and we haven't reached the max, add it
            const maxLength = isGameMode ? DIFFICULTY_SETTINGS[difficulty].patternLength : MAX_PATTERN_LENGTH;
            
            if (selectedImages.length < maxLength) {
                selectedImages.push(imageId);
                
                // Add animation if enabled
                if (animationsEnabled) {
                    const imageElement = document.querySelector(`.image-item[data-id="${imageId}"]`);
                    imageElement.classList.add('animate-select');
                    setTimeout(() => {
                        imageElement.classList.remove('animate-select');
                    }, 500);
                }
            } else {
                showMessage('You can select a maximum of ' + maxLength + ' images', false);
                return;
            }
        }
        
        updateUI();
        
        // In game mode, check if pattern matches after each selection
        if (isGameMode && selectedImages.length === patternToGuess.length) {
            setTimeout(() => {
                checkGamePattern();
            }, 500);
        }
    }

    function updateUI() {
        // Update selected state for all images
        document.querySelectorAll('.image-item').forEach(item => {
            const id = parseInt(item.dataset.id);
            const index = selectedImages.indexOf(id);
            
            item.classList.toggle('selected', index !== -1);
            if (index !== -1) {
                item.dataset.order = index + 1;
            } else {
                delete item.dataset.order;
            }
        });
        
        // Update selected images preview
        selectedImagesContainer.innerHTML = '';
        selectedImages.forEach((imageId, index) => {
            const imageData = imageSet[imageId];
            const previewDiv = document.createElement('div');
            previewDiv.classList.add('selected-preview');
            previewDiv.dataset.order = index + 1;
            previewDiv.style.backgroundColor = imageData.backgroundColor;
            previewDiv.innerHTML = imageData.pattern;
            selectedImagesContainer.appendChild(previewDiv);
        });
        
        // Update submit button state
        const minLength = isGameMode ? patternToGuess.length : MIN_PATTERN_LENGTH;
        submitBtn.disabled = selectedImages.length < minLength;
        
        // Clear any messages
        messageContainer.innerHTML = '';
        messageContainer.className = '';
    }

    function clearSelection() {
        selectedImages = [];
        updateUI();
    }

    function handleSubmit() {
        const username = usernameInput.value.trim();
        
        if (!username && !isGameMode) {
            showMessage('Please enter a username', false);
            return;
        }
        
        if (selectedImages.length < MIN_PATTERN_LENGTH && !isGameMode) {
            showMessage(`Please select at least ${MIN_PATTERN_LENGTH} images`, false);
            return;
        }
        
        if (isGameMode) {
            checkGamePattern();
        } else if (isRegisterMode) {
            registerUser(username, selectedImages);
        } else {
            const startTime = performance.now();
            loginUser(username, selectedImages, startTime);
        }
    }

    function registerUser(username, pattern) {
        // Check if username already exists
        if (userAccounts[username]) {
            showMessage('Username already exists. Please choose another or login.', false);
            return;
        }
        
        // Check for pattern master achievement
        if (pattern.length === MAX_PATTERN_LENGTH) {
            unlockAchievement(ACHIEVEMENTS.patternMaster);
        }
        
        // Save the user account
        userAccounts[username] = {
            pattern: pattern,
            imageSet: imageSet, // Save the current image set for this user
            loginStreak: 0,
            lastLogin: Date.now()
        };
        
        localStorage.setItem('graphicalPasswords', JSON.stringify(userAccounts));
        showMessage('Registration successful! You can now login.', true);
        
        // Celebrate with confetti
        if (animationsEnabled) {
            launchConfetti();
        }
        
        // Switch to login mode
        switchMode('login');
    }

    function loginUser(username, pattern, startTime = null) {
        // Check if username exists
        if (!userAccounts[username]) {
            showMessage('Username not found. Please register first.', false);
            return;
        }
        
        const userAccount = userAccounts[username];
        
        // Check if patterns match
        if (pattern.length !== userAccount.pattern.length) {
            showMessage('Incorrect pattern. Please try again.', false);
            clearSelection();
            return;
        }
        
        // Compare each image in the pattern
        for (let i = 0; i < pattern.length; i++) {
            if (pattern[i] !== userAccount.pattern[i]) {
                showMessage('Incorrect pattern. Please try again.', false);
                clearSelection();
                return;
            }
        }
        
        // Login successful
        showMessage('Login successful! Welcome back, ' + username + '!', true);
        
        // Update login streak
        const oneDayInMs = 24 * 60 * 60 * 1000;
        const now = Date.now();
        
        if (now - userAccount.lastLogin < oneDayInMs) {
            userAccount.loginStreak++;
            
            // Check for streak achievement
            if (userAccount.loginStreak >= 5) {
                unlockAchievement(ACHIEVEMENTS.streakMaster);
            }
        } else {
            userAccount.loginStreak = 1;
        }
        
        userAccount.lastLogin = now;
        localStorage.setItem('graphicalPasswords', JSON.stringify(userAccounts));
        
        // Check for first login achievement
        if (!achievements.firstLogin) {
            unlockAchievement(ACHIEVEMENTS.firstLogin);
        }
        
        // Check for speedy login achievement
        if (startTime) {
            const loginTime = (performance.now() - startTime) / 1000; // in seconds
            if (loginTime < 5) {
                unlockAchievement(ACHIEVEMENTS.speedyLogin);
            }
        }
        
        // Celebrate with confetti
        if (animationsEnabled) {
            launchConfetti();
        }
        
        // Increment streak count for this session
        streakCount++;
    }

    function showMessage(message, isSuccess) {
        messageContainer.textContent = message;
        messageContainer.className = isSuccess ? 'success-message' : 'error-message';
    }
    
    function setTheme(theme) {
        // Remove all theme classes
        document.body.classList.remove('theme-neon', 'theme-retro', 'theme-dark');
        
        // Add the selected theme class (except for default)
        if (theme !== 'default') {
            document.body.classList.add(`theme-${theme}`);
        }
        
        // Update active button
        themeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });
        
        // Save theme preference
        currentTheme = theme;
        localStorage.setItem('theme', theme);
    }
    
    function resetGame() {
        // Reset game state
        clearSelection();
        hintsRemaining = 3;
        hintsLeft.textContent = `(${hintsRemaining} left)`;
        hintBtn.disabled = false;
        
        // Generate new image grid
        generateImageGrid();
        
        // Start the timer
        startGameTimer();
    }
    
    function generatePatternToGuess() {
        patternToGuess = [];
        const patternLength = DIFFICULTY_SETTINGS[difficulty].patternLength;
        
        // Generate random pattern
        for (let i = 0; i < patternLength; i++) {
            const randomImageId = Math.floor(Math.random() * imageSet.length);
            patternToGuess.push(randomImageId);
        }
        
        // Show the pattern briefly
        showPatternPreview();
    }
    
    function showPatternPreview() {
        // Disable clicking during preview
        gridContainer.style.pointerEvents = 'none';
        
        // Show each image in sequence
        patternToGuess.forEach((imageId, index) => {
            setTimeout(() => {
                const imageElement = document.querySelector(`.image-item[data-id="${imageId}"]`);
                imageElement.classList.add('hint');
                
                setTimeout(() => {
                    imageElement.classList.remove('hint');
                    
                    // Re-enable clicking after showing the last image
                    if (index === patternToGuess.length - 1) {
                        gridContainer.style.pointerEvents = 'auto';
                    }
                }, 800);
            }, index * 1000);
        });
    }
    
    function startGameTimer() {
        // Reset timer
        gameStartTime = Date.now();
        
        // Clear any existing interval
        if (gameTimerInterval) {
            clearInterval(gameTimerInterval);
        }
        
        // Update timer every second
        gameTimerInterval = setInterval(() => {
            const elapsedSeconds = Math.floor((Date.now() - gameStartTime) / 1000);
            const timeLimit = DIFFICULTY_SETTINGS[difficulty].timeLimit;
            const remainingTime = timeLimit - elapsedSeconds;
            
            timerValue.textContent = remainingTime;
            
            // Change color when time is running out
            if (remainingTime <= 10) {
                timerValue.style.color = 'red';
            } else {
                timerValue.style.color = '';
            }
            
            // Time's up
            if (remainingTime <= 0) {
                clearInterval(gameTimerInterval);
                gameTimerInterval = null;
                showMessage('Time\'s up! Try again.', false);
                resetGame();
            }
        }, 1000);
    }
    
    function checkGamePattern() {
        // Stop the timer
        if (gameTimerInterval) {
            clearInterval(gameTimerInterval);
            gameTimerInterval = null;
        }
        
        // Check if patterns match
        let isCorrect = true;
        
        if (selectedImages.length !== patternToGuess.length) {
            isCorrect = false;
        } else {
            for (let i = 0; i < patternToGuess.length; i++) {
                if (selectedImages[i] !== patternToGuess[i]) {
                    isCorrect = false;
                    break;
                }
            }
        }
        
        totalAttempts++;
        
        if (isCorrect) {
            // Calculate score based on time, difficulty, and level
            const elapsedSeconds = Math.floor((Date.now() - gameStartTime) / 1000);
            const timeLimit = DIFFICULTY_SETTINGS[difficulty].timeLimit;
            const timeBonus = Math.max(0, timeLimit - elapsedSeconds);
            const difficultyMultiplier = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;
            const score = (timeBonus * 10 + currentLevel * 100) * difficultyMultiplier;
            
            showMessage(`Level ${currentLevel} completed! Score: ${score}`, true);
            
            // Celebrate with confetti
            if (animationsEnabled) {
                launchConfetti();
            }
            
            // Update leaderboard
            const username = usernameInput.value.trim() || 'Player';
            updateLeaderboardScore(username, score);
            
            // Check for game winner achievement
            unlockAchievement(ACHIEVEMENTS.gameWinner);
            
            // Check for hardcore gamer achievement
            if (difficulty === 'hard') {
                unlockAchievement(ACHIEVEMENTS.hardcoreGamer);
            }
            
            // Advance to next level
            currentLevel++;
            patternInstruction.textContent = `Level ${currentLevel}: Memorize and reproduce the pattern`;
            
            // Reset for next level
            setTimeout(() => {
                resetGame();
            }, 2000);
        } else {
            showMessage('Incorrect pattern. Try again.', false);
            clearSelection();
            
            // Reset the game
            setTimeout(() => {
                resetGame();
            }, 2000);
        }
    }
    
    function unlockAchievement(achievement) {
        // Check if already unlocked
        if (achievements[achievement.id]) {
            return;
        }
        
        // Mark as unlocked
        achievements[achievement.id] = {
            unlocked: true,
            date: Date.now()
        };
        
        // Save to localStorage
        localStorage.setItem('achievements', JSON.stringify(achievements));
        
        // Show achievement banner
        achievementText.textContent = `${achievement.title}: ${achievement.description}`;
        
        // Update icon if available
        const iconElement = achievementBanner.querySelector('i');
        if (iconElement && achievement.icon) {
            iconElement.className = `fas ${achievement.icon}`;
        }
        
        achievementBanner.style.display = 'block';
        
        // Hide after 5 seconds
        setTimeout(() => {
            achievementBanner.style.display = 'none';
        }, 5000);
    }
    
    function updateLeaderboardScore(username, score) {
        // Find existing entry or create new one
        const existingEntry = leaderboard.find(entry => entry.username === username);
        
        if (existingEntry) {
            existingEntry.score = Math.max(existingEntry.score, score);
        } else {
            leaderboard.push({ username, score });
        }
        
        // Sort by score (descending)
        leaderboard.sort((a, b) => b.score - a.score);
        
        // Keep only top 10
        if (leaderboard.length > 10) {
            leaderboard = leaderboard.slice(0, 10);
        }
        
        // Save to localStorage
        localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
        
        // Update display
        updateLeaderboard();
    }
    
    function updateLeaderboard() {
        leaderboardBody.innerHTML = '';
        
        leaderboard.forEach((entry, index) => {
            const row = document.createElement('tr');
            
            const rankCell = document.createElement('td');
            rankCell.textContent = index + 1;
            
            const usernameCell = document.createElement('td');
            usernameCell.textContent = entry.username;
            
            const scoreCell = document.createElement('td');
            scoreCell.textContent = entry.score;
            
            row.appendChild(rankCell);
            row.appendChild(usernameCell);
            row.appendChild(scoreCell);
            
            leaderboardBody.appendChild(row);
        });
    }
    
    function launchConfetti() {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }
}); 