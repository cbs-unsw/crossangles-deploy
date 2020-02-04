import React, { Component } from 'react';
import { connect } from 'react-redux';
import { RootState } from './state';
import { ThunkDispatch } from 'redux-thunk';
import { Meta } from './state/Meta';
import { Notice } from './state/Notice';
import { fetchData } from './actions/fetchData';
import { clearNotice } from './actions/notice';
import loadable from '@loadable/component';

// Theme
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import ThemeProvider from "@material-ui/styles/ThemeProvider";
import theme from './theme';

// Styles
import withStyles, { WithStyles } from "@material-ui/core/styles/withStyles";
import createStyles from "@material-ui/core/styles/createStyles";

// Components
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from './containers/AppBar';
import Container from '@material-ui/core/Container';
import CourseSelection from './containers/CourseSelection';
import TimetableContainer from './containers/TimetableContainer';
import InfoText from './components/InfoText';

const NoticeDisplay = loadable(() => import('./components/Notice'));

const styles = (theme: Theme) => createStyles({
  appBarSpacer: {
    ...theme.mixins.toolbar,
    marginBottom: theme.spacing(2),
  },
  spaceAbove: {
    marginTop: theme.spacing(8),
  },
  spaceBelow: {
    marginBottom: theme.spacing(8),
  },
});

export interface OwnProps extends WithStyles<typeof styles> {
}

export interface StateProps {
  notice: Notice | null,
  meta: Meta,
}

export interface DispatchProps {
  getData: () => void,
  clearNotice: () => void,
}

export type Props = OwnProps & StateProps & DispatchProps;

export interface State {
}

class App extends Component<Props, State> {
  state = {
  }

  render () {
    const classes = this.props.classes;
    return (
      <ThemeProvider theme={theme}>
        <div>
          <CssBaseline/>
          <AppBar/>
          <div className={classes.appBarSpacer} />

          <Container
            maxWidth="md"
            className={classes.spaceBelow}
          >
            <CourseSelection />

            <TimetableContainer />

            <InfoText
              meta={this.props.meta}
              className={classes.spaceAbove}
              typographyProps={{
                variant: "body2",
                style: { fontWeight: 300 },
              }}
              link
              disclaimer
            />
          </Container>

          <NoticeDisplay
            notice={this.props.notice}
            onSnackbarClose={this.handleSnackbarClose}
          />
        </div>
      </ThemeProvider>
    );
  }

  componentDidMount () {
    // TODO: immediately start data loading (asynchronously) without waiting for render
    // (maybe put near store initialisation)
    this.props.getData();
  }

  handleSnackbarClose = () => {
    this.props.clearNotice();
  }
}

const mapStateToProps = (state: RootState): StateProps => {
  return {
    notice: state.notice,
    meta: state.meta,
  }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, any>): DispatchProps => {
  return {
    getData: async () => await dispatch(fetchData(process.env.REACT_APP_DATA_URI as string)),
    clearNotice: async () => await dispatch(clearNotice()),
  }
}

const connected = connect(mapStateToProps, mapDispatchToProps);
export default withStyles(styles)(connected(App));
