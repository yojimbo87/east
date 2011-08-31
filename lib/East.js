var	debug = require("./commands/Debug"),
	Manager = require("./commands/Manager"),
	OPERATION_TYPE = require("./commands/OperationType");

/*------------------------------------------------------------------------------
  (public) East
  
  + options {host, port, database, user, password}
  - void
  
  Set up east module.
------------------------------------------------------------------------------*/
var East = module.exports = function East(options) {
	var clientOptions = options || {};

	this._options = {
		host: clientOptions.host || "localhost",
		port: clientOptions.port || 2424,
		database: clientOptions.database || "demo",
		user: clientOptions.user || "admin",
		password: clientOptions.password || "admin",
		logOperations: clientOptions.logOperations || false,
		logErrors: clientOptions.logErrors || false
	};
	
	// set up logging options
	debug.options({
		logOperations: this._options.logOperations,
		logErrors: this._options.logErrors
	});
	
	// initiate new manager which connects to the server with given options
	this._manager = new Manager(this._options);
	
	// listen to the respone event emitted when processed command is sent back
	// to the client with error or result and invoke particular callback
	this._manager.on("response", function(error, result, command) {
		//console.log("!!! response event !!! " + command.sequence);
		command.callback(error, result);
	});
	
	// listen to the respone event emitted when processed command is sent back
	// to the client with error or result and invoke particular callback
	if(this._options.logErrors) {
		this._manager.on("response_error", function(error, command) {
			debug.log();
		});
	}
};

/*------------------------------------------------------------------------------
  (public) dbOpen
  
  + callback(error, result)
  - void
  
  Executes DB_OPEN operation.
------------------------------------------------------------------------------*/
East.prototype.dbOpen = function(callback) {
	var self = this;
	
	self._manager._writeRequest(
		OPERATION_TYPE.DB_OPEN, 
		{
			database: self._options.database,
			user: self._options.user,
			password: self._options.password
		},
		callback
	);
};