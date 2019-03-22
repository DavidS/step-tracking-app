import React, { Fragment } from 'react';
import { Route } from 'react-router-dom';
import { SecureRoute, ImplicitCallback } from '@okta/okta-react';
import { CssBaseline, withStyles } from '@material-ui/core';
import PropTypes from 'prop-types';

import AppHeader from './components/AppHeader';
import StepLeaders from './pages/StepLeaders';
import DonationLeaders from './pages/DonationLeaders';
import StepsManager from './pages/StepsManager';
import ProfileManager from './pages/ProfileManager';

const styles = theme => ({
  main: {
    padding: 3 * theme.spacing.unit,
    [theme.breakpoints.down('xs')]: {
      padding: 2 * theme.spacing.unit,
    },
  },
});

const App = ({ classes }) => (
  <Fragment>
    <CssBaseline />
    <AppHeader />
    <main className={classes.main}>
      <Route exact path="/" component={StepLeaders} />
      <Route path="/donationLeaders" component={DonationLeaders} />
      <SecureRoute path="/steps" component={StepsManager} />
      <SecureRoute path="/profile" component={ProfileManager}/>
      <Route path="/implicit/callback" component={ImplicitCallback} />
    </main>
  </Fragment>
);

App.propTypes = {
  // eslint-disable-next-line
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(App);
