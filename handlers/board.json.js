let utils = require('../commons');
let db_manager = require('../db_manager/manager');

//TODO
//feels like all the API endpoints all have very similar code that could be written better.
//Please check this out later.
//Working on it now, might wanna double check what ive done when im sober.


exports.eval = async function(headers, post){
    return new Promise(async function (resolve) {
        //Return data
        let returnDat = {};
        //Get the board id & user ID
        let board_id = post.board_id || "invalid-board";
        let user_id = post.uid;

        //Check it matches the ReGex for a correct board ID
        if(!utils.isValidBoardID(board_id)){
            return resolve(utils.noBoardError());
        }

        //gets the tasks and data for board board_id

        //Checks if the user is in the board and gets their permission level (if applicable)
        let level = await utils.getPermissionLevel(user_id, board_id);
        if(level == null){
            //The user was not in a board or otherwise lacked permissions for this action (if applicable)
            return resolve(utils.noBoardError());
        }

        //Queries the tasks list for categories on this board.
        let boardClient = db_manager.getBoardConnectionWrite();
        let tasks = await boardClient.execute("SELECT * FROM board_data.tasks WHERE is_top=true AND board_id=?",
            [board_id], { prepare : true }).catch(e=>console.log(e));
        //Close Connection
        db_manager.close(boardClient);


        //Pass the returned database rows to the return data and mark exists.
        //TODO Should I really be querying *?? This seems like a waste, please think about limiting it to just what is needed.
        tasks = tasks.rows;
        returnDat.exists = true;
        returnDat.tasks = tasks;
        returnDat.id = board_id;

        //Resolve the data back to the client.
        resolve(returnDat);
    })
}