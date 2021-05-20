import * as d3 from "d3";

class LineChart {

    constructor(symbol, size, margin, color, data) {
        this.symbol = symbol;
        this.size = size;
        this.margin = margin;
        this.data = data;
        this.color = color;
    }

}

/**
 * The line chart d3 logic
 *  
 */
function drawChart(props) {
    let data = props.data;
    let symbol = props.symbol;

    let svg = d3
        .select(".securityChart"+symbol)
        .attr("overflow", "visible")
        .append("svg")
        .attr("overflow", "visible")
        .attr("id", "svg"+symbol)
        .attr("width", props.size.width)
        .attr("height", props.size.height)
        .attr("transform", "translate(" + props.margin.left + "," + 0 + ")")
        .append("g");
        
    //     .select(".securityChartPrediction"+symbol)
    //     .append("svg")
    //     .attr("id", "svgprediction"+symbol)
    //     .attr("width", width)
    //     .attr("height", height)
    //     .attr("transform", "translate(" + margin.left + "," + (margin.top) + ")")
    //     .append("g");
    let x = d3
        .scaleTime()
        .domain(
            d3.extent(data, function (d) {
                return d.date;
            })
        ).rangeRound([0, props.size.width]);

    //svg.append("g");//.attr("transform", "translate(0," + props.size.height + ")");

    let y = d3
        .scaleLinear()
        .domain(
        d3.extent(data, function (d) {
            return d.value;
        })
        )
        .rangeRound([props.size.height, 0]);
    

    let bisect = d3.bisector(function (d) {
        return d.date;
    }).left;

    var focus = svg
        .append("g")
        .append("circle")
        .style("fill", props.color)
        .attr("stroke", props.color)
        .attr("r", 4)
        .style("opacity", 0);

    var focusText = svg
        .append("g")
        .append("text")
        .style("opacity", 0)
        .style("fill", "grey")
        .attr("text-anchor", "left")
        .attr("alignment-baseline", "middle");

    // let lastItem = data.pop();
    // console.log(data);
    // console.log(lastItem);
    // Add the line
    svg
        .append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", props.color)
        .attr("stroke-width", 1.6)
        .attr("stroke-linecap", "round")
        .attr("d",
            d3.line()
              .x(function (d) {
                return x(d.date);
            })
              .y(function (d) {
                return y(d.value);
            })
        );

    let items = data.slice(data.length - 2, data.length);

    let svgPrediction = addPredictionLine(items, props.size.width, props.size.height, props.margin, x, y, "0, 200, 5", symbol);
    let defsPrediction = svgPrediction.append("defs");
    addGlow(defsPrediction, symbol);

    let defs = svg.append("defs");
    let colorMatrix = "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0";

    ///-------
    //Filter for the outside glow
    var filter = defs.append("filter")
        .attr("id","shadow")
    filter.append("feColorMatrix")
        .attr("type", "matrix")
        .attr("values", colorMatrix)
    filter.append("feGaussianBlur")
        .attr("stdDeviation","4.8")
        .attr("result","coloredBlur");
    var feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode")
        .attr("in","coloredBlur");
    feMerge.append("feMergeNode")
        .attr("in","SourceGraphic");
    //----append the svg object to the body of the page

    d3.selectAll("#svg"+symbol)
        .style("filter", "url(#shadow)");


    //   // Create a rect on top of the svg area: this rectangle recovers mouse position
    svgPrediction
        .append("rect")
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr("width", props.size.width)
        .attr("height", props.size.height)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseout", mouseout);

    d3.select(".securityName"+symbol).html(`<span>\$${symbol.toUpperCase()}</span>`);

    ///////////
    // console.log(selectedData.date, selectedData.value);
    var newDate = data[data.length-1].dateString;//.toDateString();
    var newVal = (Math.round(data[data.length-1].value * 100) / 100).toFixed(2);
    var diffVal = newVal - data[0].value; //***** */
    diffVal = (Math.round(diffVal * 100) / 100).toFixed(2); //**** */
    var diffPercentage = (newVal * 100) / data[0].value - 100;

    d3.select(".securityFeatureValue"+symbol).html(`<span>\$${newVal}</span>`);
    d3.select(".securityFeatureValueChange"+symbol).html(
        `<span>\$${diffVal}(${diffPercentage.toFixed(2)}%)</span>`
    ); //**** */
    /////

    function mouseover() {
        focus.style("opacity", 1);
        focusText.style("opacity", 1);
    }

    function mousemove() {
        //The 0.9 comes from when we shrink the graph in GraphEntity
        let positionXPadding = (((props.size.width)) * 1.5) + (props.margin.left);

        var x0 = x.invert(d3.mouse(d3.event.currentTarget)[0]);

        if (checkBrowser() === "Firefox") {
            x0  = x.invert(d3.mouse(d3.event.currentTarget)[0] + positionXPadding);
        }

        var i = bisect(data, x0, 1);
        var selectedData = data[i];

        if (selectedData == undefined) {
            return;
        }
        var newDate = selectedData.dateString;
        var newVal = (Math.round(selectedData.value * 100) / 100).toFixed(2);
        focus.attr("cx", x(selectedData.date)).attr("cy", y(selectedData.value));
        focusText
            .html(newDate)
            .attr("x", x(selectedData.date) + -70)
            .attr("y", y(selectedData.value) + -40);

        var diffVal = newVal - data[0].value; 
        diffVal = (Math.round(diffVal * 100) / 100).toFixed(2); 
        var diffPercentage = (newVal * 100) / data[0].value - 100;


        d3.select(".securityFeatureValue"+symbol).html(`<span>\$${newVal}</span>`);
        d3.select(".securityFeatureValueChange"+symbol).html(
            `<span>\$${diffVal}(${diffPercentage.toFixed(2)}%)</span>`
        ); 
    }

    function mouseout() {
        focus.style("opacity", 0);
        focusText.style("opacity", 0);
        var moveVal = (Math.round(data[data.length - 1].value * 100) / 100).toFixed(
        2
        );
        var diffVal =
        (Math.round(data[data.length - 1].value * 100) / 100).toFixed(2) - //**** */
        (Math.round(data[0].value * 100) / 100).toFixed(2); //**** */
        var diffPercentage =
        ((Math.round(data[data.length - 1].value * 100) / 100).toFixed(2) * 100) / //**** */
            (Math.round(data[0].value * 100) / 100).toFixed(2) - //*** */
        100; //**** */
        d3.select(".securityFeatureValue"+symbol).html(`<span> \$${moveVal}</span>`);
        d3.select(".securityFeatureValueChange"+symbol).html(
        //**** */
        `<span>\$${diffVal.toFixed(2)}(${diffPercentage.toFixed(2)}%)</span>` //**** */
        ); //**** */
    }
}

