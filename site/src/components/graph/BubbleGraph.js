import React, {useEffect} from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import './style.css';
import '../../constants/GlobalStyle.css';
import * as d3 from "d3";
import { Quartz, QuartzStyle } from "./D3/Quartz.js";
import CsvDownload from 'react-json-to-csv';

class BubbleGraph extends React.Component {

  constructor(props) {
    super(props);

    this.setup = this.setup.bind(this);
    this.updateChart = this.updateChart.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.drawQuartz = this.drawQuartz.bind(this);

    this.state = {
      isGainer: true,
      currentPrice: "$000.00",
      currentError: "0%",
      type: "close",
      viewingNode: true,
      loaded: false,
      daysTrained: 0};
  }

  componentWillMount() {

    // this.drawQuartz();
  }

  componentDidMount() {
    this.setup(this.props);
    
    // document.querySelector("#button" + this.props.symbol).addEventListener( 'touchend', this.onTouchEnd, false );
    // document.querySelector("#button" + this.props.symbol).addEventListener( 'mouseup', this.onMouseUp, false );
  }

  componentWillUnmount() {
    // document.querySelector("#button" + this.props.symbol).removeEventListener("touchend", this.onTouchEnd, false);
    // document.querySelector("#button" + this.props.symbol).removeEventListener("mouseup", this.onMouseUp, false);
  }

  componentWillReceiveProps(nextProps) {
    this.setup(nextProps);

    //this.drawQuartz();
  }

  onMouseUp( event ) {
    this.click();
    event.preventDefault();
  }

  onTouchEnd( event ) {
    this.click();
    event.preventDefault();
  }

  click() {
    this.setState({viewingNode: !this.state.viewingNode});
    // this.updateChart();

    // this.drawQuartz();
  }

  setup(nextProps) {

    // this.updateChart();
  }

  componentDidUpdate() {

    // this.updateChart();
  }

  updateChart() {
    d3.select("#svgbubble"+this.props.symbol).remove();
    d3.select("#svgbubbleprediction"+this.props.symbol).remove();
  }

  drawQuartz() {
    let chart = this.props.chart;
    let symbol = this.props.symbol;
    let predictions = this.props.comparable;
    let comparable = predictions[0].predictions[0].comparable;//lol...
    let meta = this.props.meta;

    let margin = {
        top: 24,
        right: 8,
        bottom: 8,
        left: 24,
        };
  
    let widthPref = this.props.width - margin.left - margin.right;
    let heightPref = this.props.height - margin.top - margin.bottom;

    //Quartz
   
    const KEY = "State";
    const GROUP_BY ="Year";
    
    const MEASURE3 = "Totals.Unemployment comp revenue";
    const MEASURE2 = "Totals.Sales tax";
    const MEASURE = "Totals.Expenditure";
    
    const SCALE = 1;

    const DATA_SET = "https://gist.githubusercontent.com/riteshpakala/83a28fc8bb1aa13c7b08d393082c1863/raw/fdbe6383c9ca18c626d6c425b3a8d647b6e1df29/sinatra_test_set_1.csv";//"https://gist.githubusercontent.com/riteshpakala/c2388ac4745e2d4626a394fc9708c68d/raw/dbbc0c8ecb92e43a5081895d672baeeded33b036/soc-firm-hi-tech.csv";

    
    let quartz = new Quartz(DATA_SET);
    
    let quartz_style = new QuartzStyle(margin,
                                         {width: widthPref, height: heightPref});
    
    //During a redraw the html component is not editable
    //this async function circumvents that. But there
    //should be a proper way to init and allow select to
    //function as expected
    quartz.prepare().then(function() {
    
    quartz.setStyle(quartz_style);
    
    
    quartz.createCanvas("svgbubble"+symbol);

    let maximas = chart.data.map(item => item.value);

    //Better
    quartz.setDomainRange([Math.min(...maximas), Math.max(...maximas)],
      [0, chart.maxX],
      SCALE);

    quartz.createAxis("", "");

    quartz.drawMarker(comparable.value, "actual: "+comparable.dateAsString, "close: $"+comparable.value);
    quartz.drawBubble(chart.data, predictions, meta, "indicator", {min: Math.min(...maximas), max: Math.max(...maximas) });
    //Scatter plot
    // quartz.setDomainRange(chart.labels,
    //                       [0, chart.maxX],
    //                       SCALE);

    // quartz.createAxis("indicators used", "days trained");

    // let maximas = chart.data.map(item => item.value);

    // quartz.drawBubble(chart.data, "indicator", {min: Math.min(...maximas), max: Math.max(...maximas) });
    });
  }

  /**
   * controls redraw requests to fire the quartz d3 bubble chart
   * flow.
   * 
   * @returns empty chart
   */
  generatePrediction = () => {
      
    if (this.props.chart == undefined) {
      return (<div></div>);
    }

    if (!this.state.loaded) {
      this.updateChart();
      this.drawQuartz();

      this.setState({loaded: true});
    }
    return (<div></div>);
  }

  render() {

    return (
    <div id="quartz" className={"quartz" + "svgbubble" + this.props.symbol + " bubbleContainer sinatraMarbleBrown courierMedium"}>
        {this.generatePrediction()}
    </div>
    )
  }
}

export default BubbleGraph;
