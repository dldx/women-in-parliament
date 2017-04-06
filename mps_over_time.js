var margin = {
    top: 60,
    right: 50,
    bottom: 60,
    left: 100
};

var colors = {
    "Lab": "#C61148",
    "Con": "#0096DB",
    "SNP": "#FCCA46",
    "Lib Dem": "#F37A48",
    "LD": "#F37A48",
    "Green": "#A1C181",
    "SF": "#008e4b",
    "Other": "#50514F"
}

var partyHasSVG = Object.keys(colors);

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function render(data) {
    var lineThickness = 0.0018 * height;
    var circleRadius = lineThickness;

    // Min and max dates
    data.minDate = d3.min(data, function (d) {
        return d.term_start;
    });
    data.maxDate = d3.max(data, function (d) {
        return d.term_end;
    });

    var x = d3.scaleTime()
        .domain([new Date(1915, 01, 01), new Date(2020, 01, 01)])
        .range([0, width]);

    var y = d3.scaleLinear()
        .domain([0, d3.max(data, function (d) {
            return d.stream;
        })])
        .range([height, 0]);

    // Enter
    // Wrapper that contains the whole graph
    var wrapper = svg
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Bounding box to clip points so that they aren't visible outside the chart area
    var boundingBox = wrapper
        .append("rect")
        .attr("opacity", 0.0)
        .attr("width", width)
        .attr("height", height)

    // Tooltip details
    var tooltip = d3.tip()
        .attr("class", "d3-tip")
        // .offset([-10, 0])
        .direction('s')
        .html(function (d) {
            if (partyHasSVG.indexOf(d.party) != -1) {
                partySVG = 0
            } else {
                partySVG = 1
            }
            return `<h1 style="background-color: ${colorParty(d.party)};">${d.name}</h1><div class="mp-term">${d3.timeFormat("%Y")(d.term_start)} &rarr; \
            ${d3.timeFormat("%Y")(d.term_end)}</div><div class="mp-party" style="opacity: ${partySVG}">${d.party}</div><div class="mp-constituency">${d.constituency}</div>
            <svg role="img"><title>${d.party}</title><use xlink:href="./party_logos/party_logos.svg#${d.party}"/></svg>`;
        })

    wrapper.call(tooltip);

    //////////////////////////////////////////////////////////////
    //////////////////////// Voronoi /////////////////////////////
    //////////////////////////////////////////////////////////////

    //Initiate the voronoi function
    //Use the same variables of the data in the .x and .y as used in the cx and cy of the circle call
    //The clip extent will make the boundaries end nicely along the chart area instead of splitting up the entire SVG
    //(if you do not do this it would mean that you already see a tooltip when your mouse is still in the axis area, which is confusing)
    var voronoi = d3.voronoi()
        .x(function (d) {
            return x(d.term_start);
        })
        .y(function (d) {
            return y(d.stream);
        })
        .extent([
            [0, 0],
            [width, height]
        ]);

    //Initiate a group element to place the voronoi diagram in
    var voronoiGroup = wrapper.append("g")
        .attr("class", "voronoiWrapper");
    //Create the Voronoi diagram
    voronoiGroup.selectAll("path")
        .data(voronoi(data)) //Use vononoi() with your dataset inside
        .enter().append("path")
        .attr("d", function (d, i) {
            return "M" + d.join("L") + "Z";
        })
        .datum(function (d, i) {
            console.log(d.point);
            return d.point;
        })
        //Give each cell a unique class where the unique part corresponds to the circle classes
        .attr("class", function (d, i) {
            return "voronoi " + d.clean_name;
        })
        .style("stroke", "#2074A0") //I use this to look at how the cells are dispersed as a check
        .style("fill", "none")
        .style("pointer-events", "all")

    var clippedArea = wrapper.append("g")
        .attr("id", "clippedArea")
        .attr("clip-path", "url(#clip)")


    var pointsGroup = clippedArea
        .append("g")
        .attr("id", "points")

    wrapper.append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);
    var instance = pointsGroup
        .selectAll("g")
        .data(data)
        .enter()
        .append("g")

    var xAxis = d3.axisBottom(x)
    var gX = wrapper.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    var yAxis = d3.axisLeft(y)
    var gY = wrapper.append("g")
        .attr("class", "y-axis")
        // .attr("opacity", 0)
        .call(yAxis);

    // Tooltip target location
    var target = wrapper
        .append("circle")
        .attr("id", "target-loc")
        .attr("cx", Math.max(100, margin.left + 0.2 * width))
        .attr("cy", 0.1 * height)
        .attr("r", 5)
        .attr("opacity", 0)
        .node()

    // Add line connecting start and end of term
    instance
        .append("line")
        .attr("class", "line-connect")
        .style("stroke-width", lineThickness)
        .on("mouseover", function (d) {
            tooltip.show(d, target)
        })
    // .on("mouseout", tooltip.hide);
    // Add circle for start and end
    instance
        .append("circle")
        .attr("r", circleRadius)
        .attr("class", "term-start")
        .on("mouseover", function (d) {
            tooltip.show(d, target)
        })

    // .on("mouseout", tooltip.hide);
    instance
        .append("circle")
        .attr("r", circleRadius)
        .attr("class", "term-end")
        .on("mouseover", function (d) {
            tooltip.show(d, target)
        })
    // .on("mouseout", tooltip.hide);

    function colorParty(party) {
        if (colors[party] != undefined) {
            return colors[party];
        } else {
            return colors["Other"];
        }
    }

    // Update
    instance.selectAll(".line-connect")
        .attr("x1", function (d) {
            return x(d.term_start)
        })
        .attr("x2", function (d) {
            return x(d.term_end)
        })
        .attr("y1", function (d) {
            return y(d.stream)
        })
        .attr("y2", function (d) {
            return y(d.stream)
        })
        .attr("stroke", function (d) {
            return colorParty(d.party);
        })

    instance.selectAll(".term-start")
        .attr("cx", function (d) {
            return x(d.term_start)
        })
        .attr("cy", function (d) {
            return y(d.stream)
        })
        .attr("fill", function (d) {
            return colorParty(d.party);
        })

    instance.selectAll(".term-end")
        .attr("cx", function (d) {
            return x(d.term_end)
        })
        .attr("cy", function (d) {
            return y(d.stream)
        })
        .attr("fill", function (d) {
            return colorParty(d.party);
        })

    wrapper.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .attr("class", "chart-title")
        .text("Women MPs in the House of Commons")

    // Zoom
    var zoom = d3.zoom()
        .scaleExtent([0.98, 40])
        .on("zoom", zoomed);
    //wrapper.call(zoom);
    svg.call(zoom);

    function zoomed() {
        pointsGroup.attr("transform", d3.event.transform)
        gX.call(xAxis.scale(d3.event.transform.rescaleX(x)));
        gY.call(yAxis.scale(d3.event.transform.rescaleY(y)));
    }
    // Exit
    instance.exit().remove();
}

