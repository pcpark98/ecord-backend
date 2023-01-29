const postgres = require('../database/pg');
const {PostgreConnectionError, SqlSyntaxError, NullParameterError, ImageFileExtensionError} = require('../error/error');
const parameter = require('../utils/parameter');

module.exports.loadStickers = async(req, res) => {
    const pg = new postgres();

    try{
        await pg.connect();

        const stickers = await pg.queryExecute(`
            SELECT sticker_url FROM sc.sticker;
        `);

        return res.status(200).send(
            stickers.rows
        )
    } catch(error){
        if(error instanceof PostgreConnectionError){
            return res.status(500).send();
        }
        return res.status(500).send();
    }
    finally {
        await pg.disconnect();
    }
}

// SELECT sticker_url FROM sc.sticker;