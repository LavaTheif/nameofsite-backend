// let defaults = require('../presets/userBoards.json');
let db_manager = require('../db_manager/manager');

exports.eval = async function(headers, post){
    return new Promise(async function(resolve) {
        let returnDat = {};

        let user_id = 0;

        let accClient = db_manager.getAccConnectionRead();
        let query = "SELECT * FROM account_data.user_boards WHERE user_id=?;";
        let usersBoards = await accClient.execute(query, [user_id], { prepare : true }).catch(e=>console.log(e));

        let boardClient = db_manager.getBoardConnectionRead();

        for(let i = 0; i < usersBoards.length; i++){
            let board = usersBoards[i];
            let board_id = board.board_id;
            let ret = {id: board_id, admin_level: board.admin_level};
            let board_query = "SELECT description, name, owner_id FROM board_data.board_data WHERE board_id=?;";
            let data = await boardClient.execute(board_query, [board_id], {prepare: true}).catch(e=>console.log(e));
            data = data[0];
            if(!data)
                continue;
            ret["name"] = data.name;
            ret["desc"] = data.description;

            let ownerData = await accClient.execute("SELECT username FROM account_data.accounts WHERE id=?;", [data.owner_id], { prepare : true }).catch(e=>console.log(e));
            ownerData = ownerData[0];
            if(!ownerData)
                ret["owner"] = "deleted.";
            else
                ret["owner"] = ownerData.username;

            returnDat[i+1] = ret;
        }

        db_manager.close(accClient);
        db_manager.close(boardClient);

        resolve(returnDat);
    })
}