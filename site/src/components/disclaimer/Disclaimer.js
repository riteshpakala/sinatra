import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import './style.css';
import '../../constants/GlobalStyle.css';

import ReactMarkdown from 'react-markdown';
const gfm = require('remark-gfm');

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
        <ReactMarkdown remarkPlugins={[gfm]} children={this.props.text} />
      </div>
    )
  }
}

export default Disclaimer;
