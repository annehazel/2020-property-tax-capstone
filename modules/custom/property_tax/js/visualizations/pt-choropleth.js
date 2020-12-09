
if (jQuery('.map-viz-1').length) {

			//Width and height
			var w = 500;
			var h = 300;


			//Define map projection
			var projection = d3.geoAlbersUsa()
								   .translate([w/2, h/2])
								   .scale([500]);

			//Define path generator
			var path = d3.geoPath()
							 .projection(projection);

			//Define quantize scale to sort data values into buckets of color
			var color = d3.scaleQuantize()
								.range(["rgb(237,248,233)","rgb(186,228,179)","rgb(116,196,118)","rgb(49,163,84)","rgb(0,109,44)"]);
								//Colors derived from ColorBrewer, by Cynthia Brewer, and included in
								//https://github.com/d3/d3-scale-chromatic

			//Create SVG element
			var svgChoropleth = d3.selectAll(".map-viz-1")
						.append("svg")
						.attr("width", w)
						.attr("height", h);

			//Load in data
			d3.csv("/sites/default/files/2020-11/pt-state-data.csv", function(data){



				return {
					state: data.State,
					ptPerCapita: parseFloat(data['Per capita property tax'])
				};

			}).then(function(data){
				//console.log(data);

				//Set input domain for color scale
				color.domain([
					d3.min(data, function(d) { return d.ptPerCapita; }),
					d3.max(data, function(d) { return d.ptPerCapita; })
				]);

				//Load in GeoJSON data
				d3.json("/sites/default/files/2020-11/us-states.json", function(json) {

				}).then(function(json){

					//Merge the ag. data and GeoJSON
					//Loop through once for each ag. data value
					for (var i = 0; i < data.length; i++) {

						//Grab state name
						var dataState = data[i].state;

						//Grab data value, and convert from string to float
						var dataPtPerCapita = parseFloat(data[i].ptPerCapita);

						//Find the corresponding state inside the GeoJSON
						for (var j = 0; j < json.features.length; j++) {

							var jsonState = json.features[j].properties.name;

							if (dataState == jsonState) {

								//Copy the data value into the JSON
								json.features[j].properties.ptPerCapita = dataPtPerCapita;

								//Stop looking through the JSON
								break;

							}
						}

					}


					//console.log(json);
					//Bind data and create one path per GeoJSON feature
					svgChoropleth.selectAll("path")
					   .data(json.features)
					   .enter()
					   .append("path")
					   .attr("d", path)
						 .attr("id", function(d){
							 //asign path elements with state name as id
							return d.properties.name;

						 })
					   .style("fill", function(d) {
					   		//Get data value
					   		var value = d.properties.ptPerCapita;

					   		if (value) {
					   			//If value exists…
						   		return color(value);
					   		} else {
					   			//If value is undefined…
						   		return "#ccc";
					   		}
					   })
						 .on("mouseover", function(mouseover) {

							 var currentPath = this;
							 var currentData = [];

								for (var i = 0; i < json.features.length; i++) {

									currentData.push({
										name: json.features[i]['properties']['name'],
									  	ptPerCapita: json.features[i]['properties']['ptPerCapita']
									});
								}

								var currentState = currentData.filter(

									function(d){

										return d.name == currentPath.id;

									}

								)

								currentState = currentState[0];

								console.log(currentState);


								var dPath = d3.select("#" + currentState.name)
								.attr("d");


								var topLeftCornerStr = dPath.substring(
								    dPath.indexOf("M") + 1,
								    dPath.indexOf("L")
								);


								var tipXPosition = parseFloat(topLeftCornerStr.substring(
									    0,
									    topLeftCornerStr.indexOf(",")
										)
									) - 20;

									console.log(topLeftCornerStr.indexOf(",") + 1);

								var tipYPosition = parseFloat(topLeftCornerStr.substring(
									    topLeftCornerStr.indexOf(",") + 1,
									    80
										)
									) - 20;

									console.log(topLeftCornerStr);
									console.log("X: " + tipXPosition);
									console.log("Y: " + tipYPosition);



								d3.select(this)
								.classed("active",true);

								d3.select("#ptc-tooltip")
								.classed("hidden", false)
								.style("left", tipXPosition + "px")
								.style("top", tipYPosition + "px")
								.select("#tipvalue")
								.text(currentState.ptPerCapita);

								d3.select("#tipstate")
								.text(currentState.name);

							});


							//Update the tooltip position and value
							// d3.select("#tooltip")
							// 	.style("left", xPosition + "px")
							// 	.style("top", yPosition + "px")
							// 	.select("#value")
							// 	.text(d);

							// //Show the tooltip
							// d3.select("#tooltip").classed("hidden", false);
						 //
					   // })
					   // .on("mouseout", function() {
						 //
							// //Hide the tooltip
							// d3.select("#tooltip").classed("hidden", true);
						 //
					   // })


				});





		function filterState(json, key, value) {
		  var result = {};
		  for (var explosionIndex in json) {
		    if (json[explosionIndex][key] === value) {
		      result[explosionIndex] = json[explosionIndex];
		    }
		  }
		  return result;
		}

			});
		}