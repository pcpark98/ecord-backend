const { swaggerUi, specs } = require('./swagger');
const express = require('express');
const app = express();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));