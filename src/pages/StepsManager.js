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
} from '@material-ui/core';
import { Delete as DeleteIcon, Add as AddIcon } from '@material-ui/icons';
import moment from 'moment';
import { find, orderBy } from 'lodash';
import { compose } from 'recompose';
import StepEditor from '../components/StepEditor';

const styles = theme => ({
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

const API = process.env.REACT_APP_API || 'http://localhost:3001';

class StepsManager extends Component {
    state = {
        loading: true,
        steps: [],
        user: null,
    };

    componentDidMount() {
        this.getCurrentUser();
        this.getSteps();
    }

    async getCurrentUser() {
        await this.props.auth.getUser().then(user => this.setState({ user }));
    }

    async fetch(method, endpoint, body) {
        try {
            const response = await fetch(`${API}${endpoint}`, {
                method,
                body: body && JSON.stringify(body),
                headers: {
                    'content-type': 'application/json',
                    accept: 'application/json',
                    authorization: `Bearer ${await this.props.auth.getAccessToken()}`,
                },
            });
            return await response.json();
        } catch (error) {
            console.error(error);
        }
    }

    async getSteps() {
        await this.getCurrentUser(); // TODO: better way?
        this.setState({ loading: false, steps: await this.fetch('get', `/steps?userId=${this.state.user.sub}`) });
    }

    saveStep = async (step) => {
        if (step.id) {
            await this.fetch('put', `/steps/${step.id}`, step);
        } else {
            step.userId = this.state.user.sub;
            step.name = this.state.user.name;
            await this.fetch('post', '/steps', step);
        }

        this.props.history.goBack();
        this.getSteps();
    };

    async deleteStep(step) {
        if (window.confirm(`Are you sure you want to delete "${step.stepsDate}"`)) {
            await this.fetch('delete', `/steps/${step.id}`);
            this.getSteps();
        }
    }

    renderStepEditor = ({ match: { params: { id } } }) => {
        if (this.state.loading) return null;
        const step = find(this.state.steps, { id: Number(id) });

        if (!step && id !== 'new') return <Redirect to="/steps" />;

        return <StepEditor step={step} onSave={this.saveStep} />;
    };

    render() {
        const { classes } = this.props;

        return (
            <Fragment>
                <Typography variant="display1">Track your steps</Typography>
                {this.state.steps.length > 0 ? (
                    <Paper elevation={1} className={classes.steps}>
                        <List>
                            {orderBy(this.state.steps, ['stepsDate'], ['desc']).map(step => (
                                <ListItem key={step.id} button component={Link} to={`/steps/${step.id}`}>
                                    <ListItemText
                                        primary={`${step.steps} steps on ${step.stepsDate}`}
                                        secondary={step.updatedAt && `Updated ${moment(step.updatedAt).fromNow()}`}
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton onClick={() => this.deleteStep(step)} color="inherit">
                                            <DeleteIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                ) : (
                    !this.state.loading && <Typography variant="subheading">No steps to display</Typography>
                )}
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
                <Route exact path="/steps/:id" render={this.renderStepEditor} />
            </Fragment>
        );
    }
}

export default compose(
    withAuth,
    withRouter,
    withStyles(styles),
)(StepsManager);