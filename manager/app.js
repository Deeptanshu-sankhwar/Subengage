const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');

// load environment variables
dotenv.conig()

const app = express();

// security middlewares
app.use(helmet());
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || '*',
    })
);

// log all http requests
app.use(morgan('combined'));

// json parser middlware
app.use(express.json());

// connect to mongodb
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => {
        console.error('Could not connect to MongoDB:', err);
        process.exit(1);
    });

// start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})