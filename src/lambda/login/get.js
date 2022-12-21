var AWS = require("aws-sdk");
AWS.config.update({
    region: "us-east-1"
});
var jwt = require('jsonwebtoken');
var crypto = require("crypto");
exports.handler = async function (event, context) {
    let request = event.queryStringParameters;
    const data = require('data-api-client')({
        secretArn: process.env.RDS_secret,
        resourceArn: process.env.RDS_arn,
        database: process.env.RDS_dbname,
        formatOptions: { treatAsLocalDate: true },
    })
    let rows = undefined;
    let query = `select * from tb_user where user_id='${request.user_id}' order by idx desc`
    try {
        rows = await data.query(query)
    } catch (e) {
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
    //찾는 유저가 없다면,
    if (rows.records.length < 1) {
        let response = {
            isBase64Encoded: false,
            statusCode: 400,
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Access-Control-Expose-Headers": "*",
                "Access-Control-Allow-Origin": "*",
            },
            body: "error:user_does_not_exist"
        };
        return response
    }
    let user = rows.records[0];
    let passwordGiven = request.password;
    console.log(user);
    //암호가 맞는지?
    if (passwordGiven != undefined) {
        const storedPassword = user.password;
        const salt = user.salt;
        const passwordCalculated = crypto.createHmac('sha256', request.password)
            .update(salt)
            .digest('hex');
        if (passwordCalculated != storedPassword) {
            let response = {
                isBase64Encoded: false,
                statusCode: 400,
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    "Access-Control-Expose-Headers": "*",
                    "Access-Control-Allow-Origin": "*",
                },
                body: "error:invalid_user_id_or_password"
            };
            return response
        }
    }
    const issuer = "spark";
    const subject = "rubywave";
    let expiresIn = 60 * 24 * 7;
    let payload = {
        user_id: user.user_id,
        name: user.name,
        rank: user.rank,
        registered_date: user.registered_date,
    };
    //JWT 토큰 생성
    const token = jwt.sign({
        data: payload
    }, process.env.key, {
        algorithm: "HS512",
        expiresIn: expiresIn,
        header: {
            "alg": "HS512",
            "typ": "JWT"
        },
        issuer: issuer,
        subject: subject,
    });
    let response = {
        isBase64Encoded: false,
        statusCode: 200,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Expose-Headers": "*",
            "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ token: token })
    };
    return response
}
