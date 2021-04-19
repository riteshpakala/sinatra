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
            <dd>- I've built a processing flow of large amounts of financial security data. This flow is then funneled into a Support Vector Machine, where we will draw regressional trends of a security to forecast a projected price. In this presentation, we will back-test to a previously achieved price to identify this algorithm's accuracy. The price we are predicting is always the most recent price available for the security in question. The theory we will prove is discovering the specific days each indicator should compute in identifying the correct prediction. Then we will identify, if 2 week trading strategeties can be defined concretely. With the usage of the certain technical indicators.</dd>
            
            <dt>Features</dt>
            <dd>- Volume Weighted Average, Volatility, Momentum, MacD, EMA, SMA, Stochastics, Change, Volume Change.</dd>
            <dd>- Node link diagram to resemble best prediction per iteration</dd>
            <dd>- Scatter plot for each prediction compared to the actual price</dd>
            <dd>- Line chart to show current security price and history</dd>

            <dt>Upcoming Milestones</dt>
            <dd>- Refine legends for node link and adjacency matrices</dd>
            <dd>- Implement, RSI</dd>
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
