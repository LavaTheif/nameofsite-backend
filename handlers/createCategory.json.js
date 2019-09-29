// let defaults = require('../presets/userBoards.json');
let db_manager = require('../db_manager/manager');

exports.eval = async function(headers, post){
    return new Promise(async function(resolve) {
        let returnDat = {success: true};

        let user_id = 0;
        let board_id = post.board_id || "invalid-board";

        let accClient = db_manager.getAccConnectionWrite();
        let boardClient = db_manager.getBoardConnectionWrite();

        let level = await accClient.execute("SELECT admin_level FROM account_data.user_boards WHERE user_id=? AND board_id=?;", [user_id, board_id],
            { prepare : true }).catch(e=>console.log(e));
        let isInBoard = !!level.rows[0];

        if(!isInBoard || level.rows[0].admin_level <= 1){
            returnDat.msg = "Board not found or you are missing permissions for this action.";
            returnDat.success = false;
            return resolve(returnDat);
        }
        let epoch = 1569799548533;
        let task_id = new Date().getTime()-epoch;
        await boardClient.execute("INSERT INTO board_data.tasks(board_id, task_id, title, details, is_top, status) VALUES(?,?,?,?,?,?);",
            [board_id,task_id, "unnamed category", "-", true, 0], { prepare : true }).catch(e=>console.log(e));

        db_manager.close(accClient);
        db_manager.close(boardClient);
        returnDat.id = board_id;
        returnDat.success = true;
        resolve(returnDat);
    })
}
