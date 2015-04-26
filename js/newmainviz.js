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


var width = screen.width*0.6,
    height = screen.height,
    radius = (screen.height * 0.3);

var pos = 0;
var neg = 0;

var x = d3.scale.linear()
    .range([0, 2 * Math.PI]);

var y = d3.scale.linear()
    .range([0, radius]);

var color = d3.scale.ordinal()
          .range(["#7d0c0c", "#801414", "#841c1c", "#872525", "#8b2d2d", "#923e3e", "#964747","#994f4f","#9d5858","#a16060","#a46868","#a87171","#ab7979","#af8282","#b38a8a","#b69393","#ba9b9b","#bda4a4","#c1acac","#c5b5b5"])

var svg = d3.select("#mainviz").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + (height / 3) + ")");

var partition = d3.layout.partition()
    .value(function(d) { return d.size; });

var arc = d3.svg.arc()
    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
    .innerRadius(function(d) { return Math.max(0, y(d.y)); })
    .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });

d3.json("data/ourTree.json", function(error, root) {
  var g = svg.selectAll("g")
      .data(partition.nodes(toJson(root)))
    .enter().append("g");

  var path = g.append("path")
    .attr("d", arc)
    .style("fill", function(d) { 
      //return color((d.children ? d : d.parent).name); 
      //var str = d.name.replace(/\s/g, '');
      var str = d.name.split(". ");
    
      //console.log(str);
      
      //var str = d.name.replace(/\s/g, '');
      if (str.length > 1){
        //str = str.split(".");
      
        
        str[0] = str[0].replace('[', '');
        str[0] = str[0].replace(' ', '');
        str[1] = str[1].replace('.', '');
        str[1] = str[1].replace(']', '');
        str[1] = str[1].replace(' ', '');

        pos= pos+parseInt(str[1]);
        neg= neg+parseInt(str[0]);
        //console.log(str[3]);
        console.log(pos);
       

        if (str[0] > str[1]){
           return "#A6A6A6"; //positive
        } else {
         
         return "#7D0C0C"; //negative
        }
      } else{
        return "#F5EFE4"; // patern
         
      }



    })
    .on("click", click);

  var text = g.append("text")
     //.attr("transform", function(d) { return "rotate(" + computeTextRotation(d) + ")"; })
     //.attr("x", function(d) { return y(d.y); })
     //.attr("dx", "6") // margin
     //.attr("dy", ".35em") // vertical-align
     //.text(function(d) { return d.name; });

  function click(d) {
    // fade out all text elements
   // text.transition().attr("opacity", 0);

    path.transition()
      .duration(750)
      .attrTween("d", arcTween(d))
      .each("end", function(e, i) {
          // check if the animated element's data e lies within the visible angle span given in d
          if (e.x >= d.x && e.x < (d.x + d.dx)) {
            // get a selection of the associated text element
            var arcText = d3.select(this.parentNode).select("text");
            // fade in the text element and recalculate positions
            arcText.transition().duration(750)
              .attr("opacity", 1)
              .attr("transform", function() { return "rotate(" + computeTextRotation(e) + ")" })
              .attr("x", function(d) { return y(d.y); });
          }
      });
  }
});

d3.select(self.frameElement).style("height", height + "px");

// Interpolate the scales!
function arcTween(d) {
  var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
      yd = d3.interpolate(y.domain(), [d.y, 1]),
      yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
  return function(d, i) {
    return i
        ? function(t) { return arc(d); }
        : function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return arc(d); };
  };
}

function computeTextRotation(d) {
  return (x(d.x + d.dx / 2) - Math.PI / 2) / Math.PI * 180;
}

console.log(pos);
console.log(neg);

