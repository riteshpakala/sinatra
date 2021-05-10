import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import './style.css';
import '../../constants/GlobalStyle.css';

import NodeGraph from '../graph/NodeGraph';
import Sidebar from '../sidebar/Sidebar';
import Disclaimer from '../disclaimer/Disclaimer';
import Graph from '../graph/Graph';
import BubbleGraph from '../graph/BubbleGraph';

class Frank extends React.Component {

  constructor(props) {
    super(props);

    this.style = this.style.bind(this);
    this.siphon = this.siphon.bind(this);
    this.onTouchEndGraph = this.onTouchEndGraph.bind(this);
    this.onMouseUpGraph = this.onMouseUpGraph.bind(this);
    this.onTouchEndChart = this.onTouchEndChart.bind(this);
    this.onMouseUpChart = this.onMouseUpChart.bind(this);
    this.onTouchEndOverview = this.onTouchEndOverview.bind(this);
    this.onMouseUpOverview = this.onMouseUpOverview.bind(this);
    this.state = {
        width: 400,
        height: 320,
        viewingGraph: true,
        viewingChart: true,
        viewingOverview: true,
        viewingTooltip: true,
        data:[],
        predictions:[],
        nodes:[],
        highlight:[],
        dataSizes:[],
        daysPages:[],
        overview: "",
        chart: undefined,
        errors: undefined,
        meta: undefined};
  }

  componentWillMount() {
    this.style();

    fetch("https://raw.githubusercontent.com/riteshpakala/sinatra/main/README.md")
    .then((response) => {
      console.log(response); 
      return response.text()
    })
    .then((text) => {
      this.setState({ overview: text });
      console.log(text);
    })

    //DEV:
    //this.siphon(this.props.symbol);
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);

