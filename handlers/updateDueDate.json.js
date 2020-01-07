let utils = require('../commons');
let db_manager = require('../db_manager/manager');

exports.eval = async function(headers, post){
    return new Promise(async function(resolve) {
        //Return data
        let returnDat = {};
        //Get the board id & user ID
        let board_id = post.board_id || "invalid-board";
        let task_id = Number(post.task_id);
        let root_id = Number(post.root_id);
        let date = Number(post.date);
        let user_id = post.uid;

        //Check it matches the ReGex for a correct board ID
        if(!utils.isValidBoardID(board_id)){
            return resolve(utils.noBoardError());
        }

        if(utils.invalidInt(task_id) || utils.invalidInt(root_id) || utils.invalidInt(date)){
            return resolve(utils.catNoFound());
        }

        if(date < 0){
            return resolve({success: false, msg:"Invalid Date."});
        }

        //Checks if the user is in the board and gets their permission level (if applicable)
        let level = await utils.getPermissionLevel(user_id, board_id);
        if(level == null){
            //The user was not in a board or otherwise lacked permissions for this action (if applicable)
            return resolve(utils.noBoardError());
        }

        if(level.admin_level <= 1){
            //users permission level is too low.
            return utils.noPermError();
        }

        //Check that the task with task_id actually exists.
        let validTask = await utils.isRealTask(board_id, false, root_id, task_id);
        let validCategory = await utils.isRealTask(board_id, true, root_id, task_id);
        if(!validTask && !validCategory){
            return resolve(utils.catNoFound());
        }


        let boardClient = db_manager.getBoardConnectionWrite();
        await boardClient.execute("UPDATE board_data.tasks SET due_date=? WHERE board_id=? AND root_node_id=? AND task_id=? AND is_top=?;",
            [date, board_id, root_id, task_id, task_id===root_id], { prepare : true }).catch(e=>console.log(e));

        db_manager.close(boardClient);
        returnDat.id = board_id;
        returnDat.date = date;
        resolve(returnDat);
    })
}
