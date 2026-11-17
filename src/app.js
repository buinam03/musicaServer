const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const apiRoutes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware');

const corsOptions = {
    origin: env.clientOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
};

function createApp() {
    const app = express();

    app.use(cors(corsOptions));
    app.use(express.static('public'));
    app.use(express.urlencoded({ limit: '10mb', extended: true }));
    app.use(express.json({ limit: '10mb' }));

    app.use('/api', apiRoutes);

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}

module.exports = { createApp, corsOptions };
