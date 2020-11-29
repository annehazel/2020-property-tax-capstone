




var originalDatasetRHP =[];
var revDatasetRHP =[];


var margin = {top: 30, right: 30, bottom: 30, left: 100},
  width = 800 - margin.left - margin.right,
  height = 200 - margin.top - margin.bottom;


var svg = d3.select(".rev-heatmap")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform","translate(" + margin.left + "," + margin.top + ")");



d3.csv("/sites/default/files/2020-11/fisc_full_dataset_2017_update.csv", function(data) {

  var dataset = data;

    originalDatasetRHP.push({
      cityId: dataset.id_city,
      cityName: dataset.city_name,
      state: dataset.city_name.substring(0, 2),
      year: new Date(dataset.year, 0, 2),
      revType: 'General Revenue',
      amount: parseFloat(dataset.rev_general_city)
    },{
      cityId: dataset.id_city,
      cityName: dataset.city_name,
      state: dataset.city_name.substring(0, 2),
      year: new Date(dataset.year, 0, 1),
      revType: 'Own Source Revenue',
      amount: parseFloat(dataset.own_source_rev_city)
    },{
      cityId: dataset.id_city,
      cityName: dataset.city_name,
      state: dataset.city_name.substring(0, 2),
      year: new Date(dataset.year, 0, 1),
      revType: 'Property Tax Revenue',
      amount: parseFloat(dataset.tax_property_city)
    });

  return originalDatasetRHP;

	}).then(function(dataset) {


    var avgDatasetRHP = originalDatasetRHP.filter(
      function(d){
        return (d.cityName == "Average for All Cities" || 
        d.cityName == "Average for Core FiSCs" || 
        d.cityName == "Average for Legacy Cities");
      }
    );


    revDatasetRHP = originalDatasetRHP.filter(
      function(d){
        return (d.cityName != "Average for All Cities" && 
        d.cityName != "Average for Core FiSCs" && 
        d.cityName != "Average for Legacy Cities");
      }
    );


    var currentState = "MA";
    var currentRev = "Property Tax Revenue";

    varDatasetRHP = revDatasetRHP.filter(
      function(d){
        return (d.state == currentState && 
        d.revType == currentRev);
      }
    );


      console.log(varDatasetRHP);

      // Get list of unique cities in dataset
      //console.log(revDataset);

      var cities = [];

      for (index = 0; index < varDatasetRHP.length; index++) {
        cities.push(varDatasetRHP[index].cityName);
      }

      function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
      }

      cities = cities.filter(onlyUnique);

      console.log(cities)

      // Build X scales and axis:
      var x = d3.scaleTime()
        .range([ 0, width ])
        .domain([
         d3.min(revDatasetRHP, function(d) { return d.year; }),
         d3.max(revDatasetRHP, function(d) { return d.year; })
       ])

      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))

      // Build X scales and axis:
      var y = d3.scaleBand()
        .range([ cities.length*15, 0 ])
        .domain(cities)

      svg.append("g")
        .call(d3.axisLeft(y));

        // Create color scale for squares
        var myColor = d3.scaleLinear()
          .range(["white", "#69b3a2"])
          .domain([
           0,
           d3.max(varDatasetRHP, function(d) { return d.amount; })
         ])

        // Create the squares
        svg.selectAll()
          .data(varDatasetRHP)
          .enter()
          .append("rect")
          .attr("x", function(d) { return x(d.year) })
          .attr("y", function(d) { return y(d.cityName) })
          .attr("width", "15")
          .attr("height", y.bandwidth)
          .style("fill", function(d) { return myColor(d.amount)} )



        // d3.select("#visualization")
        //   .on("click", function(){

        //     cities = ["NY: Yonkers"];

        //     console.log(cities)

        //     y = d3.scaleBand()
        //       .range([ 100, 0 ])
        //       .domain(cities)

              
        //       //
        //       // svg.append("g")
        //       //   .call(d3.axisLeft(y));

        //     // Create the squares
        //     svg.selectAll("rect")
        //       .data(data)
        //       .enter()
        //       .attr("x", function(d) { return x(d.year) })
        //       .attr("y", function(d) { return y(d.cityName) })
        //       .attr("width", "13")
        //       .attr("height", y.bandwidth)
        //       .style("fill", function(d) { return myColor(d.amount)} )


        //   });



    })

