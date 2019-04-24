import React from 'react';
import { Link } from 'react-router-dom';
import {
  AppBar,
  Button,
  withStyles,
  Toolbar,
  Typography,
} from '@material-ui/core';
import { withAuth } from '@okta/okta-react';
import { compose } from 'recompose';

import logo from '../puppet-logo.svg';
import LoginButton from './LoginButton';

const styles = {
  flex: {
    flex: 1,
  },
};

const API = process.env.REACT_APP_API || 'http://localhost:3003';
const deleteDatabase = Boolean(process.env.REACT_APP_DELETE_DB);

const AppHeader = ({ classes, auth: { getAccessToken } }) => (
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
      {deleteDatabase && (
        <Button
          color="inherit"
          onClick={async () => {
            const accessToken = await getAccessToken();
            fetch(`${API}/DeleteTheFreakingDatabaseNOW`, {
              method: 'get',
              headers: {
                'content-type': 'application/json',
                accept: 'application/json',
                authorization: `Bearer ${accessToken}`,
              },
            });
          }}
        >
          Seek And Destrooooooy!
        </Button>
      )}
      <div className={classes.flex} />
      <LoginButton />
    </Toolbar>
  </AppBar>
);

export default compose(
  withAuth,
  withStyles(styles),
)(AppHeader);
