const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const usersFilePath = path.join(__dirname, 'users.json'); // JSON file for user data
const leaderboardFilePath = path.join(__dirname, 'leaderboard.json'); // JSON file for leaderboard
const uploadDir = path.join(__dirname, 'uploads'); // Directory for avatar uploads

// Middleware
app.use(bodyParser.json());
app.use(express.static('uploads'));

// Ensure the upload directory exists
fs.existsSync(uploadDir) || fs.mkdirSync(uploadDir);

// Multer storage configuration for avatar uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to file name
    }
});

const upload = multer({ storage });

// Load users and leaderboard data
const loadData = (filePath) => {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([]));
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

const users = loadData(usersFilePath);
const leaderboard = loadData(leaderboardFilePath);

// Utility function to generate JWT tokens
const generateToken = (user) => {
    return jwt.sign({ id: user.id }, 'your_jwt_secret', { expiresIn: '1h' });
};

// User authentication
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = { id: Date.now(), username, password: hashedPassword };
    
    users.push(newUser);
    fs.writeFileSync(usersFilePath, JSON.stringify(users));
    
    res.status(201).json({ message: 'User registered successfully!' });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    
    if (user && bcrypt.compareSync(password, user.password)) {
        const token = generateToken(user);
        res.json({ token });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

// Endpoint to upload avatars
app.post('/upload-avatar', upload.single('avatar'), (req, res) => {
    res.json({ message: 'Avatar uploaded successfully', filePath: req.file.path });
});

// Leaderboard handling
app.get('/leaderboard', (req, res) => {
    res.json(leaderboard);
});

app.post('/leaderboard', (req, res) => {
    const { username, score } = req.body;
    leaderboard.push({ username, score });
    fs.writeFileSync(leaderboardFilePath, JSON.stringify(leaderboard));
    res.json({ message: 'Score added to leaderboard' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});