const express = require('express');
const cors = require('cors');
const db =require('./config/db');
const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
    res.send('Hello IT Helpdesk API! เซิร์ฟเวอร์พร้อมทำงานแล้วครับ!');
});

const PORT = 3000;
if(require.main === module){
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`)
    });
}

module.exports = app;