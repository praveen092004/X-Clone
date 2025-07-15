import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cloudinary from 'cloudinary';

// Importing routes
import authRoute from './routes/auth.route.js';
import userRoute from './routes/user.route.js';
import connectDB from './db/connectDB.js';
import postRoute from './routes/post.route.js';
import notificationRoute from './routes/notification.route.js'
import cors from "cors"
import path from "path"

// Loading environment variables
dotenv.config();

// Initializing Express
const app = express();
const PORT = process.env.PORT

const __dirname = path.resolve();

// Configuring Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET_KEY
})

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json(
    {
        limit: "5mb"
    }
));

app.use(cookieParser());
app.use(express.urlencoded({
    extended: true
}))

// Setting up routes
app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/posts', postRoute);
app.use('/api/notifications', notificationRoute);

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "frontend", "build")));
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
    });
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
})