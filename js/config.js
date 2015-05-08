
/******************************************************
	CONFIGURATION
******************************************************/

//var env = "prod";
var env = "dev";

/******************************************************
	FILE
******************************************************/

var tree_file = (env === "dev") ? "data/tree_small.json" : "data/tree_huge.json";
var detailed_tree_file = (env === "dev") ? "data/detailed_tree_small.json" : "data/detailed_tree_huge.json";