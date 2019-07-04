import { Timetable, Course, CBSEvent, Options, Stream, Session } from '../state';
import { Action } from 'redux';
import { search } from '../timetable/timetableSearch';
import { coursesToComponents } from '../timetable/coursesToComponents';

export const UPDATE_TIMETABLE = 'UPDATE_TIMETABLE';
export interface TimetableAction extends Action {
  type: typeof UPDATE_TIMETABLE;
  timetable: Timetable;
}

export interface UpdateTimetableConfig {
  previousTimetable: Timetable;
  courses: Course[];
  events: CBSEvent[];
  options: Options;
}


export function doTimetableSearch (config: UpdateTimetableConfig): Timetable | null {
  const {
    previousTimetable,
    courses,
    events,
    options: {
      includeFull,
    },
  } = config;

  // Group streams by course and component
  const components = coursesToComponents(courses, events, includeFull);

  // Check for impossible timetables
  if (components.filter(c => c.streams.length === 0).length > 0) {
    return null;
  }

  try {
    const newTimetable = search(components, previousTimetable);
    return newTimetable;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export function updateTimetable (newTimetable: Timetable): TimetableAction {
  return {
    type: UPDATE_TIMETABLE,
    timetable: newTimetable,
  }
}

export function swapStreams (timetable: Timetable, oldStream: Stream, newStream: Stream, topSession: Session) {
  timetable = timetable.filter(s => s.stream !== oldStream.id);
  timetable = timetable.concat(newStream.sessions.filter(s => s.index !== topSession.index));
  timetable.push(newStream.sessions[topSession.index]);

  return {
    type: UPDATE_TIMETABLE,
    timetable,
  }
}

export function bumpStream (timetable: Timetable, stream: Stream, topSession: Session) {
  return swapStreams(timetable, stream, stream, topSession);
}
