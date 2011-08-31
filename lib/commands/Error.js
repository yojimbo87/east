var parser = require("./Parser"),
	debug = require("./Debug");


	
module.exports.parse = function(data) {
	var indexCursor = 0,
		response = {pairs: []},
		tempInt, tempClass, tempMessage;
	
	var more = parser.readByte(data[indexCursor]);
	
	// session ID
	var sid = parser.readInt([
		data.charCodeAt(++indexCursor),
		data.charCodeAt(++indexCursor),
		data.charCodeAt(++indexCursor),
		data.charCodeAt(++indexCursor)
	]);
	
	more = parser.readByte(data[++indexCursor]);
	
	while(more) {
		// exception class string length
		tempInt = parser.readInt([
			data.charCodeAt(++indexCursor),
			data.charCodeAt(++indexCursor),
			data.charCodeAt(++indexCursor),
			data.charCodeAt(++indexCursor)
		]);
		
		// exception class string
		tempClass = data.substring(
			++indexCursor, 
			indexCursor + tempInt
		);
		
		indexCursor = indexCursor + tempInt;
		
		// exception message string length
		tempInt = parser.readInt([
			data.charCodeAt(indexCursor),
			data.charCodeAt(++indexCursor),
			data.charCodeAt(++indexCursor),
			data.charCodeAt(++indexCursor)
		]);
		
		// exception message string
		tempMessage = data.substring(
			++indexCursor, 
			indexCursor + tempInt
		);
		
		indexCursor = indexCursor + tempInt;
		
		response.pairs.push({class: tempClass, message: tempMessage});
		
		more = parser.readByte(data[indexCursor]);
	}
	
	return response;
};