var Client = require("../../lib/East");
	
var client = new Client({database: "test", port: 2425, logOperations: true});

setTimeout(function() {
	client.dbOpen(function(error, result) {
		console.log("CLIENT:");
		if(error) {
			console.log("error!");
		}
		
		if(result) {
			console.log("CLUSTERS:" + result.clustersCount);
			/*for(i = 0; i < result.clustersCount; i++) {
				var foo = result.clusters[i];
				var str = "";
				for(var item in foo) {
					str += foo[item] + ", ";
				}
				console.log(i + ": " + str);
			}*/
		}
	});
	
	client.dbOpen(function(error, result) {
		console.log("CLIENT:");
		if(error) {
			console.log("error!");
		}
		
		if(result) {
			console.log("CLUSTERS:" + result.clustersCount);
			/*for(i = 0; i < result.clustersCount; i++) {
				var foo = result.clusters[i];
				var str = "";
				for(var item in foo) {
					str += foo[item] + ", ";
				}
				console.log(i + ": " + str);
			}*/
		}
	});
}, 5000);
