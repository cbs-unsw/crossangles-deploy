import { CourseData, Career } from '../../../app/src/state/Course';
import { ClassTime, StreamData, DeliveryType } from '../../../app/src/state/Stream';

const TABLE_END_COUNT = 1;
const COURSE_HEADING_COUNT = 2;
const REGULAR_CELL_COUNT = 8;

export class ClassUtilParser {
  async parseFacultyPage ($: CheerioStatic): Promise<CourseData[]> {
    // Get all rows of the table
    const rows = Array.from($($('table').get(2)).find('tr'));

    // Remove first row (which is the header)
    const bodyRows = rows.slice(1);
    const courses: CourseData[] = [];
    let courseCode: string = '';
    let courseName: string = '';
    let newCourse = false;

    for (const row of bodyRows) {
      let currentCourse = courses[courses.length - 1];
      const cells = $(row).find('td');

      if (cells.length === TABLE_END_COUNT) {
        break;
      } else if (cells.length === COURSE_HEADING_COUNT) {
        courseCode = $(cells.get(0)).text().trim();
        courseName = $(cells.get(1)).text().trim();
        newCourse = true;
      } else if (cells.length === REGULAR_CELL_COUNT) {
        // Check for course enrolment streams
        const component = $(cells.get(0)).text().trim();
        const section = $(cells.get(1)).text().trim();
        const status = $(cells.get(4)).text().trim();
        const enrols = $(cells.get(5)).text().trim();
        const times = $(cells.get(7)).text().trim();

        // Handle new course
        if (component === 'CRS') {
          if (!this.checkStatus(status)) {
            continue;
          }

          courses.push(this.parseCourse(courseCode, courseName, section, times));
          newCourse = false;
          continue;
        }

        // Handle streams listed before any course enrolment
        if (newCourse === true) {
          courses.push(this.parseCourse(courseCode, courseName));
          currentCourse = courses[courses.length - 1];
          newCourse = false;
        }

        const stream = this.parseStream(component, section, status, enrols, times);
        if (stream !== null) {
          currentCourse.streams.push(stream);
        }
      }
    }

    return courses;
  }

  getCareer (time?: string): Career | undefined {
    if (!time) return undefined;

    time = time.toLowerCase();
    if (time.includes('ugrd')) {
      return Career.UGRD;
    } else if (time.includes('pgrd')) {
      return Career.PGRD;
    } else if (time.includes('rsch')) {
      return Career.RSCH;
    }

    return undefined;
  }

  parseCourse (code: string, rawName: string, section?: string, time?: string): CourseData {
    const term = this.extractTerm(rawName);
    const termRegex = new RegExp(`\\s*\\(${term}\\)$`);
    const name = rawName.replace(termRegex, '');
    const career = this.getCareer(time);
    return {
      code,
      name,
      streams: [],
      term,
      section: section || undefined,
      career,
    };
  }

  parseStream (
    component: string,
    section: string,
    status: string,
    enrolString: string,
    timeString: string,
  ): StreamData | null {
    if (!this.checkStatus(status)) {
      return null;
    }
    status = status.replace(/\*$/, '').toLowerCase();
    const full = status === 'full' ? true : undefined;

    const enrols = enrolString.split(' ')[0].split('/').map(x => parseInt(x)) as [number, number];
    if (enrols[1] === 0) {
      return null;
    }

    let web = undefined;
    let times: ClassTime[] | null = null;
    if (section.includes('WEB')) {
      // Standardise all web streams as 'LEC' component
      component = 'LEC';
      web = true;
    } else {
      times = this.parseTimeStr(timeString);
      if (times === null || times.length === 0) {
        return null;
      }
    }

    let delivery: DeliveryType | undefined;
    if (times) {
      const onlineTimes = times.filter(t => t.location && t.location.toLowerCase().replace(/[()]/g, '') === 'online');
      if (onlineTimes.length === times.length) {
        delivery = DeliveryType.online;
      } else if (onlineTimes.length === 0) {
        delivery = DeliveryType.person;
      } else {
        delivery = DeliveryType.mixed;
      }
    } else if (web) {
      delivery = DeliveryType.online;
    }

    return {
      component,
      enrols,
      full,
      times,
      web,
      delivery,
    };
  }

