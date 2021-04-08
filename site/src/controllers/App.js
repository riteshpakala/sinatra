import React from 'react';
import './style.css'
import Header from '../components/header/Header';
import Model from '../components/model/Model';
import TheView from '../components/theView/theView';

export const CLICK_CONTROL = {
    TOUCHSTART: "touchstart",
    TOUCHEND: "touchend",
    MOUSEUP: "mouseup",
    MOUSEDOWN: "mousedown",
    WHEEL: "wheel"
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.clickController = this.clickController.bind(this);
    this.state = {playing: false, volume: 0.75};
  }

  componentDidMount() {
  }

  clickController(e) {

    var isCanvas = e.target.localName == "canvas";

    if (e.type == CLICK_CONTROL.MOUSEUP) {
        this.setState({playing: (this.state.playing && !isCanvas) ? false : true, volume: 0.75});
    } else if (e.type == CLICK_CONTROL.TOUCHEND) {
        this.setState({playing: (this.state.playing && !isCanvas) ? false : true, volume: 0.75});
    }
  }

  render() {
    const shouldShowPrediction = this.state.showPrediction;

    return (
      <div className="appContainer">
        <div className="appMedia">
          {<Header />}
          {<Model clickController={this.clickController} />}
        </div>

        { <TheView size={4} widthRatio={0.95} /> }

        <div className="projectSummary courierMedium">
          Project Summary:

          <p>
            A market emits hints through features and indicators, which I will refer to as the tones. 
            Sinatra will show relationships between technical indicators and their weighted performance similarities 
            when used with a Support Vector Machine.
          </p>
          
          <p>
            The Support Vector Machine will provide a prediction for the next valid trading day. While generating 
            multiple visuals showcasing influence and impact: momentum, velocity, volume, RSI, stochastics, and other indicators.
          </p>

          <p> 
            3 expectations:
          </p>
          
          <p>
            Goal 1: Ability to run back-testing simulations and generate prediction results for past dates of a selected security. Generating a force-directed node link diagram graphing
            the indicator relationship outcome.
          </p>
          <p>
            Goal 2: Interact and observe connections and repeated occurence of indicators that influenced low errors in predictions with ease. Adjacency Matrices generate to act as a mapping
            for potential patterns.
          </p>
          <p>
            Goal 3: Developing trading strategies deducting patterns from day range variations chosen in each iteration in indicator combinations. For instance, a possible question one can pose:
            "did SMA 20 or did SMA 24 work better with Stochastic K ranging from 14 days or from 16 days?""
          </p>
        </div>
      </div>
    )
  }
}
export default App;