    document.querySelector("#buttonFrank1").addEventListener( 'touchend', this.onTouchEndGraph, false );
    document.querySelector("#buttonFrank1").addEventListener( 'mouseup', this.onMouseUpGraph, false );
    document.querySelector("#buttonFrank2").addEventListener( 'touchend', this.onTouchEndChart, false );
    document.querySelector("#buttonFrank2").addEventListener( 'mouseup', this.onMouseUpChart, false );
    document.querySelector("#buttonFrank3").addEventListener( 'touchend', this.onTouchEndOverview, false );
    document.querySelector("#buttonFrank3").addEventListener( 'mouseup', this.onMouseUpOverview, false );
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);

    document.querySelector("#buttonFrank1").removeEventListener("touchend", this.onTouchEndGraph, false);
    document.querySelector("#buttonFrank1").removeEventListener("mouseup", this.onMouseUpGraph, false);
    document.querySelector("#buttonFrank2").removeEventListener("touchend", this.onTouchEndChart, false);
    document.querySelector("#buttonFrank2").removeEventListener("mouseup", this.onMouseUpChart, false);
    document.querySelector("#buttonFrank3").removeEventListener("touchend", this.onTouchEndOverview, false);
    document.querySelector("#buttonFrank3").removeEventListener("mouseup", this.onMouseUpOverview, false);
  }

  componentWillReceiveProps(nextProps) {
    this.style();
  }

  handleResize = () => {
    this.style();
  };

  onMouseUpGraph( event ) {
    this.setState({viewingGraph: !this.state.viewingGraph});
    event.preventDefault();
  }

  onTouchEndGraph( event ) {
    this.setState({viewingGraph: !this.state.viewingGraph});
    event.preventDefault();
  }

  onMouseUpChart( event ) {
    this.setState({viewingChart: !this.state.viewingChart});
    event.preventDefault();
  }

  onTouchEndChart( event ) {
    this.setState({viewingChart: !this.state.viewingChart});
    event.preventDefault();
  }

  onMouseUpOverview( event ) {
    this.setState({viewingOverview: !this.state.viewingOverview});
    event.preventDefault();
  }

  onTouchEndOverview( event ) {
    this.setState({viewingOverview: !this.state.viewingOverview});
    event.preventDefault();
  }

  style() {
    const containerWidth = window.innerWidth / 3 - 24;
    const containerHeight = window.innerHeight / 3 - 16;

    this.setState({
        width: containerWidth * 0.95, //Same as the vw in the css for theViewContainer
        height: containerHeight * 0.9,
    });
  }

  siphon(symbol) {
    console.log("Oh New York, New York..");
    if (symbol === "" || !symbol) {
    }else{
      fetch('/api/david/v0.00.00/stock/history/'+symbol).then(results => {
             return results;
      }).then(data => {
            return data.json();
      }).then(json => {

            let jsonAggregratedData = [];
            let items = json.chart.result[0];
            let size = items.indicators.quote[0].close.length;
            for (let i = 0; i < size; i++) {

                let high = items.indicators.quote[0].high[i];
                let quote = items.indicators.quote[0].close[i];
                let open = items.indicators.quote[0].open[i];
                let volume = items.indicators.quote[0].volume[i];
                let low = items.indicators.quote[0].low[i];
                let timestamp = parseInt(items.timestamp[i]);

                let date = new Date(timestamp * 1000);
                var formattedDate = date.getUTCFullYear() + '-' + (date.getUTCMonth() + 1)+ '-' + date.getDate();

                let jsonData = {};

                jsonData["dateEpoch"] = parseFloat(timestamp);
                jsonData["dateAsString"] = formattedDate;
                jsonData["value"] = parseFloat(quote);
                jsonData["high"] = parseFloat(high);
                jsonData["open"] = parseFloat(open);
                jsonData["low"] = parseFloat(low);
                jsonData["volume"] = parseFloat(volume);
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
                jsonAggregratedData.pop();
            }

            // console.log(jsonAggregratedData);
            fetch('/api/david/v0.00.00/stock/think', {
                    method: 'POST',
                    headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(jsonAggregratedData)
                    } ).then(results => {
                return results;
            }).then(data => {
                return data.json();
            }).then(json => {
                this.setState({predictions: json.result,
                   errors: json.errors,
                   nodes: json.graph.nodes, 
                   dataSizes: json.dataSizes,
                   daysPages: json.daysPages,
                   meta: json.graph.meta,
                   highlight: json.errors.bestPaths,
                   chart: json.chart});
            });

            this.setState({data: jsonAggregratedData});
      });
    }
  }

  createChart = () => {
    if (this.state.chart == undefined || this.state.predictions == undefined) {
      return (<div></div>);
    }

    
    return (<div className={ this.state.viewingGraph ? "chartContainer" : "chartContainer hide" }>
      <BubbleGraph
      key={"bubbleGraph"}
      symbol={"bubbleGraph"}
      chart={this.state.chart}
      width={(window.innerWidth * 0.6)}
      height={window.innerHeight * 0.6}
      meta={this.state.meta}
      comparable={this.state.predictions}/>
    </div>);
  }

  createNodes = () => {
    let collection = []

    let counter = 0;
    
    for (let i = 0; i < 3; i++) {
      let children = []

      for (let j = 0; j < 3; j++) {

        children.push(<NodeGraph
          key={"nodeGraph" + counter}
          symbol={"nodeGraph" + counter}
          count={4}
          width={this.state.width}
          height={this.state.height}
          prediction={this.state.predictions[counter]}
          nodes={this.state.nodes[counter]}
          errors={this.state.errors}
          highlight={this.state.highlight[counter]}
          meta={this.state.meta}
          dataSizes={this.state.dataSizes[counter]}
          daysPages={this.state.daysPages[counter]}/>);

        counter += 1;
      }

      collection.push(<div key={"franklyNode" + i} className="graphsToTheLeft">{children}</div>)
    }
    return collection
  }

  render() {

    return (
    <div className="frankContainer">

        {this.createNodes()}

        <div className={ this.state.viewingChart ? "frankGraphContainer" : "frankGraphContainer hide" }>

          <Graph
          symbol={this.props.symbol}
          count={4}
          width={(window.innerWidth * 0.36)}
          height={window.innerHeight * 0.24}/>
        </div>



        <div className="controlBarContainer relative">
          <div className="controlBarButtons">

            <div id="buttonFrank2" className="frankButton courierSmall stoicBlack floatRight sinatraMarbleBrownBG">
                <p> { this.state.viewingChart ? "hide chart" : "chart" } </p>
            </div>

            <div id="buttonFrank1" className="frankButton courierSmall stoicBlack floatRight sinatraMarbleBrownBG">
                <p> { this.state.viewingGraph ? "hide plot" : "analyze" } </p>
            </div>
            <div id="buttonFrank3" className="frankButton courierSmall stoicBlack floatLeft sinatraOrangeBG">
                <p> { this.state.viewingOverview ? "hide" : "overview" } </p>
            </div>
          </div>
        </div>

        <div className={ this.state.viewingOverview ? "disclaimerTooltip" : "disclaimerTooltip hide" }>

          <Disclaimer text="this is a tooltip"/>
        </div> 

        <div className={ this.state.viewingOverview ? "disclaimerFrank" : "disclaimerFrank hide" }>

          <Disclaimer text={this.state.overview} />
        </div>

        {this.createChart()}

    </div>
    )
  }
}

export default Frank;
