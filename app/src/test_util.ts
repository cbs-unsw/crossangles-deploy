import { CourseData, linkStream } from './state';
import SessionPlacement from './components/Timetable/SessionPlacement';
import SessionManager from './components/Timetable/SessionManager';
import { Dimensions } from './components/Timetable/timetableTypes';

export const getCourse = (): CourseData => ({
  code: 'RING9731',
  name: 'Introduction to Ring Theory',
  streams: [
    {
      component: 'LEC',
      enrols: [50, 100],
      times: [
        { time: 'M9', location: 'Morder', canClash: true },
        { time: 'H12', location: 'Helm\'s Deep', weeks: '1,3,7-9' },
        { time: 'T12', location: 'Tol Brandir', weeks: '1,3,7-9' },
      ],
    },
    {
      component: 'OTH',
      enrols: [10, 50],
      times: [
        { time: 'T9', location: 'Morder', canClash: true },
        { time: 'F9', location: 'Helm\'s Deep', weeks: '1,3,7-9' },
        { time: 'W12', location: 'Tol Brandir', weeks: '1,3,7-9' },
      ],
    },
    {
      component: 'TUT',
      enrols: [5, 10],
      times: [
        { time: 'H9', location: 'Hobbiton' },
      ],
    },
    {
      component: 'TUT',
      enrols: [9, 9],
      times: [
        { time: 'F19', location: 'Fangorn' },
      ],
    },
  ],
});

export const getLinkedStream = (streamIndex = 0) => {
  const course = getCourse();
  return linkStream(course, course.streams[streamIndex]);
}

export const getLinkedSession = (streamIndex = 0, sessionIndex = 0) => {
  const stream = getLinkedStream(streamIndex);
  return stream.sessions[sessionIndex];
}

export const getSessionPlacement = (streamIndex = 0, sessionIndex = 0): SessionPlacement => {
  const session = getLinkedSession(streamIndex, sessionIndex);
  return new SessionPlacement(session);
}

export const getSessionManager = () => {
  const manager = new SessionManager();
  const p1 = getSessionPlacement(0);
  const p2 = getSessionPlacement(2);
  const p3 = getSessionPlacement(3);
  manager.set(p1.session.id, p1);
  manager.set(p2.session.id, p2);
  manager.set(p3.session.id, p3);
  return manager;
}

export const getDimensions = () => {
  const dimensions: Dimensions = {
    width: 800,
    height: 500,
  };
  return dimensions;
}
