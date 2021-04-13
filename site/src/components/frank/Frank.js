import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import './style.css';
import '../../constants/GlobalStyle.css';

import NodeGraph from '../graph/NodeGraph';
import Sidebar from '../sidebar/Sidebar';
import Graph from '../graph/Graph';

class Frank extends React.Component {

  constructor(props) {
    super(props);

    this.style = this.style.bind(this);
    this.siphon = this.siphon.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.click = this.click.bind(this);
    this.state = {
        width: 400,
        height: 320,
        viewingGraph: false,
        data:[],
        predictions:[]};
  }

  componentWillMount() {
    this.style();

  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);

    document.querySelector("#buttonFrank").addEventListener( 'touchend', this.onTouchEnd, false );
    document.querySelector("#buttonFrank").addEventListener( 'mouseup', this.onMouseUp, false );
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
    document.querySelector("#buttonFrank").removeEventListener("touchend", this.onTouchEnd, false);
    document.querySelector("#buttonFrank").removeEventListener("mouseup", this.onMouseUp, false);
  }

  componentWillReceiveProps(nextProps) {
    this.style();
  }

  handleResize = () => {
    this.style();
  };

  onMouseUp( event ) {
    this.click();
    event.preventDefault();
  }

  onTouchEnd( event ) {
    this.click();
    event.preventDefault();
  }

  click() {
    this.setState({viewingGraph: !this.state.viewingGraph});
  }

  style() {
    const containerWidth = window.innerWidth / 3 - (16 + 84);
    const containerHeight = window.innerHeight / 3 - 16;

    this.setState({
        width: containerWidth * 0.95, //Same as the vw in the css for theViewContainer
        height: containerHeight * 0.9,
    });
    
    this.siphon(this.props.symbol);
  }

  siphon(symbol) {
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
                this.setState({predictions: json.predictions});
            });

            this.setState({data: jsonAggregratedData});
      });
    }
  }

  createNodes = () => {
    let collection = []
    console.log("hey");
    let counter = 0;
    
    for (let i = 0; i < 3; i++) {
      let children = []

      for (let j = 0; j < 3; j++) {
        console.log(this.state.predictions[counter]);
        children.push(<NodeGraph
          key={"nodeGraph" + counter}
          symbol={"nodeGraph" + counter}
          count={4}
          width={this.state.width}
          height={this.state.height}
          prediction={this.state.predictions[counter]}/>);

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

      <div className={ this.state.viewingGraph ? "graphContainer" : "graphContainer hide" }>

        <Graph
        symbol="msft"
        count={4}
        width={(window.innerWidth * 0.95) - 200}
        height={window.innerHeight * 0.9}/>
      </div>



        <div className="graphsToTheRight relative">

            <Sidebar />

            <div id="buttonFrank" className="frankButton courierSmall stoicBlack">
                <p> { this.state.viewingGraph ? "hide chart" : "show chart" } </p>
            </div>
        </div>

    </div>
    )
  }
}

export default Frank;
