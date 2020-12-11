if (jQuery('.var-heatmap').length) {



var originalDatasetRHP =[];
var revDatasetRHP =[];
var regionNE = ['MA', 'CT', 'ME', 'NH', 'RI', 'VT'];
var regionPAC = ['AK', 'CA', 'HI', 'OR', 'WA'];

var margin = {top: 30, right: 30, bottom: 30, left: 100};

// Function to convert Dates to strings
var formatTime = d3.timeFormat("%Y");


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


    for (i = 0; i < originalDatasetRHP.length; i++) {
      
      if (regionNE.includes(originalDatasetRHP[i].state)){
        originalDatasetRHP[i].region = 'New England';

      }
      else if (regionPAC.includes(originalDatasetRHP[i].state)){
        originalDatasetRHP[i].region = 'Pacific';

      }

    }

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
    var currentRegion = "New England";
    var currentRev = "Property Tax Revenue";

    varDatasetRHP = revDatasetRHP.filter(
      function(d){
        return ( 
        d.revType == currentRev);
      }
    );

    //d.region == currentRegion &&


  // Get list of unique cities in dataset

    var cities = [];

    for (index = 0; index < varDatasetRHP.length; index++) {
      cities.push(varDatasetRHP[index].cityName);
    }

    function onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
    }

    cities = cities.filter(onlyUnique);

  // Get list of unique years in dataset

  var years = [];
  for (index = 0; index < varDatasetRHP.length; index++) {
    years.push(formatTime(varDatasetRHP[index].year));
  }
  function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }
  years = years.filter(onlyUnique);





  var width = 800 - margin.left - margin.right;
  var height = cities.length * 15;

  d3.selectAll('.ptc-spinner').remove();

  var svg = d3.selectAll(".var-heatmap")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform","translate(" + margin.left + "," + margin.top + ")");


  // Build X scales and axis:

      var x = d3.scaleTime()
        .rangeRound([0,width])
        .domain([
         d3.min(revDatasetRHP, function(d) { return d.year; }),
         d3.max(revDatasetRHP, function(d) { return d.year; })
       ]);

      svg.append("g")
        .attr("transform", "translate(8," + (height+3) + ")")
        .call(d3.axisBottom(x))


      // Build X scales and axis:
      var y = d3.scaleBand()
        .range([ height, 0 ])
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



         var sqWidth = (width/years.length) - 1.5;

        // Create the squares
        svg.selectAll()
          .data(varDatasetRHP)
          .enter()
          .append("rect")
          .attr("x", function(d) { return x(d.year);})
          .attr("y", function(d) { return y(d.cityName) })
          .attr("width", sqWidth)
          .attr("height", "18")
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

  }