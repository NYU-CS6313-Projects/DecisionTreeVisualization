
var margin = {top: 20, right: 100, bottom: 20, left: 10},
    widthdist = 450 - margin.left - margin.right,
    heightdist = 120 - margin.top - margin.bottom;

var xdist = d3.scale.ordinal()
    .rangeRoundBands([0, widthdist], .1);

var ydist = d3.scale.linear()
    .rangeRound([heightdist, 0]);

var colordist = d3.scale.ordinal()
    .range(["#7D0C0C", "#1f77b4"]);

var xAxis = d3.svg.axis()
    .scale(xdist)
    .orient("bottom");

var color = d3.scale.ordinal()
          .range(["#7d0c0c", "#801414", "#841c1c", "#872525", "#8b2d2d", "#923e3e", "#964747","#994f4f","#9d5858","#a16060","#a46868","#a87171","#ab7979","#af8282","#b38a8a","#b69393","#ba9b9b","#bda4a4","#c1acac","#c5b5b5"])


// var yAxis = d3.svg.axis()
//     .scale(y)
//     .orient("left")
//     .tickFormat(d3.format(".0%"));

var classsvg = d3.select("#classDist").append("svg")
    .attr("width", widthdist + margin.left + margin.right)
    .attr("height", heightdist + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("data/classdist.csv", function(error, datadist) {
  color.domain(d3.keys(datadist[0]).filter(function(key) { return key !== "State"; }));

  datadist.forEach(function(d) {
    var y0 = 0;
    d.ages = color.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name]}; });
    d.ages.forEach(function(d) { d.y0 /= y0; d.y1 /= y0; });
  });

  datadist.sort(function(a, b) { return b.ages[0].y1 - a.ages[0].y1; });

  xdist.domain(datadist.map(function(d) { return d.State; }));

  classsvg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + heightdist + ")")
      .call(xAxis);

  classsvg.append("g")
      .attr("class", "y axis")
      //.call(yAxis);

  var state = classsvg.selectAll(".state")
      .data(datadist)
    .enter().append("g")
      .attr("class", "state")
      .attr("transform", function(d) { return "translate(" + xdist(d.State) + ",0)"; });

  state.selectAll("rect")
      .data(function(d) { return d.ages; })
    .enter().append("rect")
      .attr("width", xdist.rangeBand())
      .attr("y", function(d) { return ydist(d.y1); })
      .attr("height", function(d) { return ydist(d.y0) - ydist(d.y1); })
      .style("fill", function(d) { return colordist(d.name); });

  var legend = classsvg.select(".state:last-child").selectAll(".legend")
      .data(function(d) { return d.ages; })
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d) { return "translate(" + xdist.rangeBand() / 2 + "," + ydist((d.y0 + d.y1) / 2) + ")"; });

  legend.append("line")
      .attr("x2", 10);

  legend.append("text")
      .attr("x", 13)
      .attr("dy", ".35em")
      .text(function(d) { return d.name; });

});