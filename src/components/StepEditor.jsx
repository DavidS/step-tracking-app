import React from 'react';
import PropTypes from 'prop-types';
import { history as historyPropTypes } from 'history-prop-types';
import {
  withStyles,
  Card,
  CardContent,
  CardActions,
  Modal,
  Button,
  TextField,
} from '@material-ui/core';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';
import { Form, Field } from 'react-final-form';

const styles = theme => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    width: '90%',
    maxWidth: 500,
  },
  modalCardContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  marginTop: {
    marginTop: 2 * theme.spacing.unit,
  },
});

const StepEditor = ({ classes, step, onSave, history }) => (
  <Form initialValues={step} onSubmit={onSave}>
    {({ handleSubmit }) => (
      <Modal className={classes.modal} onClose={() => history.goBack()} open>
        <Card className={classes.modalCard}>
          <form onSubmit={handleSubmit}>
            <CardContent className={classes.modalCardContent}>
              <Field name="stepsDate">
                {({ input }) => (
                  <TextField
                    required
                    type="date"
                    label="Date"
                    autoFocus
                    {...input}
                  />
                )}
              </Field>
              <Field name="steps">
                {({ input }) => (
                  <TextField required label="Step Count" {...input} />
                )}
              </Field>
            </CardContent>
            <CardActions>
              <Button size="small" color="primary" type="submit">
                {'Save'}
              </Button>
              <Button size="small" onClick={() => history.goBack()}>
                {'Cancel'}
              </Button>
            </CardActions>
          </form>
        </Card>
      </Modal>
    )}
  </Form>
);

StepEditor.propTypes = {
  // eslint-disable-next-line
   classes: PropTypes.object.isRequired,
  step: PropTypes.number.isRequired,
  onSave: PropTypes.func.isRequired,
  history: PropTypes.shape(historyPropTypes).isRequired,
};

export default compose(
  withRouter,
  withStyles(styles),
)(StepEditor);
