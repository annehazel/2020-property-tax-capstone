

	/* ---------------------------------
		Initial Setup
	------------------------------------*/
			
	// Set width and height for SVG area
	var w = 500;
	var h = 300;
	var padding = 40;

	// Setup variables
	var dataset, xScale, yScale, xAxis, yAxis, line;  



	/* ---------------------------------
		Data Setup & Import
	------------------------------------*/
			
	// Function to convert Dates to strings
	var formatTime = d3.timeFormat("%Y");


	//Load in data
	d3.csv("https://propertytaxcenter.lndo.site/sites/default/files/2020-11/fisc_full_dataset_2017_update.csv",
		function(data) {

		var dataset = data;

			return {
				date: new Date(dataset.year, 0, 1),  //Make a new Date object for each year
				genRev: parseFloat(dataset.rev_general_city), //Convert from string to float
				ownSourceRev: parseFloat(dataset.own_source_rev_city),
				ptRev: parseFloat(dataset.tax_property_city),
				cityId: dataset.id_city,
				cityName: dataset.city_name
			};

			// Make sure data is loaded before processing
			}).then(function(dataset) {


				/* ---------------------------------
					Setup Axes Scales & Formats
				------------------------------------*/

				//Create scale functions
				xScale = d3.scaleTime()
							.domain([
								d3.min(dataset, function(d) { return d.date; }),
								d3.max(dataset, function(d) { return d.date; })
							])
							.range([padding, w]);

				yScale = d3.scaleLinear()
							.domain([
								d3.min(dataset, function(d) {
									if (d.genRev >= 0)
									return d.genRev;
								}) - 10,
								d3.max(dataset, function(d) {
									return d.genRev;
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
				genRevLine = d3.line()
					.x(function(d) { 
						return xScale(d.date); 
					})
		    		.y(function(d) { 
						return yScale(d.genRev); 
					});

				ownSourceRevLine = d3.line()
					.x(function(d) { 
						return xScale(d.date); 
					})
		    		.y(function(d) { 
						return yScale(d.ownSourceRev); 
					});

				ptRevLine = d3.line()
					.x(function(d) { 
						return xScale(d.date); 
					})
					.y(function(d) { 
						return yScale(d.ptRev); 
					});


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
								.datum(dataset.filter(
									function(d){
										return d.cityName == "MA: Boston"
									}
								))
								.attr("class", "genRevLine")
								.attr("d", genRevLine)

				svg.call(hover, path1); // testing new 'hover' functionality
			

				//Create ownSourceRevLine for single city (Own Source Revenue)
				svg.append("path")
					.datum(dataset.filter(
						function(d){
							return d.cityName == "MA: Boston"
						}
					))
					.attr("class", "ownSourceRevLine")
					.attr("d", ownSourceRevLine)


				//Create ptRevLine for single city (Property Tax Revenue)
				svg.append("path")
					.datum(dataset.filter(
						function(d){
							return d.cityName == "MA: Boston"
						}
					))
					.attr("class", "ptRevLine")
					.attr("d", ptRevLine)



				/* ---------------------------------
					Hover / Tooltip Functionality
				------------------------------------*/


				// Filtering large dataset down to just Boston MA for testing
				var newData = dataset.filter(
					function(d){
						return d.cityName == "MA: Boston"
					}
				);
					
				var dates = _.pluck(newData, 'date');
				var values = _.pluck(newData, 'genRev');

				console.log(newData);



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
						const i = d3.bisectCenter(dates, xm);
						// i should be the index of the closest year value in newData
						const s = d3.least(newData, function(d) { 
							Math.abs(d.genRev[i] - ym)
						});
						console.log(s);
						path.attr("stroke", function(d){ 
							d === s ? null : "#ddd"
						})
						.filter(function(d) { d === s}).raise();
						dot.attr("transform", `translate(${xScale(dates[i])},${yScale(s.genRev[i])})`);
						dot.select("text").text(s.name);
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

