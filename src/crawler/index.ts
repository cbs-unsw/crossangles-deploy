require('dotenv').config();

import { writeFileSync } from 'fs';
import { getCampusCrawler } from './campus';
import { CampusCrawler } from './CampusCrawler';

const crawlCampus = async (crawler: CampusCrawler) => {
  const data = await crawler.crawl();

  writeFileSync(crawler.output, data, 'utf-8');
  crawler.log(`written to "${crawler.output}"`);
}

const main = async () => {
  const args = process.argv.slice(2);
  const promises: Promise<void>[] = [];
  for (let campus of args) {
    const crawler = getCampusCrawler(campus);
    if (crawler) {
      const promise = crawlCampus(crawler);
      promise.catch(e => {
        crawler.error(e);
        process.exitCode = 1;
      });
      promises.push(promise);
    } else {
      console.warn(`[WARNING] No crawler found for ${campus}`);
      process.exitCode = 1;
    }
  }

  for (const promise of promises) {
    await promise;
  }
}

main();
