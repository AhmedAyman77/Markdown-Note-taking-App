import express from 'express';
import sequelize from './config/db.config.js';
import userRouter from './routes/user.route.js';


// Connect to database with better error handling
const connectDB = async() => {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');
        // Optionally sync models
        await sequelize.sync(); // to create tables if they don't exist but if add { force: true } to drop and recreate tables
    } catch (err) {
        console.error('Unable to connect to the database:', err);
        process.exit(1); // Exit if DB connection fails
    }
};


const app = express();

app.use(express.json());

// Routers
app.use('/api/users', userRouter);

app.get('/', (req, res) => {
    res.send('server is running');
});

// 404 Error Handling Middleware
app.use((req, res, next) => {
    res.status(404).send('404 Not Found');
});

// General Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start server only after DB connection
connectDB().then(() => {

    const PORT = process.env.PORT || 3000;

    const server = app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async() => {
        console.log('SIGTERM received, closing server...');
        server.close(async() => {
            await sequelize.close();
            console.log('Database connection closed');
            process.exit(0);
        });
    });
});