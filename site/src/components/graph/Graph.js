import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import './style.css';
import '../../constants/GlobalStyle.css';

import GraphEntity from './GraphEntity';

class Graph extends React.Component {

  constructor(props) {
    super(props);

    this.style = this.style.bind(this);
    this.siphon = this.siphon.bind(this);
    this.state = {
      data:[],
      dataSymbols: [],
      count: 0,
      siphonSymbols: []};
  }

  componentWillMount() {

  }

  componentDidMount() {
    this.style();
  }

  componentWillUnmount() {
  }

  componentWillReceiveProps(nextProps) {
    this.style();
  }

  style() {
    let symbols = [this.props.symbol];

    let vw = this.props.width - 16;// / 3 - 16;
    let vh = this.props.height - 16;// / 3 - 16;

    document.documentElement.style.setProperty('--vw', `${vw}px`);
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    document.querySelector(".graphContainer").addEventListener( 'mouseup', this.onMouseUp, false );

    if (this.state.data.length <= 0) {
      console.log("fetching ticker data");

      for (const symbol in symbols) {
        this.siphon(symbols[symbol]);
      }
    }

    this.setState({
         siphonSymbols: symbols,
          width: vw,
           height: vh });
  }

  siphon(symbol) {
    if (symbol === "" || !symbol) {
    }else{
      fetch('/api/david/v0.00.00/stock/history/'+symbol).then(results => {
          return results;
      }).then(data => {
          return data.json();
      }).then(json => {
          let newData = this.state.data;
          newData.push(json);
          let newSymbols = this.state.dataSymbols;
          newSymbols.push(symbol);
          this.setState({data: newData, count: newData.length, dataSymbols: newSymbols});
      });
    }
  }

  render() {
      if(this.state.data.length > 0) {

        return (<div className="graphContainer">
          <GraphEntity
            data={this.state.data[0]}
            symbol={this.state.dataSymbols[0]}
            width={this.state.width}
            height={this.state.height}/>
          </div>)

      } else {
        return (<div className="graphContainer"> </div>);
      }
  }
}

export default Graph;
