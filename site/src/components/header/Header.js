import React from 'react';
import PropTypes from 'prop-types';
import './style.css';
import '../../constants/GlobalStyle.css';

class Header extends React.Component {
  constructor(props) {
    super(props);

    this.state = {animate: true, todaysDate: ""};
  }

  componentDidMount() {
    let today = new Date();
    let dd = 23;// today.getDate()+(this.props.isReady ? 1 : 0);
    let mm = today.getMonth()+1;
    let yyyy = today.getFullYear();
    let date = yyyy+'-'+mm+'-'+dd;
    if(window.sessionStorage.getItem("firstLoadDone") === null) {
      this.setState({
        animate: true,
        todaysDate: date
      })

      window.sessionStorage.setItem("firstLoadDone", 1);
    } else {
      this.setState({
        animate: false,
        todaysDate: date
      })
    }
  }

  render() {
    return (
    <div>
        <div className="header">
            <div className="headerTitleContainer marginLeftPadding">
                <p className="courierLarge fade-in-copy-2">
                    <a className="sinatraMarbleBrown" target="_blank">{this.props.title}</a>
                </p>
            </div>

            <div className="headerDetailsContainer marginRightPadding">
              <p className="courierMedium fade-in-copy-2">
                  <a className="sinatraOrange" >{this.props.subtitle}</a>
              </p>
            </div>

        </div>
    </div>
    )
  }
}

Header.propTypes ={
    title:PropTypes.string.isRequired,
    subtitle:PropTypes.string.isRequired,
}

Header.defaultProps = {
    title: '* sinatra - work in progress',
    subtitle: 'author: ritesh pakala'
};

export default Header;
