

//import * from "/modules/custom/property_tax/js/vendor/observable-legends.js"


if (jQuery('.line-viz-1').length ) {
	/* ---------------------------------
		Initial Setup
	------------------------------------*/
	//import {legend} from '../../../../../node_modules/d3-color-legend/dist/d3-color-legend.js';
	//import * as legend from "/modules/custom/property_tax/js/vendor/d3-legend.min.js"


	// Set width and height for SVG area
	var w = 500;
	var h = 300;
	var padding = 40;

	// Setup variables
	var dataset, xScale, yScale, xAxis, yAxis, revLine;
	var originalDataset =[];
	var revDataset =[];
	var avgDataset =[];


	//starting city and 2nd city
	var city = "AK: Anchorage";
	var option2 = "none";



	/* ---------------------------------
		Data Setup & Import
	------------------------------------*/
			
	// Function to convert Dates to strings
	var formatTime = d3.timeFormat("%Y");



	//Load in data
	d3.csv("/sites/default/files/2020-11/fisc_full_dataset_2017_update.csv",
		function(data) {

		var dataset = data;

		originalDataset.push({
			cityId: dataset.id_city,
			cityName: dataset.city_name,
			year: new Date(dataset.year, 0, 1),
			revType: 'General Revenue',
			amount: parseFloat(dataset.rev_general_city)
		},{
			cityId: dataset.id_city,
			cityName: dataset.city_name,
			year: new Date(dataset.year, 0, 1),
			revType: 'Own Source Revenue',
			amount: parseFloat(dataset.own_source_rev_city)
		},{
			cityId: dataset.id_city,
			cityName: dataset.city_name,
			year: new Date(dataset.year, 0, 1),
			revType: 'Property Tax Revenue',
			amount: parseFloat(dataset.tax_property_city)
		});


		return originalDataset;

			// Make sure data is loaded before processing
			}).then(function(dataset) {


				/* ---------------------------------
					Create separate Average dataset
				------------------------------------*/


				avgDataset = originalDataset.filter(
					function(d){
						return (d.cityName == "Average for All Cities" || 
						d.cityName == "Average for Core FiSCs" || 
						d.cityName == "Average for Legacy Cities");
					}
				);


				revDataset = originalDataset.filter(
					function(d){
						return (d.cityName != "Average for All Cities" && 
						d.cityName != "Average for Core FiSCs" && 
						d.cityName != "Average for Legacy Cities");
					}
				);

				/* ---------------------------------
					Setup Axes Scales & Formats
				------------------------------------*/

				//Create scale functions
				xScale = d3.scaleTime()
							.domain([
								d3.min(revDataset, function(d) { return d.year; }),
								d3.max(revDataset, function(d) { return d.year; })
							])
							.range([padding, w]);

				yScale = d3.scaleLinear()
							.domain([
								d3.min(revDataset, function(d) {
									if (d.amount >= 0)
									return d.amount;
								}) - 10,
								d3.max(revDataset, function(d) {
									return d.amount;
								})
							])
							.range([h - padding, 0]);


				//Define X axis
				xAxis = d3.axisBottom()
						   .scale(xScale)
						   .ticks(10)
						   .tickFormat(formatTime);

				//Define Y axis
				yAxis = d3.axisLeft()
						   .scale(yScale)
						   .ticks(8);


				/* ---------------------------------
					Line Generators
				------------------------------------*/

				//Define line generator
				revLine = d3.line()
					.x(function(d) { 
						return xScale(d.year); 
					})
		    		.y(function(d) {
						return yScale(d.amount); 
					});

				// var triLine = d3.svg.symbol().type('triangle-up')
				// 	.size(function(d){ return scale(d); });

				/* ---------------------------------
					Draw the SVG
				------------------------------------*/

				// Create SVG element
				var svg = d3.selectAll(".line-viz-1")
							.append("svg")
							.attr("width", w)
							.attr("height", h);

				// Draw axes
				svg.append("g")
					.attr("class", "axis")
					.attr("transform", "translate(0," + (h - padding) + ")")
					.call(xAxis);

				var yAxisSVG = svg.append("g")
					.attr("class", "axis")
					.attr("transform", "translate(" + padding + ",0)")
					.call(yAxis);



				// Create rev lines for single city (General Revenue)

				var path1 = svg.append("path")
								.datum(revDataset.filter(
									function(d){
										return (d.cityName == city && d.revType == "General Revenue")
									}
								))
								.attr("class", "genRevLine")
								.attr("id", "path1-"+ city.substring(4,))
								.attr("d", revLine)
								.attr("data-legend",function(d) { return d.name});

				svg.call(hover, path1);
			

				//Create ownSourceRevLine for single city (Own Source Revenue)
				var path2 = svg.append("path")
								.datum(revDataset.filter(
									function(d){
										return (d.cityName == city && d.revType == "Own Source Revenue")
									}
								))
								.attr("class", "ownSourceRevLine")
								.attr("id", "path2-"+ city.substring(4,))
								.attr("d", revLine)
								.attr("data-legend",function(d) { return d.name});

				svg.call(hover, path2); 


				var path3 = svg.append("path")
								.datum(revDataset.filter(
									function(d){
										return (d.cityName == city && d.revType == "Property Tax Revenue")
									}
								))
								.attr("class", "ptRevLine ")
								.attr("id", "path3-"+ city.substring(4,))
								.attr("d", revLine)
								.attr("data-legend",function(d) { return d.name});

				svg.call(hover, path3); 



				// set up option2 paths
				var path1a = svg.append("path")
								.datum(originalDataset.filter(
									function(d){
										return (d.cityName == option2 && d.revType == "General Revenue")
									}
								))
								.attr("class", "genRevLine")
								.attr("id", "path1a-"+ option2.substring(4,))
								.style("stroke-dasharray", ("3, 3"))
								.attr("d", revLine);




				var path2a = svg.append("path")
								.datum(originalDataset.filter(
									function(d){
										return (d.cityName == option2 && d.revType == "Own Source Revenue")
									}
								))
								.attr("class", "ownSourceRevLine")
								.attr("id", "path2a-"+ option2.substring(4,))
								.style("stroke-dasharray", ("3, 3"))
								.attr("d", revLine);



				var path3a = svg.append("path")
								.datum(originalDataset.filter(
									function(d){
										return (d.cityName == option2 && d.revType == "Property Tax Revenue")
									}
								))
								.attr("class", "ptRevLine")
								.attr("id", "path3a-"+ option2.substring(4,))
								.style("stroke-dasharray", ("3, 3"))
								.attr("d", revLine);



				/* ---------------------------------
					Hover / Tooltip Functionality
				------------------------------------*/


				// Filtering large dataset down to just current city

				var cityData = originalDataset.filter(
					function(d){
						return d.cityName == city;
					}
				);

				var years = _.pluck(cityData, 'year');



				// code from Observable https://observablehq.com/@d3/multi-line-chart
				function hover(svg, path) {

					if ("ontouchstart" in document) svg
						.style("-webkit-tap-highlight-color", "transparent")
						.on("touchmove", moved)
						.on("touchstart", entered)
						.on("touchend", left)
					else svg
						.on("mousemove", moved)
						.on("mouseenter", entered)
						.on("mouseleave", left);
						
					const dot = svg.append("g")
						.attr("display", "none");
						
					dot.append("circle")
						.attr("r", 2.5);
						
					dot.append("text")
						.attr("font-family", "sans-serif")
						.attr("font-size", 10)
						.attr("text-anchor", "middle")
						.attr("y", -8);
						

					function moved(event) {
						event.preventDefault();
						const pointer = d3.pointer(event, this);
						const xm = xScale.invert(pointer[0]);
						const ym = yScale.invert(pointer[1]);
						const i = d3.bisectCenter(years, xm);
						var yearData = cityData.filter(
							function(d){
								return formatTime(d.year) == formatTime(years[i]);
							}
						)

						const s = d3.least(yearData, function(d) { 
							return Math.abs(d.amount - ym);
						});

						dot.attr("transform", `translate(${xScale(s.year)},${yScale(s.amount)})`);
						dot.select("text").text(s.cityName + ", " + s.revType + ", $" + s.amount);
					}
						
					function entered() {
						path.style("mix-blend-mode", null).attr("stroke", "#ddd");
						dot.attr("display", null);
					}
						
					function left() {
						path.style("mix-blend-mode", "multiply").attr("stroke", null);
						dot.attr("display", "none");
					}
				}
						

				// Get unique city list for input

				var cities = [];

				for (var i = 0; i < revDataset.length; i++) {
				  cities.push(revDataset[i].cityName);
				}
		  
				function onlyUnique(value, index, self) {
				  return self.indexOf(value) === index;
				}
		  
				cities = cities.filter(onlyUnique);

				

				//Create three columns within filters section

				var inputCol1 = d3.select('.filters-line-viz-1')
									.append("div")
									.attr("class", "col-md-4 viz-input-col");

				inputCol1.append("h5").text('Select a city:');

				var inputCol2 = d3.select('.filters-line-viz-1')
									.append("div")
									.attr("class", "col-md-4 viz-input-col");

				inputCol2.append("h5").text('Compare this city to:');

				var inputCol3 = d3.select('.filters-line-viz-1')
									.append("div")
									.attr("class", "col-md-4 viz-input-col");

				inputCol3.append("h5").text('Select an option:');


				//Create main city select input (col 1)

				var mainSelect = inputCol1.append('select')
										.attr('class','form-control cities-list');

			  
			  	var options = mainSelect
					.selectAll('option')
					.data(cities).enter()
					.append('option')
						.text(function (d) { return d; });


				jQuery('.cities-list').chosen(
					{disable_search_threshold: 10}
				);
				jQuery('select').on('change', function(evt, params) {
					var city = jQuery(this).val();
					updateCity(city);
				});

				// var xSlider = inputCol1.append('div')
				// 						.attr('class','slidecontainer')
				// 						.append('label')
				// 						.text('Adjust Y Axis Values')
				// 						.append('input')
				// 						.attr('type', 'range')
				// 						.attr('min', 0)
				// 						.attr('max', d3.max(revDataset, function(d) {
				// 											return d.amount;
				// 									})
				// 						);

				var ySlider2 = inputCol1.append('input')
										.attr('type', 'text')
										.attr("id", "ySlider")
										.attr('data-slider-min', 0)
										.attr('data-slider-max', d3.max(revDataset, function(d) {
																	return d.amount;
																})
										)
										.attr('data-slider-value', d3.max(revDataset, function(d) {
																	return d.amount;
																})
										)
										.attr('data-slider-step', 10);


				var ySlider = jQuery('#ySlider').slider();

				jQuery('#ySlider').on('change', function(evt, params) {
								var yMax = jQuery(this).val();
								updateYScale(yMax);
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
										.attr('class','radio')
										.append('label');

				avgLabel1.append('input')
							.attr('type', 'radio')
							.attr('name', 'compareAvg')
							.attr('value', 'Average for All Cities');

				avgLabel1.append('text').text('All Cities (FiSC and Legacy Cities)');



				var avgLabel2 = avgs.append('div')
											.attr('class','radio')
											.append('label');

				avgLabel2.append('input')
							.attr('type', 'radio')
							.attr('name', 'compareAvg')
							.attr('value', 'Average for Core FiSCs');

				avgLabel2.append('text').text('FiSC Cities');



				var avgLabel3 = avgs.append('div')
				.attr('class','radio')
				.append('label');

				avgLabel3.append('input')
				.attr('type', 'radio')
				.attr('name', 'compareAvg')
				.attr('value', 'Average for Legacy Cities');

				avgLabel3.append('text').text('Legacy Cities');


				

				/* ---------------------------------
					Legend
				------------------------------------*/

				var legendSvg = d3.select(".visualization-row")
									.append("div")
									.attr("class", "col-md-3")
									.append("svg");


				 var ordinal = d3.scaleOrdinal()
				 	.domain(["General Revenue", "Own Source Revenue", "Property Tax Revenue"])
				 	.range([ "#008A77", "rgb(56, 106, 197)", "rgb(222, 119, 46)"]);

				 	legendSvg.append("g")
				 	.attr("class", "legendOrdinal")
				 	.attr("transform", "translate(20,5)");

				 	var legendOrdinal = d3.legendColor()
				 	//d3 symbol creates a path-string, for example
				 	//"M0,-8.059274488676564L9.306048591020996,
				 	//8.059274488676564 -9.306048591020996,8.059274488676564Z"
				 	.shape("path", d3.symbol().type(d3.symbolSquare).size(150)())
				 	.shapePadding(10)
				 	//use cellFilter to hide the "e" cell
				 	.cellFilter(function(d){ return d.label !== "e" })
				 	.scale(ordinal);

				 	legendSvg.select(".legendOrdinal")
				 	.call(legendOrdinal);


		swatches({
		color: d3.scaleOrdinal(["blueberries", "oranges", "apples"], d3.schemeCategory10)
		})



	/* ---------------------------------
		update functions
	------------------------------------*/

		function updateCity(city) {

			cityData = originalDataset.filter(
				function(d){
					return d.cityName == city;
				}
			);

			years = _.pluck(cityData, 'year');



			svg.select('[id^=path1]')
					.datum(revDataset.filter(
						function(d){
							return (d.cityName == city && d.revType == "General Revenue")
						}
					))
					.attr("id", "path1-"+ city.substring(4,))
					.attr("d", revLine)

			svg.call(hover, path1);


			svg.select('[id^=path2]')
						.datum(revDataset.filter(
							function(d){
								return (d.cityName == city && d.revType == "Own Source Revenue")
							}
						))
						.attr("id", "path2-"+ city.substring(4,))
						.attr("d", revLine)

			svg.call(hover, path2); 


			svg.select('[id^=path3]')
						.datum(revDataset.filter(
							function(d){
								return (d.cityName == city && d.revType == "Property Tax Revenue")
							}
						))
						.attr("id", "path3-"+ city.substring(4,))
						.attr("d", revLine)

			svg.call(hover, path3); 

			return city;

		} // End updateCity


		function updateOption2(option2) {


			svg.select('[id^=path1a]')
						.datum(originalDataset.filter(
							function(d){
								return (d.cityName == option2 && d.revType == "General Revenue")
							}
						))
						.attr("id", "path1a-"+ option2.substring(4,))
						.attr("d", revLine)



			svg.select('[id^=path2a]')
						.datum(originalDataset.filter(
							function(d){
								return (d.cityName == option2 && d.revType == "Own Source Revenue")
							}
						))
						.attr("id", "path2a-"+ option2.substring(4,))
						.attr("d", revLine)



			svg.select('[id^=path3a]')
						.datum(originalDataset.filter(
							function(d){
								return (d.cityName == option2 && d.revType == "Property Tax Revenue")
							}
						))
						.attr("id", "path3a-"+ option2.substring(4,))
						.attr("d", revLine)


			return option2;


		} // End updateOption2


		function updateYScale(yMax) {

			yScale = d3.scaleLinear()
				.domain([
					d3.min(revDataset, function(d) {
						if (d.amount >= 0)
						return d.amount;
					}) - 10,
					yMax
				])
				.range([h - padding, 0]);

			yAxis = d3.axisLeft()
				.scale(yScale)
				.ticks(8);

			yAxisSVG.call(yAxis);

			revLine = d3.line()
				.x(function(d) { 
					return xScale(d.year); 
				})
				.y(function(d) {
					return yScale(d.amount); 
				});

			updateCity(city);
			updateOption2(option2);

		} // End updateYScale



		// Input 'on change
		jQuery(document).ready(function(){
			jQuery('.avgs').hide();
			jQuery('.second-city').hide();

			jQuery('input[name="compareOptions"]').click(function(){


				var inputValue = jQuery(this).attr("value");


				if (inputValue == 'city') {

					jQuery('.second-city').show();
					jQuery('.avgs').hide();
					option2 = 'none';
					updateOption2(option2);
				}

				else if (inputValue == 'average') {
					jQuery('.avgs').show();
					jQuery('.second-city').hide();
					option2 = 'none';
					updateOption2(option2);
				}

			});

			jQuery('input[name="compareAvg"]').click(function(){


				var inputValue = jQuery(this).attr("value");

				option2 = inputValue;

				updateOption2(option2);


			});


		






			});



				
		});

	}
