const postgres = require('../database/pg');
const {PostgreConnectionError, SqlSyntaxError, NullParameterError, TokenIssueError, SendMailError, SqlUniqueViolationError} = require('../error/error');
const parameter = require('../utils/parameter');
const tokenUtil = require('../utils/jwtToken');

module.exports.login = async(req, res)=>{
    const pg = new postgres();
    const id = req.body.id;
    const password = req.body.password;

    try{
        await parameter.nullCheck(id, password);
        await pg.connect();

    
        const userInfo = await pg.queryExecute(`
            SELECT * FROM sc.user WHERE id = $1 AND password = $2;
        `, [id, password]);

        if(userInfo.rowCount == 0){
            return res.status(401).send();
        }

        const token = await tokenUtil.issueToken(userInfo.rows[0].user_index);

        return res.status(200).send({
            user_index : userInfo.rows[0].user_index,
            user_name : userInfo.rows[0].name,
            token : token
        })
    } catch(error) {
        if(error instanceof NullParameterError){
            return res.status(400).send();
        }
        if(error instanceof PostgreConnectionError){
            return res.status(500).send();
        }
        if(error instanceof TokenIssueError){
            return res.status(500).send();
        }
        return res.status(500).send();
    }
    finally{
        await pg.disconnect();
    }
}

module.exports.loadFavoriteFood = async(req, res)=>{
    const pg = new postgres();
    const userIndex = req.params.userIndex;

    try{
        await parameter.nullCheck(userIndex);
        await pg.connect();

        const favoriteFoodInfo = await pg.queryExecute(`
            SELECT a.brand_name, b.product_name, SUM(b.ea) AS ea, receipt_img_url 
            FROM sc.receipt AS a INNER JOIN sc.purchase AS b ON a.receipt_index=b.receipt_index 
            WHERE a.category='food' AND a.user_index = $1
            GROUP BY a.brand_name, b.product_name, receipt_img_url
            ORDER BY ea DESC
            LIMIT 3;
            `,[userIndex]);
        
        return res.status(200).send(
            favoriteFoodInfo.rows
        )
    } catch(error) {
        if(error instanceof NullParameterError){
            return res.status(400).send();
        }
        if(error instanceof PostgreConnectionError){
            return res.status(500).send();
        }
        if(error instanceof TokenIssueError){
            return res.status(500).send();
        }
        return res.status(500).send();
    }
    finally{
        await pg.disconnect();
    }
}



/*
// 소셜 로그인
module.exports.login = async(req, res)=>{
    const redirectCode = req.query.code;
    const pg = new postgres();
    const token_url = `https://kauth.kakao.com/oauth/token?grant_type=authorization_code&client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.HOST}/kakao/callback&code=${redirectCode}`;

    try{
        await parameter.nullCheck(redirectCode);
        await pg.connect();

        const result = await axios.post(token_url,
            {
                headers: {
                    'Content-type': 'application/x-www-form-urlencoded;charset=utf-8'
                }
            }
        );

        const userInfo = await axios.get('https://kapi.kakao.com/v2/user/me',
            {
                headers: {
                    'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
                    Authorization: `Bearer ${result.data.access_token}`
                }
            }
        );

        const checkUser = await pg.queryExecute(`
            SELECT * FROM sc.user WHERE platform_id = $1;
        `, [userInfo.data.id]);

        let userIndex;
        if(checkUser.rowCount == 0){
            userIndex = await pg.queryExecute(`
                INSERT INTO sc.user (user_index, platform_id, name, point) VALUES(DEFAULT, $1, $2, 0) RETURNING user_index;
            `, [userInfo.data.id, userInfo.data.properties.nickname]).user_index;
        } else{
            userIndex =checkUser.rows[0].user_index;
        }

        const token = await tokenUtil.issueToken(userIndex);
        console.log(req.headers.referer);

        res.cookie('token', token);
        res.setHeader('location', req.headers.referer);
        res.status(302).send();
        

 
        return res.status(200).send({
            user_index : userIndex,
            user_name : userInfo.data.properties.nickname,
            token : token
        })

    } catch(error) {
        console.log(error);
        if(error instanceof NullParameterError){
            return res.status(400).send();
        }
        if(error instanceof PostgreConnectionError){
            return res.status(500).send();
        }
        if(error instanceof TokenIssueError){
            return res.status(500).send();
        }
        return res.status(500).send();
    }
    finally{
        await pg.disconnect();
    }
}
*/