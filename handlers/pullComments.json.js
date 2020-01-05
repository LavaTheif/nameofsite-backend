let utils = require('../commons');
let db_manager = require('../db_manager/manager');

exports.eval = async function(headers, post){
    return new Promise(async function(resolve) {
        //Return data
        let returnDat = {};
        //Get the board id & user ID
        let board_id = post.board_id || "invalid-board";
        let user_id = post.uid;

        //Check it matches the ReGex for a correct board ID
        if(!utils.isValidBoardID(board_id)){
            return resolve(utils.noBoardError());
        }

        let task_id = Number(post.task_id) || -1;

        if(utils.invalidInt(task_id)){
            return resolve(utils.catNoFound());
        }

        //Checks if the user is in the board and gets their permission level (if applicable)
        let level = await utils.getPermissionLevel(user_id, board_id);
        if(level == null){
            //The user was not in a board
            return resolve(utils.noBoardError());
        }

        // //Check that the task with task_id actually exists.
        // let validTask = await utils.isRealTask(board_id, false, root_id, task_id);
        // if(!validTask){
        //     return resolve(utils.catNoFound());
        // }

        let boardClient = db_manager.getBoardConnectionRead();

        let commentData = await boardClient.execute(
            "SELECT content, user_id, comment_id, timestamp " +
            "FROM board_data.comments WHERE task_id=?",
            [task_id], { prepare : true }).catch(e=>console.log(e));

        //Close Connection
        db_manager.close(boardClient);

        //return results to client.
        returnDat.id = board_id;
        returnDat.comments = commentData.rows;
        returnDat.success = true;
        resolve(returnDat);
    })
}
