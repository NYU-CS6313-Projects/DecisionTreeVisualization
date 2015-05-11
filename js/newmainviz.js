var total_Right = 0;
var total_Wrong = 0;

var total_Real_Positive = 0;
var total_Real_Negative = 0;

var total_Predict_Positive = 0;
var total_Predict_Negative = 0;

var TP = 0;
var FP = 0;
var TN = 0;
var FN = 0;

function mapName(name){
    return realName[aliasName.indexOf(name)]; 
}

function uniq(a) { //remove duplicates
        var prims = {"boolean":{}, "number":{}, "string":{}}, objs = [];

        return a.filter(function(item) {
            var type = typeof item;
            if(type in prims)
                return prims[type].hasOwnProperty(item) ? false : (prims[type][item] = true);
            else
                return objs.indexOf(item) >= 0 ? false : objs.push(item);
        });
    }


function searchPath(path, obj, target) {
    for (var k in obj) {
        if (obj.hasOwnProperty(k))
            if (obj[k] === target)
                return path + "['" + k + "']"
            else if (typeof obj[k] === "object") {
                var result = search(path + "['" + k + "']", obj[k], target);
                if (result)
                    return result;
            }
    }
    return false;
}

function toJson(x,y) 
{
  var result = {};
  var labelName = "";
  var nodeSample = 0;
  
  result.id = x.id;
  result.depth = 0;
  result.color = "";
  result.from = "";
  result.path = "";
  result.leftVal = "";
  result.rightVal = "";

  

  x.rule = x.rule.replace(' <= 0.5000','');
  real = mapName(x.rule);

  if (real!=undefined){
    labelName = x.id + "////"+ x.rule+"////"+real;
  } else {
    labelName = x.id + "////"+  x.rule;
  }

  labelName=labelName.replace('diagnosis__','D:');
  labelName=labelName.replace('procedure__','P:');
  labelName=labelName.replace('HIERARCHY_','CCS-');
  result.name = labelName;
  
  result.samples=x.samples;
  result.rule=x.rule;
      if (y!= undefined && y.left!=undefined && y.right!=undefined){
        result.leftVal = y[0];
        result.rightVal = y[1];
    }
  
 
  if ( (!!x.left && !x.left.value) ||
       (!!x.right && !x.right.value) ){
    result.size = parseInt(x.samples);
    result.children = [];

    
  }
      
  else{ 
        result.size = parseInt(x.samples); 

        var str = result.rule;
        str = str.replace(' ','');
        str = str.split(".");
               
        str[0] = str[0].replace('[', '');
        str[1] = str[1].replace(']', '');



        var leftVal = parseInt(str[0]);
        var rightVal = parseInt(str[1]);

        result.leftVal = leftVal;
        result.rightVal = rightVal;


        result.name = "[-"+result.leftVal+",+"+result.rightVal+"]";

        if (result.leftVal > result.rightVal){
            result.color="#1f77b4"; //blue
        } else {
             
        //result.name = ""; //negative
        //result.name = "";
        result.color = "#7D0C0C"; //red
        }
    }
 
    var index = 0;
    if (y!= undefined && y.left!=undefined && y.right!=undefined){

        if (!!x.left && !x.left.value)
            result.children[index++] = toJson(x.left,y.left);
         
        if (!!x.right && !x.right.value)
            result.children[index++] = toJson(x.right,y.right);
        }
 
    return result;
  
}



// treeData, depth = 20, contains which, truth keys.
var treeData = null
// data, depth =20, directly from the python tree output. 
var data = null
// var csvData = null

/// tree_large, depth = 30,  contain which, truth keys.
var tree_large = null


d3.json(tree_file, function(error, _treeData) {
    if (error) {
        return console.warn(error);
    }
    treeData = _treeData;
    finishLoading();
});


