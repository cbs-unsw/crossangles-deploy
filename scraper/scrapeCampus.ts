import { getCampusScraper } from './scraper';
import { getWriter } from './writer';
import HTMLCache from './scraper/HTMLCache';

export const scrapeCampus = async (campus: string, outputPrefix: string = '', cacheFile?: string) => {
  const scraper = await getCampusScraper(campus);
  scraper.cache = new HTMLCache();

  if (cacheFile) await scraper.cache.load(cacheFile).catch(() => {});

  const data = await scraper.scrape().catch(() => {});

  if (data) {
    if (cacheFile) await scraper.cache.write(cacheFile);

    const destination = `${outputPrefix}${scraper.campus}/data.json`;
    const output = getWriter(destination);
    await output.write(data);
    scraper.log(`written to ${output}`);
  } else {
    scraper.log('no data written');
  }
}

export default scrapeCampus;
