const jwt = require('jsonwebtoken');
const tokenUtil = require('../utils/jwtToken');
const parameter = require('../utils/parameter');
const {NullParameterError, TokenExpiredError, TokenIssueError} = require('../error/error');

module.exports.verifyToken = async(req, res, next) => {
    try{
        const userIndex = req.body.userIndex || req.params.userIndex || req.query.userIndex;
        const token = tokenUtil.parseToken(req.headers.authorization);

        await parameter.nullCheck(userIndex, token);

        req.decoded = await jwt.verify(token, process.env.TOKEN_SECRET_KEY);
        if(userIndex != tokenUtil.openToken(token).id){
            return res.status(401).send();
        }
        next();
    } catch(error){
        if(error instanceof NullParameterError){
            return res.status(400).send();
        }
        if(error.name = "TokenExpiredError"){
            return res.status(419).send();
        }
        else{
            return res.status(401).send();
        }
    }
}