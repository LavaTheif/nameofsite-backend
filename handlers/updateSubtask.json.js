let utils = require('../commons');
let db_manager = require('../db_manager/manager');

exports.eval = async function(headers, post){
    return new Promise(async function(resolve) {
        //Return data
        let returnDat = {};
        //Get the board id & user ID
        let board_id = post.board_id || "invalid-board";
        let task_id = Number(post.task_id) || -1;
        let root_id = Number(post.root_id) || -1;
        let user_id = post.uid;

        //Check it matches the ReGex for a correct board ID
        if(!utils.isValidBoardID(board_id)){
            return resolve(utils.noBoardError());
        }

        if(utils.invalidInt(task_id) || utils.invalidInt(root_id)){
            return resolve(utils.catNoFound());
        }

        //Checks if the user is in the board and gets their permission level (if applicable)
        let level = await utils.getPermissionLevel(user_id, board_id);
        if(level == null){
            //The user was not in a board or otherwise lacked permissions for this action (if applicable)
            return resolve(utils.noBoardError());
        }

        if(level.admin_level <= 2){
            //users permission level is too low.
            return utils.noPermError();
        }

        //Check that the task with task_id actually exists.
        let validTask = await utils.isRealTask(board_id, false, root_id, task_id);
        if(!validTask){
            return resolve(utils.catNoFound());
        }


        let name = post.task_name || "unnamed";
        let desc = post.task_desc || "-";

        if(name.length > 25){
            returnDat.msg = "Max length: 25 characters.";
            returnDat.success = false;
            return resolve(returnDat);
        }
        if(desc.length > 252){
            returnDat.msg = "Max length: 252 characters.";
            returnDat.success = false;
            return resolve(returnDat);
        }

        let boardClient = db_manager.getBoardConnectionWrite();
        await boardClient.execute("UPDATE board_data.tasks SET title=?, details=? WHERE board_id=? AND root_node_id=? AND task_id=? AND is_top=false;",
            [name, desc, board_id, root_id, task_id], { prepare : true }).catch(e=>console.log(e));

        db_manager.close(boardClient);
        returnDat.id = board_id;
        returnDat.title = name;
        returnDat.details = desc;
        resolve(returnDat);
    })
}
