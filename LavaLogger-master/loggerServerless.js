/**
@author: LavaTheif
https://github.com/LavaTheif/LavaLogger/README.md

This is the serverless logger interface, which allows the programs to communicate without a server running.
This uses both the server and client files, however it skips the step of using sockets.
*/

exports.init = function(app_name, instance_id){
    return require('./client/loggerClient.js').init(app_name, instance_id, '', -1);
};
