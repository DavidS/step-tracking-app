import React, { Component, Fragment } from 'react';

import {
  Paper,
  withStyles,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  Fade,
  CircularProgress,
} from '@material-ui/core';

import { Link as LinkIcon } from '@material-ui/icons';

import { compose } from 'recompose';
import { withAuth } from '@okta/okta-react/dist/index';
import PropTypes from 'prop-types';
import log from '../utils/log';

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto',
  },
  table: {
    minWidth: 700,
  },
});

const API = process.env.REACT_APP_API || 'http://localhost:3003';

class DonationLeaders extends Component {
  static propTypes = {
    // eslint-disable-next-line
    classes: PropTypes.object.isRequired,
    auth: PropTypes.shape({
      getUser: PropTypes.func.isRequired,
      getAccessToken: PropTypes.func.isRequired,
    }).isRequired,
  };

  state = {
    loading: true,
    dashData: [],
  };

  componentDidMount() {
    this.getData();
  }

  async getData() {
    const dashData = await this.fetch('get', '/donationLeaders');
    this.setState({ loading: false, dashData });
  }

  async fetch(method, endpoint, body) {
    const {
      auth: { getAccessToken },
    } = this.props;
    try {
      const accessToken = await getAccessToken();
      const stringifiedBody = body && JSON.stringify(body);
      const response = await fetch(`${API}${endpoint}`, {
        method,
        body: stringifiedBody,
        headers: {
          'content-type': 'application/json',
          accept: 'application/json',
          authorization: `Bearer ${accessToken}`,
        },
      });
      return await response.json();
    } catch (error) {
      log('ERROR:', error);
      return { error };
    }
  }

  render() {
    const { classes } = this.props;
    const { dashData, loading } = this.state;
    let content = null;
    if (loading) {
      content = (
        <div className={classes.loading}>
          <Fade
            in={loading}
            style={{
              transitionDelay: loading ? '500ms' : '0ms',
            }}
            unmountOnExit
          >
            <CircularProgress />
          </Fade>
        </div>
      );
    } else if (dashData.length > 0) {
      content = (
        <Paper className={classes.root}>
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Charity</TableCell>
                <TableCell>Fundraising Link</TableCell>
                <TableCell>Total Donations</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dashData.map(row => (
                <TableRow key={row.rank}>
                  <TableCell align="right">{row.rank}</TableCell>
                  <TableCell align="right">{row.name}</TableCell>
                  <TableCell align="right">{row.charity_name}</TableCell>
                  <TableCell align="right"><a rel="noopener noreferrer" target="_blank" href={row.fundraising_link}><LinkIcon/></a></TableCell>
                  <TableCell align="right">{row.total_donations}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      );
    } else {
      content = (
        <Typography variant="subheading">No data to display</Typography>
      );
    }

    return (
      <Fragment>
        <Typography variant="display1">Donation Leaders</Typography>
        {content}
      </Fragment>
    );
  }
}

export default compose(
  withAuth,
  withStyles(styles),
)(DonationLeaders);