/**
 * Generates a glow filter with multiple layers of it for intensity
 * purposes around the edge of a prediction line. Not currently in use
 * but a good to have when predictions need to be drawn on the line chart
 * itself.
 * 
 * @param defs type of d3
 * @param symbol for ticker
 */
function addGlow(defs, symbol) {
    let shadowCM1 = "0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0";
    let shadowCM2 = "0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.9 0";
    let shadowCM3 = "0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.8 0";
    let shadowCM4 = "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.69678442 0";
    let shadowCM5 = "0 0 0 0 0.314369351 0 0 0 0 0.8883757 0 0 0 0 0.759899616 0 0 0 0.649371603 0";

    //Filter for the outside glow
    var filter = defs.append("filter")
        .attr("id","glow"+symbol)
        .attr("filterUnits","userSpaceOnUse");

    filter.append("feOffset")
        .attr("in","SourceAlpha")
        .attr("result","shadowOffsetOuter1");
    filter.append("feGaussianBlur")
        .attr("stdDeviation","5")
        .attr("in","shadowOffsetOuter1")
        .attr("result","shadowBlurOuter1");
    filter.append("feColorMatrix")
        .attr("type","matrix")
        .attr("values",shadowCM1)
        .attr("in","shadowBlurOuter1")
        .attr("result","shadowMatrixOuter1");

    filter.append("feOffset")
        .attr("in","SourceAlpha")
        .attr("dy","1")
        .attr("result","shadowOffsetOuter2");
    filter.append("feGaussianBlur")
        .attr("stdDeviation","7")
        .attr("in","shadowOffsetOuter2")
        .attr("result","shadowBlurOuter2");
    filter.append("feColorMatrix")
        .attr("type","matrix")
        .attr("values",shadowCM2)
        .attr("in","shadowBlurOuter2")
        .attr("result","shadowMatrixOuter2");


    filter.append("feOffset")
        .attr("in","SourceAlpha")
        .attr("dy","2")
        .attr("result","shadowOffsetOuter3");
    filter.append("feGaussianBlur")
        .attr("stdDeviation","10")
        .attr("in","shadowOffsetOuter3")
        .attr("result","shadowBlurOuter3");
    filter.append("feColorMatrix")
        .attr("type","matrix")
        .attr("values",shadowCM3)
        .attr("in","shadowBlurOuter3")
        .attr("result","shadowMatrixOuter3");


    filter.append("feOffset")
        .attr("in","SourceAlpha")
        .attr("dx","2")
        .attr("dy","2")
        .attr("result","shadowOffsetOuter4");
    filter.append("feGaussianBlur")
        .attr("stdDeviation","4")//creates a singular baseline
        .attr("in","shadowOffsetOuter4")
        .attr("result","shadowBlurOuter4");
    filter.append("feColorMatrix")
        .attr("type","matrix")
        .attr("values",shadowCM4)
        .attr("in","shadowBlurOuter4")
        .attr("result","shadowMatrixOuter4");

    filter.append("feOffset")
        .attr("in","SourceAlpha")
        .attr("dy","2")
        .attr("result","shadowOffsetOuter5");
    filter.append("feGaussianBlur")
        .attr("stdDeviation","8")
        .attr("in","shadowOffsetOuter5")
        .attr("result","shadowBlurOuter5");
    filter.append("feColorMatrix")
        .attr("type","matrix")
        .attr("values",shadowCM5)
        .attr("in","shadowBlurOuter5")
        .attr("result","shadowMatrixOuter5");

    var feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode")
        .attr("in","shadowMatrixOuter1");
    feMerge.append("feMergeNode")
        .attr("in","shadowMatrixOuter2");
    feMerge.append("feMergeNode")
        .attr("in","shadowMatrixOuter3");
    feMerge.append("feMergeNode")
        .attr("in","shadowMatrixOuter4");
    feMerge.append("feMergeNode")
        .attr("in","shadowMatrixOuter5");
}

