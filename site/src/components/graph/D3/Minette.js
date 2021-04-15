import * as d3 from "d3";
import regeneratorRuntime from "regenerator-runtime";

/*****************************************
 *     author: Ritesh Pakala
 *     D3 Engine - `Minette` v0.0
 *               - 2021-03-01        //  *
 * 
 *     ~currently augmenting D3 in CS360.
 * ~~ more to come.
 * ****/

 class Minette {

    constructor(dataSet_loc) {
        this.dataSet_loc = dataSet_loc;
        this.measurables = {};
        this.tool = new MinetteTool();
    }

    /*************************
     *       Engine Boot     *
     * ****/

    async prepare() {
        let loaded = await this.load();
        this.dataSet = loaded;
    }

    loadJSON() {
        this.dataSet = this.dataSet_loc;
    }

    load() {
        return this._load();
    }

    _load() {
        let targetDataSet = this.dataSet_loc;
        return new Promise(function (resolve) {
            d3.csv(targetDataSet).then(function(data) {
                resolve(data)
            });
        })
    }

    /****************************
     *       Data Set Specs     *
     * ****/


    /*
        Let"s add a dimension so our loaded Data Set can accurately parse 
        before we begin with the D3 festivities

        @param String identifier - "name of the dimension"
                                 -- i.e. State, Country
     */
    setMeasure(forIdentifier, scale) {
        let measures = new MinetteMeasurable(forIdentifier, this.nest, scale);

        if (this.isNest) {
            measures.nestifySum();
        }

        this.currentMeasure = measures;
        this.measurables[forIdentifier] = measures;
    }

    sortMeasure(identifier) {
        this.measurables[identifier].sortyMcSortSortDescend();
    }

    removeDimension(fromMeasure, identifier) {
        this.measurables[fromMeasure].remove(identifier);
    }

    isolateDimension(fromMeasure, identifier) {
        this.measurables[fromMeasure].isolate(identifier);
    }
    
    getValue(key, identifier, fromPeriod) {
        if (this.isNest) {
            let target = this.nest.filter(item => { return item.key == key });

            if (target.length <= 1) {
                let children = target[0].values[0].values;

                if (children != undefined && children.length > 1 && fromPeriod == undefined) {
                    let sum = 0;
                    for (var i=0;i<children.length;i++) {
                        sum += parseInt(children[i][identifier]);
                    }

                    return sum;
                }
            }
        }
    }

    /*
        Mapping Measurables

        for CS 360 - Review:
        Citation: @Stuart Thompson "The difference between d3.nest(), d3.map() and data.map"
        https://observablehq.com/@stuartathompson/the-difference-between-d3-nest-d3-map-and-data-map
     */
    arrangeMap(key, parent) {}

    /*
        Nesting Measurables

        for CS 360 - Review:
        Citation: @Stuart Thompson "The difference between d3.nest(), d3.map() and data.map"
        https://observablehq.com/@stuartathompson/the-difference-between-d3-nest-d3-map-and-data-map
        api doc used as ref: https://github.com/d3/d3-collection
     */
    arrangeNest(key, groupBy) {
        this.baseKey = key;
        this.groupByKey = key;
        this.isNest = true;
        this.nest = d3.nest()
                        .key(function(item) { return item[key]; })
                        .key(function(item) { return item[groupBy]; })
                        .entries(this.dataSet);
    }

    arrangeNodes(nodes) {
        if (nodes != undefined) {
            this.dataSet = nodes;
        }
        this.node = new MinetteNodeLink(this.dataSet);
    }

    /*******************
     *     Styling     *
     * ****/
    setStyle(minetteStyle) {
        this.style = minetteStyle;
    }

    /*********************
     *      Graph        *
     * ****/
    setHorizontalDomainRange(identifier, tuneCoeff, suffix) {
        let measure = this.currentMeasure;

        this.origin_x = d3.scaleLinear()
                          .range([0, this.style.size.width])
                          .domain([0, measure.getSumMax]);
        this.origin_y = d3.scaleBand()
                            .domain(measure.getDimensions)
                            .range([this.style.size.height, 0])
                            .padding(.1);

        let finalTC = 1;
        if (tuneCoeff != undefined) {
            finalTC = undefined;
        }

        let finalS = "";
        if (suffix != undefined) {
            finalS = suffix;
        }

        this.x = d3.axisBottom(this.origin_x)
                    .tickFormat(function (item) {return ((item / measure.scale).toFixed(2) * 100).toString()+finalS})
                    .tickSize(0);
    
        this.y = d3.axisLeft(this.origin_y).tickSize(0);
    }

    //TODO: Extract these out to be apart of their shape classes
    //                                          - line 320 ~
    setDomainRange(xDomains, yDomains, scale) {
        //console.log(xDomains);
        //console.log(yDomains);
        this.origin_x = d3.scaleBand()
                            .domain(xDomains)
                            .range([0, this.style.size.width])
                            .padding(.1);
        
        this.origin_y = d3.scaleLinear()
                            .domain(yDomains)
                            .range([this.style.size.height, 0]);

        this.x = d3.axisBottom(this.origin_x).tickSize(0);
    
        this.y = d3.axisLeft(this.origin_y).tickSize(0);
    }

    setHeatDomainRange(identifier) {
        if (!this.isNest) {
            return;
        }

        let nestedKeys = this.nest[0].values.map(item => { return item.key } );

        let measure = this.measurables[identifier];

        this.origin_x = d3.scaleBand()
                            .domain(nestedKeys)
                            .range([0, this.style.size.width])
                            .padding(.1);
        this.origin_y = d3.scaleBand()
                            .domain(measure.getSums)
                            .range([this.style.size.height, 0])
                            .padding(.1);

        this.x = d3.axisBottom(this.origin_x).tickSize(0);
    
        this.y = d3.axisLeft(this.origin_y)
                    .tickFormat(function (item) {return (item / measure.scale).toFixed(1)})
                    .tickSize(0);
    }

    setLinearDomainRange(identifier, identifier2) {
        if (!this.isNest) {
            return;
        }

        let measure = this.measurables[identifier];
        let measure2 = this.measurables[identifier2];

        this.origin_x = d3.scaleLinear()
                            .range([0, this.style.size.width])
                            .domain([0, measure2.getSumMax]);

        this.origin_y = d3.scaleBand()
                            .domain(measure.getSums)
                            .range([this.style.size.height, 0])
                            .padding(.1);

        this.x = d3.axisBottom(this.origin_x)
                    .tickFormat(function (item) {return (item / measure.scale).toFixed(1)})
                    .tickSize(0);
    
        this.y = d3.axisLeft(this.origin_y)
                    .tickFormat(function (item) {return (item / measure.scale).toFixed(1)})
                    .tickSize(0);
    }

    setTimeSeriesDomainRange(identifier) {
        if (!this.isNest) {
            return;
        }

        //TODO: Should not need to "parseInt" next, use DateFormatter to properly
        //attribute and detect timeseries data.
        let nestedKeys = this.nest[0].values.map(item => { return parseInt(item.key) } );

        let measure = this.measurables[identifier];

        this.origin_x = d3.scaleBand()
                            .domain(nestedKeys)
                            .range([0, this.style.size.width])
                            .padding(.1);
        this.origin_y = d3.scaleBand()
                            .domain(measure.isolatedData)
                            .range([this.style.size.height, 0])
                            .padding(.1);

        this.x = d3.axisBottom(this.origin_x).tickSize(0);
    
        this.y = d3.axisLeft(this.origin_y)
                    .tickFormat(function (item) {return (item / measure.scale).toFixed(1)})
                    .tickSize(0);
    }

    setNodesDomain(identifier) {
        //For the bubble chart
        this.measurables[identifier].prepareNodes(this.style.size);
    }

    createCanvas(identifier) {
        this.tool.tip.remove();
        this.tool = new MinetteTool(identifier);
        this.svg = d3.select(".minette"+identifier)
                        .append("svg")
                        .attr("id", identifier)
                        .attr("width", this.style.getPaddedWidth)
                        .attr("height", this.style.getPaddedHeight);

    }

    createAxis(xTitle, yTitle) {
        this.svg.append("g")
                .call(this.x)
                .attr("class", "x axis")
                .attr("transform", "translate("+this.style.padding.left+"," + (this.style.size.height + 12) + ")")
                .selectAll("text")
                .text();

        this.svg.append("g")
                .call(this.y)
                .attr("class", "y axis")
                .attr("transform", "translate("+this.style.padding.left+", "+(this.style.padding.top/2)+")")
                .append("text")

        this.svg.append("text")
                .attr("x", this.style.getPaddedWidth/2)
                .attr("y", this.style.size.height + this.style.padding.bottom + this.style.padding.top)
                .style("max-width", this.style.size.width/2)
                .attr("text-anchor", "middle")
                .text(xTitle);

        this.svg.append("g")
                .attr("transform", "translate(0, " + this.style.size.height/2 + ")")
                .append("text")
                .attr("text-anchor", "middle")
                .attr("transform", "rotate(-90)")
                .text(yTitle);
    }
    
    createTitle(text) {
        this.svg.append("text")
                .attr("transform", "translate(" + this.style.getPaddedWidth/2 + ", 0)")
                .attr("text-anchor", "middle")
                .style("font-size", "20px")
                .text(text);
    }


    /**************************
     *      Graph Types       *
     * ****/ //TODO: Move this out these graph specs outside

    drawBars() {
        let x_domain = this.origin_x;
        let y_domain = this.origin_y;
        let sums = this.currentMeasure.totalSums;

        let attach = this.attachTooltip;
        let tool = this.tool;
        let legend = this.legend;
        this.svg.append("g")
                .selectAll("measure")
                .data(sums)
                .enter()
                .append("rect")
                .style("fill", function(item) { return legend.getColor(item.key) })
                .style("stroke", "#121212")
                .attr("x", this.style.padding.left)
                .attr("y", function(item) { return y_domain(item.key) })
                .attr("width", function(item) { return x_domain(item.value) })
                .attr("height", y_domain.bandwidth())
                .attr("transform", "translate(0, "+(-1*y_domain.bandwidth()/2 + this.style.padding.top*2)+")")
                .on("mouseover", function(event, item) { attach(event, item.key, d3.format(",")(item.value), tool) })
                .on("mouseout", this.removeTooltip(tool));
    }

    setLegend(legend) {
        this.legend = legend;
    }

    /*
        for CS 360 - Review:
        Citation: @Yan Holtz "Basic scatterplot in d3.js"
        https://www.d3-graph-gallery.com/graph/scatter_basic.html
        it was here I learned about `attr("cx", function (d) { return x(d.GrLivArea); } `
        or the difference of using `x` and `cx` for x and y coordinates on scatter plots.
        as well as the fact we had to use `r` rather than `width`/`height` for the size.
     */
    drawDots() {
        let x_domain = this.origin_x;
        let y_domain = this.origin_y;
        let sums = this.currentMeasure.totalSums;

        let attach = this.attachTooltip;
        let tool = this.tool;
        this.svg.append("g")
                .selectAll("measure")
                .data(sums)
                .enter()
                .append("circle")
                .style("fill", "#121212")
                .attr("cx", function(item) { return x_domain(item.value) })
                .attr("cy", function(item) { return y_domain(item.key) })
                .attr("r", 6)
                .attr("transform", "translate("+this.style.padding.left+", "+(-1*y_domain.bandwidth() + this.style.padding.top*2 + 6)+")")
                .on("mouseover", function(event, item) { attach(event, item.key, d3.format(",")(item.value), tool) })
                .on("mouseout", this.removeTooltip(tool));
    }

    drawHeat() {
        let x_domain = this.origin_x;
        let y_domain = this.origin_y;

        let min = this.currentMeasure.getMin;
        let max = this.currentMeasure.getMax;
        let target = this.currentMeasure.name;

        let attach = this.attachTooltip;
        let tool = this.tool;
        this.svg.append("g");
        console.log(this.nest);
        for (const item in this.nest) {
            let dim = this.nest[item];
            this.svg.selectAll("measure")
                    .data(dim.values)
                    .enter()
                    .append("rect")
                    .style("fill", function(value) { 
                        let lum = luminance(value.values[0][target], max, min);
                        return "hsl("+lum+",50%,42%"+")";
                    })
                    .attr("x", function(value) { return x_domain(value.key) })
                    .attr("y", function(value) { return y_domain(dim.key) })
                    .attr("width", x_domain.bandwidth())
                    .attr("height", y_domain.bandwidth())
                    .attr("transform", "translate("+this.style.padding.left+", "+(-1*y_domain.bandwidth() + this.style.padding.top*2)+")")
                    .on("mouseover", function(event, value) { attach(event, dim.key, value.values[0][target], tool) })
                    .on("mouseout", this.removeTooltip(tool));
        }
        
    }

    //TODO: the concept of multiple measureables needs to be refactored
    //and become more re-usable. This should be able to handle N - size
    //comaparables
    drawBubble(data, identifier, maximas) {
        let x_domain = this.origin_x;
        let y_domain = this.origin_y;

        let width = this.style.size.width;
        let height = this.style.size.height;

        let min = maximas.min;
        let max = maximas.max;

        // this.svg.append("g")
        //         .selectAll("measure")
        //         .append("svg")
        //         .attr("width", width)
        //         .attr("height", height)

        let attach = this.attachTooltip;
        let remove = this.removeTooltip;
        let tool = this.tool;
        
        let paddingLeft = this.style.padding.left;
        this.svg.append("g")
                .selectAll("measure")
                .data(data)
                .enter()
                .append("circle")
                .classed("bubble", true)
                .attr("cx", function(item, i) { 
                    let xd = x_domain(item[identifier][0].title);
                    return xd + paddingLeft + 12; })
                .attr("cy", function(item) { 
                    let yd = y_domain(item[identifier][0].days);
                    return yd - 12; })
                .attr("r", d => 12)//d.radius)
                .attr("fill", function(item) { 
                    let lum = luminance(item.value, max, min);
                    return "hsl("+lum+",50%,42%"+")";
                })
                //.attr("style", "outline: thin solid black")
                .style("stroke", "#121212")
                .style("stroke-width", 0.75)
                .attr("transform", "translate("+this.style.padding.left+", "+(this.style.padding.top)+")")
                /*
                    for CS 360 - Review:
                    Citation: @Ruben Helsloot
                    https://stackoverflow.com/questions/64910052/d3-js-v6-2-get-data-index-in-listener-function-selection-onclick-listene
                    This is where I learned of `.nodes().indexOf(this)` to grab and pass an index of an element
                */
                .on("mouseover", function(event, item) { console.log(item); return data == undefined ? undefined : attach(event, data[item][identifier][0].title, data[item][identifier][0].days+" days", tool) })
                .on("mouseout", this.removeTooltip(tool));
        //console.log(this.svg);
                              
    }

    drawLegend() {
        this.legend.draw();                  
    }

    drawNodes(meta, highlight, subtitles) {
        // console.log(this.svg);
        let attach = this.attachTooltip;
        let tool = this.tool;
        this.meta = meta;
        this.highlight = highlight;
        this.subtitles = subtitles;

        let metadata = this.meta;
        let highlights = this.highlight;
        let subtext = this.subtitles;

        let targetHighlights = [];
        if (highlight != undefined) {

            highlight.map(item => { return item.nodes.forEach(data => { targetHighlights.push(data.target); targetHighlights.push(data.source); }) });
            targetHighlights = targetHighlights.filter(uniques);
            // console.log(targetHighlights);
        } 
        let links = this.svg.append("g")
                            .attr("class", "links")
                            .selectAll("line")
                            .data(this.node.getData)
                            .enter()
                            .append("line")
                            .attr("stroke-width", 1)
                            .attr("stroke", function(item) { return targetHighlights.includes(item.source) && targetHighlights.includes(item.target) ? "#EC6CFF" : "#808080" } );
                            // .on("mouseover", function(event, item) { return attach(event, "source: "+item.source, "target: "+item.target, tool) })
                            // .on("mouseout", this.removeTooltip(tool));
        
        let packedNodes = this.node.getNodesPacked;
        
        let nodes = this.svg.append("g")
                            .attr("class", "nodes")
                            .selectAll("circle")
                            .data(this.node.getNodesPacked)
                            .enter()
                            .append("circle")
                            .attr("r", 10)
                            .attr("fill",   function(item) { return (metadata) == undefined ? "#121212" : ((metadata[item.id]) == undefined ? "#121212" : metadata[item.id].color); })
                            .on("mouseover", function(event, item) { /*console.log(item);*/ return metadata == undefined ? undefined : ((metadata[packedNodes[item].id]) == undefined ? "#121212" : attach(event, metadata[packedNodes[item].id].label, subtext[packedNodes[item].id]+" days", tool)) })
                            .on("mouseout", this.removeTooltip(tool));

        let simulation = d3.forceSimulation()
                           .force("link", d3.forceLink().id(link => link.id))//.strength(0))
                           .force("charge", d3.forceManyBody().strength(-this.style.size.width)) //-4
                           .force("center", d3.forceCenter(this.style.size.width / 2, this.style.size.height / 2))

        //  /*
        //     for CS 360 - Review:
        //     Citation: @Gerardo Furtado
        //     https://stackoverflow.com/questions/43760235/d3-cannot-create-property-vx-on-number-65
        //     This is where I got a better understanding of the properties required to make 
        //     node-links understand their paths between each.
        // */
        simulation
                .nodes(this.node.getNodesPacked)
                .on("tick", () => {
                        links.attr("x1", link => link.source.x)
                             .attr("y1", link => link.source.y + this.style.padding.top)
                             .attr("x2", link => link.target.x)
                             .attr("y2", link => link.target.y + this.style.padding.top);

                        nodes.attr("cx", node => node.x)
                             .attr("cy", node => node.y + this.style.padding.top);
                });
            
        simulation.force("link").links(this.node.getData);
    }

    /*
        for CS 360 - Review:
        Citation: @KingOfCramers
        https://bl.ocks.org/KingOfCramers/32bbcd8c360e6d8aa0d5b7a50725fe73
        Got major inspiration of a concise matrix solution here.
    */
    drawMatrix() {
        let attach = this.attachTooltip;
        let tool = this.tool;

        var matrix = [];
		this.dataSet.forEach(node => {
			let link_id = +(node.source + node.target);
            let cell = {id: link_id, source: node.source, target: node.target, weight: node.length};
			matrix.push(cell);
		});

        for(let i = 0; i < this.node.getNodes.length; i++) {
            for(let j = 0; j < this.node.getNodes.length; j++) {
                let source = this.node.getNodes[i];
                let target = this.node.getNodes[j];

                let link_id = +(source + target);
                let rev_link_id = +(target + source);
                if (matrix.find(item => item.id == link_id) != undefined) {

                    matrix.find(item => item.id == link_id)["x"] = i;
                    matrix.find(item => item.id == link_id)["y"] = j;

                    //Mirroring
                    // if (matrix.find(item => item.id == rev_link_id) == undefined) {
                    //     let cellTarget = matrix.find(item => item.id == link_id);
                    //     let cell = {id: rev_link_id, x: j, y: i, source: cellTarget.target, target: cellTarget.source, weight: cellTarget.length};
			        //     matrix.push(cell);
                    // }
                }
            }
        }
		
		//console.log(matrix);

        let cellWidth = this.style.size.width / this.node.getNodes.length;
        this.svg.append("g")
            .selectAll("rect")
            .data(matrix)
            .enter()
            .append("rect")
            .attr("class","grid")
            .attr("width", cellWidth)
            .attr("height", cellWidth)
            .attr("x", item => (item.x) * cellWidth + 5)
            .attr("y", item => (item.y) * cellWidth + 5 + this.style.padding.top)
            .attr("stroke-width", 1)
            .attr("stroke", "#808080")
            .on("mouseover", function(event, item) { return attach(event, "source: " + item.source, "target: " + item.target, tool) })
            .on("mouseout", this.removeTooltip(tool));
		
        this.svg.append("g")
            .selectAll("text")
            .data(this.node.getNodesPacked)
            .enter()
            .append("text")
            .attr("x", (item, i) => i * cellWidth + cellWidth.toFixed(2)/2.0 + 5)
            .attr("y", this.style.padding.top)
            .text(item => item.id)
            .style("text-anchor","middle")
            .style("font-size","10px");
            
        this.svg.append("g")
            .selectAll("text")
            .data(this.node.getNodesPacked)
            .enter()
            .append("text")
            .attr("y",(item, i) => i * cellWidth.toFixed(2) + cellWidth.toFixed(2)/1.5 + 5 + this.style.padding.top)
            .text(item => item.id)
            .style("text-anchor","end")
            .style("font-size","10px");
    }

    /*
        for CS 360 - Review:
        Citation: @1wheel - Adam Pearce
        https://github.com/1wheel/d3-init
        Not much taken from here, but got inspiration
        for the tooltip design / functionality..
     */
    attachTooltip(event, key, value, tool) {
        tool.tip.transition()		
                    .duration(200)		
                    .style("opacity", .9);		
        tool.tip.html(key + "<br/>" + tool.subtitle + value)	
                    .style("left", (event.clientX) + "px")		
                    .style("top", (event.clientY - 28) + "px");


    }

    removeTooltip(tool) {
        tool.tip.transition()		
                .duration(500)		
                .style("opacity", 0);
    }
}

