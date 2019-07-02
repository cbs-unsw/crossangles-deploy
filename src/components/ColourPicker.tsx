import React, { PureComponent } from 'react';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import createStyles from '@material-ui/core/styles/createStyles';
import Colour from './Colour';

const styles = (theme: Theme) => createStyles({
  root: {
    padding: theme.spacing(1),
  },
  colourContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  colour: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',

    '&$selected': {
      border: '1px solid white',
    }
  },
  selected: {},
});

export interface Props extends WithStyles<typeof styles> {
  colours: string[],
  columns: number,
  size: number,
  value?: string | null,
  onChange: (colour: string) => void,
}

class ColourPicker extends PureComponent<Props> {
  render() {
    const classes = this.props.classes;

    return (
      <div
        className={classes.root}
      >
        <div
          className={classes.colourContainer}
          style={{
            width: this.props.size * this.props.columns,
          }}
        >
          {this.props.colours.map(colour => (
            <Colour
              key={colour}
              colour={colour}
              onClick={() => this.props.onChange(colour)}
              size={this.props.size}
              isSelected={colour === this.props.value}
            />
          ))}
        </div>
      </div>
    )
  }
}

export default withStyles(styles)(ColourPicker);
