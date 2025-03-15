const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL connection
// const db = mysql.createConnection({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME
// });

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Updated MySQL username
    password: '', // Updated MySQL password
    database: 'voting_bukber' // Updated MySQL database name
});


// Connect to MySQL
db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

app.post('/api/votes', (req, res) => {
    const { deviceId, vote } = req.body;

    // Query untuk memasukkan vote hanya jika deviceId belum ada
    const insertQuery = `
        INSERT INTO votes (deviceId, vote, timestamp)
        SELECT ?, ?, NOW() FROM DUAL
        WHERE NOT EXISTS (SELECT 1 FROM votes WHERE deviceId = ?)`;

    db.query(insertQuery, [deviceId, vote, deviceId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (results.affectedRows === 0) {
            return res.status(400).json({ message: 'Anda sudah memberikan suara!' });
        }

        res.status(201).json({ message: 'Vote recorded successfully!' });
    });
});

app.get('/api/votes', (req, res) => {
    db.query('SELECT * FROM votes', (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

app.delete('/api/votes', (req, res) => {
    db.query('DELETE FROM votes', (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'All votes deleted!' });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
