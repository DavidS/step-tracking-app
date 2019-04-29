import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Security } from '@okta/okta-react';
import * as serviceWorker from './serviceWorker';
import App from './App';

const oktaConfig = {
  issuer: `${process.env.REACT_APP_OKTA_ORG_URL}`,
  redirect_uri: `${window.location.origin}/implicit/callback`,
  client_id: process.env.REACT_APP_OKTA_CLIENT_ID,
};

ReactDOM.render(
  // eslint-disable-next-line
  <BrowserRouter>
    <Security {...oktaConfig}>
      <App />
    </Security>
  </BrowserRouter>,
  document.getElementById('root'),
);

serviceWorker.register();

if (module.hot) module.hot.accept();
