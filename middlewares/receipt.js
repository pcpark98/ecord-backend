const postgres = require('../database/pg');
const {PostgreConnectionError, SqlSyntaxError, NullParameterError, ImageFileExtensionError} = require('../error/error');
const fs = require('fs');
const parameter = require('../utils/parameter');
const multer = require('multer');
const path = require('path');
const imageUtil = require('../utils/image');
const util = require('util');

module.exports.loadReceipts = async(req, res) => {
    const pg = new postgres();
    const userIndex = req.params.userIndex;

    try{
        await parameter.nullCheck(userIndex);
        await pg.connect();

        const receiptInfo = await pg.queryExecute(`
        SELECT receipt.receipt_index, brand_name, product_name, total_cost,date, ea, receipt_img_url FROM sc.receipt INNER JOIN (SELECT receipt_index, array_agg(product_name) AS product_name, array_agg(cost) AS cost 
        ,array_agg(ea) AS ea FROM sc.purchase GROUP BY receipt_index) AS  pc ON receipt.user_index = $1 AND receipt.receipt_index = pc.receipt_index;
        `,[userIndex]);

        return res.status(200).send(
            receiptInfo.rows
        )
    } catch(error) {
        if(error instanceof NullParameterError){
            return res.status(400).send();
        }
        if(error instanceof PostgreConnectionError){
            return res.status(500).send();
        }
        return res.status(500).send();
    }
    finally{
        await pg.disconnect();
    }
}

module.exports.loadReceiptsDetail = async(req, res) => {
    const pg = new postgres();
    const receiptIndex = req.params.receiptIndex;
    try{
        await parameter.nullCheck(receiptIndex);
        await pg.connect();

        const receiptInfo = await pg.queryExecute(`
        SELECT * FROM sc.receipt 
        INNER JOIN (SELECT receipt_index, array_agg(product_name) AS product_name, array_agg(cost) AS cost 
                    FROM sc.purchase 
                    WHERE receipt_index = $1 GROUP BY receipt_index) AS pc 
        ON pc.receipt_index = receipt.receipt_index
        ORDER BY pc.receipt_index DESC;
        `,[receiptIndex]);

        return res.status(200).send(
            receiptInfo.rows[0]
        )
    } catch(error) {
        
        if(error instanceof NullParameterError){
            return res.status(400).send();
        }
        if(error instanceof PostgreConnectionError){
            return res.status(500).send();
        }
        return res.status(500).send();
    }
    finally{
        await pg.disconnect();
    }
}

module.exports.createReceipt = async(req, res) => {
    const pg = new postgres();
    const receiptIndex = req.paㅇrams.receiptIndex;
    try{
        await parameter.nullCheck(receiptIndex);
        await pg.connect();

        await pg.queryUpdate(`BEGIN;`,[]);

        // TODO
        // 쿼리수정
        const receiptInfo = await pg.queryExecute(`
        INSERT INTO sc.receipt 
        VALUES(DEFAULT, $1, '맛사랑', '7282765643', '인천 미추홀구 인하로77번길 6-26', '김순자', '032-872-5181', '삼성카드', '234287651', '3318', '4567-6547-2167-7325', '23/01/24 10:23:40', '11938517', 'TW1231242379', '13,000', '식사' );
        `,[receiptIndex]);

        await pg.queryUpdate(`COMMIT;`,[]);
        return res.status(200).send(
            receiptInfo.rows
        )
    } catch(error) {
        if(error instanceof NullParameterError){
            return res.status(400).send();
        }
        if(error instanceof PostgreConnectionError){
            return res.status(500).send();
        }
        return res.status(500).send();
    }
    finally{
        await pg.disconnect();
    }
}

module.exports.loadImage = async(req,res) =>{
    const fileName = req.params.fileName;
    try{
        await parameter.nullCheck(fileName);
        const image = await fs.promises.readFile(path.join(__dirname, `../images/${fileName}`))
        res.writeHead(200, {'Content-type' : 'image/jpeg'});
        res.write(image);
        res.end();
    }
    catch(err){
        if(err instanceof NullParameterError)
            return res.status(400).send();

        console.log(err);
        return res.status(500).send();
    }
}

const fileFilter = (req, files, callback) =>{
    const typeArray = files.mimetype.split('/');
    const fileType = typeArray[1]; // 이미지 확장자 추출
    //이미지 확장자 구분 검사
    if(fileType == 'jpg' || fileType == 'jpeg' || fileType == 'png' || fileType == 'pdf'){
        callback(null, true)
    }else {
        // 이미지 파일이 아니라면 ImageFileExtensionError를 던진다.
        callback(new ImageFileExtensionError())
    }
}

module.exports.uploadImage = async(req,res) =>{
    const storage = multer.diskStorage({
        destination: (req, files, cb) => {
          cb(null, path.join(__dirname, '../images')) // cb 콜백함수를 통해 전송된 파일 저장 디렉토리 설정
        },
        filename: async(req, files, cb) =>{
            const fileName = await imageUtil.getFileName()+'.' + files.mimetype.split('/')[1];  // 파일이름.확장자 로 저장
          cb(null, fileName) // cb 콜백함수를 통해 전송된 파일 이름 설정
        }
      })

    const Multer = multer({
        storage : storage,
        limits : 5 * 1024 * 1024,
        fileFilter : fileFilter
    })
    const pg = new postgres();

    try{
        const upload = util.promisify(Multer.fields([{ name: 'content', maxCount: 1 }]));
        await upload(req,res);

        const {receiptIndex} = req.params;
        const contentPath = req.files['content'][0].filename;

        await parameter.nullCheck(receiptIndex, contentPath);

        await pg.connect();
        await pg.queryUpdate(`BEGIN;`,[]);
        await pg.queryUpdate(
            `
            UPDATE sc.receipt SET content_img_url = $1 WHERE receipt_index = $2;
            `
        ,['/images/' + contentPath, receiptIndex]);

        await pg.queryUpdate('COMMIT;',[]);

        return res.status(200).send();

    }
    catch(err){
        console.log(err);
        if(err instanceof ImageFileExtensionError)
            return res.status(415).send();

        if(err instanceof NullParameterError)
            return res.status(400).send();

        if(err instanceof PostgreConnectionError)
            return res.status(500).send();

        if(err instanceof SqlSyntaxError){
            await pg.queryUpdate('ROLLBACK',[]);
            return res.status(500).send();
        }

        return res.status(500).send();
    }
    finally{
        await pg.disconnect();
    }
}
