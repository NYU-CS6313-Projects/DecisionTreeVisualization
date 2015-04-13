$(document).ready(function() {
  //calendar
	$('#ex1').slider({
		formatter: function(value) {
			return 'Current value: ' + value;
		}
	});



	d3.text("data/attribute.csv", function(data) {
                var parsedCSV = d3.csv.parseRows(data);

                var container = d3.select("#attr-list")

                    .selectAll("tr")
                        .data(parsedCSV).enter()
                        .append("tr")

                    .selectAll("td")
                        .data(function(d) { return d; }).enter()
                        .append("td")
                        .text(function(d) { return d; });
});
});



