import React from 'react';
import ReactDOM from 'react-dom';
import App from './controllers/App';
import './style.css'

ReactDOM.render(
  <div>
    <App />
  </div>,
  document.getElementById('app')
);

module.hot.accept();