class MinetteTool {
    constructor(identifier) {
        this.tip = d3.select(".minette"+identifier)
                           .append("div")	
                           .attr("class", "tooltip")	
                           .attr("id", "tooltip"+identifier)				
                           .style("opacity", 0);

        // this.tip = identifier == undefined ? d3.select(".tooltip") : d3.select("tooltip"+identifier);
        //TODO: Hardcoded....
        this.subtitle = "";
    }
    
}

/********************************
 *       Minette Node Links     *
 * ****/
 class MinetteNodeLink {
    /*
        Let"s add a dimension so our loaded Data Set can accurately parse 
        before we begin with the D3 festivities

        @param Dict dataSet - "a dataSet of a type D3 parsable"
                            -- could be treated as a [[String: Any]]
     */
    constructor(dataSet) {
        this.dataSet = dataSet;
        
        this.nodes = [];
        dataSet.forEach(item => { this.nodes.push(item.target); this.nodes.push(item.source) });//.sort((a, b) => (parseInt(a) < parseInt(b)) ? -1 : 1);
        this.nodes = this.nodes.filter(uniques);

        this.nodesPacked = this.nodes.map(item => { return { id: item } });
    }

    get getNodes() {
        return this.nodes;
    }

    get getNodesPacked() {
        return this.nodesPacked;
    }

    get getData() {
        return this.dataSet;
    }
}

