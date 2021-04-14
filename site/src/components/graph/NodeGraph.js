import React, {useEffect} from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import './style.css';
import '../../constants/GlobalStyle.css';
import * as d3 from "d3";
import { Minette, MinetteStyle } from "./D3/Minette.js";
import CsvDownload from 'react-json-to-csv';

class NodeGraph extends React.Component {

  constructor(props) {
    super(props);

    this.setup = this.setup.bind(this);
    this.updateChart = this.updateChart.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.drawMinette = this.drawMinette.bind(this);

    this.state = {
      isGainer: true,
      currentPrice: "$000.00",
      currentError: "0%",
      type: "close",
      viewingNode: true,
      daysTrained: 0};
  }

  componentWillMount() {

    this.drawMinette();
  }

  componentDidMount() {
    this.setup(this.props);
    
    document.querySelector("#button" + this.props.symbol).addEventListener( 'touchend', this.onTouchEnd, false );
    document.querySelector("#button" + this.props.symbol).addEventListener( 'mouseup', this.onMouseUp, false );
  }

  componentWillUnmount() {
    document.querySelector("#button" + this.props.symbol).removeEventListener("touchend", this.onTouchEnd, false);
    document.querySelector("#button" + this.props.symbol).removeEventListener("mouseup", this.onMouseUp, false);
  }

  componentWillReceiveProps(nextProps) {
    this.setup(nextProps);

    //this.drawMinette();
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

    this.drawMinette();
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

  drawMinette() {
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

    //Minette
    const DATA_SET = "https://gist.githubusercontent.com/riteshpakala/83a28fc8bb1aa13c7b08d393082c1863/raw/fdbe6383c9ca18c626d6c425b3a8d647b6e1df29/sinatra_test_set_1.csv";//"https://gist.githubusercontent.com/riteshpakala/c2388ac4745e2d4626a394fc9708c68d/raw/dbbc0c8ecb92e43a5081895d672baeeded33b036/soc-firm-hi-tech.csv";

    let minette = new Minette(DATA_SET);

    let minette_style = new MinetteStyle({top: 8, left: 8, bottom: 8, right: 8},
                                        {width: widthPref, height: heightPref});

    let symbol = this.props.symbol;
    let isNode = this.state.viewingNode;

    minette.prepare().then(function() {

    minette.setStyle(minette_style);

    minette.arrangeNodes(nodes);
    minette.createCanvas("svgnode"+symbol);
    if (isNode) {

        minette.drawNodes(meta, highlight, subtitles);
    } else {

        minette.drawMatrix();
    }
    });
  }

  generatePrediction = () => {
      
    if (this.props.prediction == undefined) {
      return (<div></div>);
    }

    this.updateChart();
    this.drawMinette();
    console.log("%%%%%%%%%");
    console.log(this.props.daysPages);
    return (<div className="bestError courierMedium"> training days: { this.props.dataSizes } best error: { (Math.round(parseFloat(this.props.highlight[0].error) * 10000) / 10000) }% </div>);
  }

  render() {

    return (
    <div id="minette" className={"minette" + "svgnode" + this.props.symbol + " nodeContainer"}>
        {this.generatePrediction()}
        <div id={"button" + this.props.symbol} className="basicButton courierSmall stoicBlack">
          <p> { this.state.viewingNode ? "matrix" : "node" } </p>
        </div>
        
    </div>
    )
  }
}

export default NodeGraph;
