const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/avatars', express.static(path.join(__dirname, 'avatars')));

let leaderboard = [];

// API endpoint to get the leaderboard
app.get('/api/leaderboard', (req, res) => {
    res.json(leaderboard);
});

// API endpoint to upload an avatar
app.post('/api/avatar', (req, res) => {
    const { username, avatar } = req.body;
    const avatarPath = path.join(__dirname, 'avatars', `${username}.png`);

    fs.writeFile(avatarPath, avatar, 'base64', (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to save avatar' });
        }
        res.json({ message: 'Avatar saved successfully' });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
