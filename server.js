const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

app.use(bodyParser.json());
app.use(cors());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'your_new_password',
    database: 'expense_tracking'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to database');
});

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, 'secretKey', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err, result) => {
        if (err) return res.status(500).send('Error registering user');
        res.status(201).send('User registered');
    });
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) return res.status(500).send('Error fetching user');
        if (results.length === 0) return res.status(401).send('Invalid credentials');

        const user = results[0];
        if (await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ username: user.username }, 'secretKey', { expiresIn: '1h' });
            res.json({ token });
        } else {
            res.status(401).send('Invalid credentials');
        }
    });
});

app.get('/api/transactions', authenticateToken, (req, res) => {
    db.query('SELECT * FROM transactions WHERE user_id = (SELECT id FROM users WHERE username = ?)', [req.user.username], (err, results) => {
        if (err) return res.status(500).send('Error fetching transactions');
        res.json(results);
    });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).send('Something broke!');
    });
    
});
