import React, {useEffect} from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import './style.css';
import '../../constants/GlobalStyle.css';
import * as d3 from "d3";
import { Quartz, QuartzStyle } from "./D3/Quartz.js";
import CsvDownload from 'react-json-to-csv';

class NodeGraph extends React.Component {

  constructor(props) {
    super(props);

    this.setup = this.setup.bind(this);
    this.updateChart = this.updateChart.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    // this.onMouseOver = this.onMouseOver.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.drawQuartz = this.drawQuartz.bind(this);

    this.state = {
      isGainer: true,
      currentPrice: "$000.00",
      currentError: "0%",
      type: "close",
      viewingNode: true,
      daysTrained: 0,
      loaded: false,
      isHovering: false};
  }

  componentWillMount() {

    this.drawQuartz();
  }

  componentDidMount() {
    this.setup(this.props);
    
    // document.querySelector("#button" + this.props.symbol).addEventListener( 'touchend', this.onTouchEnd, false );
    // document.querySelector(".quartz" + "svgnode" + this.props.symbol).addEventListener( 'mouseover', this.onMouseOver, false );
  }

  componentWillUnmount() {
    // document.querySelector("#button" + this.props.symbol).removeEventListener("touchend", this.onTouchEnd, false);
    // document.querySelector("#button" + this.props.symbol).removeEventListener("mouseup", this.onMouseUp, false);
    // document.querySelector(".quartz" + "svgnode" + this.props.symbol).removeEventListener( 'mouseover', this.onMouseOver, false );
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
    this.updateChart();

    this.drawQuartz();
  }

  setup(nextProps) {

    // this.updateChart();
  }

  componentDidUpdate() {

    // this.updateChart();
  }

  updateChart() {
    d3.select("#svgnode"+this.props.symbol).remove();
    d3.select("#svgnodeprediction"+this.props.symbol).remove();
  }

  drawQuartz() {
    let nodes = this.props.nodes;
    let meta = this.props.meta;
    let highlight = this.props.highlight;
    let subtitles = this.props.daysPages;

    let margin = {
        top: 8,
        right: 8,
        bottom: 8,
        left: 8,
        };
  
    let widthPref = this.props.width - margin.left - margin.right;
    let heightPref = this.props.height - margin.top - margin.bottom;

    //Quartz
    //This data_Set link is for testing.
    //otherwise as you can see, the `arrangeNodes(...)` function below 
    //is taking data we are inserting from the aggregates we fetched
    //earlier
    const DATA_SET = "https://gist.githubusercontent.com/riteshpakala/83a28fc8bb1aa13c7b08d393082c1863/raw/fdbe6383c9ca18c626d6c425b3a8d647b6e1df29/sinatra_test_set_1.csv";//"https://gist.githubusercontent.com/riteshpakala/c2388ac4745e2d4626a394fc9708c68d/raw/dbbc0c8ecb92e43a5081895d672baeeded33b036/soc-firm-hi-tech.csv";

    let quartz = new Quartz(DATA_SET);

    let quartz_style = new QuartzStyle({top: 8, left: 8, bottom: 8, right: 8},
                                        {width: widthPref, height: heightPref});

    let symbol = this.props.symbol;
    let isNode = this.state.viewingNode;

    quartz.prepare().then(function() {

    quartz.setStyle(quartz_style);

    //remove `nodes` to make it ...arrangeNodes(); to demo
    //the DATA_SET for customizing node graph styling more easily.
    quartz.arrangeNodes(nodes);
    quartz.createCanvas("svgnode"+symbol);
    if (isNode) {

        quartz.drawNodes(meta, highlight, subtitles);
    } else {

        quartz.drawMatrix();
    }
    });
  }

  generatePrediction = () => {
      
    if (this.props.prediction == undefined) {
      return (<div></div>);
    }

    if (!this.state.loaded) {

      this.updateChart();
      this.drawQuartz();
  
      this.setState({loaded: true});
    }
    return (<div className="bestError courierSmall"> <p className="tdays sinatraMarbleBrown">training days: { this.props.dataSizes }</p> <p className="error">best error: { (Math.round(parseFloat(this.props.highlight[0].error) * 10000) / 10000) }%</p> </div>);
  }

  render() {

    return (
    <div id="quartz" className={"quartz" + "svgnode" + this.props.symbol + " nodeContainer"}>
        {this.generatePrediction()}
    </div>
    )
  }
}

export default NodeGraph;
