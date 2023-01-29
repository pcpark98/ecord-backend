const Pusher = require("pusher");
const postgres = require('../database/pg');
const {PostgreConnectionError, SqlSyntaxError, NullParameterError, TokenIssueError, SendMailError, SqlUniqueViolationError} = require('../error/error');
const parameter = require('../utils/parameter');
const pusher = new Pusher({
  appId: "1544216",
  key: "355b90c48a1eaff96f03",
  secret: "af61913edbdc3187a20d",
  cluster: "ap3",
  useTLS: true,
});

const dummy = [
    {
        "brand_name" : "노브랜드버거",
        "business_number" : "1238775643",
        "address" : "인천 미추홀구 인하로 81-1",
        "ceo" : "주시현",
        "phone_number" : "032-873-0508",
        "card_company" : "삼성카드",
        "store_number" : "934587651",
        "serial_number" : "4312",
        "card_number" : "4567-6547-2167-7325",
        "date" : "2023.01.25",
        "approval_number" : "00838517",
        "original_number" : "NS1231242379",
        "total_cost" : "15,000",
        "category" : "food",
        "receipt_img_url" : "/images/nobrand.png",
        "product_name" : ["미트마니아 세트", "NBB어메이징 세트"],
        "cost" : ["7,700" , "7,300"],
        "ea" : [1, 1]
    },
    {
        "brand_name" : "kfc",
        "business_number" : "1238775643",
        "address" : "인천 미추홀구 인하로77번길 8",
        "ceo" : "신지애",
        "phone_number" : "032-873-0508",
        "card_company" : "삼성카드",
        "store_number" : "934587651",
        "serial_number" : "4312",
        "card_number" : "4567-6547-2167-7325",
        "date" : "2023.01.20",
        "approval_number" : "00838517",
        "original_number" : "NS1231242379",
        "total_cost" : "25,600",
        "category" : "food",
        "receipt_img_url" : "/images/kfc.png",
        "product_name" : ["핫크리스피치킨 8조각", "콜라(L)"],
        "cost" : ["21,200" , "4,400"],
        "ea" : [1, 2]
    },
    {
        "brand_name" : "버거킹",
        "business_number" : "1238775643",
        "address" : "인천 미추홀구 독배로 309",
        "ceo" : "박연진",
        "phone_number" : "032-873-0508",
        "card_company" : "삼성카드",
        "store_number" : "934587651",
        "serial_number" : "4312",
        "card_number" : "4567-6547-2167-7325",
        "date" : "2023.01.21",
        "approval_number" : "00838517",
        "original_number" : "NS1231242379",
        "total_cost" : "22,700",
        "category" : "food",
        "receipt_img_url" : "/images/burgerKing.png",
        "product_name" : ["치즈와퍼세트", "와퍼주니어세트", "불고기와퍼세트"],
        "cost" : ["9,500" , "6,600", "6,600"],
        "ea" : [1, 1, 1]
    },
    {
        "brand_name" : "설빙",
        "business_number" : "1238775643",
        "address" : "인천 미추홀구 인하로77번길 12 2층",
        "ceo" : "박동은",
        "phone_number" : "032-873-0508",
        "card_company" : "삼성카드",
        "store_number" : "934587651",
        "serial_number" : "4312",
        "card_number" : "4567-6547-2167-7325",
        "date" : "2023.01.22",
        "approval_number" : "00838517",
        "original_number" : "NS1231242379",
        "total_cost" : "8,900",
        "category" : "food",
        "receipt_img_url" : "/images/sulbing.png",
        "product_name" : ["인절미 설빙"],
        "cost" : ["8,900"],
        "ea" : [1]
    }
]


module.exports.createReceipt = async(req,res) =>{
    const pg = new postgres();
    const userIndex = req.body.userIndex || 1;
    try{
        const idx = Math.floor(Math.random() * 4);
        const data = dummy[idx];
        await pg.connect();

        //DB insert

        const receiptIndex = await pg.queryExecute(`
            INSERT INTO sc.receipt 
            VALUES (DEFAULT, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            returning receipt_index;
        `,[userIndex, data.brand_name, data.business_number, data.address, data.ceo, data.phone_number, data.card_company, data.store_number, data.serial_number, data.card_number, data.date, data.approval_number, data.original_number, data.total_cost, data.category, data.receipt_img_url]);

        for(i=0; i<data.product_name.length; i++){
            await pg.queryUpdate(`
                INSERT INTO sc.purchase
                VALUES (DEFAULT, $1, $2, $3, $4);
            `,[receiptIndex, data[i].product_name, data[i].cost, data[i].ea]);
        }

        pusher.trigger("chat", "message", data);
        res.send("서버에서");
    }
    catch(err){
        if(error instanceof PostgreConnectionError){
            return res.status(500).send();
        }

        return res.status(500).send();
    }
    finally{
        await pg.disconnect();
    }
}