/********************************
 *       Minette Measurable     *
 * ****/
class MinetteMeasurable {
    /*
        Let"s add a dimension so our loaded Data Set can accurately parse 
        before we begin with the D3 festivities

        @param String name - "name of the dimension"
                           -- i.e. State, Country

        @param Dict dataSet - "a dataSet of a type D3 parsable"
                            -- could be treated as a [String: Any]
     */
    constructor(name, dataSet, scale) {
        this.name = name;
        this.data = dataSet;
        this.scale = scale;

        this.storeValues();
    }

    get getName() {
        return this.name;
    }

    get getData() {
        return this.data;
    }

    //TODO: need to brainstorm a better grouping strategy
    //of visuals that utilize a necessity of summations
    //and those that do not. aka, Bins vs Heat vs Bar
    get getSums() {
        return this.totalSums.map(item => { return item.value; });
    }

    get getSumMax() {
        return d3.max(this.getSums);
    }

    get getSumMin() {
        return d3.min(this.getSums);
    }

    get getMax() {
        return d3.max(this.values);
    }

    get getMin() {
        return d3.min(this.values);
    }

    get getDimensions() {
        return this.totalSums.map(item => { return item.key; });
    }

    getValue(key, identifier) {
        console.log(this.data);
    }

    storeValues() {
        let sums = this.data.map(key => { 
            return key.values.flatMap(value => { 
                    return value.values.map( target => { 
                        return target[this.name] }) })
        });

        this.values = sums.flatMap(item => { return parseFloat(item); });
    }

