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
        "brand_name" : "파리바게트",
        "business_number" : "1238775643",
        "address" : "인천 미추홀구 인하로 69-2",
        "ceo" : "이남우",
        "phone_number" : "032-873-0508",
        "card_company" : "삼성카드",
        "store_number" : "934587651",
        "serial_number" : "4312",
        "card_number" : "4567-6547-2167-7325",
        "date" : "2023.01.30",
        "approval_number" : "00838517",
        "original_number" : "NS1231242379",
        "total_cost" : "5,600",
        "category" : "food",
        "receipt_img_url" : "/images/파리바게트_로고.png",
        "product_name" : ["슈크림빵", "정통바게뜨"],
        "cost" : ["1,700" , "3,900"],
        "ea" : [1, 1]
    }
]


module.exports.createReceipt = async(req,res) =>{
    const pg = new postgres();
    const userIndex = req.body.userIndex || 1;
    try{
        const idx = 0;
        let data = dummy[idx];
        await pg.connect();

        //DB insert

        const receiptIndex = await pg.queryExecute(`
            INSERT INTO sc.receipt 
            VALUES (DEFAULT, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            returning receipt_index;
        `,[userIndex, data.brand_name, data.business_number, data.address, data.ceo, data.phone_number, data.card_company, data.store_number, data.serial_number, data.card_number, data.date, data.approval_number, data.original_number, data.total_cost, data.category, data.receipt_img_url]);
        
        data.receipt_index = receiptIndex.rows[0].receipt_index;

        for(i=0; i<data.product_name.length; i++){
            await pg.queryUpdate(`
                INSERT INTO sc.purchase
                (purchase_index, receipt_index, product_name, cost, ea)
                VALUES (DEFAULT, $1, $2, $3, $4);
            `,[receiptIndex.rows[0].receipt_index, data.product_name[i], data.cost[i], data.ea[i]]);
        }

        pusher.trigger("chat", "message", data);
        res.send("서버에서");
    }
    catch(err){
        console.log(err);
        if(err instanceof PostgreConnectionError){
            return res.status(500).send();
        }

        return res.status(500).send();
    }
    finally{
        await pg.disconnect();
    }
}