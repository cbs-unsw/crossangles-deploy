import {
  ADD_COURSE,
  TOGGLE_EVENT,
  TOGGLE_OPTION,
  ToggleOptionAction,
  EventAction,
  CourseAction,
  ToggleShowEventsAction,
  TOGGLE_SHOW_EVENTS,
} from '../actions/selection';
import {
  AdditionalEvent, baseState,
} from '../state';
import { OtherAction } from '../actions';
import { Options } from '../state/Options';
import { CourseId } from '../state/Course';

export function events (state: AdditionalEvent[] = [], action: EventAction | CourseAction | OtherAction): AdditionalEvent[] {
  switch (action.type) {
    case TOGGLE_EVENT:
      if (!state.includes(action.event)) {
        return [
          ...state,
          action.event,
        ];
      } else {
        const i = state.indexOf(action.event);
        return [
          ...state.slice(0, i),
          ...state.slice(i + 1),
        ];
      }
    case ADD_COURSE:
      if (action.course.isAdditional && !action.course.autoSelect) {
        const components = action.course.streams.map(s => s.component);
        const eventList = components.filter((c, i) => components.indexOf(c) === i);
        if (eventList.length === 1) {
          return [ ...state, eventList[0] ];
        }
      }
      break;
  }

  return state;
};

export function options (
  state: Options = baseState.options,
  action: ToggleOptionAction | OtherAction
): Options {
  switch (action.type) {
    case TOGGLE_OPTION:
      return {
        ...state,
        [action.option]: !state[action.option],
      };
  }

  return state;
};

export function hiddenEvents (
  state: CourseId[] = baseState.hiddenEvents,
  action: ToggleShowEventsAction | OtherAction,
): CourseId[] {
  switch (action.type) {
    case TOGGLE_SHOW_EVENTS:
      if (!state.includes(action.course)) {
        return [
          ...state,
          action.course,
        ];
      } else {
        const i = state.indexOf(action.course);
        return [
          ...state.slice(0, i),
          ...state.slice(i + 1),
        ];
      }
  }

  return state;
}