    nestifySum() {
        let sums = this.data.map(key => { 
            let value = key.values.flatMap(value => { 
                    return value.values.map( target => { 
                        return target[this.name] }) }).reduce((prev, next) => parseFloat(prev) + parseFloat(next)) 
                    
            return { key: key.key, value: value };        
        }); 
        
        /*
            Basic Map
            for CS 360 - Review:
            Citation: @d3js.org "d3-collection API"
            https://github.com/d3/d3-collection#maps

            i.e. d3.map(sums, function(item) { return item.key; });
        */
        this.totalSums = sums;
    }

    sortyMcSortSortAscend() {
        this.totalSums.sort((a, b) => (a.value < b.value) ? 1 : -1);
    }

    sortyMcSortSortDescend(){
        this.totalSums.sort((a, b) => (a.value > b.value) ? 1 : -1);
    }

    prepareNodes(size) {
        //const maxSize = d3.max(this.getSums, d => +d);
        // size bubbles based on area
        const radiusScale = d3.scaleLinear()
                                .domain([this.getSumMin, this.getSumMax])
                                .range([2, 24])

        // use map() to convert raw data into node data
        const myNodes = this.totalSums.map(d => ({
            key: d.key,
            radius: radiusScale(d.value),
            value: d.value
        }))
        this.nodes = myNodes;
    }