  extractTerm (name: string) {
    const matches = / \(([A-Z][A-Z0-9]{2})\)$/.exec(name) || [];
    return matches[1];
  }

  parseTimeStr (timeString: string): ClassTime[] | null {
    // Basic string sanitisation
    timeString = timeString.replace(/\/odd|\/even|Comb\/w.*/g, '').trim();

    // Return empty list if no data has been given
    if (timeString === '') {
      return [];
    }

    if (timeString.indexOf('; ') !== -1) {
      const timeParts = timeString.split('; ');
      const times = timeParts.reduce((a: ClassTime[], t) => a.concat(this._parseTimeStringData(t)), []);

      // Remove any duplicate times
      const timeSet = new Set();
      const finalTimes: ClassTime[] = [];
      for (let time of times) {
        if (!timeSet.has(time.time)) {
          timeSet.add(time.time);
          finalTimes.push(time);
        }
      }

      return finalTimes;
    } else {
      return this._parseTimeStringData(timeString);
    }
  }

  private _parseTimeStringData (data: string): ClassTime[] {
    const openBracketIndex = data.indexOf('(');
    if (openBracketIndex !== -1) {
      const tidiedTime = this.tidyUpTime(data.slice(0, openBracketIndex).trim());
      if (tidiedTime === null) {
        return [];
      }
      const [time, canClash] = tidiedTime;

      const otherDetails = data.slice(openBracketIndex + 1, data.indexOf(')'));
      const weeks = this.getWeeks(otherDetails);
      if (weeks === null) {
        return [];
      }

      const commaIndex = otherDetails.indexOf(', ');
      let location = '';
      if (commaIndex !== -1) {
        location = otherDetails.slice(commaIndex + 2);
      } else if (otherDetails.length > 0 && otherDetails[0] !== 'w') {
        location = otherDetails;
      }

      location = location.toLowerCase() !== 'see school' ? location : '';

      return [{
        time,
        weeks: weeks || undefined,
        location: location || undefined,
        canClash,
      }];
    } else {
      const tidiedTime = this.tidyUpTime(data);
      if (tidiedTime !== null) {
        const [ time, canClash ] = tidiedTime;
        return [{ time, canClash }];
      } else {
        return [];
      }
    }
  }

  private tidyUpTime (time: string): [string, boolean | undefined] | null {
    if (time === '' || time === '00-00') {
      return null;
    }

    const days = {'Mon': 'M', 'Tue': 'T', 'Wed': 'W', 'Thu': 'H', 'Fri': 'F', 'Sat': 'S', 'Sun': 's'};
    for (let [day, letter] of Object.entries(days)) {
      time = time.replace(day + ' ', letter);
    }

    // Use decimal notation for half-hours
    time = time.replace(':30', '.5');

    // Remove leading zeros
    time = time.replace(/(?<=[MTWHFSs])0(?=[0-9])/, '');

    // Don't include courses which run over multiple days (usually intensives) or on weekends
    if (isNaN(+time[1]) || time.toLocaleLowerCase().indexOf('s') !== -1) {
      return null;
    }

    const canClash = time.endsWith('#') ? true : undefined;
    time = time.replace(/#$/, '');

    return [time, canClash];
  }

  private getWeeks (weeks: string) {
    weeks = weeks.split(', ')[0].replace(/^[, ]|[, ]$/g, '');

    if (weeks === '' || weeks[0] !== 'w') {
      return '';
    }

    weeks = weeks.replace(/^w/, '');

    // Don't include classes which only run outside of regular term weeks
    if (/^((11|N[0-9]|< ?1)[, ]*)*$/.test(weeks)) {
      return null;
    }

    return weeks;
  }

  checkStatus (status: string): boolean {
    status = status.replace(/\*$/, '').toLowerCase();
    return status === 'open' || status === 'full';
  }
}
