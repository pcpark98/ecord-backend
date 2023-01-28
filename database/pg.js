const {Pool} = require('pg');
const dotenv = require('dotenv');
const {PostgreConnectionError, SqlSyntaxError, SqlUniqueViolationError} = require("../error/error.js");
const path = require('path');
dotenv.config({path: path.join(__dirname, "../.env")});
const config = {
    user: process.env.POSTGRESQL_USER,
    host : process.env.POSTGRESQL_HOST,
    database : process.env.POSTGRESQL_DBNAME,
    port : process.env.POSTGRESQL_PORT,
    password: process.env.POSTGRESQL_PASSWORD,
    connectionTimeoutMillis: 10000,
    max : 10,
};

module.exports =  class Postgres {
    Postgres(){                     // postgres 객체를 생성합니다.
        this.client = null;
        this.pool = null;
    }
    async connect(){                // postgresql 데이터베이스와 연결합니다.
        try{
            this.pool = new Pool(config);
            this.client = await this.pool.connect();
            return;
        }
        catch(err){
            throw new PostgreConnectionError(err);
        }
    }

    async queryExecute(sql, parameter){ // 파라미터로 받은 쿼리를 실행하고 결과값을 return합니다.
        try{
            const result = await this.client.query(sql,parameter);
            return result;
        }
        catch(err){
            console.log(err)
            if(err.code = '23505')
                throw new SqlUniqueViolationError();
            else{
                throw new SqlSyntaxError(err);
            }
        }

    }

    async queryUpdate(sql, parameter){  // 파라미터로 받은 쿼리를 실행합니다.
        try{
            await this.client.query(sql,parameter);
        }
        catch(err){
            console.log(err)
            if(err.code = '23505')
                throw new SqlUniqueViolationError();
            else{
                throw new SqlSyntaxError(err);
            }
        }
    }

    async disconnect(){                 // 데이터베이스와의 연결을 끊습니다.
        try{
            this.client.release(true);
        }
        catch(err){
            console.log(err);
        }
    }
}
        