    remove(dimension) {
        this.totalSums = this.totalSums.filter(item => { return item.key != dimension });
    }

    isolate(dimension) {
        this.data = this.data.filter(item => { return item.key == dimension });
        this.totalSums = this.totalSums.filter(item => { return item.key == dimension });

        //TODO: Needs to be reviewed for re-usability. As of 2021-03-08
        //this was included for time-series evaluations.
        let values = this.data[0].values;

        let targetData = [];
        for (const index in values) {
            targetData.push(values[index].values[0][this.name]);
        }

        this.isolatedData = targetData;
    }
}

/**************************
 *      Minette Graphs     *
 * ****/

//TODO: Abstract these out to incorporate D3 draw logics
class MinetteBar {

}

class MinetteScatter {

}

class MinetteHeat {

}

class MinetteFinance {

}

class MinetteLegend {
    constructor(data, ticks) {
        this.dataSet = data;

        this.ticks = ticks;

        this.isQualitative = false;
        this.isDivergent = false;
        this.isSequential = false;
    }

    scale() {
        let array = [];
        for(let i = 0; i < this.ticks; i++) {
            array.push(Math.floor(this.min + (this.factor*i)));
        }
        this.groups = array.sort((a, b) => (a.value > b.value) ? -1 : 1);

    }

