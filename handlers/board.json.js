let db_manager = require('../db_manager/manager');

exports.eval = async function(headers, post){
    return new Promise(async function (resolve) {
        let board_id = post.board_id || "invalid-board";
        let user_id = 0;
        let returnDat = {id: board_id};//defaults;

        if(!board_id){
            returnDat.success = false;
            returnDat.msg = "Board not found.";
            returnDat.close = true;
            return resolve(returnDat);
        }

        //gets the tasks and data for board "post.board_id"

        let accClient = db_manager.getAccConnectionWrite();
        let boardClient = db_manager.getBoardConnectionWrite();

        let isInBoard = await accClient.execute("SELECT admin_level FROM account_data.user_boards WHERE user_id=? AND board_id=?;", [user_id, board_id],
            { prepare : true }).catch(e=>console.log(e));
        isInBoard = !!isInBoard.rows[0];

        if(!isInBoard){
            returnDat.success = false;
            returnDat.close = true;
            returnDat.msg = "Board not found or you are not a member of this board.";
            return resolve(returnDat);
        }

        let tasks = await boardClient.execute("SELECT * FROM board_data.tasks WHERE is_top=true AND board_id=?",
            [board_id], { prepare : true }).catch(e=>console.log(e));

        tasks = tasks.rows;
        returnDat.exists = true;
        returnDat.tasks = tasks;

        db_manager.close(accClient);
        db_manager.close(boardClient);

        resolve(returnDat);
    })
}