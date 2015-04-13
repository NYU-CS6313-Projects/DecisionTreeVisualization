function toJson(x) 
{
  var result = {};
  result.name = x.rule;
 
  if ( (!!x.left && !x.left.value) ||
       (!!x.right && !x.right.value) )
    result.children = [];
  else
    result.size = parseInt(x.samples);
 
  var index = 0;
  if (!!x.left && !x.left.value)
    result.children[index++] = toJson(x.left);
 
  if (!!x.right && !x.right.value)
    result.children[index++] = toJson(x.right);
 
  return result;
}

var radius = (screen.height * 0.4);

var cluster = d3.layout.cluster()
    .size([360, radius - 120]);

var diagonal = d3.svg.diagonal.radial()
    .projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });

var svg = d3.select("#mainviz").append("svg")
    .attr("width", radius * 2)
    .attr("height", radius * 2)
  .append("g")
    .attr("transform", "translate(" + radius + "," + radius/1.5 + ")");

d3.json("data/ourTree.json", function(error, root) {
  var nodes = cluster.nodes(toJson(root));

  var link = svg.selectAll("path.link")
      .data(cluster.links(nodes))
    .enter().append("path")
      .attr("class", "link")
      .attr("d", diagonal);

  var node = svg.selectAll("g.node")
      .data(nodes)
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })

  node.append("circle")
      .attr("r", 4.5);

  node.append("text")
      .attr("dy", ".31em")
      .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
      .attr("transform", function(d) { return d.x < 180 ? "translate(8)" : "rotate(180)translate(-8)"; })
      .text(function(d) { return d.name; });
});

d3.select(self.frameElement).style("height", radius * 2 + "px");
