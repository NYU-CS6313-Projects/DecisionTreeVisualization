
/******************************************************
	CONFIGURATION
******************************************************/

//var env = "prod";
var env = "dev"; //development

/******************************************************
	FILE
******************************************************/

var tree_file = (env === "dev") ? "data/tree_25_node.json" : "tree_contains_1.json";
var detailed_tree_file = (env === "dev") ? "data/tree_25_node_data.json" : "data/detailed_tree_huge.json";

//var tree_file = (env === "dev") ? "data/tree_small.json" : "tree_contains_1.json";
//var detailed_tree_file = (env === "dev") ? "data/detailed_tree_small.json" : "data/detailed_tree_huge.json";