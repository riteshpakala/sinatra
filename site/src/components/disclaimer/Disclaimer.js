import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import './style.css';
import '../../constants/GlobalStyle.css';

class Disclaimer extends React.Component {

  constructor(props) {
    super(props);

    this.style = this.style.bind(this);
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

  }

  render() {

    return (
      <div className="disclaimerContainer sinatraMarbleBrown">
        <dl>
            <dt>Notes:</dt>
            <dd>- refresh the page, if layout is broken.</dd>
            <dd>- predictions take time to load in, there's no indicator yet.</dd>

            <dt>Alpha Overview - 2021-04-12</dt>
            <dd>- A node-link diagram, adjacency matrix, and a line chart will visualize the length of time (in days) certain technical indicators should be compared against. To properly identify a security's trending behavior. For instance, an SMA/EMA are moving averages usually judged from 20, 50, 100 day intervals respectively. What if there was a more specific setting we can discover in between those? Such as 27 today and maybe 36 tomorrow? That's the goal of this project.</dd>
            
            <dt>Features</dt>
            <dd>- Volume Weighted Average, Volatility, Momentum, EMA, SMA.</dd>
            <dd>- Node link diagram logic</dd>
            <dd>- Scatter plot logic to display all iterations and their relevancy to the tested stock quote</dd>
            <dd>- Line chart functionality and pseudo interactive</dd>
            <dd>- Prediction infrastructure setup</dd>

            <dt>Upcoming Milestones</dt>
            <dd>- Update node-link diagram to prediction results</dd>
            <dd>- Update adjacency matrix to prediction results</dd>
            <dd>- Refine legends for node link and adjacency matrices</dd>
            <dd>- Implement, MacD, RSI, Stochastics</dd>
            <dd>- Design should be responsive</dd>
            <dd>- Custom tickers</dd>

            <dt>Roadblocks</dt>
            <dd>- none so far</dd>
        </dl>
      </div>
    )
  }
}

export default Disclaimer;
