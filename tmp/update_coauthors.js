
const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateCoAuthors() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
    });

    const co_authors = [
        {
            name: "Chekatla Swapna Priya",
            email: "swapnachsp@gmail.com",
            phone: "0000000000",
            designation: "Assistant Professor, CSE",
            institution: "Vignan's Institute of Information Technology (A), Visakhapatnam, India"
        },
        {
            name: "Suseela Kocho",
            email: "jackbenison12@gmail.com",
            phone: "0000000000",
            designation: "SGT",
            institution: "Department of school education, India (Orcid ID: 0000-0002-1567-7896)"
        }
    ];

    try {
        const [result] = await pool.execute(
            "UPDATE submissions SET co_authors = ? WHERE id = 13",
            [JSON.stringify(co_authors)]
        );
        console.log("Update successful:", result);
    } catch (error) {
        console.error("Update failed:", error);
    } finally {
        await pool.end();
    }
}

updateCoAuthors();