    setQualitative() {
        let values = this.dataSet.map(item => { return item.value; });
        this.groups = values.filter(uniques);
        this.isQualitative = true;
        this.colors = ["rgb(141,211,199)", "rgb(255,255,179)", "rgb(190,186,218)", "rgb(251,128,114)", "rgb(128,177,211)", "rgb(253,180,98)", "rgb(179,222,105)", "rgb(252,205,229)"];
    
    }

    setSequential() {
        let values = this.dataSet.map(item => { return item.value; });
        this.max = d3.max(values);
        this.min = d3.min(values);
        this.factor = (this.max - this.min) / this.ticks;

        this.scale();

        this.isSequential = true;
        this.colors = ["rgb(2,56,88)", "rgb(4,90,141)", "rgb(5,112,176)", "rgb(54,144,192)", "rgb(116,169,207)", "rgb(166,189,219)", "rgb(208,209,230)", "rgb(236,231,242)"];
    }

    setDivergent() {
        let values = this.dataSet.map(item => { return item.value; });
        this.max = d3.max(values);
        this.min = d3.min(values);
        this.factor = (this.max - this.min) / this.ticks;

        this.scale();

        this.isDivergent = true;
        this.colors = ["rgb(166,97,26)", "rgb(223,194,125)", "rgb(245,245,245)", "rgb(128,205,193)", "rgb(1,133,113)"]
    }

