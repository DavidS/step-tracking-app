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
} from '@material-ui/core';

import { compose } from 'recompose';
import {withAuth} from "@okta/okta-react/dist/index";

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

const API = process.env.REACT_APP_API || 'http://localhost:3001';

class Dashboard extends Component {
    state = {
        loading: true,
        dashData: [],
    };

    componentDidMount() {
        this.getData();
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

    async getData() {
        this.setState({ loading: false, dashData: await this.fetch('get', '/dashboard') });
    }

    render() {
        const { classes } = this.props;

        return (
            <Fragment>
                <Typography variant="display1">Leader Board</Typography>
                {this.state.dashData.length > 0 ? (
                    <Paper className={classes.root}>
                        <Table className={classes.table}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Rank</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Step Count</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {this.state.dashData.map(row => (
                                    <TableRow key={row.rank}>
                                        <TableCell align="right">{row.rank}</TableCell>
                                        <TableCell align="right">{row.name}</TableCell>
                                        <TableCell align="right">{row.steps}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Paper>
                ) : (
                    !this.state.loading && <Typography variant="subheading">No data to display</Typography>
                )}
            </Fragment>
        );
    }
}

// SimpleTable.propTypes = {
//     classes: PropTypes.object.isRequired,
// };

export default compose(
    withAuth,
    withStyles(styles),
)(Dashboard);