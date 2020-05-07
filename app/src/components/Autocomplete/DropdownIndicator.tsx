import React from 'react';
import { IndicatorProps } from 'react-select/lib/components/indicators';
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';
import { CourseData } from '../../state/Course';

export interface Props extends IndicatorProps<CourseData> {}

const DropdownIndicator = ({ selectProps }: Props) => {
  const { DropdownIndicatorProps, classes } = selectProps;
  const { open, focused } = DropdownIndicatorProps;

  const classList: string[] = [
    classes.dropDown,
    open ? classes.dropDownUp : '',
    focused ? classes.dropDownFocus : '',
  ].filter((c: string) => !!c);

  return (
    <ArrowDropDown className={classList.join(' ')} />
  );
}

export default DropdownIndicator;
