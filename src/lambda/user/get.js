var AWS = require("aws-sdk");
AWS.config.update({
    region: "us-east-1"
});
var moment = require("moment");
var crypto = require("crypto");
exports.handler = async function (event, context) {
    try {
        let request = event.queryStringParameters;
        const password = request.password;

        const data = require('data-api-client')({
            secretArn: process.env.RDS_secret,
            resourceArn: process.env.RDS_arn,
            database: process.env.RDS_dbname,
            formatOptions: { treatAsLocalDate: true },
        })
        let rows = undefined;
        //유저가 있는지 체크
        let querySearch = `select * from tb_user where user_id='${request.user_id}' order by idx desc`
        try {
            rows = await data.query(querySearch)
        } catch (e) {
            let response = {
                isBase64Encoded: false,
                statusCode: 500,
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    "Access-Control-Expose-Headers": "*",
                    "Access-Control-Allow-Origin": "*",
                },
                body: "error:query_Error"
            };
            return response
        }
        if (rows.records.length > 0) {
            let response = {
                isBase64Encoded: false,
                statusCode: 400,
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    "Access-Control-Expose-Headers": "*",
                    "Access-Control-Allow-Origin": "*",
                },
                body: "error:user_already_exist"
            };
            return response
        }
        var salt = crypto.randomBytes(20).toString('hex');
        const passwordToStore = crypto.createHmac('sha256', password)
            .update(salt)
            .digest('hex');
        let query = `insert into tb_user (user_id,password,salt,rank) values(:user_id,:password,:salt,:rank)`
        let item = [{
            "user_id": request.user_id,
            "password": passwordToStore,
            "salt": salt,
            "registered_date": moment().format("YYYY-MM-DD HH:mm:ss"),
            "rank": (request.user_id == "spark") ? 10 : 1,
        }]
        console.log(item);
        const result = await data.query(query, item);
        let response = {
            isBase64Encoded: false,
            statusCode: 200,
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Access-Control-Expose-Headers": "*",
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({ item: item })
        };
        return response
    }
    catch (e) {
        console.log(e);
        let response = {
            isBase64Encoded: false,
            statusCode: 200,
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Access-Control-Expose-Headers": "*",
                "Access-Control-Allow-Origin": "*",
            },
            body: "error:invalid_token"
        };
        return response
    }
}