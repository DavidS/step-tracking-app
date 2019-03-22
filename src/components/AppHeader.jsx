import React from 'react';
import { Link } from 'react-router-dom';
import {
  AppBar,
  Button,
  withStyles,
  Toolbar,
  Typography,
} from '@material-ui/core';

import logo from '../puppet-logo.svg';
import LoginButton from './LoginButton';

const styles = {
  flex: {
    flex: 1,
  },
};

const AppHeader = ({ classes }) => (
  <AppBar position="static" style={{ backgroundColor: '#222222' }}>
    <Toolbar>
      <img
        src={logo}
        alt="logo"
        height="35px"
        style={{ paddingRight: '15px' }}
      />
      <Typography
        variant="title"
        color="inherit"
        style={{ paddingRight: '15px' }}
      >
        May for Mental Health
      </Typography>
      <Button color="inherit" component={Link} to="/">
        Step Leaders
      </Button>
      <Button color="inherit" component={Link} to="/donationLeaders">
        Donation Leaders
      </Button>
      <Button color="inherit" component={Link} to="/steps">
        My Steps
      </Button>
      <Button color="inherit" component={Link} to="/profile">
        My Fundraising
      </Button>
      <div className={classes.flex} />
      <LoginButton />
    </Toolbar>
  </AppBar>
);

export default withStyles(styles)(AppHeader);
