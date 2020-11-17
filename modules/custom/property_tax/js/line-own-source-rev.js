

	/* ---------------------------------
		Initial Setup
	------------------------------------*/
			
	// Set width and height for SVG area
	var w = 500;
	var h = 300;
	var padding = 40;

	// Setup variables
	var dataset, xScale, yScale, xAxis, yAxis, line;
	var revDataset =[];



	/* ---------------------------------
		Data Setup & Import
	------------------------------------*/
			
	// Function to convert Dates to strings
	var formatTime = d3.timeFormat("%Y");
	var parseTime = d3.timeParse("%Y");


	//Load in data
	d3.csv("https://dev-propertytaxcenter.pantheonsite.io/sites/default/files/2020-11/fisc_full_dataset_2017_update.csv",
		function(data) {

		var dataset = data;

		revDataset.push({
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


		return revDataset;

			// Make sure data is loaded before processing
			}).then(function(dataset) {

				
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

				//Define line generators
				revLine = d3.line()
					.x(function(d) { 
						return xScale(d.year); 
					})
		    		.y(function(d) {
						return yScale(d.amount); 
					});

				// ownSourceRevLine = d3.line()
				// 	.x(function(d) { 
				// 		return xScale(d.year); 
				// 	})
		    	// 	.y(function(d) { 
				// 		return yScale(d.ownSourceRev); 
				// 	});

				// ptRevLine = d3.line()
				// 	.x(function(d) { 
				// 		return xScale(d.year); 
				// 	})
				// 	.y(function(d) { 
				// 		return yScale(d.ptRev); 
				// 	});


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

				const path1 = svg.append("path")
								.datum(revDataset.filter(
									function(d){
										return (d.cityName == "MA: Boston" && d.revType == "General Revenue")
									}
								))
								.attr("class", "genRevLine")
								.attr("d", revLine)

				svg.call(hover, path1); // testing new 'hover' functionality
			

				//Create ownSourceRevLine for single city (Own Source Revenue)
				const path2 = svg.append("path")
								.datum(revDataset.filter(
									function(d){
										return (d.cityName == "MA: Boston" && d.revType == "Own Source Revenue")
									}
								))
								.attr("class", "genRevLine")
								.attr("d", revLine)

				svg.call(hover, path2); // testing new 'hover' functionality


				const path3 = svg.append("path")
				.datum(revDataset.filter(
					function(d){
						return (d.cityName == "MA: Boston" && d.revType == "Property Tax Revenue")
					}
				))
				.attr("class", "genRevLine")
				.attr("d", revLine)

				svg.call(hover, path3); // testing new 'hover' functionality




				/* ---------------------------------
					Hover / Tooltip Functionality
				------------------------------------*/


				// Filtering large dataset down to just Boston MA for testing
				var cityData = revDataset.filter(
					function(d){
						return d.cityName == "MA: Boston"
					}
				);

				
				var years = _.pluck(cityData, 'year');

				// for (i = 0; i < cityData.length; i++) {
				// 	cityData[i].year = formatTime(cityData[i].year);
				// }



	
				console.log(years);

				//console.log("full dataset = ", dataset)
				//console.log("Boston dataset = ", newData);



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
						// pointer gives back array of [x,y] position on the screen
						const xm = xScale.invert(pointer[0]);
						// xm should store the date/year value associated with pointer position
						const ym = yScale.invert(pointer[1]);
						// ym should store the value associated with pointer position
						const i = d3.bisectCenter(years, xm);
						//const year = formatTime(dates[i]);
						// i should be the index of the closest year value in cityData
						// figure out what year i is
						console.log(i);
						var yearData = cityData.filter(
							function(d){
								// console.log("d.year = ", d.year);
								// console.log("years[i] = ", years[i]);

								// if(d.year == years[i]) {
								// 	console.log("True");
								// } else {
								// 	console.log("False");
								// }

								return formatTime(d.year) == formatTime(years[i]);
							}
						)

						console.log("yearData = ", yearData);

						const s = d3.least(yearData, function(d) { 
							//console.log(d.amount);
							return Math.abs(d.amount - ym);
						});

						//s.year = new Date(s.year, 0, 1);
						// path.attr("stroke", function(d){ 
						// 	d === s ? null : "#ddd"
						// })
						//.filter(function(d) { d === s}).raise();
						dot.attr("transform", `translate(${xScale(s.year)},${yScale(s.amount)})`);
						//dot.attr("transform", `translate(${xScale(dates[i])},${yScale(s.genRev[i])})`);
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
						


			});

