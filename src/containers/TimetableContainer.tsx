import React, { Component } from 'react';
import { connect } from 'react-redux';
import { RootState, CBSEvent } from '../state';
import { WithDispatch } from '../typeHelpers';

// Styles
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import createStyles from '@material-ui/core/styles/createStyles';

// Components
import TimetableTable from '../components/Timetable';
import { CourseData, CourseId, CourseMap, getCourseId } from '../state/Course';
import { linkStream, LinkedStream } from '../state/Stream';
import { Options } from '../state/Options';
import { ColourMap } from '../state/Colours';
import { SessionManagerData } from '../components/Timetable/SessionManager';
import { updateTimetable } from '../actions';


const styles = (theme: Theme) => createStyles({
  spaceAbove: {
    paddingTop: theme.spacing(4),
  },
});

export interface OwnProps extends WithStyles<typeof styles> {}

export interface StateProps {
  courses: CourseMap,
  chosen: CourseData[],
  custom: CourseData[],
  additional: CourseData[],
  events: CBSEvent[],
  options: Options,
  colours: ColourMap,
  webStreams: CourseId[],
  timetableData: SessionManagerData,
}

export type Props = WithDispatch<OwnProps & StateProps>;

class TimetableContainer extends Component<Props> {
  render () {
    const classes = this.props.classes;

    return (
      <div className={classes.spaceAbove}>
        <TimetableTable
          courses={this.props.courses}
          options={this.props.options}
          allChosenIds={this.chosenIds}
          streams={this.timetableStreams}
          colours={this.props.colours}
          webStreams={this.props.webStreams}
          timetableData={this.props.timetableData}
          onUpdate={this.handleUpdate}
        />
      </div>
    );
  }

  shouldComponentUpdate (prevProps: Props) {
    if (this.props.courses !== prevProps.courses || this.props.chosen !== prevProps.chosen || this.props.events !== prevProps.events || this.props.options !== prevProps.options) {
      return true;
    }

    // TODO is this necessary? should they be sorted first?
    // const oldSessions = this.props.sessionManager.order;
    // const newSessions = prevProps.sessionManager.order;
    // if (!arraysEqual(oldSessions, newSessions)) {
    //   return true;
    // }

    return false;
  }

  private handleUpdate = (timetable: SessionManagerData) => {
    this.props.dispatch(updateTimetable(timetable));
  }

  private get allCourses (): CourseData[] {
    const { chosen, custom, additional } = this.props;

    return chosen.concat(custom, additional);
  }

  private get chosenIds (): CourseId[] {
    return this.allCourses.map(c => getCourseId(c));
  }

  private get timetableStreams (): LinkedStream[] {
    // Get all streams of chosen courses
    return this.allCourses.flatMap(c => c.streams.map(s => linkStream(c, s)));
  }
}

const mapStateToProps = (state: RootState): StateProps => {
  const courseSort = (a: CourseData, b: CourseData) => +(a.code > b.code) - +(a.code < b.code);
  const customSort = (a: CourseData, b: CourseData) => +(a.name > b.name) - +(a.name < b.name);

  return {
    courses: state.courses,
    chosen: state.chosen.map(cid => state.courses[cid]).sort(courseSort),
    custom: state.custom.map(c => state.courses[c]).sort(customSort),
    additional: state.additional.map(c => state.courses[c]).sort(courseSort),
    events: state.events,
    options: state.options,
    colours: state.colours,
    webStreams: state.webStreams,
    timetableData: state.timetable,
  };
}

const connected = connect(mapStateToProps);
export default withStyles(styles)(connected(TimetableContainer));
