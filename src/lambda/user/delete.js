var AWS = require("aws-sdk");
AWS.config.update({
    region: "us-east-1"
});
var moment = require("moment");

exports.handler = async function (event, context) {
    try {
        let request = event.queryStringParameters;
        const data = require('data-api-client')({
            secretArn: process.env.RDS_secret,
            resourceArn: process.env.RDS_arn,
            database: process.env.RDS_dbname,
            formatOptions: { treatAsLocalDate: true },
        })
        let query = `DELETE FROM tb_user WHERE (user_id = '${request.user_id}');`
        let item = [{}]
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
            body: JSON.stringify({})
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