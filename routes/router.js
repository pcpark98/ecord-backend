const express = require("express");
const router = express.Router();
const user = require('../middlewares/user');
const jwtToken = require('../middlewares/jwtToken');
const receipt = require('../middlewares/receipt');
const pusher = require('../middlewares/pusher');
const sticker = require('../middlewares/sticker')

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
 *                            example: 1
 *                        user_name:
 *                            type: string
 *                            example: '이동령'
 *                        token:
 *                            type: string
 *                            example: '토큰값'
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
 *  /sticker/load:
 *    get:
 *      tags: [Sticker]
 *      summary: 모든 스티커를 조회한다
 *      produces:
 *      - application/json
 *      responses:
 *       200:
 *        description: 모든 스티커 정보
 *        schema:
 *            type: object
 *            properties:
 *                UserInfo:
 *                    type: object
 *                    properties:
 *                        sticker_url:
 *                            type: Array
 *                            example: ['스티커 url', '스티커 url', '이렇게 18개의 url']
 *       500:
 *        description: Server Error
 */
router.get('/sticker/load', sticker.loadStickers);

/**
 * @swagger
 *  /users/:userIndex/receipt/:receiptIndex/image:
 *    post:
 *      tags: [Receipt]
 *      summary: 영수증 메인 이미지 업로드
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
 *        - in: "body"
 *          name: "content"
 *          description: "이미지 파일(url 아님)"
 *          required: true
 *          schema:
 *              type: binary
 *              example: "바이너리 형식의 이미지 파일"
 *      responses:
 *       200:
 *        description: 이미지 업로드 성공
 *       415:
 *        description: 이미지 파일의 확장자가 jpg, jpeg, png, pdf가 아님
 *       400:
 *        description: receiptIndex 또는 업로드된 이미지 파일 없음
 *       500:
 *        description: 서버 에러
 */
router.post('/users/:userIndex/receipt/:receiptIndex/image', jwtToken.verifyToken, receipt.uploadImage);

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
 *                        ea:
 *                            type: number
 *                        content_img_url:
 *                            type: string
 *                            example: 'null 이면 기본 이미지, 아니면 url에 해당하는 이미지'
 *       400:
 *        description: receiptIndex 누락
 *       500:
 *        description: Server Error
 */
router.get('/users/:userIndex/receipts/:receiptIndex', jwtToken.verifyToken, receipt.loadReceiptsDetail);

/**
 * @swagger
 *  /users/:userIndex/receipts/date:
 *    post:
 *      tags: [Receipt]
 *      summary: userIndex 유저의 date 날짜의 모든 영수증 조회
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
 *        - in: "body"
 *          name: "date"
 *          description: "조회할 날짜"
 *          required: true
 *          schema:
 *              type: string
 *              properties:
 *                  date:
 *                      type: string
 *                      example: '2023.01.29'
 *      responses:
 *       200:
 *        description: date 날짜에 해당하는 영수증 정보
 *        schema:
 *            type: object
 *            properties:
 *                ReceiptInfo:
 *                    type: object
 *                    properties:
 *                        receipt_index:
 *                            type: number
 *                            example: 1
 *                        brand_name:
 *                            type: string
 *                            example: '스타벅스'
 *                        date:
 *                            type: string
 *                            example: '23.01.29'
 *                        total_cost:
 *                            type: string
 *                            example: '5,600원'
 *                        receipt_img_url:
 *                            type: string
 *                            example: '파리바게트_로고.png'
 *                        product_name:
 *                            type: Array
 *                            example: ['슈크림빵', '정통바게뜨']
 *                        ea:
 *                            type: Array
 *                            example: [1, 1]
 *       400:
 *        description: receiptIndex 또는 date 누락
 *       500:
 *        description: Server Error
 */
router.post('/users/:userIndex/receipts/date', jwtToken.verifyToken, receipt.loadReceiptsByDate);

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
 *        description: 모든 영수증 정보
 *        schema:
 *            type: object
 *            properties:
 *                UserInfo:
 *                    type: object
 *                    properties:
 *                        receipt_index:
 *                            type: number
 *                            example: 1
 *                        brand_name:
 *                            type: string
 *                            example: '세븐일레븐 일산점'
 *                        date:
 *                            type: string
 *                            example: '2023.01.29'
 *                        total_cost:
 *                            type: string
 *                            example: '8,900'
 *                        receipt_img_url:
 *                            type: string
 *                            example: '/images/99857F4F5E738F472F.png'
 *                        product_name:
 *                            type: Array
 *                            example: ['육개장 라면', '참깨라면', '참치마요 김밥']
 *                        ea:
 *                            type: Array
 *                            example: [1, 1, 1]
 *       400:
 *        description: receiptIndex 누락
 *       500:
 *        description: Server Error
 */
router.get('/users/:userIndex/receipts', jwtToken.verifyToken, receipt.loadReceipts);

/**
 * @swagger
 *  /users/:userIndex/favorite-food:
 *    get:
 *      tags: [User]
 *      summary: userIndex 유저가 가장 많이 결제한 음식 및 브랜드 세 가지 조회
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
 *        description: 유저가 가장 많이 결제한 음식 및 브랜드 정보
 *        schema:
 *            type: object
 *            properties:
 *                UserInfo:
 *                    type: object
 *                    properties:
 *                        brand_name:
 *                            type: Array
 *                            example: ['가메이', '가메이', '가메이']
 *                        product_name:
 *                            type: Array
 *                            example: ['돈까스정식', '런치 세트', '규동']
 *                        ea:
 *                            type: Array
 *                            example: [3, 2, 1]
 *                        receipt_img_url:
 *                            type: Array
 *                            example: ['/images/99857F4F5E738F472F.png', '/images/99857F4F5E738F472F.png', '/images/99857F4F5E738F472F.png']
 *       400:
 *        description: receiptIndex 누락
 *       500:
 *        description: Server Error
 */
router.get('/users/:userIndex/favorite-food', jwtToken.verifyToken, user.loadFavoriteFood);

router.get('/images/:fileName', receipt.loadImage);

router.post('/message', pusher.createReceipt)


module.exports = router;