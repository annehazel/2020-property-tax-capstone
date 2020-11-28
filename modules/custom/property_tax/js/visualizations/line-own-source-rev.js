

	/* ---------------------------------
		Initial Setup
	------------------------------------*/
	import * as d3Legend from "/modules/custom/property_tax/js/vendor/d3-legend.min.js"

	// Set width and height for SVG area
	var w = 500;
	var h = 300;
	var padding = 40;

	// Setup variables
	var dataset, xScale, yScale, xAxis, yAxis, revLine;
	var originalDataset =[];
	var revDataset =[];
	var avgDataset =[];


	//starting city
	var city = "AK: Anchorage";



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

				//console.log(avgDataset);
				//console.log(revDataset);


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

				svg.append("g")
					.attr("class", "axis")
					.attr("transform", "translate(" + padding + ",0)")
					.call(yAxis);



				// Create genRevLine for single city (General Revenue)

				var path1 = svg.append("path")
								.datum(revDataset.filter(
									function(d){
										return (d.cityName == city && d.revType == "General Revenue")
									}
								))
								.attr("class", "genRevLine")
								.attr("d", revLine)

				svg.call(hover, path1);
			

				//Create ownSourceRevLine for single city (Own Source Revenue)
				var path2 = svg.append("path")
								.datum(revDataset.filter(
									function(d){
										return (d.cityName == city && d.revType == "Own Source Revenue")
									}
								))
								.attr("class", "ownSourceRevLine")
								.attr("d", revLine)

				svg.call(hover, path2); 


				var path3 = svg.append("path")
								.datum(revDataset.filter(
									function(d){
										return (d.cityName == city && d.revType == "Property Tax Revenue")
									}
								))
								.attr("class", "ptRevLine")
								.attr("d", revLine)

				svg.call(hover, path3); 




				// Create All Cities Average Lines
				var v = svg.append("path")
								.datum(avgDataset.filter(
									function(d){
										return (d.cityName == "Average for All Cities" && d.revType == "General Revenue")
									}
								))
								.attr("class", "genRevLine")
								.attr("id", "avgAllCitiesGenRev")
								.style("stroke-dasharray", ("3, 3"))
								.attr("d", revLine);




				var avgAllCitiesOwnSource = svg.append("path")
								.datum(avgDataset.filter(
									function(d){
										return (d.cityName == "Average for All Cities" && d.revType == "Own Source Revenue")
									}
								))
								.attr("class", "ownSourceRevLine")
								.style("stroke-dasharray", ("3, 3"))
								.attr("d", revLine);



				var avgAllCitiesPT = svg.append("path")
								.datum(avgDataset.filter(
									function(d){
										return (d.cityName == "Average for All Cities" && d.revType == "Property Tax Revenue")
									}
								))
								.attr("class", "ptRevLine")
								.style("stroke-dasharray", ("3, 3"))
								.attr("d", revLine);





				// var avgFiscCitiesPT = svg.append("path")
				// 				.datum(avgDataset.filter(
				// 					function(d){
				// 						return (d.cityName == "Average for Core FiSCs" && d.revType == "Property Tax Revenue")
				// 					}
				// 				))
				// 				.attr("class", "ptRevLine1")
				// 				.attr("d", revLine);

				// svg.call(hover, avgFiscCitiesPT); 


				/* ---------------------------------
					Hover / Tooltip Functionality
				------------------------------------*/


				// Filtering large dataset down to just current city

				var cityData = originalDataset.filter(
					function(d){
						return d.cityName == city;
					}
				);

				console.log(cityData);
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
						dot.select("text").text(s.cityName + " " + s.revType + " " + s.amount);
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

				
				//Create Select input

				var select = d3.select('.filters-line-viz-1')
					.append('select')
						.attr('class','form-control cities-list');

			  
			  	var options = select
					.selectAll('option')
					.data(cities).enter()
					.append('option')
						.text(function (d) { return d; });


				// jQuery('.cities-list').chosen(
				// 	{disable_search_threshold: 10}
				// 	);
				

				// Handle select input update

				d3.select('select').on("change", updateCity);

				function updateCity() {

					console.log(this.value);
					var city = this.value;

					cityData = revDataset.filter(
							function(d){
								return d.cityName == city;
							}
						);
	
					years = _.pluck(cityData, 'year');


				svg.select('.genRevLine')
						.datum(revDataset.filter(
							function(d){
								return (d.cityName == city && d.revType == "General Revenue")
							}
						))
						.attr("d", revLine)

				svg.call(hover, path1);

				svg.select('.ownSourceRevLine')
							.datum(revDataset.filter(
								function(d){
									return (d.cityName == city && d.revType == "Own Source Revenue")
								}
							))
							.attr("d", revLine)

				svg.call(hover, path2); 


				svg.select('.ptRevLine')
							.datum(revDataset.filter(
								function(d){
									return (d.cityName == city && d.revType == "Property Tax Revenue")
								}
							))
							.attr("d", revLine)

				svg.call(hover, path3); 

				return city;

				}

	



				// Average Lines Inputs

				var avgGenRevInput = d3.select('.filters-line-viz-1')
							.append('div')
								.attr('class','form-check')
								.attr('id','avgGenRevInputDiv')
							.append('input')
								.attr('type','checkbox')
								.attr('class','form-check-input')
								.attr('id','avgGenRevInput')
								.on('click', function(){
									// determine if current line is visible
									var active   = avgAllCitiesGenRev.active ? false : true,
									newOpacity = active ? 0 : 1;
									// hide or show the elements
									d3.select('path#avgAllCitiesGenRev').style('opacity', newOpacity);
									// update whether or not the elements are active
									avgAllCitiesGenRev.active = active;
								});

				d3.select('#avgGenRevInputDiv')
					.append('label')
						.attr('for','avgGenRevInput')
						.attr('class','form-check-label')
						.text('Average General Revenue');


				var avgOwnSourceInput = d3.select('.filters-line-viz-1')
							.append('div')
								.attr('class','form-check')
								.attr('id','avgOwnSourceInputDiv')
							.append('input')
								.attr('type','checkbox')
								.attr('class','form-check-input')
								.attr('id','avgOwnSourceInput');
								

				d3.select('#avgOwnSourceInputDiv')
					.append('label')
						.attr('for','avgOwnSourceInput')
						.attr('class','form-check-label')
						.text('Average Own Source Revenue');


				var avgPtInput = d3.select('.filters-line-viz-1')
						.append('div')
							.attr('class','form-check')
							.attr('id','avgPtInputDiv')
						.append('input')
							.attr('type','checkbox')
							.attr('class','form-check-input')
							.attr('id','avgPtInput');
							

				d3.select('#avgPtInputDiv')
					.append('label')
						.attr('for','avgPtInput')
						.attr('class','form-check-label')
						.text('Average Property Tax Revenue');




				// d3.select("#avgGenRevInput")
				// 		.on("click", function(){
				// 		console.log("Here for Gen Rev");
				// });


				// d3.select("#avgOwnSourceInput")
				// 		.on("click", function(){
				// 		console.log("Here for Own Source Rev");
				// });


				// d3.select("#avgPtInput")
				// 		.on("click", function(){
				// 		console.log("Here for PT Rev");
				// });

				swatches({
					color: d3.scaleOrdinal(["blueberries", "oranges", "apples"], d3.schemeCategory10)
				  })

			});

