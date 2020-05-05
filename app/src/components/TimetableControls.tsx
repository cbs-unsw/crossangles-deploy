import React from 'react';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import createStyles from '@material-ui/core/styles/createStyles';
import { HistoryData } from '../state/StateHistory';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Undo from '@material-ui/icons/Undo';
import Redo from '@material-ui/icons/Redo';
import Refresh from '@material-ui/icons/Refresh';
import Event from '@material-ui/icons/Event';

const styles = (theme: Theme) => createStyles({
  primary: {
    transition: theme.transitions.create('color'),
    color: theme.palette.primary.main,
  },
  amber: {
    transition: theme.transitions.create('color'),
    color: theme.palette.warning.main,
  },
  red: {
    transition: theme.transitions.create('color'),
    color: theme.palette.error.main,
  },
  spacer: {
    flexGrow: 1,
  },
});

export interface Props extends WithStyles<typeof styles> {
  history: HistoryData,
  improvementScore: number,
  isUpdating: boolean,
  timetableIsEmpty: boolean,
  onUndo?: () => void,
  onRedo?: () => void,
  onUpdate?: () => void,
  onCreateCustom?: () => void,
}

export const TimetableControls = ({
  classes,
  history,
  improvementScore,
  isUpdating,
  timetableIsEmpty,
  onUndo,
  onRedo,
  onUpdate,
  onCreateCustom,
}: Props) => {
  let updateClass = classes.primary;
  if (improvementScore > 100) {
    if (improvementScore < 800) {
      updateClass = classes.amber;
    } else {
      updateClass = classes.red;
    }
  }

  return (
    <Toolbar>
      {onUndo && (
        <IconButton
          onClick={onUndo}
          color="primary"
          disabled={history.past.length === 0}
          data-cy="undo-button"
        >
          <Undo />
        </IconButton>
      )}
      {onRedo && (
        <IconButton
          onClick={onRedo}
          color="primary"
          disabled={history.future.length === 0}
          data-cy="redo-button"
        >
          <Redo />
        </IconButton>
      )}
      {onUpdate && (
        <IconButton
          onClick={!isUpdating ? onUpdate : undefined}
          disabled={timetableIsEmpty}
          className={updateClass}
          data-cy="update-button"
        >
          <Refresh />
        </IconButton>
      )}

      <div className={classes.spacer}></div>

      {onCreateCustom && (
        <IconButton
          color="primary"
          onClick={onCreateCustom}
          data-cy="create-custom-event"
        >
          <Event />
        </IconButton>
      )}
    </Toolbar>
  )
}

export default withStyles(styles)(TimetableControls);
