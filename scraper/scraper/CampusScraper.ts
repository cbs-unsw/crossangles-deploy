import { CourseData } from '../../src/state/Course';
import { MinistryMeta, Meta } from '../../src/state/Meta';
import AsyncQueue from './AsyncQueue';
import HTMLCache from './HTMLCache';
import cheerio from 'cheerio';
import axios from 'axios';

export interface CampusData {
  courses: CourseData[],
  meta: Meta,
}

export abstract class CampusScraper {
  protected abstract readonly additional: CourseData[];
  protected abstract readonly meta: MinistryMeta;
  abstract readonly source: string;
  abstract readonly output: string;
  abstract readonly name: string;
  maxRequests: number = 5;
  cache?: HTMLCache;
  logging = true;

  abstract async scrape (): Promise<CampusData>;

  generateMetaData (term: number): Meta {
    const zfill = (x: string | number, n = 2) => x.toString().padStart(n, '0');
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();

    return {
      term,
      year: term === 1 && currentMonth >= 6 ? currentYear + 1 : currentYear,
      updateDate: `${zfill(currentDay)}/${zfill(currentMonth + 1)}/${currentYear}`,
      updateTime: `${zfill(now.getHours())}:${zfill(now.getMinutes())}`,
      source: this.source,
      signup: process.env.SIGN_UP || '',
      ...this.meta,
    };
  }

  protected async scrapePages<T> (urls: string[], handler: (page: CheerioStatic) => Promise<T>) {
    const queue = new AsyncQueue<string, T>(this.maxRequests);
    queue.enqueue(urls);
    const processor = async (url: string) => handler(await this.getPageContent(url));
    const parsingPromises = await queue.run(processor);
    return await Promise.all(parsingPromises);
  }

  private async getPageContent (url: string) {
    let content: string;
    if (this.cache && this.cache.has(url)) {
      content = this.cache.get(url);
    } else {
      const response = await axios.get<string>(url);
      content = response.data;

      if (this.cache) {
        this.cache.set(url, content);
      }
    }

    const page = cheerio.load(content);
    return page;
  }

  log (...args: any[]) {
    if (this.logging) {
      console.log(`${this.name}:`, ...args);
    }
  }
}
