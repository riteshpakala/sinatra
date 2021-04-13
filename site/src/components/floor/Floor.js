import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import './style.css';
import '../../constants/GlobalStyle.css';

import Graph from '../graph/Graph';

class Floor extends React.Component {

  constructor(props) {
    super(props);

    this.style = this.style.bind(this);
    this.state = {
      width: 400,
      height: 320
    };
  }

  componentWillMount() {
    this.style();

  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  handleResize = () => {
    this.style();
  };

  style() {
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;

    this.setState({
        width: window.innerWidth * 0.95, //Same as the vw in the css for theViewContainer
        height: window.innerHeight * 0.9,
    });
  }

  render() {

    return (
    <div className="theViewContainer">
      <div className="graphsToTheLeft">
        <Graph
          symbol="aapl"
          count={4}
          width={this.state.width}
          height={this.state.height}/>
        <Graph
          symbol="msft"
          count={4}
          width={this.state.width}
          height={this.state.height}/>
        <Graph
          symbol="amzn"
          count={4}
          width={this.state.width}
          height={this.state.height}/>
      </div>

      <div className="graphsToTheRight">

        <Graph
          symbol="tsla"
          count={4}
          width={this.state.width}
          height={this.state.height}/>
        <Graph
          symbol="pfe"
          count={4}
          width={this.state.width}
          height={this.state.height}/>
        <Graph
          symbol="fb"
          count={4}
          width={this.state.width}
          height={this.state.height}/>
      </div>

      <div className="graphsToTheRight">

        <Graph
          symbol="mrna"
          count={4}
          width={this.state.width}
          height={this.state.height}/>
        <Graph
          symbol="nvda"
          count={4}
          width={this.state.width}
          height={this.state.height}/>
        <Graph
          symbol="amd"
          count={4}
          width={this.state.width}
          height={this.state.height}/>
      </div>

      </div>
    )
  }
}

export default Floor;
