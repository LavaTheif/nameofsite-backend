let utils = require('../commons');
let db_manager = require('../db_manager/manager');

exports.eval = async function(headers, post){
    return new Promise(async function(resolve) {
        //Return data
        let returnDat = {};
        //Get the board id & user ID
        let board_id = post.board_id || "invalid-board";
        let content = post.content;
        let user_id = post.uid;

        if(!content || content.length > 512 || content.length === 0){
            //if the message is too long then return an error.
            //also checks if message doesn't exist and returns an error.
            return resolve(utils.msgTooLong());
        }

        //Check it matches the ReGex for a correct board ID
        if(!utils.isValidBoardID(board_id)){
            return resolve(utils.noBoardError());
        }

        let task_id = Number(post.task_id) || -1;
        let root_id = Number(post.root_id) || -1;

        if(utils.invalidInt(task_id) || utils.invalidInt(root_id)){
            return resolve(utils.catNoFound());
        }

        //Checks if the user is in the board and gets their permission level (if applicable)
        let level = await utils.getPermissionLevel(user_id, board_id);
        if(level == null){
            //The user was not in a board or otherwise lacked permissions for this action (if applicable)
            return resolve(utils.noBoardError());
        }

        //Check that the task with task_id actually exists.
        let validTask = await utils.isRealTask(board_id, false, root_id, task_id);
        if(!validTask){
            return resolve(utils.catNoFound());
        }

        //Generate a new id and insert the data into the db.
        let boardClient = db_manager.getBoardConnectionWrite();
        let epoch = 1569799548533;
        let now = new Date().getTime();
        let comment_id = now-epoch;
        //comment_id BIGINT, task_id BIGINT, user_id VARCHAR, content VARCHAR, timestamp BIGINT

        await boardClient.execute("INSERT INTO board_data.comments" +
            "(comment_id, task_id, user_id, content, timestamp) VALUES(?,?,?,?,?);",
            [comment_id, task_id, user_id, content, now], { prepare : true }).catch(e=>console.log(e));

        //Close Connection
        db_manager.close(boardClient);

        //return results to client.
        returnDat.id = board_id;
        returnDat.comment_id = comment_id;
        returnDat.success = true;
        resolve(returnDat);
    })
}
