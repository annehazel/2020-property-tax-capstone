if (jQuery('.var-heatmap').length) {



var originalDatasetRHP =[];
var revDatasetRHP =[];
var regionNE = ['MA', 'CT', 'ME', 'NH', 'RI', 'VT'];
var regionPAC = ['AK', 'CA', 'HI', 'OR', 'WA'];
var color = "#14765f";

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
    var currentVar = "Property Tax Revenue";
    var placeSelection = currentRegion;

    varDatasetRHP = revDatasetRHP.filter(
      function(d){
        return ((d.region == placeSelection || 
          d.state == placeSelection) &&
          d.revType == currentVar);
      }
    );

    //d.region == currentRegion &&


  // Get list of unique cities in dataset

    var cities = [];
    var allCities = [];

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
                .append('h5')
                .text("Showing: " + currentVar + " for " + placeSelection);

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
          .range(["white", color])
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





				//Create three columns within filters section

				var inputCol1 = d3.select('.filters-var-heatmap')
									.append("div")
									.attr("class", "col-md-4 viz-input-col");

				inputCol1.append("h5").text('Select a city:');

				var inputCol2 = d3.select('.filters-var-heatmap')
									.append("div")
									.attr("class", "col-md-4 viz-input-col");

				inputCol2.append("h5").text('Compare this city to:');

				var inputCol3 = d3.select('.filters-var-heatmap')
									.append("div")
									.attr("class", "col-md-4 viz-input-col");

				inputCol3.append("h5").text('Select an option:');


				//Create main city select input (col 1)

				var mainSelect = inputCol1.append('select')
										.attr('class','form-control cities-list');

			  
			  	var options = mainSelect
					.selectAll('option')
					.data(allCities).enter()
					.append('option')
						.text(function (d) { 
              return d; 
            });


				jQuery('.cities-list').chosen(
					{disable_search_threshold: 10}
				);
				jQuery('select').on('change', function(evt, params) {
					var city = jQuery(this).val();
					//updateCity(city);
				});



				//Create compare option input (col 2)
				
				var compareLabel1 = inputCol2.append('div')
											.attr('class','radio')
											.append('label');

				compareLabel1.append('input')
							.attr('type', 'radio')
							.attr('name', 'compareOptions')
							.attr('value', 'city');

				compareLabel1.append('text').text('Another City');



				var compareLabel2 = inputCol2.append('div')
											.attr('class','radio')
											.append('label');

				compareLabel2.append('input')
							.attr('type', 'radio')
							.attr('name', 'compareOptions')
							.attr('value', 'average');

				compareLabel2.append('text').text('Average Data');




				//Create second city option input (col 3, option 1)

				var optionSelect = inputCol3.append('div')
										.attr('class','second-city')
										.append('select')
										.attr('class','form-control cities-list-option2');

			  
			  	optionSelect.selectAll('option')
					.data(cities).enter()
					.append('option')
						.text(function (d) { return d; });


				jQuery('.cities-list-option2').chosen(
					{disable_search_threshold: 10}
				);
				jQuery('select.cities-list-option2').on('change', function(evt, params) {
					option2 = jQuery(this).val();
					updateOption2(option2);
				});



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
          console.log(jQuery(this).val());
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

          svg.selectAll('rect')
            .style("fill", function(d) { return myColor(d.amount)} )

        }


    })

  }