var svg = d3.select(timeline).append("svg")

// https://github.com/wbkd/d3-extended
d3.selection.prototype.moveToFront = function () {
    return this.each(function () {
        this.parentNode.appendChild(this);
    });
};
d3.selection.prototype.moveToBack = function () {
    return this.each(function () {
        var firstChild = this.parentNode.firstChild;
        if (firstChild) {
            this.parentNode.insertBefore(this, firstChild);
        }
    });
};


function draw_graph() {
    d3.selectAll("g").remove()
    d3.select(".d3-tip").remove()
    var timeline = document.getElementById("timeline")
    // Chart dimensions - use parent div size
    width = timeline.clientWidth - margin.left - margin.right,
        height = timeline.clientHeight - margin.top - margin.bottom;
    svg
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)

    d3.csv("mps_over_time.csv", function (d) {
        var parseDate = d3.timeParse("%Y-%m-%d");
        return {
            name: d.name,
            constituency: d.constituency,
            term_start: parseDate(d.term_start),
            term_end: parseDate(d.term_end),
            party: d.party,
            byelection: (d.byelection == "TRUE"),
            notes: d.notes,
            clean_name: d.clean_name,
            stream: +d.stream
        };
    }, function (data) {
        render(data);
    });
}
draw_graph()
window.addEventListener('resize', draw_graph);
