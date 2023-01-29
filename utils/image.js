const {v4} = require('uuid');

module.exports.getFileName = async() =>{
    const token = v4().split('-');
    return token[2] + token[1] + token[0] + token[3] + token[4];
}