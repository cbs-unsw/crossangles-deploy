import { AdditionalEvent } from '../state';
import { search, TimetableSearchResult } from '../timetable/timetableSearch';
import { coursesToComponents, Component } from '../timetable/coursesToComponents';
import { SessionManagerData } from '../components/Timetable/SessionManager';
import { LinkedSession } from '../state/Session';
import { CourseData, CourseId } from '../state/Course';
import { Options } from '../state/Options';
import { UserAction } from '.';
import { GeneticSearchOptionalConfig } from '../timetable/GeneticSearch';
import { linkStream } from '../state/Stream';

export const UPDATE_SESSION_MANAGER = 'UPDATE_SESSION_MANAGER';
export interface SessionManagerAction extends UserAction {
  type: typeof UPDATE_SESSION_MANAGER,
  sessionManager: SessionManagerData,
}

export const UPDATE_SUGGESTED_TIMETABLE = 'UPDATE_SUGGESTED_TIMETABLE';
export interface SuggestionAction extends UserAction {
  type: typeof UPDATE_SUGGESTED_TIMETABLE,
  score: number | null,
}

export interface UpdateTimetableConfig {
  fixedSessions: LinkedSession[];
  courses: CourseData[],
  events: AdditionalEvent[],
  webStreams: CourseId[],
  options: Options,
  maxSpawn?: number,
  ignoreCache?: boolean,
  searchConfig?: GeneticSearchOptionalConfig,
}


export function doTimetableSearch (config: UpdateTimetableConfig): TimetableSearchResult | null {
  const {
    fixedSessions,
    courses,
    events,
    webStreams,
    options,
    maxSpawn,
    ignoreCache,
    searchConfig,
  } = config;

  // Remove fixed sessions from full streams
  let includeFull = options.includeFull || false;
  const fixed = fixedSessions.filter(s => includeFull || !s.stream.full);

  // Group streams by course and component
  // NB: removes full streams
  let components = coursesToComponents(
    courses,
    events,
    webStreams,
    fixed,
    includeFull,
  );

  // Check for impossible timetables
  const fullComponents = components.filter(c => c.streams.length === 0);
  components = components.filter(c => c.streams.length > 0);

  let result: ReturnType<typeof search>;
  try {
    // Search for a new timetable
    // NB: scoring should take fixed sessions into account too
    // NB: full sessions don't matter here, since they can be considered to be 'unplaced'
    result = search(components, fixed, maxSpawn, ignoreCache, searchConfig);
  } catch (err) {
    console.error(err);
    return null;
  }

  // Add fixed sessions
  result.timetable.push(...fixed);

  // Add sessions from first stream of any completely full components
  const unplaced = getFullStreamSessions(fullComponents);

  return { ...result, unplaced };
}

function getFullStreamSessions (fullComponents: Component[]) {
  const fullSessions: LinkedSession[] = [];

  for (const component of fullComponents) {
    const course = component.course;
    const firstStream = course.streams[0];
    const linkedStream = linkStream(course, firstStream);
    fullSessions.push(...linkedStream.sessions);
  }

  return fullSessions;
}

export function updateTimetable (newTimetable: SessionManagerData): SessionManagerAction {
  return {
    type: UPDATE_SESSION_MANAGER,
    sessionManager: newTimetable,
    isUser: true,
  }
}

export function setSuggestionScore (score: number | null): SuggestionAction {
  return {
    type: UPDATE_SUGGESTED_TIMETABLE,
    score,
    isUser: true,
  }
}
