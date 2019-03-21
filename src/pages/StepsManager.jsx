import React, { Component, Fragment } from 'react';
import { withAuth } from '@okta/okta-react';
import { withRouter, Route, Redirect, Link } from 'react-router-dom';
import {
  withStyles,
  Typography,
  Button,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Fade,
  CircularProgress,
} from '@material-ui/core';
import { Delete as DeleteIcon, Add as AddIcon } from '@material-ui/icons';
import PropTypes from 'prop-types';
import { history as historyPropTypes } from 'history-prop-types';
import moment from 'moment';
import { find, orderBy } from 'lodash';
import { compose } from 'recompose';
import StepEditor from '../components/StepEditor';
import log from '../utils/log';

const styles = theme => ({
  loading: {
    'text-align': 'center',
  },
  steps: {
    marginTop: 2 * theme.spacing.unit,
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

const API = process.env.REACT_APP_API || 'http://localhost:3003';

class StepsManager extends Component {
  static propTypes = {
    // eslint-disable-next-line
    classes: PropTypes.object.isRequired,
    history: PropTypes.shape(historyPropTypes).isRequired,
    auth: PropTypes.shape({
      getUser: PropTypes.func.isRequired,
      getAccessToken: PropTypes.func.isRequired,
    }).isRequired,
  };

  state = {
    loading: true,
    steps: [],
  };

  async componentDidMount() {
    const {
      auth: { getUser },
    } = this.props;
    this.user = await getUser();
    this.getSteps();
  }

  async getSteps() {
    const { sub } = this.user;
    const steps = await this.fetch('get', `/steps?userId=${sub}`);
    this.setState({ loading: false, steps });
  }

  async fetch(method, endpoint, body) {
    const {
      auth: { getAccessToken },
    } = this.props;
    const accessToken = await getAccessToken();
    const stringifiedBody = body && JSON.stringify(body);
    try {
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
      return {
        error,
      };
    }
  }

  async saveStep(step) {
    const { history } = this.props;
    const { id } = step;
    const { name, sub } = this.user;
    if (id) {
      await this.fetch('put', `/steps/${step.id}`, step);
    } else {
      await this.fetch('post', '/steps', {
        ...step,
        name,
        userId: sub,
      });
    }

    history.goBack();
    this.setState(
      {
        loading: true,
      },
      () => {
        this.getSteps();
      },
    );
  }

  async deleteStep(step) {
    // eslint-disable-next-line
    if (window.confirm(`Are you sure you want to delete "${step.stepsDate}"`)) {
      await this.fetch('delete', `/steps/${step.id}`);
      this.setState(
        {
          loading: true,
        },
        () => {
          this.getSteps();
        },
      );
    }
  }

  renderStepEditor(url) {
    const {
      match: {
        params: { id },
      },
    } = url;
    const { loading, steps } = this.state;
    if (loading) return null;
    const step = find(steps, { id: Number(id) });

    if (!step && id !== 'new') return <Redirect to="/steps" />;

    return <StepEditor step={step} onSave={step => this.saveStep(step)} />;
  }

  render() {
    const { classes } = this.props;
    const { loading, steps } = this.state;
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
    } else if (steps.length > 0) {
      content = (
        <Paper elevation={1} className={classes.steps}>
          <List>
            {orderBy(steps, ['stepsDate'], ['desc']).map(step => (
              <ListItem
                key={step.id}
                button
                component={Link}
                to={`/steps/${step.id}`}
              >
                <ListItemText
                  primary={`${step.steps} steps on ${step.stepsDate}`}
                  secondary={
                    step.updatedAt &&
                    `Updated ${moment(step.updatedAt).fromNow()}`
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    onClick={() => this.deleteStep(step)}
                    color="inherit"
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      );
    } else {
      content = (
        <Typography variant="subheading">No steps to display</Typography>
      );
    }

    return (
      <Fragment>
        <Typography variant="display1">Track your steps</Typography>
        {content}
        <Button
          variant="fab"
          color="secondary"
          aria-label="add"
          className={classes.fab}
          component={Link}
          to="/steps/new"
        >
          <AddIcon />
        </Button>
        <Route
          exact
          path="/steps/:id"
          render={url => this.renderStepEditor(url)}
        />
      </Fragment>
    );
  }
}

export default compose(
  withAuth,
  withRouter,
  withStyles(styles),
)(StepsManager);
