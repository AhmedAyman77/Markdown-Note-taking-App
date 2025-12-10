import fs from 'fs';
import path from 'path';
import express from 'express';
import noteRouter from './routes/note.route.js';
import userRouter from './routes/user.route.js';
import fileRouter from './routes/file.route.js';
import authMiddleware from './middleware/auth.middleware.js';
import { connectDB } from './config/db.config.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';
import cookieParser from 'cookie-parser';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (!fs.existsSync(path.join(process.cwd(), 'src', process.env.UPLOAD_DIR))) {
    fs.mkdirSync(path.join(process.cwd(), 'src', process.env.UPLOAD_DIR), { recursive: true });
}


// Routers
app.get('/', (req, res) => {
    res.send('server is running');
});

app.use('/api/users', userRouter);
app.use('/api/notes', authMiddleware, noteRouter);
app.use('/api/files', authMiddleware, fileRouter);



// error handling middleware
app.use(notFound);
app.use(errorHandler);





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