import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';


// Load environment variables BEFORE creating the connection
dotenv.config();


const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS, {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: "postgres",
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

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

export { sequelize, connectDB };