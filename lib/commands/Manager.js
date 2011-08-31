var net = require("net"),
	debug = require("./Debug"),
	parser = require("./Parser"),
	error = require("./Error"),
	OPERATION_TYPE = require("./OperationType"),
	DbOpen = require("./DbOpen");

/*------------------------------------------------------------------------------
  (public) Manager
  
  + options {host, port, database, user, password}
  - void
  
  Set up connection manager.
------------------------------------------------------------------------------*/
var Manager = module.exports = function Manager(options) {
	this._options = options;
	
	// hash of the supported operations
	this._operations = {
		dbOpen: new DbOpen()
	};
	
	// protocol version which this client is using
	this._PROTOCOL_VERSION = 5;
	this._socket = null;
	
	// set up logging options
	debug.options({
		logOperations: options.logOperations,
		logErrors: options.logErrors
	});
	
	// session ID
	this._sessionID = -1;
	
	// count of commands executed from the module initiation
	this._commandsCount = 0;
	
	// queue with currently executing commands
	this._commandQueue = [];
	
	// initiate connection with the server
	this._init();
};

Manager.prototype = new process.EventEmitter();

/*------------------------------------------------------------------------------
  (private) _init
  
  + none
  - void
  
  Initiate connection with the server.
------------------------------------------------------------------------------*/
Manager.prototype._init = function() {
	var self = this,
		first = true;
	
	self._socket = net.createConnection(
		self._options.port,
		self._options.host
	);
	self._socket.setEncoding("utf8");
	debug.log("Connecting");
	
	self._socket.on("connect", function() {
		debug.log("Connected");
	});

	self._socket.on("data", function (data) {
		if(first) {
			
			if(self._PROTOCOL_VERSION !== parser.readShort(data)) {
				debug.log(
					"Server protocol version is not supported - " +
					"This driver supports only version " + 
					self._PROTOCOL_VERSION
				);
				self._socket.destroy();
				return;
			}
			first = false;
		} else {
			self._readResponse(data);
		}
	});

	self._socket.on("close", function (hadError) {
		debug.log("Closed " + hadError);
	});
};

/*------------------------------------------------------------------------------
  (private) _readResponse
  
  + data
  - void
  
  Parse data received from socket.
------------------------------------------------------------------------------*/
Manager.prototype._readResponse = function(data) {
	var self = this,
		command;
		
	command = self._commandQueue.shift();
	
	debug.log(
		"Response - " +
		data.length + " B - " +
		"Operation " + 
		command.operationType +
		" Sequence " + command.sequence
	);
	
	switch(command.operationType) {
		case OPERATION_TYPE.SHUTDOWN:
			break;
		case OPERATION_TYPE.CONNECT:
			break;
		case OPERATION_TYPE.DB_OPEN:
			self._operations.dbOpen.read(data, function(errorData, result) {			
				if(errorData) {
					var foo = error.parse(errorData);
					
					
					debug.log(debug.look(foo).join("\n"));
				}
			
				if(result) {
					self._sessionID = result.sessionID;
				}
				self.emit("response", errorData, result, command);
			});
			break;
		default:
			break;
	}
};

/*------------------------------------------------------------------------------
  (private) _writeRequest
  
  + operationType
  + data
  + callback
  - void
  
  Send operation request to the server.
------------------------------------------------------------------------------*/
Manager.prototype._writeRequest = function(operationType, data, cmdCallback) {
	var self = this,
		command;
	
	command = {
		sequence: ++self._commandsCount,
		operationType: operationType,
		callback: cmdCallback
	};
	
	if((self._sessionID !== -1) || 
	   (operationType === OPERATION_TYPE.CONNECT) ||
	   (operationType === OPERATION_TYPE.DB_OPEN)) {
		switch(operationType) {
			case OPERATION_TYPE.SHUTDOWN:
				break;
			case OPERATION_TYPE.CONNECT:
				break;
			case OPERATION_TYPE.DB_OPEN:
				self._operations.dbOpen.write(
					self._socket, 
					self._sessionID, 
					data,
					function() {
						self._commandQueue.push(command);
					}
				);
				break;
			default:
				break;
		}
	} else {
		debug.log(
			"Cannot send request - " +
			"Client has no session ID assigned"
		);
	}
	
	debug.log(
		"Request - Operation " + 
		command.operationType + 
		" - Sequence " + 
		command.sequence
	);
};