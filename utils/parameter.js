const {NullParameterError} = require('../error/error');

module.exports.nullCheck = async(...arg) =>{
    if(arg.length === 0 )
        throw new NullParameterError();

    arg.forEach((value =>{
        if(value === "" || value === null || value === undefined || ( value !== null && typeof value === "object" && !Object.keys(value).length)){
            throw  new NullParameterError();
        }
    }))

}