import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  IconButton,
  Menu,
  MenuItem,
  ListItemText,
} from '@material-ui/core';
import { AccountCircle } from '@material-ui/icons';
import { withAuth } from '@okta/okta-react';

class LoginButton extends Component {
  static propTypes = {
    auth: PropTypes.shape({
      getUser: PropTypes.func.isRequired,
      getAccessToken: PropTypes.func.isRequired,
    }).isRequired,
  };

  state = {
    authenticated: null,
    user: null,
    menuAnchorEl: null,
  };

  componentDidMount() {
    this.checkAuthentication();
  }

  componentDidUpdate() {
    this.checkAuthentication();
  }

  handleMenuOpen = event =>
    this.setState({ menuAnchorEl: event.currentTarget });

  handleMenuClose = () => this.setState({ menuAnchorEl: null });

  async checkAuthentication() {
    const {
      auth: { isAuthenticated, getUser },
    } = this.props;
    const { authenticated } = this.state;
    const isUserAuthenticated = await isAuthenticated();
    if (isUserAuthenticated !== authenticated) {
      const user = await getUser();

      this.setState({
        authenticated,
        user,
      });
    }
  }

  render() {
    const { authenticated, user, menuAnchorEl } = this.state;
    const {
      auth: { login },
    } = this.props;

    if (authenticated == null) return null;
    if (!authenticated)
      return (
        <Button
          color="inherit"
          onClick={() => {
            login();
          }}
        >
          {'Login'}
        </Button>
      );

    const menuPosition = {
      vertical: 'top',
      horizontal: 'right',
    };

    return (
      <div>
        <IconButton onClick={this.handleMenuOpen} color="inherit">
          <AccountCircle />
        </IconButton>
        <Menu
          anchorEl={menuAnchorEl}
          anchorOrigin={menuPosition}
          transformOrigin={menuPosition}
          open={!!menuAnchorEl}
          onClose={this.handleMenuClose}
        >
          <MenuItem
            onClick={() => {
              const {
                auth: { logout },
              } = this.props;
              this.handleMenuClose();
              logout();
            }}
          >
            <ListItemText primary="Logout" secondary={user && user.name} />
          </MenuItem>
        </Menu>
      </div>
    );
  }
}

export default withAuth(LoginButton);
