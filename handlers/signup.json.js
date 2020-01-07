let utils = require('../commons');
let db_manager = require('../db_manager/manager');
let bcrypt = require('bcrypt');
const uuid = require('uuid/v4');

exports.eval = async function(headers, post){
    return new Promise(async function (resolve) {
        //Return data
        let returnDat = {};

        //Get username and pwd
        let username = post.username || "";
        let password = post.password || "";

        //Check length of username && pwd
        if(username.length < 4){
            return resolve({success: false, message: "Username must be at least 4 characters."});
        }
        if(username.length > 16){
            return resolve({success: false, message: "Username must be at most 16 characters."});
        }
        if(password.length < 6){
            return resolve({success: false, message: "Password must be at least 6 characters."});
        }
        if(password.length > 25){
            return resolve({success: false, message: "Password must be at less than 25 characters."});
        }

        //Check if user already exists (if so, return err)
        let accClient = db_manager.getAccConnectionRead();
        let queryData = await accClient.execute("SELECT id FROM account_data.user_lookup WHERE username=?;",
            [username.toLowerCase()],
            { prepare : true }).catch(e=>console.log(e));
        db_manager.close(accClient);

        //check if the user exists in the lookup
        if(queryData.rows[0]){
            return resolve({success: false, message: "User already exists."});
        }

        //Hash and store data
        let hash = await bcrypt.hash(password, 10);
        let uid = uuid();

        //Save to accounts and lookup (with lower case name);
        let now = new Date().getTime();
        accClient = db_manager.getAccConnectionWrite();
        await accClient.execute(
            "INSERT INTO account_data.accounts(id, username, last_login, signed_up, pwd)" +
            " VALUES(?,?,?,?,?);",
            [uid, username, now, now, hash],
            { prepare : true }).catch(e=>console.log(e));

        await accClient.execute(
            "INSERT INTO account_data.user_lookup(username, id)" +
            " VALUES(?,?);",
            [username.toLowerCase(), uid],
            { prepare : true }).catch(e=>console.log(e));

        db_manager.close(accClient);


        //Generate and reply with a JWT and refresh tokens
        let jwt = utils.generateJWT(uid, username);
        let refresh = utils.generateRefreshToken(uid, username);
        returnDat.jwt = jwt;
        returnDat.refresh = refresh;
        returnDat.success = true;

        //Resolve the data back to the client.
        resolve(returnDat);
    })
}