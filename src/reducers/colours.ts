import { COURSE_COLOURS, ColourMap, Colour } from '../state/Colours';
import { ADD_COURSE, CourseAction, ColourAction, SET_COLOUR, OtherAction } from '../actions';
import { getCourseId } from '../state/Course';

export function colours (state: ColourMap | undefined, action: CourseAction | ColourAction | OtherAction): ColourMap {
  switch (action.type) {
    case ADD_COURSE:
      const courseId = getCourseId(action.course);
      const colour = pickColor(Object.values(colours));
      return {
        ...state,
        [courseId]: colour,
      };
    case SET_COLOUR:
      const newColour = action.colour ? action.colour : pickColor(Object.values(colours));
      return {
        ...state,
        [action.course]: newColour,
      };
  }

  return state || {};
};

function pickColor (chosenColours: Colour[]): Colour {
  let canChoose = COURSE_COLOURS.filter(c => !chosenColours.includes(c));
  if (canChoose.length === 0) {
    canChoose = COURSE_COLOURS;
  }

  const i = Math.floor(Math.random() * canChoose.length);
  return canChoose[i];
}
