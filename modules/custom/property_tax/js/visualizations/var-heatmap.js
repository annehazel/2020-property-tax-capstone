if (jQuery('.var-heatmap').length) {



var originalDatasetRHP =[];
var revDatasetRHP =[];
var regionNE = ['MA', 'CT', 'ME', 'NH', 'RI', 'VT'];
var regionPAC = ['AK', 'CA', 'HI', 'OR', 'WA'];
var regionENC = ['IL', 'IN', 'MI', 'OH', 'WI'];
var regionESC = ['AL', 'KY', 'MS', 'OH', 'TN'];
var regionMDA = ['NJ', 'NY', 'PA'];
var regionMNT = ['AZ', 'CO', 'ID', 'MT', 'NV', 'NM', 'UT', 'WY'];
var regionSOA = ['DE', 'DC', 'FL', 'GA', 'MD', 'NC', 'SC', 'VA', 'WV'];
var regionWNC = ['IA', 'KS', 'MN', 'MO', 'NE', 'ND', 'SD'];
var regionWSC = ['AK', 'LA', 'OK', 'TX'];
var regions = [
  "East North Central", "East South Central", "Middle Atlantic", "Mountain",
  "New England", "Pacific", "South Atlantic", "West North Central", "West South Central"
];
var color = "#14765f";
var currentRegion = "New England";
var currentVar = "Property Tax Revenue";

var margin = {top: 30, right: 30, bottom: 30, left: 110};

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

    // add region to cities in dataset
    for (i = 0; i < originalDatasetRHP.length; i++) {
      
      if (regionNE.includes(originalDatasetRHP[i].state)){
        originalDatasetRHP[i].region = 'New England';
      }
      else if (regionPAC.includes(originalDatasetRHP[i].state)){
        originalDatasetRHP[i].region = 'Pacific';
      }
      else if (regionENC.includes(originalDatasetRHP[i].state)){
        originalDatasetRHP[i].region = 'East North Central';
      } 
      else if (regionESC.includes(originalDatasetRHP[i].state)){
        originalDatasetRHP[i].region = 'East South Central';
      }
      else if (regionMDA.includes(originalDatasetRHP[i].state)){
        originalDatasetRHP[i].region = 'Middle Atlantic';
      }
      else if (regionMNT.includes(originalDatasetRHP[i].state)){
        originalDatasetRHP[i].region = 'Mountain';
      }
      else if (regionSOA.includes(originalDatasetRHP[i].state)){
        originalDatasetRHP[i].region = 'South Atlantic';
      }
      else if (regionWNC.includes(originalDatasetRHP[i].state)){
        originalDatasetRHP[i].region = 'West North Central';
      }
      else if (regionWSC.includes(originalDatasetRHP[i].state)){
        originalDatasetRHP[i].region = 'West South Central';
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

    varDatasetRHP = revDatasetRHP.filter(
      function(d){
        return (d.region == currentRegion &&
          d.revType == currentVar);
      }
    );






  d3.selectAll('.ptc-spinner').remove();

  var tooltip = d3.selectAll('.var-heatmap')
  .append("div")
  .attr("class", "varheatmap1-tooltip varheatmap1-hidden");

  tooltip.append("p")
    .attr("class", "varheatmap1-tooltip-heading");

  tooltip.append("p")
    .append("span")
    .attr("class", "varheatmap1-value");


  drawSVG(varDatasetRHP);


  function drawSVG(data) {

    // Get unique list of cities and years per current dataset
    var cities = [];
    var years = [];

    for (index = 0; index < varDatasetRHP.length; index++) {
      cities.push(varDatasetRHP[index].cityName);
    }
    for (index = 0; index < varDatasetRHP.length; index++) {
      years.push(formatTime(varDatasetRHP[index].year));
    }

    cities = cities.filter(onlyUnique);
    years = years.filter(onlyUnique);

    var width = 800 - margin.left - margin.right;
    var height = cities.length * 15;

    //remove old svg
    d3.selectAll(".var-heatmap")
        .selectAll('svg').remove();

    d3.selectAll(".var-heatmap")
        .selectAll('h5').remove();

    // d3.selectAll(".var-heatmap")
    //     .selectAll('.var-heatmap-legend').remove();

    // Add dynamic viz title
    d3.selectAll(".var-heatmap")
        .append('h5')
        .text("Showing: " + currentVar + " per Capita for " + currentRegion);

    // Add div for legend
    // d3.selectAll(".var-heatmap")
    //     .append('div')
    //     .attr("class", "var-heatmap-legend");

    // create svg
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
          .attr("class", "axis")
          .attr("transform", "translate(8," + (height+3) + ")")
          .call(d3.axisBottom(x));


    // Build X scales and axis:
    var y = d3.scaleBand()
                .range([ height, 0 ])
                .domain(cities);

    svg.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y));

    var myColor = d3.scaleLinear()
        .range(["white", color])
        .domain([
          0,
          d3.max(varDatasetRHP, function(d) { return d.amount; })
      ]);



    var sqWidth = (width/years.length) - 1.5;

    svg.selectAll()
        .data(varDatasetRHP)
        .enter()
        .append("rect")
        .attr("x", function(d) { return x(d.year);})
        .attr("y", function(d) { return y(d.cityName) })
        .attr("width", sqWidth)
        .attr("height", "18")
        .style("fill", function(d) { return myColor(d.amount)})

        // setup tooltip
        .on("mouseover", function(d, i) {
          var xPos = parseFloat(d3.select(this).attr("x"));
          var yPos = parseFloat(d3.select(this).attr("y"))

          //Update the tooltip position and value
          d3.selectAll(".varheatmap1-tooltip")
              .style("left", xPos + "px")
              .style("top", yPos + "px")
              .selectAll(".varheatmap1-tooltip-heading")
              .text(i.cityName + " ("+ formatTime(i.year) + ")");

          d3.selectAll(".varheatmap1-value")
              .text("$" + i.amount);
          
          //Show the tooltip
          d3.selectAll(".varheatmap1-tooltip")
              .classed("varheatmap1-hidden", false);
        })
        .on("mouseout", function() {
          //Hide the tooltip
          d3.selectAll(".varheatmap1-tooltip").classed("varheatmap1-hidden", true);
        });   
  // Draw legend
  


    

    // var legendSVG = d3.selectAll(".var-heatmap-legend").append('svg')
    //                   .attr("width", 300)
    //                   .attr("height", 50);

    // var arr = d3.range(101);
    
    // var xScaleLeg = d3.scaleLinear().domain([0, 100]).range([0, 500]);

    //var legColorScale = d3.scaleLinear().domain([0, 100]).range(["white", color]);

    // legendSVG.selectAll('rect')
    //           .data(arr)
    //           .enter()
    //           .append('rect')
    //             .attr("x", function(d) { 
    //               return xScaleLeg(d) 
    //             })
    //             .attr("y", 20)
    //             .attr("height", 20)
    //             .attr("width", 5)
    //             .attr("fill", function(d) {
    //               console.log(d);
    //               return legColorScale(d) 
    //             });

  } // End drawSVG




  function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }



				//Create three columns within filters section

				var inputCol1 = d3.select('.filters-var-heatmap')
									.append("div")
									.attr("class", "col-md-4 viz-input-col");

				inputCol1.append("h5").text('Select a region:');

				var inputCol2 = d3.select('.filters-var-heatmap')
									.append("div")
									.attr("class", "col-md-4 viz-input-col");

				inputCol2.append("h5").text('Select a Revenue Source:');

				var inputCol3 = d3.select('.filters-var-heatmap')
									.append("div")
									.attr("class", "col-md-4 viz-input-col");

				inputCol3.append("h5").text('Select a color:');


				//Create main city select input (col 1)

				var mainSelect = inputCol1.append('select')
										.attr('class','form-control regions-list');

			  
        mainSelect.selectAll('option')
                    .data(regions).enter()
                    .append('option')
                      .text(function (d) { 
                        return d; 
                      });


				jQuery('.regions-list').chosen(
          {disable_search_threshold: 10,
          placeholder_text_single: "Select a Region"
          }
        );


        // jQuery(function(){
        //   jQuery('.regions-list option:contains("New England")').attr("selected",);
        // });

				jQuery('.regions-list').on('change', function(evt, params) {
          currentRegion = jQuery(this).val();
          
          varDatasetRHP = revDatasetRHP.filter(
            function(d){
              return (d.region == currentRegion &&
                d.revType == currentVar);
            }
          );

					drawSVG(varDatasetRHP);
				});



				//Create compare option input (col 2)
				
				var varSelect = inputCol2.append('div')
                                      .attr('class','second-city')
                                      .append('select')
                                      .attr('class','form-control cities-list-option2');

			  
			  varSelect.selectAll('option')
                      .data(regions).enter()
                      .append('option')
                        .text(function (d) { return d; });


				jQuery('.cities-list-option2').chosen(
					{disable_search_threshold: 10}
				);
				jQuery('select.cities-list-option2').on('change', function(evt, params) {
					option2 = jQuery(this).val();
					updateOption2(option2);
				});




				//Create second city option input (col 3, option 1)




				//Create average option inputs (col 3, option 2)

				
				var avgs = inputCol3.append('div')
										.attr('class','avgs');
				
				
				var avgLabel1 = avgs.append('div')
										.attr('class','color')
										.append('label');

				avgLabel1.append('input')
              .attr('type', 'color')
              .attr('class', 'color')
							.attr('value', color);

				avgLabel1.append('text').text('Pick a new color');


				jQuery('input.color').on('blur', function(evt, params) {
					color = jQuery(this).val();
					updateColor(color);
				});



        // Update functions


        function updateColor(color) {

          myColor = d3.scaleLinear()
          .range(["white", color])
          .domain([
           0,
           d3.max(varDatasetRHP, function(d) { return d.amount; })
         ])

          d3.selectAll('svg')
            .selectAll('rect')
            .style("fill", function(d) { return myColor(d.amount)} )

        }



        function updateRegion(currentRegion) {

          varDatasetRHP = revDatasetRHP.filter(
            function(d){
              return (d.region == currentRegion &&
                d.revType == currentVar);
            }
          );

          for (index = 0; index < varDatasetRHP.length; index++) {
            cities.push(varDatasetRHP[index].cityName);
          }
      
          for (index = 0; index < revDatasetRHP.length; index++) {
            allCities.push(revDatasetRHP[index].cityName);
          }
      
          function onlyUnique(value, index, self) {
            return self.indexOf(value) === index;
          }
      
          cities = cities.filter(onlyUnique);
          allCities = allCities.filter(onlyUnique);
        // Get list of unique years in dataset
    
    
        height = cities.length * 15;

        d3.selectAll('rect').remove();
        d3.selectAll('.axis').remove();

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
      y = d3.scaleBand()
        .range([ height, 0 ])
        .domain(cities)

      svg.append("g")
        .call(d3.axisLeft(y));

        // Create color scale for squares
      myColor = d3.scaleLinear()
          .range(["white", color])
          .domain([
           0,
           d3.max(varDatasetRHP, function(d) { return d.amount; })
         ])


          // Create the squares
          svg.selectAll()
          .data(varDatasetRHP)
          .enter()
          .append("rect")
          .attr("x", function(d) { return x(d.year);})
          .attr("y", function(d) { return y(d.cityName) })
          .attr("width", sqWidth)
          .attr("height", "18")
          .style("fill", function(d) { return myColor(d.amount)})
          // setup tooltip
          .on("mouseover", function(d, i) {
            var xPos = parseFloat(d3.select(this).attr("x"));
            var yPos = parseFloat(d3.select(this).attr("y"))
            //Update the tooltip position and value
            d3.selectAll(".varheatmap1-tooltip")
            .style("left", xPos + "px")
            .style("top", yPos + "px")
            .selectAll(".varheatmap1-tooltip-heading")
            .text(i.cityName + " ("+ formatTime(i.year) + ")");

            d3.selectAll(".varheatmap1-value")
            .text("$" + i.amount);
            
            //Show the tooltip
            d3.selectAll(".varheatmap1-tooltip").classed("varheatmap1-hidden", false);
          })
          .on("mouseout", function() {

            //Hide the tooltip
            d3.selectAll(".varheatmap1-tooltip").classed("varheatmap1-hidden", true);

        });


        }


    })

  }