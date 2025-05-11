const express = require('express');
const cors = require('cors');
require('dotenv').config();

const dbConnect = require('./config/dbConnect');
const agenda = require('./config/agenda');
require('./jobs')(agenda);

const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
// const patientRoutes = require('./routes/patientRoutes');
// const bookingRoutes = require('./routes/bookingRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
// app.use('/api/patients', patientRoutes);
// app.use('/api/bookings', bookingRoutes);

app.get('/', (req, res) => res.send('DocSure API Running'));

// Start server after DB and Agenda are ready
const startServer = async () => {
    try {
        await dbConnect();
        await agenda.start();
        console.log('Agenda started successfully');

        app.listen(process.env.PORT, () => {
            console.log(`Server running on port ${process.env.PORT}`);
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();