require('dotenv').config({ path: __dirname + '/.env' });

console.log("PORT:", process.env.PORT);
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_PORT:", process.env.DB_PORT);


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
//     host: 'localhost',
//     user: 'root', // Updated MySQL username
//     password: '', // Updated MySQL password
//     database: 'voting_bukber' // Updated MySQL database name
// });

// MySQL connection (gunakan createPool untuk efisiensi)
// Validasi environment variables
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
    console.error("Missing required environment variables. Please check your .env file.");
    process.exit(1);
}

// MySQL connection menggunakan pool
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306, // Port database MySQL
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Pastikan koneksi ke database berhasil
db.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        process.exit(1);
    }
    console.log('Connected to MySQL on Clever Cloud');
    connection.release();
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
