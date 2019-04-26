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

import FlipMove from 'react-flip-move';
import { compose } from 'recompose';
import { withAuth } from '@okta/okta-react/dist/index';
import PropTypes from 'prop-types';
import log from '../utils/log';
import sockets from '../utils/socket';

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
    const { io } = sockets;
    io.on('fetchNewData', () => {
      console.log('Getting New Data');
      this.getData();
    });
  }

  componentWillUnmount() {
    const { io } = sockets;
    io.removeListener('fetchNewData');
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

    return (
      <Fragment>
        <Typography variant="display1">Donation Leaders</Typography>
        {loading && (
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
        )}
        {dashData.length > 0 ? (
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
                <FlipMove
                  duration={500}
                  delay={10}
                  easing="cubic-bezier(0.25, 0.5, 0.75, 1)"
                  staggerDurationBy={30}
                  staggerDelayBy={10}
                  onStart={(elem, node) => {
                    // eslint-disable-next-line
                    node.style.backgroundColor = '#F7EDDE';
                  }}
                  onFinish={(elem, node) => {
                    // eslint-disable-next-line
                    node.style.backgroundColor = 'white';
                  }}
                  enterAnimation={false}
                  leaveAnimation={false}
                  maintainContainerHeight
                  typeName={null}
                >
                  {dashData.map(row => (
                    <TableRow key={row.name} id={row.name}>
                      <TableCell align="right">{row.rank}</TableCell>
                      <TableCell align="right">{row.name}</TableCell>
                      <TableCell align="right">{row.charity_name}</TableCell>
                      <TableCell align="right">
                        <a
                          rel="noopener noreferrer"
                          target="_blank"
                          href={row.fundraising_link}
                        >
                          <LinkIcon />
                        </a>
                      </TableCell>
                      <TableCell align="right">{row.total_donations}</TableCell>
                    </TableRow>
                  ))}
                </FlipMove>
              </TableBody>
            </Table>
          </Paper>
        ) : (
          !loading && (
            <Typography variant="subheading"> No data to display </Typography>
          )
        )}
      </Fragment>
    );
  }
}

export default compose(
  withAuth,
  withStyles(styles),
)(DonationLeaders);
