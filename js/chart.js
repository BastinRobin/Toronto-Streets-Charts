var treemap = function(data, conf) {
  //Data declaration
   var w = 1150,
       h = 800,
       root;  

  //Color scale define
  // var colorScale = d3.scale.category20c();
 var amount = d3.extent(_.pluck(data, conf['size']));

  var colorScale = d3.scale.linear()
    .clamp(true)
    .domain([amount[0],(amount[0] + amount[1]) / 2 ,amount[1]])
    .range(['#756bb1', '#bcbddc', '#efedf5']);

  if(conf['body']) {
    //Data nesting
     root = {  values: d3.nest()
              .key(function(d) {  return d[conf['head']]; })
              .key(function(d) {  return d[conf['body']]; })
              .rollup(function(d) { return d.map(function(d) { return { key: parseInt(d[conf['size']]) }; }); })
              .entries(data) };
  } else {
     //Data nesting
      root = {  values: d3.nest()
               .key(function(d) {  return d[conf['head']]; })
               .rollup(function(d) { return d.map(function(d) { return { key: parseInt(d[conf['size']]) }; }); })
               .entries(data) };
  }
  
  //Plot the data as treemap
  var treemap = d3.layout.treemap()
        .size([w, h])
        .sticky(true)
        .padding(1)
        .sort(function(a,b) { return a.value - b.value; })
        .children(function(d) { return d.values; }) 
        .value(function(d) { return d.key; }); 


      var svg = d3.select(".chart")
        .append("svg")
        .style("width", w + "px")
        .style("height", h + "px")
        .attr("transform", "translate(.5,.5)")
        .on('click', secondLevel);

      var cell = svg.selectAll(".cell")
              .data(treemap.nodes(root).filter(function(d) { return d.values; }) )
            
      // enter new elements 
      var cellEnter = cell.enter()
          .append("g") 
          .attr("class", "cell");    
      cellEnter.append("rect");   
      cellEnter.append("text"); 
            
      // update remaining elements 
      cell.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
      
      //Append rectangle
      cell.select("rect") 
            .attr("width", function (d) { return d.dx; })
            .attr("height", function (d) { return d.dy; })
            .attr('data-title', function (d, i) { 
              return d.key+','+d.value+','+'Infraction '+data[i]['time_of_infraction']+' Time'; })
            .style("fill", function(d) { return colorScale(d.value); });

      //Append text
      cell.select("text")
          .attr("x", function(d) { return d.dx / 2; })
          .attr("y", function(d) { return d.dy / 2; })
          .attr("dy", ".35em")  
          .attr("text-anchor", "middle")
          .style('font-size', function(d) { return d.dx / 5 + "px"; })
         .text(function(d) { return d.key; }) 

      $('[data-title]').tooltip({
              container: 'body',
              html: true,
              placement: 'right'
          });
}

// Second Level Treemap
var secondLevel = function() {
  d3.selectAll('.chart svg').remove();
  var data = JSON.parse(localStorage.data);
  treemap(data, {head: 'location1', body: 'location2', size: 'set_fine_amount'});
}



$(document).ready(function() {
  //Get the data via csv
  d3.csv('Parking_data.csv', function(data) {
    // plot treemap
    localStorage.setItem('data', JSON.stringify(data));
    treemap(data, {head: 'location1', size: 'set_fine_amount'});

  });

  //First Treemap
    var lastsearch = '';
    var $box = {};
    function add_search(search, chart) {
      var $chart = $(chart);
      $(search).on('keypress, change, keyup', function() {
        var search = $(this).val();
        if (lastsearch != search) {
          lastsearch = search;
          var re = new RegExp(search, "i");
          $('g', $chart).each(function(){
              $(this).css('opacity', re.test($(this).text()) ? '1.0': '0.1');
          });
        }
      });
    }


    add_search('.search', '.chart');
});

