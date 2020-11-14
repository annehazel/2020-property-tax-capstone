

			//Width and height
			var w = 500;
			var h = 300;
			var padding = 40;

			var dataset, xScale, yScale, xAxis, yAxis, line;  //Empty, for now

			//For converting Dates to strings
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

				}).then(function(dataset) {
				//Print data to console as table, for verification
			//	console.table(dataset, ["date", "genRev", "ownSourceRev",
												//				"ptRev", "cityId", "cityName"]);

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

				//Define axes
				xAxis = d3.axisBottom()
						   .scale(xScale)
						   .ticks(10)
						   .tickFormat(formatTime);

				//Define Y axis
				yAxis = d3.axisLeft()
						   .scale(yScale)
						   .ticks(8);

				//Define line generators
				genRevLine = d3.line()
					.x(function(d) { return xScale(d.date); })
		    	.y(function(d) { return yScale(d.genRev); });

				ownSourceRevLine = d3.line()
					.x(function(d) { return xScale(d.date); })
		    	.y(function(d) { return yScale(d.ownSourceRev); });

				ptRevLine = d3.line()
					.x(function(d) { return xScale(d.date); })
					.y(function(d) { return yScale(d.ptRev); });


				//Create SVG element
				var svg = d3.selectAll(".line-viz-1")
							.append("svg")
							.attr("width", w)
							.attr("height", h);

				//Create axes
				svg.append("g")
					.attr("class", "axis")
					.attr("transform", "translate(0," + (h - padding) + ")")
					.call(xAxis);

				svg.append("g")
					.attr("class", "axis")
					.attr("transform", "translate(" + padding + ",0)")
					.call(yAxis);

					console.log(dataset);

				//Create genRevLine for single city
				svg.append("path")
					.datum(dataset.filter(
						function(d){
							return d.cityName == "MA: Boston"
						}
					))
					.attr("class", "genRevLine")
					.attr("d", genRevLine)

					//Create ownSourceRevLine for single city
					svg.append("path")
						.datum(dataset.filter(
							function(d){
								return d.cityName == "MA: Boston"
							}
						))
						.attr("class", "ownSourceRevLine")
						.attr("d", ownSourceRevLine)

					//Create ptRevLine for single city
					svg.append("path")
						.datum(dataset.filter(
							function(d){
								return d.cityName == "MA: Boston"
							}
						))
						.attr("class", "ptRevLine")
						.attr("d", ptRevLine)



	
				jQuery(".filters-line-viz-1")
					.append('<input type="checkbox" id="vehicle1" name="vehicle1" value="Bike">')
					.append('<label for="vehicle1"> Test</label><br></br>');
						







			});