    getColor(key) {
        let target = this.dataSet.filter(item => { return item.key == key.toUpperCase() });
        let found = this.groups.find(item => item <= target[0].value);
        let index = this.groups.indexOf(found);

        return (this.colors[index]);
    }

    get getColors() {
        return (this.colors.map((item, i) => { return {color: item, label: this.groups[i]} }))
    }

    draw() {       
        var svg = d3.select("body")
                    .append("minette")	
                    .attr("class", "minette_legend")
                    .append("svg");

        svg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(20,20)");

        var legend = svg.append("g");
        let colors = this.colors;
        legend.append("text")
              .attr("x", 0)
              .attr("y", 12)
              .text("% Major Pollution w/ Loadings (amount of mass discharged into water)");
        for (let i = 0; i < this.groups.length; i++) {
            legend.append("rect").attr("x", 0)
                .attr("y", (25*(i + 1)))                                  
                .attr("width", 25)                        
                .attr("height", 25)                        
                .style("fill", (function(j) { return colors[i]; }))
        }
        
        var legendText = svg.append("g");
        
        let scale = this.groups;
        for (let i = 0; i < this.groups.length; i++) {
            let prefix = "";
            let suffix = "";
            if (this.isSequential) {
                prefix = "> ";

                if(i > 0 && i < this.groups.length - 1) {
                    continue;
                }
            } else if (this.isDivergent) {
                if(i > 0 && i < this.groups.length - 1 && i != Math.floor(this.groups.length/2)) {
                    continue;
                }
                suffix = "%";
            }

            legend.append("text")
                .attr("x", 35)
                .attr("y", (25*(i + 1)) + 15.5)
                .text(prefix+scale[i]+suffix);
        }
        svg.select(".legend")
            .call(legend);

        svg.select(".legend")
            .call(legendText);
    }
}