function bro_key(key){
    tail = key.slice(-1)[0];
    if (tail === 'right') {
        bro = 'left';
    } else {
        bro = 'right';
    }
    key.pop();
    key.push(bro);
    return key;
}
function statsOfLeaf (data,key){
    var el = data;
    key.forEach(function(k) {
        el = el[k];
    });
    p = el[1];
    n = el[0];
    if (p < n) {
        tp = 0;
        fp = 0;
        tn = n 
        fn = p
    } else {
        tn = 0;
        fn = 0;
        tp = p
        fp = n
    }
    return [tp, tn, fp, fn]
} 
function splitLeaf(data_larger, key) {
    var el = data_larger;
    function getel(key){
        key.forEach(function(k) {    
        el = el[k];
    });
        return el
    }
    console.log
    /// the calculation of the right child
    key.push('right');
    var el_right = getel(key);
    right_n = el_right[0];
    right_p = el_right[1];
    right_sample = right_n + right_p
    right_rule = el_right['rule'];
    right_con = statsOfLeaf(data_larger, key);
    /// the calculation of the left child
    key.pop();
    key.push('left');
    var el_left = getel(key);
    left_n = el_left[0];
    left_p = el_left[1];
    left_sample = left_n + left_p
    left_rule = el_left['rule'];
    left_con = statsOfLeaf(data_larger, key);
    /// the calculation of the parent
    key.pop()
    parent_con = statsOfLeaf(data_larger,key);
    /// changing in the confusion matrix
    var con_change =[]
    for(var i = 0; i < left_con.length; i++){
       con_change.push(left_con[i] + right_con[i] - parent_con[i]);
    }
    /// the dict of the children and the changes in confusion matrix
    var children = {'left':{'samples':left_sample, 'rule': left_rule, "0": right_n , "1": right_p}, 'right':{'samples':right_sample, 'rule':right_rule, 0: right_n, 1: right_p}, 'confusion':con_change}
    return children;
} 
function delLeaves(data, key) {
    leaf_con = statsOfLeaf(data, key);
    bro = bro_key(key);
    bro_con = statsOfLeaf(data, bro);
    // console.log(leaf_con);
    // console.log(bro_con);
    key.pop()
    parent_con = statsOfLeaf(data,key)
    // console.log(parent_con)
    var con_change=[];
    for(var i = 0; i < leaf_con.length; i++){
       con_change.push(- leaf_con[i] - bro_con[i] + parent_con[i]);
    }
    var el = data;
      key.forEach(function(k) {
        el = el[k];
      });
    pos_parent = el[1]
    neg_parent = el[0]
    var change = {"confusion":con_change, 'samples':[pos_parent,neg_parent], 'attibute':el['rule']};
    return change
} 

