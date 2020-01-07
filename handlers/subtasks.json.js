let utils = require('../commons');
let db_manager = require('../db_manager/manager');

exports.eval = async function(headers, post){
    return new Promise(async function (resolve) {
        //Return data
        let returnDat = {};
        //Get the board id & user ID
        let board_id = post.board_id || "invalid-board";
        let task_id = post.task_id || -1;
        let user_id = post.uid;

        //Check it matches the ReGex for a correct board ID
        if(!utils.isValidBoardID(board_id)){
            return resolve(utils.noBoardError());
        }

        //Check its a valid category
        if(utils.invalidInt(task_id)){
            return resolve(utils.catNoFound());
        }

        //Checks if the user is in the board and gets their permission level (if applicable)
        let level = await utils.getPermissionLevel(user_id, board_id);
        if(level == null){
            //The user was not in a board or otherwise lacked permissions for this action (if applicable)
            return resolve(utils.noBoardError());
        }

        let boardClient = db_manager.getBoardConnectionWrite();
        let board_query = "SELECT details, title, is_top, task_id, status, parent_id, due_date FROM board_data.tasks WHERE board_id=? AND root_node_id=? AND is_top IN (true, false);";
        let data = await boardClient.execute(board_query, [board_id, task_id], {prepare: true}).catch(e=>console.log(e));
        db_manager.close(boardClient);

        if(!data){
            return resolve(utils.catNoFound());
        }
        if(!data.rows[0]){//<-- There were no rows returned.
            return resolve(utils.catNoFound());
        }

        //Order the tasks by parent_id ascending.
        //This way we can work from the bottom to the top
        //in order to build a tree.
        //(ORDER BY) wont work as parent_id isn't a PK

        returnDat['taskData'] = data.rows.sort(
            (a,b) => {return a.parent_id - b.parent_id});

        resolve(returnDat);
    })
}