import React, {useEffect} from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import './style.css';
import '../../constants/GlobalStyle.css';
import * as d3 from "d3";
import { LineChart, drawChart } from "./D3/LineChart.js";

class GraphEntity extends React.Component {

  constructor(props) {
    super(props);

    this.setup = this.setup.bind(this);
    this.updateChart = this.updateChart.bind(this);

    this.state = {
      isGainer: true,
      currentPrice: "$000.00",
      currentError: "0%",
      type: "close",
      daysTrained: 0};
  }

  componentWillMount() {

  }

  componentDidMount() {
    this.setup(this.props);
  }

  componentWillUnmount() {
  }

  componentWillReceiveProps(nextProps) {
    this.setup(nextProps);
  }

  setup(nextProps) {
    let resizedWidth = nextProps.width*0.9;
    let resizedHeight = nextProps.height*0.9;

    let jsonAggregratedData = [];

    let chart = nextProps.data.chart.result;

    if (chart.length < 1) {
      return;
    }

    let items = chart[0];
    let size = items.indicators.quote[0].close.length;
    for (let i = 0; i < size; i++) {
      let quote = items.indicators.quote[0].close[i];
      let timestamp = parseInt(items.timestamp[i]);

      let date = new Date(timestamp * 1000);
      var formattedDate = date.getUTCFullYear() + '-' + (date.getUTCMonth() + 1)+ '-' + date.getDate();

      let jsonData = {};
      jsonData["date"] = date;
      jsonData["dateString"] = formattedDate;
      jsonData["value"] = parseFloat(quote);
      jsonAggregratedData.push(jsonData);
    }

    let today = new Date();
    // today.setDate(today.getDate()-1);
    let dd = today.getDate();
    let mm = today.getMonth()+1;
    let yyyy = today.getFullYear();

    let currentPrice = parseFloat(jsonAggregratedData[jsonAggregratedData.length - 1].value);
    let lastPrice = parseFloat(jsonAggregratedData[jsonAggregratedData.length - 2].value);
    if(jsonAggregratedData[jsonAggregratedData.length - 1].dateString == yyyy+'-'+mm+'-'+dd) {
      
      //this is for when you wanted to add the prediction line
      //instead of the last segment. But, we should probably just overlay
      //the line and leave the orig line chart a ground truth of today
      //jsonAggregratedData.pop();
    }

    d3.select(".securityName"+nextProps.symbol).html(`<span>\$${nextProps.symbol}</span>`);

    this.setState({
      width: resizedWidth,
       height: resizedHeight,
        symbol: nextProps.symbol,
         newData: jsonAggregratedData,
          isGainer: currentPrice > lastPrice,
          currentPrice: "$"+currentPrice.toString(),
          lastPrice: "$"+lastPrice.toString()});

  }

  componentDidUpdate() {

    this.updateChart();
  }

  updateChart() {
    d3.select("#svg"+this.state.symbol).remove();
    d3.select("#svgprediction"+this.state.symbol).remove();
    
    let margin = {
      top: 90,
      right: 20,
      bottom: 30,
      left: 20,
      };

    let widthPref = this.props.width - margin.left - margin.right;
    let heightPref = this.props.height - margin.top - margin.bottom;
    drawChart(new LineChart( this.state.symbol, {width: widthPref, height: heightPref}, margin, this.state.isGainer ? "rgba(0,200,5,1)" : "rgba(255,80,0,1)", this.state.newData));
  }

  render() {

    return (
    <div className="securityMetadataContainer courierMedium">
      <div className="securityMetadata">
        <div className={"securityName"+`${this.state.symbol}`+" graphTitle courierLarge "+`${this.state.isGainer ? "sinatraGreen" : "sinatraRed"}`}>
        </div>
        <div className={"securityFeatureValue"+`${this.state.symbol}`+" graphPrice courierSemiLarge"}>
        </div>
        <div className={"securityFeatureValueChange"+`${this.state.symbol}`+" graphPriceChange courierMedium"}>
        </div>
      </div>
      <div className="spacerForChart"> </div>
      <div className="securityChart graphChartContainer">
        <div className={"securityChart"+`${this.state.symbol}`}>
        </div>
        <div className={"securityChartPrediction"+`${this.state.symbol}`+" graphChartPrediction "+`${this.state.isGainer ? "graphChartFlickerGreen" : "graphChartFlickerRed"}`}>
        </div>
      </div>
    </div>
    )
  }
}

export default GraphEntity;
