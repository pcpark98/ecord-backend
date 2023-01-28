const express = require("express");
const router = express.Router();
const user = require('../middlewares/user');
const jwtToken = require('../middlewares/jwtToken');
const receipt = require('../middlewares/receipt');

/**
 * @swagger
 *  /login:
 *    post:
 *      tags: [User]
 *      summary: 유저 로그인
 *      produces:
 *      - application/json
 *      parameters:
 *        - in: "body"
 *          name: "id"
 *          description: "유저 아이디"
 *          required: true
 *          schema:
 *              type: string
 *              properties:
 *                  id:
 *                      type: string
  *        - in: "body"
 *          name: "password"
 *          description: "유저 비밀번호"
 *          required: true
 *          schema:
 *              type: string
 *              properties:
 *                  password:
 *                      type: string
 *      responses:
 *       200:
 *        description: 유저 로그인 성공
 *        schema:
 *            type: object
 *            properties:
 *                UserInfo:
 *                    type: object
 *                    properties:
 *                        user_index:
 *                            type: number
 *                        user_name:
 *                            type: string
 *                        token:
 *                            type: string
 *       401:
 *        description: 유저가 존재하지 않음
 *       400:
 *        description: 아이디 또는 패스워드 누락
 *       500:
 *        description: 서버 에러
 */
router.post('/login',user.login);

/**
 * @swagger
 *  /users/:userIndex/receipts/:receiptIndex:
 *    get:
 *      tags: [Receipt]
 *      summary: userIndex 유저의 receiptIndex 영수증 상세 내용 조회
 *      produces:
 *      - application/json
 *      parameters:
 *        - in: "header"
 *          name: "token"
 *          description: "유저 토큰"
 *          required: true
 *          schema:
 *              type: string
 *              properties:
 *                  token:
 *                      type: string
 *        - in: "path"
 *          name: "userIndex"
 *          description: "유저 인덱스"
 *          required: true
 *          schema:
 *              type: number
 *              properties:
 *                  user_index:
 *                      type: number
 *        - in: "path"
 *          name: "receiptIndex"
 *          description: "영수증 인덱스"
 *          required: true
 *          schema:
 *              type: number
 *              properties:
 *                  receipt_index:
 *                      type: number
 *      responses:
 *       200:
 *        description: 영수증 상세 정보
 *        schema:
 *            type: object
 *            properties:
 *                UserInfo:
 *                    type: object
 *                    properties:
 *                        receipt_index:
 *                            type: number
 *                        user_index:
 *                            type: number
 *                        brand_name:
 *                            type: string
 *                        business_number:
 *                            type: string
 *                        address:
 *                            type: string
 *                        ceo:
 *                            type: string
 *                        phone_number:
 *                            type: string
 *                        card_company:
 *                            type: string
 *                        store_number:
 *                            type: string
 *                        serial_number:
 *                            type: string
 *                        card_number:
 *                            type: string
 *                        date:
 *                            type: string
 *                        approval_number:
 *                            type: string
 *                        original_number:
 *                            type: string
 *                        total_cost:
 *                            type: string
 *                        category:
 *                            type: string
 *                        receipt_img_url:
 *                            type: string
 *                        product_name:
 *                            type: Array
 *                        cost:
 *                            type: Array
 *       400:
 *        description: receiptIndex 누락
 *       500:
 *        description: Server Error
 */
router.get('/users/:userIndex/receipts/:receiptIndex', jwtToken.verifyToken, receipt.loadReceiptsDetail);

/**
 * @swagger
 *  /users/:userIndex/receipts:
 *    get:
 *      tags: [Receipt]
 *      summary: userIndex 유저의 모든 영수증 조회
 *      produces:
 *      - application/json
 *      parameters:
 *        - in: "header"
 *          name: "token"
 *          description: "유저 토큰"
 *          required: true
 *          schema:
 *              type: string
 *              properties:
 *                  token:
 *                      type: string
 *        - in: "path"
 *          name: "userIndex"
 *          description: "유저 인덱스"
 *          required: true
 *          schema:
 *              type: number
 *              properties:
 *                  user_index:
 *                      type: number
 *      responses:
 *       200:
 *        description: 영수증 정보
 *        schema:
 *            type: object
 *            properties:
 *                UserInfo:
 *                    type: object
 *                    properties:
 *                        receipt_index:
 *                            type: number
 *                        user_index:
 *                            type: number
 *                        brand_name:
 *                            type: string
 *                        business_number:
 *                            type: string
 *                        address:
 *                            type: string
 *                        ceo:
 *                            type: string
 *                        phone_number:
 *                            type: string
 *                        card_company:
 *                            type: string
 *                        store_number:
 *                            type: string
 *                        serial_number:
 *                            type: string
 *                        card_number:
 *                            type: string
 *                        date:
 *                            type: string
 *                        approval_number:
 *                            type: string
 *                        original_number:
 *                            type: string
 *                        total_cost:
 *                            type: string
 *                        category:
 *                            type: string
 *                        receipt_img_url:
 *                            type: string
 *       400:
 *        description: userIndex 누락
 *       500:
 *        description: Server Error
 */
router.get('/users/:userIndex/receipts', jwtToken.verifyToken, receipt.loadReceipts);


module.exports = router;




