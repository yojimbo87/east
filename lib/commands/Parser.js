/*------------------------------------------------------------------------------
  (public) readByte
  
  + byte
  - byte representing character code
  
  Parse byte to readable number.
------------------------------------------------------------------------------*/
module.exports.readByte = function(byte) {	
	return byte.charCodeAt(0);
};

/*------------------------------------------------------------------------------
  (public) readInt
  
  + bytes
  - string
  
  Parse bytes to readable number.
------------------------------------------------------------------------------*/
module.exports.readInt = function(bytes) {	
	return (bytes[0] << 24) +
		   (bytes[1] << 16) +
		   (bytes[2] << 8) +
		   bytes[3];
};

/*------------------------------------------------------------------------------
  (public) readShort
  
  + bytes
  - string
  
  Parse bytes to readable number.
------------------------------------------------------------------------------*/
module.exports.readShort = function(bytes) {
	/*var i = 0, 
		len = data.length,
		str = "";
	
	for (; i < len; i++) {
		 str += data.charCodeAt(i);
	}
	
	return str;*/
	
	/*return (bytes[0] << 8) +
		   bytes[1];*/
		   
	return bytes.charCodeAt(0) +
		   bytes.charCodeAt(1);
};

/*------------------------------------------------------------------------------
  (public) writeByte
  
  + data
  + useBuffer (optional) - when returned value should be a buffer
  - bytes or buffer
  
  Parse data to 4 bytes which represents integer value.
------------------------------------------------------------------------------*/
module.exports.writeByte = function(data, useBuffer) {
	var byte = [data];
	
	if(useBuffer) {
		return new Buffer(byte);
	} else {
		return byte;
	}
};

/*------------------------------------------------------------------------------
  (public) writeInt
  
  + data
  + useBuffer (optional) - when returned value should be a buffer
  - bytes or buffer
  
  Parse data to 4 bytes which represents integer value.
------------------------------------------------------------------------------*/
module.exports.writeInt = function(data, useBuffer) {
	var bytes = [];
	bytes[3] = data & (255);
	bytes[2] = (data & (65280))/256;
	bytes[1] = (data & (16711680))/65536;
	bytes[0] = (data & (4278190080))/16777216;
	
	if(useBuffer) {
		return new Buffer(bytes);
	} else {
		return bytes;
	}
};

/*------------------------------------------------------------------------------
  (public) writeString
  
  + data
  - buffer
  
  Parse string data to buffer with UTF-8 encoding.
------------------------------------------------------------------------------*/
module.exports.writeString = function(data) {
	return new Buffer(data, "utf8");
};