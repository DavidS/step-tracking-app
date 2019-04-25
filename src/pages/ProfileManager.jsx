import React, { Component, Fragment } from 'react';
import { withAuth } from '@okta/okta-react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  Button,
  withStyles,
  TextField,
  Typography,
  MenuItem,
} from '@material-ui/core';
import { Save as SaveIcon } from '@material-ui/icons';
import { compose } from 'recompose';

const API = process.env.REACT_APP_API || 'http://localhost:3003';

const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200,
  },
  dense: {
    marginTop: 19,
  },
  menu: {
    width: 200,
  },
  fab: {
    position: 'absolute',
    bottom: 3 * theme.spacing.unit,
    right: 3 * theme.spacing.unit,
    [theme.breakpoints.down('xs')]: {
      bottom: 2 * theme.spacing.unit,
      right: 2 * theme.spacing.unit,
    },
  },
});
// BFS, LON, TSR, PDX, SEA, SYD, SIN, REMOTE EMEA, REMOTE APJ, REMOTE AMER
const regions = [
  {
    value: '',
    label: 'None',
  },
  {
    value: 'BFS',
    label: 'Belfast (BFS)',
  },
  {
    value: 'LON',
    label: 'London (LON)',
  },
  {
    value: 'TSR',
    label: 'Timisoara (TSR)',
  },
  {
    value: 'PDX',
    label: 'Portland (PDX)',
  },
  {
    value: 'SEA',
    label: 'Seattle (SEA)',
  },
  {
    value: 'SYD',
    label: 'Sydney (SYD)',
  },
  {
    value: 'SIN',
    label: 'Singapore (SIN)',
  },
  {
    value: 'REMOTE EMEA',
    label: 'Remote EMEA',
  },
  {
    value: 'REMOTE APJ',
    label: 'Remote APJ',
  },
  {
    value: 'REMOTE AMER',
    label: 'Remote AMER',
  },
];

class ProfileManager extends Component {
  static propTypes = {
    // eslint-disable-next-line
    classes: PropTypes.object.isRequired,
    auth: PropTypes.shape({
      getUser: PropTypes.func.isRequired,
      getAccessToken: PropTypes.func.isRequired,
    }).isRequired,
  };

  state = {
    data: {},
  };

  async componentDidMount() {
    const {
      auth: { getUser },
    } = this.props;
    this.user = await getUser();
    this.getData();
  }

  async getData() {
    const { sub } = this.user;
    this.data = await this.fetch('get', `/profiles/${sub}`);
    this.setState({
      data: this.data || {
        userId: null,
        charityName: null,
        totalDonations: null,
        fundraisingLink: null,
        region: null,
      },
    });
  }

  async saveData() {
    const { data } = this.state;
    const { userId } = data;
    if (userId) {
      await this.fetch('put', `/profiles/${userId}`, data);
    } else {
      const { name, sub } = this.user;
      await this.fetch('post', '/profiles', {
        ...data,
        name,
        userId: sub,
      });
    }
  }

  handleChange(name, event) {
    const { data } = this.state;
    this.setState({
      data: {
        ...data,
        [name]: event.target.value,
      },
    });
  }

  async fetch(method, endpoint, body) {
    const {
      auth: { getAccessToken },
    } = this.props;
    const token = await getAccessToken();
    try {
      const response = await fetch(`${API}${endpoint}`, {
        method,
        body: body && JSON.stringify(body),
        headers: {
          'content-type': 'application/json',
          accept: 'application/json',
          authorization: `Bearer ${token}`,
        },
      });
      return await response.json();
    } catch (error) {
      console.error(error);
      return { error };
    }
  }

  render() {
    const { classes } = this.props;
    const {
      data: { totalDonations, charityName, fundraisingLink, region },
    } = this.state;

    return (
      <Fragment>
        <Typography variant="display1">
          {'Hows the fundraising going?'}
        </Typography>
        <form className={classes.container} noValidate autoComplete="off">
          <TextField
            id="donations"
            label="Total Donations so far"
            type="number"
            value={totalDonations || ''}
            onChange={event => this.handleChange('totalDonations', event)}
            helperText="How much have you raised?  Keep this up-to-date (there is a leader board for it)."
            margin="normal"
            fullWidth
          />
          <TextField
            id="charity"
            label="Charity Name"
            value={charityName || ''}
            onChange={event => this.handleChange('charityName', event)}
            helperText="Who is benefiting from your hard work?"
            margin="normal"
            fullWidth
          />
          <TextField
            id="link"
            label="Fundraising Link"
            value={fundraisingLink || ''}
            onChange={event => this.handleChange('fundraisingLink', event)}
            helperText="This might be your JustGiving page.  We'll display this link beside your name on the leader boards."
            margin="normal"
            fullWidth
          />
          <TextField
            id="region"
            select
            label="Region"
            value={region || ''}
            onChange={event => this.handleChange('region', event)}
            helperText="Which region are you in?"
            margin="normal"
            fullWidth
          >
            {regions.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </form>
        <Button
          variant="fab"
          color="secondary"
          aria-label="add"
          className={classes.fab}
          onClick={() => {
            this.saveData();
          }}
        >
          <SaveIcon />
        </Button>
      </Fragment>
    );
  }
}

export default compose(
  withAuth,
  withRouter,
  withStyles(styles),
)(ProfileManager);
