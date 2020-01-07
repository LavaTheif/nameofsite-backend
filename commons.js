let db_manager = require('./db_manager/manager');

exports.noPost = function(){
    //This action requires post data.
    //None was provided. Return a malformed request error.
    let returnDat = {};
    returnDat.success = false;
    returnDat.msg = "Malformed Request(#000)";
    returnDat.close = true;
    return returnDat;
};

exports.isValidBoardID = function(id){
    //Checks the supplied id with regex.
    return new String(id).match(/^[a-zA-Z0-9]{8}$/);
};

exports.isRealTask = async function(board_id, is_top, root_node_id, task_id){
    let boardClient = db_manager.getBoardConnectionRead();
    let data = await boardClient.execute("SELECT task_id FROM board_data.tasks " +
        "WHERE board_id=? AND is_top=? AND root_node_id=? AND task_id=?;",
        [board_id, is_top, root_node_id, task_id],
        { prepare : true }).catch(e=>console.log(e));
    return data.rows[0];
};

exports.getPermissionLevel = async function(user_id, board_id){
    let accClient = db_manager.getAccConnectionRead();
    let level = await accClient.execute("SELECT admin_level FROM account_data.user_boards WHERE user_id=? AND board_id=?;", [user_id, board_id],
        { prepare : true }).catch(e=>console.log(e));
    return level.rows[0];
};

exports.noBoardError = function(){
    //The error pops up a lot
    //It is generated here for better maintainability
    let returnDat = {};
    returnDat.success = false;
    returnDat.msg = "Board not found.";
    returnDat.close = true;
    return returnDat;
}

exports.noPermError = function () {
    //The error pops up a lot
    //It is generated here for better maintainability
    let returnDat = {};
    returnDat.msg = "You are missing permissions for this action.";
    returnDat.success = false;
    return returnDat;
}
exports.catNoFound = function (){
    let returnDat = {};
    returnDat.msg = "Category not found.";
    returnDat.success = false;
    return returnDat;
}

exports.msgTooLong = function (){
    let returnDat = {};
    returnDat.msg = "Message too long (512 characters max).";
    returnDat.success = false;
    return returnDat;
}

exports.invalidInt = function(num){
    return num === -1 || isNaN(num)
}

function genRandHash(len){
    //Generates a random string of length 'len'
    let hash = "";
    for(let i = 0; i < len; i++){
        hash += String.fromCharCode(Math.floor(Math.random() * 256));
    }
    return hash;
}

//JWT Token Secret Key
const jwt = require('njwt');
if(!exports.secret){
    //On startup, we generate a random key.
    //This will log out all users by invalidating
    //their current tokens, however, it allows
    //for more security as nobody can predict the secret.
    exports.secret = genRandHash(25);
}

exports.generateJWT = function(userID, username){
    //Add the uid and username to the token
    //This allows us to ensure they're correct
    //as if the client attempts to change the
    //JWT token, it will be invalidated
    let data = { uid: userID, sub: username };
    //Generate and sign the token
    let token = jwt.create(data, exports.secret);
    //This token expires after 30 mins. After this,
    // a refresh token must be used to get a new one
    token.setExpiration(new Date().getTime() + 30*60*1000);
    return token.compact();
}

exports.generateRefreshToken = function(userID, username) {
    //Generate a refresh token (Only done on login || signup)
    let data = { uid: userID, sub: username, ref: true };
    //Generate and sign the token
    let token = jwt.create(data, exports.secret);
    //This token expires after 30 days. After this,
    // a user must log back into their account
    token.setExpiration(new Date().getTime() + 30*24*60*60*1000);
    return token.compact();
}

exports.validateJWT = async function(JWT){
    if(!JWT){
        //No token provided.
        return {error:true, message: "Invalid Token"}
    }
    //async operation, return a promise.
    return new Promise(async function (resolve) {
        //verify the supplied JWT using the generated secret
        jwt.verify(JWT, exports.secret, (err, verifiedJwt) => {
            if (err) {
                //Error. Perhaps token is invalid due to tampering
                //or maybe the servers have just restarted.
                resolve({error: true, message: "Invalid Token"});
            } else {
                //Return the JWT data.
                resolve(verifiedJwt);
            }
        })
    });
}

exports.issueNewToken = async function (refreshToken) {
    //The supplied JWT was invalid. Attempt to refresh it
    //verify that the refreshToken was valid.
    let data = await exports.validateJWT(refreshToken);
    if(!data.error){
        //Valid token, but is it a refresh token??
        if(data.body.ref === true){
            //It has the refresh attribute set, generate a new token with the same UID and name
            return {uid: data.body.uid, token: exports.generateJWT(data.body.uid, data.body.sub)};
        }else{
            //This isn't a refresh token.
            return {error: true, message: "Invalid Token"}
        }
    }else{
        //invalid token
        return data;
    }
}