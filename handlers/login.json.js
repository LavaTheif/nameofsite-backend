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
        let uid = await accClient.execute("SELECT id FROM account_data.user_lookup WHERE username=?;",
            [username.toLowerCase()],
            { prepare : true }).catch(e=>console.log(e));
        uid = uid.rows[0];

        //check if the user exists in the lookup
        if(!uid){
            db_manager.close(accClient);
            return resolve({success: false, message: "Invalid username or password."});
        }
        uid = uid.id;

        let hash = await accClient.execute("SELECT pwd FROM account_data.accounts WHERE id=?;",
            [uid],
            { prepare : true }).catch(e=>console.log(e));
        db_manager.close(accClient);
        hash = hash.rows[0].pwd;

        //Hash and check data
        if(!(await bcrypt.compare(password, hash))){
            return resolve({success: false, message: "Invalid username or password."});
        }

        //update last login
        let now = new Date().getTime();
        accClient = db_manager.getAccConnectionWrite();
        //dont need to await, just used for logging user counts
        accClient.execute(
            "UPDATE account_data.accounts SET last_login=? WHERE id=?;",
            [now, uid],
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