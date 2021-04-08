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
      </div>
    )
  }
}
export default App;