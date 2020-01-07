let db_manager = require('../db_manager/manager');
let utils = require('../commons');

exports.eval = async function(headers, post){
    return new Promise(async function(resolve) {
        //Return data
        let returnDat = {};
        //Get the board id & user ID
        let board_id = post.board_id || "invalid-board";
        let is_top = post.is_top === true;
        let user_id = post.uid;

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

        if(level.admin_level <= 3){
            //users permission level is too low.
            return utils.noPermError();
        }

        if(is_top){
            root_id = task_id;
        }

        //Delete category.
        let boardClient = db_manager.getBoardConnectionWrite();
        await boardClient.execute("DELETE FROM board_data.tasks WHERE board_id=? AND task_id=? AND root_node_id=? AND is_top=?;",
            [board_id, task_id, root_id, is_top], { prepare : true }).catch(e=>console.log(e));

        db_manager.close(boardClient);
        returnDat.success = true;
        resolve(returnDat);
    })
}
