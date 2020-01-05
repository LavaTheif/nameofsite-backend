# logger
A simple logging application to easily store all logs centrally.

#

Supported databases: Cassandra, Mongoose.

Coming soon: SQL, MySQL + Others

## Server & Client combo

### Server setup
The server files are located in /server/.

- Download and the files to a directory on your computer.
- Open the config.json, and set the db_type to the database you want to use, and set username and password to the valid login details.
- Set the ip and port to the correct one for your database.
- (optional) set the schema to whatever you want, by default it is 'logs'.
- (optional) change the server_port to another port for the server to listen on.
- Install the package required to talk to your database (you do not need to install the packages for the other databases).  These can be found in the requirements.txt

Now you should be able to start the server up by running app.js in node.

### Client setup (JS)
The client files are located in /client/.

Drop the loggerClient.js into your workspace and initialise it like this:

`const logger = require('./loggerClient.js').init("AppName", "Instance_ID", "IP", port);`

where "AppName" is the name of your application,
and "Instance_ID" is the ID of that instance.  This is useful for if you are running multiple servers and need to know
which one caused an error.  If you will not be running multiple instances, it can be anything, otherwise we recommend
setting it in a config file and reading it from there.

###### Note: If you are running locally on the default port, then you wont need to supply an IP or port.


Once the logger is initialised, you can send your logs to the central server.
These can be info, warnings, errors, critical, or major logs.

When you send a log, you have three fields: message, data, and use_stack_trace, however you do not need all of them
#### Below are a few examples of how the logger can be used.

```
logger.info("User account created", {time: timestamp, id: account_id}, false);
//This will create an info log saying that a user account was created.  It will also have the data about the time and
//account id logged with it to make it easier to search logs.
```
```
logger.err("IndexOutOfBounds", {list: list_of_cars, index: i}, true);
//This will create an error log for an index error.  It will include the list it was searching, and the index it tried
//to access.  It will also include the stacktrace to where the log was created so you will be able to debug it easier.
```
```
logger.warn("Warning: LavaTheif added random warning logs");
//If you just want to log a message, then you can leave the data and use_stack_trace fields empty and they will default
//to {} and false respectively.  Additionally, you are able to leave use_stack_trace blank rather than writing false
//when you only want to log a message and some data
```

### Coming soon: Multiple language support, so you can send logs to the server from any language you choose to work in.

## Serverless Setup (JS Only)
###### Note: To query the serverless setup, only the command line interface is available.

Copy the /client/ and /server/ directory into the workspace.
Configure the database settings (See server setup for details).  Note, since this is a serverless setup, server_port can be ignored.

Copy the loggerServerless.js into the workspace and initialise it like this:

`const logger = require('./loggerServerless.js').init("AppName", "Instance_ID");`

Where AppName and Instance_ID are the same as in the client setup.

The logger can now be used in the same way as Client setup (JS), however it will save the data directly to the database, rather than sending it to a server first.

## Accessing logs

### CLI
To query the logs via the command line, start by navigating to the /server/query directory.  Here, you will find a query.js file which handles the querying of the databases.

Start by running the file with `node query.js --help`.  It will show you a help menu containing all the available arguments for the command.
Using these arguments, you are able to edit the time, severity, and number of logs returned, aswell as toggling a few values.
The usage for the command is `node query.js --run [args]`

### Web Interface
Coming soon!
