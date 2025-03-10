# Graphical Password Authentication System

A secure, interactive, and FUN graphical password authentication system built with HTML, CSS, and JavaScript.

## Awesome Features

- **Visual Password Selection**: Instead of typing a text password, users select a sequence of images as their password
- **Pattern-Based Authentication**: Users create a unique pattern by selecting 4-6 images in a specific order
- **User Registration & Login**: Complete authentication flow with registration and login functionality
- **Multiple Themes**: Choose from 4 visually stunning themes - Default, Neon, Retro, and Dark
- **Animated Interactions**: Beautiful animations for image selection, shuffling, and successful logins
- **Achievement System**: Unlock achievements as you use the system (First Login, Pattern Master, Theme Explorer, etc.)
- **Celebration Effects**: Confetti explosions when you successfully register, login, or complete a game level
- **Game Mode**: Test your memory with an exciting pattern-matching game with multiple difficulty levels
- **Leaderboard**: Compete for high scores in game mode and see your ranking
- **Hint System**: Get hints in game mode when you're stuck
- **Streak Tracking**: The system tracks your login streaks and rewards consistent usage
- **Responsive Design**: Works beautifully on desktop and mobile devices

## How It Works

### Registration

1. Enter a username in the input field
2. Select 4-6 images in a specific order to create your graphical password
3. The selected images will be displayed in order at the bottom
4. Click "Submit" to register your account
5. You'll receive a confirmation message and be switched to login mode
6. Enjoy the confetti celebration!

### Login

1. Enter your registered username
2. Select the same images in the exact same order as you did during registration
3. Click "Submit" to log in
4. If successful, you'll see a welcome message and confetti celebration
5. Unlock achievements for fast logins and login streaks

### Game Mode

1. Click "Game Mode" to switch to the memory challenge
2. Choose your difficulty level (Easy, Medium, Hard)
3. Watch carefully as the system shows you a pattern of images
4. Reproduce the pattern by clicking the images in the same order
5. Complete levels to earn points and climb the leaderboard
6. Use hints when you're stuck (limited number per level)
7. Unlock special achievements for completing game challenges

### Theme Customization

1. Click on any theme button at the top of the interface
2. The entire interface will instantly transform to the selected theme
3. Your theme preference is saved for future visits
4. Try all themes to unlock the "Theme Explorer" achievement

## Achievement System

Unlock these special achievements as you use the system:

- **First Login**: Successfully log in for the first time
- **Lightning Fast**: Log in under 5 seconds
- **Pattern Master**: Create a 6-image pattern
- **Theme Explorer**: Try all available themes
- **Game Winner**: Complete a game mode challenge
- **Hardcore Gamer**: Complete the hard difficulty level
- **Streak Master**: Achieve a 5-login streak

## Security Features

- The system requires selecting images in a specific order, making it harder to guess than a simple image selection
- The grid of images is randomly generated each time, with different colors and patterns
- The system stores the specific image set used during registration for each user
- Visual feedback shows the order of selected images

## Getting Started

1. Clone this repository
2. Open `index.html` in your web browser
3. No server or additional dependencies required

## Implementation Details

- **HTML**: Provides the structure for the authentication interface
- **CSS**: Styles the interface with a modern, responsive design and multiple themes
- **JavaScript**: Implements the interactive functionality, including:
  - Dynamic image generation with SVG patterns
  - User interaction handling
  - Authentication logic
  - Local storage management
  - Game mode mechanics
  - Achievement system
  - Animation effects

## Security Considerations

This implementation is for demonstration purposes. In a production environment, you would want to:

- Implement server-side validation and storage
- Add encryption for stored passwords
- Implement rate limiting and account lockout features
- Add additional security layers like CAPTCHA or two-factor authentication

## License

This project is open source and available under the MIT License. 