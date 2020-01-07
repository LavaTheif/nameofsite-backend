let utils = require('../commons');
let db_manager = require('../db_manager/manager');

exports.eval = async function(headers, post){
    return new Promise(async function (resolve) {
        //Return data
        let returnDat = {};
        //Get the user IDs
        let user_id = post.uid;
        let users = post.uuids;

        if(!users || users.length === 0){
            return resolve({success: false, message:"no users specified"});
        }

        let accountClient = db_manager.getAccConnectionRead();

        //TODO: also get pfp etc
        //Actually, might just have the users pfp
        //stored as api.url.thingy/images/users/UUID.ext
        let userData = await accountClient.execute(
            "SELECT id, username " +
            "FROM account_data.accounts WHERE id IN ?",
            [users], { prepare : true }).catch(e=>console.log(e));

        //Close Connection
        db_manager.close(accountClient);

        //return results to client.
        returnDat.data = userData.rows;
        returnDat.success = true;
        resolve(returnDat);
    })
}