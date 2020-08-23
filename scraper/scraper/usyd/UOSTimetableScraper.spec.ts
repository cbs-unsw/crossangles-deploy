import {
  getLocation,
  getTime,
  getWeeks,
  mergeWeeks,
  shouldSkipTime,
  mergeTimes,
  splitTerms,
  shouldIncludeTerm,
  isStreamClosed,
} from './UOSTimetableScraper';
import { ClassTime } from '../../../app/src/state/Stream';
import { CourseData } from '../../../app/src/state/Course';

describe('parsing utils', () => {
  it.each([
    ['', false],
    ['S1C', true],
    ['S2C', true],
    ['S1CIMY', false],
    ['S2CIJL', false],
    ['T2C', false],
  ])('shouldIncludeTerm(%s) = %s', (termCode, expected) => {
    expect(shouldIncludeTerm(termCode)).toEqual(expected);
  });

  it.each([
    ['M9-12', 'Abercrombie Business School', false],
    ['T9-12', 'Abercrombie Business School', false],
    ['S9', 'Abercrombie Business School', true],
    ['s14-16', 'Abercrombie Business School', true],
    ['W9-12', 'Online-Live', false],
    ['M9-12', 'Online', false],
    ['M9-12', 'Online Pre-Recorded', true],
    ['M9-12', 'Online pre-recorded', true],
  ])('shouldSkipTime("%s") = %s', (time, location, expected) => {
    const classTime: ClassTime = { time, location };
    expect(shouldSkipTime(classTime)).toEqual(expected);
  });

  it.each([
    ['M09A', undefined],
    ['N10A', undefined],
    ['N14AClass Closed', true],
    ['N14A Class Closed', true],
  ])('shouldSkipTime("%s") = %s', (streamCode, expected) => {
    expect(isStreamClosed(streamCode)).toEqual(expected);
  });

  it.each([
    ['Mon', '10:00-11:30', 'M10-11.5'],
    ['Tue', '10:00-11:00', 'T10'],
    ['Wed', '9:00-19:00', 'W9-19'],
    ['Thu', '9:00-9:30', 'H9-9.5'],
    ['Fri', '9:30-10:30', 'F9.5'],
  ])('getTime("%s", "%s") = "%s"', (day, time, expected) => {
    expect(getTime(day, time)).toEqual(expected);
  });

  it.each([
    ['[wks 1 to 13]', '1-13'],
    ['[wks 2 to 13]', '2-13'],
    ['[wks 1 to 6, 9 to 12]', '1-6,9-12'],
    ['[wks 1, 3, 6, 9 to 12]', '1,3,6,9-12'],
    ['[wks 1]', '1'],
    ['[wks 13]', '13'],
    ['[wks 2 to 13]Dateswk 2Thu 05 Mar 2020wk 3Thu 12 Mar 2020wk 4Thu 19 Mar 2020', '2-13'],
  ])('getWeeks("%s") = "%s"', (weeks, expected) => {
    expect(getWeeks(weeks)).toEqual(expected);
  });

  it.each([
    [[], undefined],
    [['1', '2-13'], '1-13'],
    [['5-6', '1-13'], '1-13'],
    [['2-6', '7-12'], '2-12'],
    [['2-6', '8-13'], '2-6,8-13'],
    [['1-2,4', '7,9,10', '13'], '1-2,4,7,9-10,13'],
  ])('mergeWeeks(%s) = "%s"', (weeks, expected) => {
    expect(mergeWeeks(weeks)).toEqual(expected);
  });

  it.each([
    ['in Abercrombie Business School', 'Abercrombie Business School'],
    ['in Storie Dixson', 'Storie Dixson'],
  ])('getLocation("%s") = "%s"', (rawLocation, expected) => {
    expect(getLocation(rawLocation)).toEqual(expected);
  });

  it.each([
    [[], []],
    [[{ time: 'a' }], [{ time: 'a' }]],
    [[{ time: 'a', weeks: '1-2' }, { time: 'a' }], [{ time: 'a', weeks: '1-2' }]],
    [[{ time: 'b', weeks: '1-2' }, { time: 'b', weeks: '3-4' }], [{ time: 'b', weeks: '1-4' }]],
    [[{ time: 'b', location: 'a' }, { time: 'b' }], [{ time: 'b', location: 'a' }]],
    [[{ time: 'b', location: 'a' }, { time: 'b', location: 'b' }], [{ time: 'b', location: 'a' }]],
    [[{ time: 'b' }, { time: 'b', location: 'b' }], [{ time: 'b', location: 'b' }]],
  ])('mergeTimes', (times, expected) => {
    expect(mergeTimes(times)).toEqual(expected);
  });

  it('splitTerms', () => {
    const courses: CourseData[] = [
      { code: 'a', name: '', streams: [], term: 'T1C' },
      { code: 'b', name: '', streams: [], term: 'T1C' },
      { code: 'c', name: '', streams: [], term: 'T2C' },
    ];
    const [term1, term2] = splitTerms(courses);
    expect(term1).toEqual([
      { code: 'a', name: '', streams: [] },
      { code: 'b', name: '', streams: [] },
    ]);
    expect(term2).toEqual([
      { code: 'c', name: '', streams: [] },
    ]);
  });
});
