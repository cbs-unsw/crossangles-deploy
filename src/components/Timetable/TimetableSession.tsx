import React, { PureComponent, CSSProperties } from 'react';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import createStyles from '@material-ui/core/styles/createStyles';
import { MappedSession, CBS_CODE, Course, Stream } from '../../state';
import { Placement, Dimensions, Position } from './timetableTypes';
import { DraggableCore, DraggableData } from 'react-draggable';

const styles = (theme: Theme) => createStyles({
  root: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    color: 'white',
    cursor: 'grab',
    overflow: 'hidden',
    zIndex: 10,

    transition: 'box-shadow 0.3s, transform 0.3s',
    boxShadow: theme.shadows[3],

    '&$snapped': {
      boxShadow: theme.shadows[0],
    },

    '&$dragging': {
      cursor: 'grabbing',
      transition: 'box-shadow 0.3s',
      boxShadow: theme.shadows[8],
    },
    '&$new': {
      transition: 'none',
    },
  },
  background: {
    transition: 'background-color 0.3s',
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  new: {},
  dragging: {},
  snapped: {},
  sessionText: {
    position: 'relative',
    textAlign: 'center',
    fontWeight: 300,

    '& > $label': {
      lineHeight: 1.25,
      fontSize: '105%',

      '& > $em': {
        fontWeight: 500,
      },
    },
  },
  label: {},
  em: {},
  details: {
    lineHeight: 1.15,
    fontSize: '82%',

    '& > $moreSpace': {
      lineHeight: 1.2,
    },
  },
  moreSpace: {},
});

export interface Props extends WithStyles<typeof styles> {
  session: MappedSession,
  placement: Placement,
  color: string,
  bounds: Dimensions,
  onDrag: (session: MappedSession, position: Position) => false | void,
  onDrop: (session: MappedSession, position: Position, onSnap: () => void) => false | void,
}

export interface State {
  offset: { x: number, y: number },
  justSnapped: boolean,
  dragging: boolean,
  snapped: boolean,
}

class TimetableSession extends PureComponent<Props, State> {
  state: State = {
    offset: { x: 0, y: 0 },
    justSnapped: true,
    dragging: false,
    snapped: true,
  }

  render() {
    const classes = this.props.classes;
    const rootClasses = [
      classes.root,
      this.state.dragging ? classes.dragging : '',
      this.state.snapped ? classes.snapped : '',
      // !this.state.justSnapped ? classes.new : '',
    ].join(' ');

    return (
      <DraggableCore
        onStart={this.handleStart}
        onDrag={this.handleDrag}
        onStop={this.handleStop}
      >
        <div className={rootClasses} style={this.styles}>
          <div
            className={classes.background}
            style={{
              backgroundColor: this.props.color,
            }}
          />

          <div className={classes.sessionText}>
            <div className={classes.label}>
              <span className={classes.em}>{this.sessionTitle}</span>
              <span>{this.sessionComponent}</span>
            </div>

            {this.details.map((detail, i) => (
              <div className={classes.details} key={`detail-${i}`}>
                {detail}
              </div>
            ))}
          </div>
        </div>
      </DraggableCore>
    )
  }

  componentDidUpdate () {
    if (this.state.justSnapped) {
      this.setState({ justSnapped: false });
    }
  }

  private handleStart = () => {
    this.setState({ dragging: true, snapped: false });
    return this.props.onDrag(this.props.session, this.boundedOffset);
  }

  private handleDrag = (_: any, data: DraggableData) => {
    const { deltaX, deltaY } = data;
    let x = this.state.offset.x + deltaX;
    let y = this.state.offset.y + deltaY;

    this.setState({ offset: { x, y } });
  }

  private handleStop = () => {
    const offset = this.boundedOffset;
    this.setState({ offset, dragging: false });
    return this.props.onDrop(this.props.session, offset, this.handleSnap);
  }

  private handleSnap = () => {
    this.setState({ offset: { x: 0, y: 0 }, snapped: true, justSnapped: true });
  }

  private get course (): Course {
    return this.props.session.course;
  }

  private get stream (): Stream {
    return this.props.session.stream;
  }

  private get isSpecialCourse (): boolean {
    // TODO handle custom courses
    return this.course.code === CBS_CODE;
  }

  private get sessionTitle (): string {
    if (this.isSpecialCourse) {
      return this.stream.component;
    }

    return this.course.code;
  }

  private get sessionComponent (): string {
    if (this.isSpecialCourse) {
      return '';
    }

    return this.stream.component;
  }

  private get details (): string[] {
    return [];
  }

  private get boundedOffset (): Position {
    let { width, height, x, y } = this.props.placement;

    x = Math.min(Math.max(this.state.offset.x + x, 0), this.props.bounds.width - width) - x;
    y = Math.min(Math.max(this.state.offset.y + y, 0), this.props.bounds.height - height) - y;

    return { x, y };
  }

  private get styles (): CSSProperties {
    const { width, height, x, y } = this.props.placement;

    return {
      transform: `translate(${this.boundedOffset.x + x}px, ${this.boundedOffset.y + y}px)`,
      width,
      height,
    };
  }
}

export default withStyles(styles)(TimetableSession);
