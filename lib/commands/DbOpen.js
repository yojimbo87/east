var parser = require("./Parser"),
	OPERATIONTYPE = require("./OperationType");
	
/*------------------------------------------------------------------------------
  (public) DbOpen
  
  + none
  - void
  
  Constructor - set up parser.
------------------------------------------------------------------------------*/
var DbOpen = module.exports = function DbOpen() {
	this._indexCursor = 13;
};

/*------------------------------------------------------------------------------
  (public) read
  
  + data
  + callback
  - void
  
  Read respone from server and emits response event.
------------------------------------------------------------------------------*/
DbOpen.prototype.read = function(data, callback) {
	var self = this,
		indexCursor = this._indexCursor,
		result = {
			status: 0,
			sessionID: 0,
			clustersCount: 0,
			clusters: [],
			clusterConfig: null
		},
		cluster = {},
		i, j, tempInt;
	
	// status
	result.status = parser.readByte(data[0]);
	//console.log("status: " + result.status);
	if(result.status === 1) {
		callback(
			data, 
			undefined
		);
		return;
	}

	// session ID
	result.sessionID = parser.readInt([
		data.charCodeAt(5),
		data.charCodeAt(6),
		data.charCodeAt(7),
		data.charCodeAt(8)
	]);
	//console.log("session ID: " + result.sessionID);
	
	// number of clusters
	result.clustersCount = parser.readInt([
		data.charCodeAt(9),
		data.charCodeAt(10),
		data.charCodeAt(11),
		data.charCodeAt(12)
	]);
	//console.log("number of clusters: " + result.clustersCount);
	
	// clusters
	for(i = 0; i < result.clustersCount; i++) {
		// cluster name length
		tempInt = parser.readInt([
			data.charCodeAt(indexCursor),
			data.charCodeAt(++indexCursor),
			data.charCodeAt(++indexCursor),
			data.charCodeAt(++indexCursor)
		]);

		// cluster name
		cluster["name"] = data.substring(
			++indexCursor, 
			indexCursor + tempInt
		);
		
		// cluster id
		indexCursor = indexCursor + tempInt;
		cluster["id"] = parser.readInt([
			data.charCodeAt(indexCursor),
			data.charCodeAt(++indexCursor),
			data.charCodeAt(++indexCursor),
			data.charCodeAt(++indexCursor)
		]);
		
		//cluster type length
		tempInt = parser.readInt([
			data.charCodeAt(++indexCursor),
			data.charCodeAt(++indexCursor),
			data.charCodeAt(++indexCursor),
			data.charCodeAt(++indexCursor)
		]);
		
		// cluster type
		cluster["type"] = data.substring(
			++indexCursor, 
			indexCursor + tempInt
		);
		
		// insert cluster into collection
		result.clusters.push(cluster);
		// clear cluster object
		cluster = {};
		// set index cursor to next value
		indexCursor = indexCursor + tempInt;
	}
	
	callback(undefined, result);
};

/*------------------------------------------------------------------------------
  (public) write
  
  + socket
  + sessionID
  + data
  + callback
  - void
  
  Write request to server and emits request event.
------------------------------------------------------------------------------*/
DbOpen.prototype.write = function(socket, sessionID, data, callback) {
	var buffer;
	
	// operation type
	//socket.write(parser.writeByte(OPERATIONTYPE.DB_OPEN, true));
	socket.write(parser.writeByte(500, true));
	
	// invoke callback imidiately when the operation is sent to the server
	callback();
	
	// session ID
	socket.write(parser.writeInt(sessionID, true));
	
	// database name
	buffer = new Buffer(data.database);
	socket.write(parser.writeInt(buffer.length, true));
	socket.write(buffer);
	
	// user name
	buffer = new Buffer(data.user);
	socket.write(parser.writeInt(buffer.length, true));
	socket.write(buffer);
	
	// password
	buffer = new Buffer(data.password);
	socket.write(parser.writeInt(buffer.length, true));
	socket.write(buffer);
};