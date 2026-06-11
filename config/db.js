const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'patipan110544',
    database: process.env.DB_NAME || 'it_helpdesk',
    port: process.env.DB_PORT || 3306
});

db.getConnection((err, connection) => {
    if(err){
        console.error('เชื่อมต่อข้อมูลล้มเหลว:', err.message);
    }else{
        console.log('เชื่อมต่อฐานข้อมูล MySQL สำเร็จแล้ว!');
        connection.release();
    }
});

module.exports = db.promise();