function addPredictionLine(items, width, height, margin, x, y, color, symbol) {
    var svgPrediction = d3
        .select(".securityChartPrediction"+symbol)
        .attr("overflow", "visible")
        .append("svg")
        .attr("overflow", "visible")
        .attr("id", "svgprediction"+symbol)
        .attr("width", width)
        .attr("height", height)
        .attr("transform", "translate(" + margin.left + "," + (margin.top - margin.bottom/2) + ")")
        .append("g");

    svgPrediction
        .append("path")
        .datum(items)
        .attr("fill", "#FFF")
        .attr("stroke", "rgba(255, 255, 255, 1)") //"+color+","+(1.0/i)+")")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 2.4)
        .attr("id", "prediction")
        .attr(
            "d",
            d3
            .line()
            .x(function (d) {
                return x(d.date);
            })
            .y(function (d) {
                return y(d.value);
            })
        );

    ////
    //Apply to your element(s)
    d3.selectAll("#svgprediction"+symbol)
        .style("filter", "url(#glow"+symbol+")");

    return svgPrediction;
}

function checkBrowser(){
    let browser = "";
    let c = navigator.userAgent.search("Chrome");
    let f = navigator.userAgent.search("Firefox");
    let m8 = navigator.userAgent.search("MSIE 8.0");
    let m9 = navigator.userAgent.search("MSIE 9.0");
    if (c > -1) {
        browser = "Chrome";
    } else if (f > -1) {
        browser = "Firefox";
    } else if (m9 > -1) {
        browser ="MSIE 9.0";
    } else if (m8 > -1) {
        browser ="MSIE 8.0";
    }
    return browser;
}

export { LineChart, drawChart, addGlow, addPredictionLine };