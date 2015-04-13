var smallradius = (screen.height * 0.1);

var smallcluster = d3.layout.cluster()
    .size([360, smallradius - 120]);

var diagonal = d3.svg.diagonal.radial()
    .projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });

var overview = d3.select("#overview").append("svg")
    .attr("width", smallradius * 2)
    .attr("height", smallradius * 2)
  .append("g")
    .attr("transform", "translate(" + smallradius + "," + smallradius + ")");

d3.json("data/ourTree.json", function(error, root) {
  var nodes = smallcluster.nodes(toJson(root));

  var link = overview.selectAll("path.link")
      .data(smallcluster.links(nodes))
    .enter().append("path")
      .attr("class", "link")
      .attr("d", diagonal);

  var node = overview.selectAll("g.node")
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

d3.select(self.frameElement).style("height", smallradius * 2 + "px");