function test(data,key){
    var el = data;
    key.forEach(function(k) {
        el = el[k];
    });
    console.log(el['which'])
    console.log(el)
    console.log('baa')
}
function finishLoading() {
    if (!data || !treeData) return;
    // console.log(delLeaves(data, ['left','left','left','left','right']));
    // console.log(delLeaves(data, ['left','left','right']));
    // the input data for the next line should change to 'tree_large'+ path
    console.log(splitLeaf(data,['right','right','right','right','right','right','right','right','right']))
    // console.log(test(data,['right','right','right','right','right','right','right']))


    // Calculate total nodes, max label length
    var totalNodes = 0;
    var maxLabelLength = 0;
    var maxSample = 0;
    var maxWidth = 43; //px
    var minWidth = 3; //px

    var selectedNode = null;

    // panning variables
    var panSpeed = 200;
    var panBoundary = 20; // Within 20px from edges will pan when dragging.
    // Misc. variables
    var i = 0;
    var duration = 750;
    var root;
    var linkedByIndex = {};
    var maxDepth = 0;
    var depthMap = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]]; //change it in smarter way!!!!

    // size of the diagram
    var viewerWidth = screen.width*0.6;
    var viewerHeight = screen.height;

    var tree = d3.layout.tree()
        //.size([viewerHeight, viewerWidth])
        .nodeSize([50])
        .separation(function(a, b) { return 3}); //TO DO : change according to children or not

    // define a d3 diagonal projection for use by the node paths later on.
    var diagonal = d3.svg.diagonal()
        .projection(function(d) {
            return [d.y, d.x];
        });

    function getLeftWidth(x){
        samples = x.leftVal + x.rightVal;
        if (x.leftVal != 0){
            percentage = (x.leftVal/maxSample);
            return (minWidth + ((percentage*maxWidth)));
        } else {
            return 0;
        }
        
    }

    function getRightWidth(x){
        samples = x.leftVal + x.rightVal;
        if (x.rightVal != 0){
            percentage = (x.rightVal/maxSample);
            return (minWidth + ((percentage*maxWidth)));
        } else {
            return 0;
        }
    }

    function isLeafNode(obj){
        
        if (obj.leftVal != undefined){
            //console.log(obj.target.leftVal);
            return true;
        } else {
            return false;
        }
    }
    
    function getDepth(parent, child){
        var newChild = child;
        var newParent = parent;
        var depth = 0;

        if ((parent.id != 0)&&(parent.id == undefined)){
            newChild = parent;
            newParent = parent.parent;
            depth = getDepth(newParent, newChild);
            
        }

        return 1+depth;
    }

    function getMaxDepth (obj) {
        var depth = 0;
        if (obj.children) {
            obj.children.forEach(function (d) {
                var tmpDepth = getMaxDepth(d)
                if (tmpDepth > depth) {
                    depth = tmpDepth;
                }
            })
        }
        return 1 + depth;
    }


    function getPath(obj){
        path = "";
        while ((obj.id!=0)&&(obj.id != undefined)){ //parent
            path = obj.from + "," + path;
            obj = obj.parent;
        }
        path = path.substring(0,path.length-1);
        path = "[" + path + "]";
        return path;
    }

    function neighboring(parent, child) {
        return linkedByIndex[parent.id + "," + child.id];
    }

    function getAccuracy (obj){
        if (!obj.children) {
            var str = obj.rule;
            str = str.replace(' ','');
            str = str.split(".");
            str[0] = str[0].replace('[', '');
            str[1] = str[1].replace(']', '');
            // console.log(str[0])
        
            total_Real_Negative = total_Real_Negative + parseInt(str[0]);
            total_Real_Positive = total_Real_Positive+ parseInt(str[1]);

            if (parseInt(str[0]) > parseInt(str[1])){
                total_Right = total_Right + parseInt(str[0]);
                total_Wrong = total_Wrong + parseInt(str[1]);
                TN = TN + parseInt(str[0]);
                FN = FN +parseInt(str[1]);
                total_Predict_Negative = total_Predict_Negative + parseInt(str[1]) + parseInt(str[0]);
            }
            else{
                total_Right = total_Right + parseInt(str[1]);
                total_Wrong = total_Wrong + parseInt(str[0]);
                TP = TP + parseInt(str[1]);
                FP = FP + parseInt(str[0]);
                total_Predict_Positive = total_Predict_Positive + parseInt(str[1]) + parseInt(str[0]);

            }
            }
        
        else{
            obj.children.forEach(function (d){
                getAccuracy(d);
            })
        }
    }
       

    function visit(parent, visitFn, childrenFn) {
        if (!parent) return;

        visitFn(parent);

        var children = childrenFn(parent);
        if (children) {
            var count = children.length;
            for (var i = 0; i < count; i++) {
                visit(children[i], visitFn, childrenFn);

            }
        }
    }

    // Call visit function to establish maxLabelLength
    visit(toJson(treeData,data), function(d) {
        // console.log(d);
        totalNodes++;
        maxLabelLength = Math.max(d.name.length, maxLabelLength);
        maxSample = Math.max(maxSample,(d.leftVal+d.rightVal));

    }, function(d) {
        d.depth = getDepth(d); //assign depth to each node
        return d.children && d.children.length > 0 ? d.children : null;
    });

    // console.log(maxSample)


    maxDepth = getMaxDepth(toJson(treeData,data));
    getAccuracy(toJson(treeData,data));
    //console.log(total_Right);
    //console.log(total_Wrong);

    d3.select("#num_nodes")
    .text(totalNodes);
    d3.select("#depth")
    .text(maxDepth-1);
    d3.select("#branch_num")
    .text(totalNodes);
    // need revision to make it dynamic
    d3.select("#accuracy")
    .text(((total_Right/(total_Wrong+total_Right))*100).toFixed(2)+ "%");

    d3.select("#tp")
    .text(TP);
    d3.select("#fp")
    .text(FP);
    d3.select('#tn')
    .text(TN);
    d3.select('#fn')
    .text(FN);
    
    //console.log(total_Real_Negative);
    //console.log(total_Real_Positive);
    //console.log(total_Predict_Positive);
    //console.log(total_Predict_Negative);
    //console.log(TP,FP,TN,FN);


    // sort the tree according to the node names

    function sortTree() {
        tree.sort(function(a, b) {
            return b.name.toLowerCase() < a.name.toLowerCase() ? 1 : -1;
        });
    }
    // Sort the tree initially incase the JSON isn't in a sorted order.
    //sortTree();

    // TODO: Pan function, can be better implemented.

    function pan(domNode, direction) {
        var speed = panSpeed;
        if (panTimer) {
            clearTimeout(panTimer);
            translateCoords = d3.transform(svgGroup.attr("transform"));
            if (direction == 'left' || direction == 'right') {
                translateX = direction == 'left' ? translateCoords.translate[0] + speed : translateCoords.translate[0] - speed;
                translateY = translateCoords.translate[1];
            } else if (direction == 'up' || direction == 'down') {
                translateX = translateCoords.translate[0];
                translateY = direction == 'up' ? translateCoords.translate[1] + speed : translateCoords.translate[1] - speed;
            }
            scaleX = translateCoords.scale[0];
            scaleY = translateCoords.scale[1];
            scale = zoomListener.scale();
            svgGroup.transition().attr("transform", "translate(" + translateX + "," + translateY + ")scale(" + scale + ")");
            d3.select(domNode).select('g.node').attr("transform", "translate(" + translateX + "," + translateY + ")");
            zoomListener.scale(zoomListener.scale());
            zoomListener.translate([translateX, translateY]);
            panTimer = setTimeout(function() {
                pan(domNode, speed, direction);
            }, 50);
        }
    }

    // Define the zoom function for the zoomable tree

    function zoom() {
        svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }


    // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
    var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);


    // define the baseSvg, attaching a class for styling and the zoomListener
    var baseSvg = d3.select("#mainviz").append("svg")
        .attr("width", viewerWidth)
        .attr("height", viewerHeight)
        .attr("class", "overlay")
        .call(zoomListener);

    // Helper functions for collapsing and expanding nodes.

    function collapse(d) {
        if (d.children) {
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null;
        }
    }

    function expand(d) {
        if (d._children) {
            d.children = d._children;
            d.children.forEach(expand);
            d._children = null;
        }
    }

    var overCircle = function(d) {
        // console.log(d.name);
        //updateTempConnector();
    };
    var outCircle = function(d) {
        selectedNode = null;
        //updateTempConnector();
    };

    // Function to center node when clicked/dropped so node doesn't get lost when collapsing/moving with large amount of children.

    function setScale(val){
        zoomListener.scale(val);
    }

    function centerNode(source) {
        scale = zoomListener.scale();
        x = -source.x0;
        y = -source.y0;
        x = x * scale + viewerWidth / 2;
        y = y * scale + viewerHeight / 2;
        d3.select('g').transition()
            .duration(duration)
            .attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
        zoomListener.scale(scale);
        zoomListener.translate([x, y]);
    }

    // Toggle children function

    function toggleChildren(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else if (d._children) {
            d.children = d._children;
            d._children = null;
        }
        return d;
    }

    // Toggle children on click.

    function click(d) {
        if (state != ""){
            alert(state);
        } else {
            if (d3.event.defaultPrevented) return; // click suppressed
            d = toggleChildren(d);
            update(d);
            //centerNode(d);
        }
    }


    function update(source) {
        // Compute the new height, function counts total children of root node and sets tree height accordingly.
        // This prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
        // This makes the layout more consistent.
        var levelWidth = [1];
        var childCount = function(level, n) {

            if (n.children && n.children.length > 0) {
                if (levelWidth.length <= level + 1) levelWidth.push(0);

                levelWidth[level + 1] += n.children.length;
                n.children.forEach(function(d) {
                    childCount(level + 1, d);
                });
            }
        };
        childCount(0, root);
        var newHeight = d3.max(levelWidth) * 25; // 25 pixels per line  
        tree = tree.nodeSize([50]);

        // Compute the new tree layout.
        var nodes = tree.nodes(root).reverse(),
            links = tree.links(nodes);

        // Set widths between levels based on maxLabelLength.
        nodes.forEach(function(d) {
            d.y = (d.depth * (maxLabelLength * 2)); //maxLabelLength * 10px
            //d.y = (d.depth * (50)); //maxLabelLength * 10px
            // alternatively to keep a fixed scale one can set a fixed depth per level
            // Normalize for fixed-depth by commenting out below line
            //d.x = (d.depth * 500); //500px per level.
        });

        // Update the nodes…
        node = svgGroup.selectAll("g.node")
            .data(nodes, function(d) {
                return d.id || (d.id = ++i);
            });



        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) {
                return "translate(" + source.x0 + "," + source.y0 + ")";
            })
            .on('click', click)
            .attr('pointer-events', 'mouseover')
            .on("mouseover", function(node) {
                //console.log(getLeft(node));
                //overCircle(node);
            })
            .on("mouseout", function(node) {
                //outCircle(node);
            });

        nodeEnter.append("circle")
            .attr('class', 'nodeCircle')
            .attr("r", 0)
            .style("fill", function(d) {
                return d._children ? "lightsteelblue" : "#fff";
            });
            
        nodeEnter.append("rect")
            .attr('width', function(d) {
                if (d.id==0){
                    return 400;
                } else {
                    return 200;
                }
            })
            .attr('height',45)
            .attr('fill', 'white')
            .attr('x',function(d) {
                if (d.id==0){
                    return -200;
                } else {
                    return -100;
                }
            })
            .attr('y', 0)
            .style("visibility",function(d) {
                if (isLeafNode(d)){
                    //console.log(d);
                    return "visible";
                }
            });

        nodeEnter.append("text")
            // .attr("x", function(d) {
            //     //return d.children || d._children ? -10 : 10;
            // })
            .attr("dy", ".35em")
            .attr('class', 'nodeText')
            .attr("text-anchor", "middle") 
            .each(function(d) {
                var t = d3.select(this);
                var pos = 10;
                d.name.split("////").forEach(function(n) { 
                    t.append("tspan").text(n).attr({
                        "y": pos,
                        "x": 0
                    });
                    pos += 15;
                });
            })
            .style("fill-opacity", 0);
            //.style("visibility", "hidden");

        // phantom node to give us mouseover in a radius around it
        nodeEnter.append("circle")
            .attr('class', 'ghostCircle')
            .attr("r", 5)
            .attr("opacity", 1) // change this to zero to hide the target area
            .style("fill", function(d) {return d.color;})
            .attr('pointer-events', 'mouseover')
            .on("mouseover", function(node) {
                //overCircle(node);
            })
            .on("mouseout", function(node) {
                //outCircle(node);
            })
            .style("visibility","hidden");

        // Update the text to reflect whether node has children or not.
        node.select('text')
            .attr("x", function(d) {
                return d.children || d._children ? -10 : 10;
            })
            .attr("text-anchor", "middle");

        // Change the circle fill depending on whether it has children and is collapsed
        node.select("circle.nodeCircle")
            .attr("r", 4.5)
            .style("fill", function(d) {
                return d._children ? "lightsteelblue" : "#fff";
            })
            .style("visibility","hidden");

        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            });

        // Fade the text in
        nodeUpdate.select("text")
            .style("fill-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + source.x + "," + source.y + ")";
            })
            .remove();

        nodeExit.select("circle")
            .attr("r", 0);

        nodeExit.select("text")
            .style("fill-opacity", 0);

        // Update the links…
        var link = svgGroup.selectAll("path.link")
            .data(links, function(d) {
                return d.target.id;
            });

        var link2 = svgGroup.selectAll("path.link")
            .data(links, function(d) {
                return d.target.id;
            });



        // Enter any new links at the parent's previous position.
        var linkEnter = link.enter().insert("path", "g").classed("foo",true)
            .attr("class", "link")
            .attr("d", function(d) {
                var o = {
                    x: source.x0,
                    y: source.y0
                };
                return diagonal({
                    source: o,
                    target: o
                });
            })
            .attr("transform", "rotate(-270) scale(1,-1)")
            //.attr("transform", "scale(-1,1)")

            .style("stroke", function(d){
                if (isLeafNode(d.target)){
                    return "#1f77b4";
                } else {
                    return;
                }
            })
            .style("stroke-width", function(d){
                if (isLeafNode(d)){
                    return getLeftWidth(d.target);
                } else {
                    return getLeftWidth(d.target);
                }
            });

        // Transition links to their new position.
        var linkUpdate = link.transition()
            .duration(duration)
            .attr("d", diagonal)
            .style("stroke", function(d){
                if (isLeafNode(d.target)){
                    return "#1f77b4";
                } else {
                    return;
                }
            })
            .style("stroke-width", function(d){
                if (isLeafNode(d)){
                    return getLeftWidth(d.target);
                } else {
                    return getLeftWidth(d.target);
                }
            });

        var linkEnter2 = link2.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", function(d) {
                var o = {
                    x: source.x0,
                    y: source.y0
                };
                return diagonal({
                    source: o,
                    target: o
                });
            })
            .style("stroke", function(d){
                if (isLeafNode(d.target)){
                    return "#7D0C0C";
                } else {
                    return;
                }
            })
            .style("stroke-width", function(d){
                if (isLeafNode(d)){
                    return getRightWidth(d.target);
                } else {
                    return getRightWidth(d.target);
                }
            })
            .attr("transform", function(d){
                // console.log(getLeftWidth(d.target.id));
                // console.log(getLeftWidth(d.target));
                // console.log(getRightWidth(d.target));
                return "rotate(-270) scale(1,-1) translate(0,"+String(getLeftWidth(d.target))+")";
            });

                

        var linkUpdate2 = link2.transition()
            .duration(duration)
            .attr("d", diagonal)
            .style("stroke", function(d){
                if (isLeafNode(d.target)){
                    return "#7D0C0C";
                } else {
                    return;
                }
            })
            .style("stroke-width", function(d){
                if (isLeafNode(d)){
                    return getRightWidth(d.target);
                } else {
                    return getRightWidth(d.target);
                }
            });

        // Transition exiting nodes to the parent's new position.
        var linkExit = link.exit().transition()
            .duration(duration)
            .attr("d", function(d) {
                var o = {
                    x: source.x,
                    y: source.y
                };
                return diagonal({
                    source: o,
                    target: o
                });
            })
            .remove();

        var linkExit2 = link2.exit().transition()
            .duration(duration)
            .attr("d", function(d) {
                var o = {
                    x: source.x,
                    y: source.y
                };
                return diagonal({
                    source: o,
                    target: o
                });
            })
            .remove();

        // Stash the old positions for transition.
        nodes.forEach(function(d) {
            d.x0 = d.x;
            d.y0 = d.y;

            var curDepthMap = depthMap[d.depth];
            curDepthMap[curDepthMap.length] = d.id;
        });

        //assign left and right for each node
        
        links.forEach(function(d) {
            linkedByIndex[d.source.id + "," + d.target.id] = d;
        });



    }

    // Append a group which holds all nodes and which the zoom Listener can act upon.
    var svgGroup = baseSvg.append("g");

    // Define the root
    root = toJson(treeData,data);
    root.x0 = viewerHeight/2;
    root.y0 = viewerWidth/2;
    setScale(0.3);

    // Layout the tree initially and center on the root node.
    update(root);
    centerNode(root);

    /*

    var couplingParent1 = tree.nodes(root).filter(function(d) {
            return d['id'] === '1';
        })[0];
    var couplingChild1 = tree.nodes(root).filter(function(d) {
            return d['id'] === '77';
        })[0];

    
    multiParents = [{
                    parent: couplingParent1,
                    child: couplingChild1
                }];
    
    multiParents.forEach(function(multiPair) {
            svgGroup.append("path", "g")
            .attr("class", "link")
            .attr("transform", "rotate(-270) scale(1,-1)")
                .attr("d", function() {
                    var oTarget = {
                        x: multiPair.parent.x0,
                        y: multiPair.parent.y0
                    };
                    var oSource = {
                        x: multiPair.child.x0,
                        y: multiPair.child.y0
                    };
                    /*if (multiPair.child.depth === multiPair.couplingParent1.depth) {
                        return "M" + oSource.y + " " + oSource.x + " L" + (oTarget.y + ((Math.abs((oTarget.x - oSource.x))) * 0.25)) + " " + oTarget.x + " " + oTarget.y + " " + oTarget.x;
                    
                    return diagonal({
                        source: oSource,
                        target: oTarget
                    });
                });
        }); 

*/


    var allNodes = [];
    for (i =0 ; i< totalNodes ; i++){
        var targetNode = tree.nodes(root).filter(function(d) {
            return d['id'] === String(i);
        })[0];
        allNodes[allNodes.length] = targetNode;
    }

    console.log(allNodes)


    for (i=1; i<depthMap.length;i++){

        nodes = depthMap[i];
        flag = "right";
        for (j=0 ; j< nodes.length; j++){

            var targetNode = tree.nodes(root).filter(function(d) {
            return d['id'] === nodes[j];
            })[0];
            targetNode['from'] = flag;
            if (flag=="right"){
                flag = "left";
            } else {
                flag = "right"; 
            }
        }
    }

    allNodes.forEach(function(node){
        if (node!=undefined){
            node.path = getPath(node);
        }
    })



    var list1 = [];
    function getName (obj){
        if (obj.name!=""){
           list1.push(obj.name); 
        }
        if (obj.children) {
            obj.children.forEach(function (d) {
                getName(d);
            })
        }
    }


    var container = d3.select("#attr-list"); 
    getName(toJson(treeData,data));
    var arrayLength = list1.length;
    var new_ul = document.createElement('div');
    new_ul.id = "attr_button_group";
    new_ul.className = "btn-group-vertical";
    groupWidth = "width:"+String(screen.width/3.4)+"px;";
    new_ul.style.cssText = groupWidth;
    // Note, don't forget the var keyword!
    for (var i = 0, tr, td; i < arrayLength; i++) {

        if (list1[i].charAt(0) !='['){
            new_li = document.createElement('button');
            new_li.className = "btn btn-default";
            var nameArray = list1[i].split("////");
            var nameLabel = nameArray[0]+" "+nameArray[1]+" "+nameArray[2];
            new_li.appendChild(document.createTextNode(nameLabel));
            new_ul.appendChild(new_li);
            new_li.id=nameArray[0];
            new_li.onclick = function () {
                this_id = this.id;
                var targetNode = tree.nodes(root).filter(function(d) {
                return d['id'] === this_id;
                })[0];

                centerNode(targetNode);
                };
        }
        
    }
    $("#attr-list").append(new_ul);

    //AUTOCOMPLETE SEARCH ATTRIBUTE BOX
    var nameLabels = [];
    
    for (var i = 0 ; i<list1.length ; i++){
         if (list1[i].charAt(0) !='['){
            var nameArray = list1[i].split("////");
            var nameLabel = nameArray[0]+" "+nameArray[1]+" "+nameArray[2];
            nameLabels[nameLabels.length] = nameLabel
        }
    }

    $("#searchAttrButton").click(function(){
        searchValue =  document.getElementById("searchAttr").value;
        var nameArray = searchValue.split(" ");
        var this_id = nameArray[0];
        var targetNode = tree.nodes(root).filter(function(d) {
            return d['id'] === this_id;
        })[0];

        centerNode(targetNode);

    })

    $("#searchAttr").typeahead({ source:nameLabels });

    $("#searchAttr").keyup(function(event){
        if(event.keyCode == 13){
            $("#searchAttrButton").click();
        }
    });


    //PRUNING BY DEPTH
    $("#pruneNode").click(function() {
        sliderDepth = $("#ex6SliderVal").text();
        d3.select("#depth")
        .text(sliderDepth);

        allNodes.forEach(function(node){
            if (node!=undefined){
                expand(node);
            }
        })

        var node_ids = depthMap[sliderDepth];
        node_ids = uniq(node_ids);
        var nodes = [];
        var total_R = 0;
        var total_W = 0;
        var total_Real_Po = 0;
        var total_Real_Neg = 0;
        var total_Predict_Po = 0;
        var total_Predict_Neg = 0;
        var TP_1 = 0;
        var FP_1 = 0;
        var TN_1 = 0;
        var FN_1 = 0;

        node_ids.forEach(function(node_id){
            var targetNode = tree.nodes(root).filter(function(d) {
                return d['id'] === node_id;
            })[0];

            var names = targetNode['name'].split("////");

            if (names.length!=1){ //not leaf node
                targetNode['name'] = names[0]+"////"+names[1]+"////"+names[2]+"////"+"[-"+parseInt(targetNode.leftVal)+",+"+parseInt(targetNode.rightVal)+"]";
                }
            total_Real_Neg = total_Real_Neg + parseInt(targetNode.leftVal);
            total_Real_Po = total_Real_Po+ parseInt(targetNode.rightVal);
            console.log(targetNode.leftVal);

            a = parseInt(targetNode.leftVal);
            b = parseInt(targetNode.rightVal);
            if (a > b){
                total_R = total_R + a;
                total_W = total_W + b;
                TN_1 = TN_1 + a;
                FN_1 = FN_1 +b;
                total_Predict_Neg = total_Predict_Neg + a + b;
                }
            else{
                total_R = total_R + b;
                total_W = total_W + a;
                TP_1 = TP_1 + b;
                FP_1 = FP_1 + a;
                total_Predict_Po = total_Predict_Po + a + b;
            }
            nodes[nodes.length] = targetNode;
            
        });

        nodes.forEach(function(node){
            toggleChildren(node);
        })

        toggleChildren(root);
        update(root);

        d3.select("#accuracy")
        .text(((total_R/(total_W+total_R))*100).toFixed(2)+ "%");

        d3.select("#tp")
        .text(TP_1);

        d3.select("#fp")
        .text(FP_1);

        d3.select('#tn')
        .text(TN_1);

        d3.select('#fn')
        .text(FN_1);

        setTimeout(function(){
            toggleChildren(root);
            update(root);

        },1000);

        setTimeout(function () {
            var chart = c3.generate({
                data:{
                    x :'x',
                    columns: [
                    ['x', 'True Data', 'Predicted Data'],
                    ['Positive (Diabetes)', total_Real_Po, total_Predict_Po], 
                    ['Negative', total_Real_Neg, total_Predict_Neg],
                    ],
                    groups:[
                    ['Negative', 'Positive (Diabetes)']
                    ],
                    type: 'bar',
                    colors: {
                        'Positive (Diabetes)': '#7D0C0C',
                        'Negative': '#1f77b4'}, },
                    axis : {
                        x : {
                            type: 'categorized'
                        }
                    }
                });
        }, 2000);

    });

};

d3.json(detailed_tree_file, function(error, _data){
    if (error) return console.warn(error,'container');
    data = _data;
    finishLoading();
});

// var csvData = null
// d3.csv('/data/output.csv',function(error,_data){
//     if(error) return console.warn(error);
//     csvData= _data;
// //     finishLoading();
// });