/**************************
 *       Minette Style     *
 * ****/
class MinetteStyle {
    /*
        Basic style properties

        @param Dict padding - { top: Number, left: Number, bottom: Number, right: Number }
        @param Dict size - { width: Number, height: Number }
     */
    constructor(padding, size) {
        this.padding = padding;
        this.size = size;
    }

    get getPaddedWidth() {
        return this.padding.left + this.padding.right + this.size.width;
    }

    get getPaddedHeight() {
        return this.padding.bottom + this.padding.top + this.size.height;
    }
}

/*************************
 *     Data Preppers     *
 * ****/
function clean(data, target) {
    return data.remove(target);
}

/*
    for CS 360 - Review:
    
    Normalize the target val between 0 - 1.0, 
    invert and expand back out to to a range of 0 - 240.
    although, we are implementing it differently here. A singular
    `h` to override the other 2 indices in a color property to give
    us a gradient.

    We could mute the colors however we please for design standards.
*/
function luminance(value, min, max) {
    let normalized = (parseFloat(value) - min) / (max - min);
    return (normalized * 75);
}

/*********************
 *     Utilities     *
 * ****/
Object.defineProperty(Array.prototype, "remove", {
    value: function(value) {
      for(let key in this){
        if(this[key] === value){
          this.splice(key,1);
        }
      }
      return this;
    } 
});

function uniques(value, index, self) {
    return self.indexOf(value) === index;
}

export { Minette, MinetteStyle };