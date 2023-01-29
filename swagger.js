const swaggerUi = require('swagger-ui-express');
const swaggereJsdoc = require('swagger-jsdoc');
const { env } = require('process');

const options = {
    swaggerDefinition: {
        info: {
            title: 'Ecord API',
            version: '1.0.0',
            description: 'Ecord API with express',
        },
        host: process.env.HOST,
        basePath: '/'
    },
    apis: ['./routes/*.js', './swagger/']
};

const specs = swaggereJsdoc(options);

module.exports = {
    swaggerUi,
    specs
};