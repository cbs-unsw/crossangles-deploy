import React, { PureComponent, ChangeEvent } from 'react';

// Styles
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import createStyles from '@material-ui/core/styles/createStyles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';
import CloseIcon from '@material-ui/icons/Close';

const styles = (theme: Theme) => createStyles({
  dialog: {
  },
  dialogTitle: {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: theme.spacing(1),
  },
  flexGrow: {
    flexGrow: 1,
  },
  moveRight: {
    marginRight: theme.spacing(-1),
  },
  marginTop: {
    marginTop: theme.spacing(2.5),
  },
  paddingBottom: {
    paddingBottom: theme.spacing(2),
  },
  clearButton: {
    marginRight: theme.spacing(3),
    cursor: 'pointer',
  },
});

export interface Props extends WithStyles<typeof styles> {
  open: boolean,
  onSend: (name: string, email: string, message: string) => void,
  onClose: () => void,
}

export interface State {
  name: string,
  email: string,
  message: string,
}

class CreateCustom extends PureComponent<Props, State> {
  state: State = {
    name: '',
    email: '',
    message: '',
  }

  render() {
    const classes = this.props.classes;

    return (
      <Dialog
        open={this.props.open}
        onClose={this.handleClose}
        onExited={this.handleExited}
        aria-labelledby="contact-us-title"
        className={classes.dialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle disableTypography className={classes.dialogTitle}>
          <Typography variant="h6" id="contact-us-title" className={classes.flexGrow}>
            Get in Contact
          </Typography>

          <IconButton
            aria-label="close"
            onClick={this.handleClose}
            className={classes.moveRight}
            data-cy="close-dialog"
          >
            <CloseIcon></CloseIcon>
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <TextField
            label="Name"
            placeholder="Joe Bloggs"
            value={this.state.name}
            onChange={this.handleChangeName}
            inputProps={{ maxLength: 40 }}
            helperText={`${this.state.name.length} / 40`}
            autoFocus
            className={classes.paddingBottom}
            fullWidth
            data-cy="contact-us-name"
          />

          <TextField
            label="Email"
            type="email"
            placeholder="joe.bloggs@example.com"
            value={this.state.email}
            onChange={this.handleChangeEmail}
            autoFocus
            className={classes.paddingBottom}
            fullWidth
            data-cy="contact-us-email"
          />

          <TextField
            label="Message"
            value={this.state.message}
            onChange={this.handleChangeMessage}
            autoFocus
            className={classes.paddingBottom}
            fullWidth
            data-cy="contact-us-email"
          />
        </DialogContent>

        <DialogActions>
          <Button
            color="primary"
            variant="contained"
            fullWidth
            disabled={!this.canSubmit()}
            onClick={this.handleClickSave}
            data-cy="contact-us-submit"
          >
            Send Message
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  handleClickSave = () => {
    this.props.onSend(
      this.state.name,
      this.state.email,
      this.state.message,
    );
    this.handleClose();
  }

  handleClose = () => {
    this.props.onClose();
  }

  handleExited = () => {
    this.setState({
      name: '',
      email: '',
      message: '',
    });
  }

  handleChangeName = (event: ChangeEvent<{value: unknown}>) => {
    this.setState({ name: event.target.value as string });
  }

  handleChangeEmail = (event: ChangeEvent<{value: unknown}>) => {
    this.setState({ email: event.target.value as string });
  }

  handleChangeMessage = (event: ChangeEvent<{value: unknown}>) => {
    this.setState({ message: event.target.value as string });
  }

  private canSubmit = (): boolean => {
    const nameError = !this.state.name;
    const emailError = !this.state.email;
    const messageError = !this.state.message;

    return !nameError && !emailError && !messageError;
  }
}

export default withStyles(styles)(CreateCustom);
