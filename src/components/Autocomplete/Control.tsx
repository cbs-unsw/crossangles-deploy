import React, { Component, HTMLAttributes } from 'react';

// Components
import TextField, { BaseTextFieldProps } from '@material-ui/core/TextField';
import Course from '../../state/Course';
import { ControlProps } from 'react-select/lib/components/Control';

export interface Props extends ControlProps<Course> {
}

type InputComponentProps = Pick<BaseTextFieldProps, 'inputRef'> & HTMLAttributes<HTMLDivElement>;
function inputComponent({ inputRef, ...props }: InputComponentProps) {
  return <div ref={inputRef} {...props} />;
}

export class Control extends Component<Props> {
  render () {
    const {
      children,
      innerProps,
      innerRef,
      selectProps,
    } = this.props;
    const { TextFieldProps, classes } = selectProps;

    return (
      <TextField
        fullWidth
        InputProps={{
          inputComponent,
          inputProps: {
            className: classes.input,
            ref: innerRef,
            children,
            ...innerProps,
          },
        }}
        {...TextFieldProps}
      />
    );
  }

  shouldComponentUpdate (nextProps: Props) {
    return this.props.selectProps.options !== nextProps.selectProps.options;
  }
}

export default Control;
