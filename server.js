require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());
app.use(cors());

// Database Connection
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '12345',
    database: 'ddas_db'
});

db.connect(err => {
    if (err) {
        console.error("Database connection failed:", err.message);
        process.exit(1); // Stop the server if DB connection fails
    }
    console.log("Database connected!");
});

// Check if Email Credentials Exist
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("Missing EMAIL_USER or EMAIL_PASS in .env file!");
    process.exit(1); // Stop the server if email credentials are missing
}

// Nodemailer Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'Raj9074kk@gmail.com',
        pass: 'adkf clln gycq xvsu'
    }
});

// Function to Send Email Alert
const sendEmailAlert = (userEmail, fileName) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: "Duplicate Download Alert",
        text: `You attempted to download the file "${fileName}" again. This has been flagged as a duplicate.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Email error:", error);
        } else {
            console.log("Email sent:", info.response);
        }
    });
};

// AI Feature: Predict Duplicate Download
const predictDuplicateDownload = (userId, fileName, callback) => {
    const query = `SELECT COUNT(*) AS count FROM downloads WHERE user_id = ? AND file_name = ?`;

    db.query(query, [userId, fileName], (err, results) => {
        if (err) {
            console.error("Database error in duplicate check:", err.message);
            return callback(err, null);
        }

        let count = results[0].count;
        console.log(`🔍 User ${userId} has downloaded '${fileName}' ${count} times.`);

        callback(null, count > 0);
    });
};

// API: Download a File
app.post('/download', (req, res) => {
    const { userId, fileName, userEmail } = req.body;

    if (!userId || !fileName || !userEmail) {
        return res.status(400).json({ message: "User ID, email, and file name are required" });
    }

    // Predict if a duplicate download is happening
    predictDuplicateDownload(userId, fileName, (err, isDuplicate) => {
        if (err) return res.status(500).json({ message: "Database error" });

        if (isDuplicate) {
            sendEmailAlert(userEmail, fileName);
            return res.status(409).json({ message: "Duplicate download detected! Email alert sent." });
        }

        // Insert download record
        const insertQuery = `INSERT INTO downloads (user_id, file_name) VALUES (?, ?)`;
        db.query(insertQuery, [userId, fileName], (err) => {
            if (err) {
                console.error("Database error during INSERT:", err.message);
                return res.status(500).json({ message: "Database error" });
            }
            res.status(200).json({ message: "File downloaded successfully!" });
        });
    });
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
