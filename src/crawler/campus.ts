import { UNSWCrawler } from "./UNSWCrawler";
import { CampusCrawler } from "./CampusCrawler";

export const getCampusCrawler = (campus: string): CampusCrawler | null => {
  switch (campus) {
    case "unsw":
      return new UNSWCrawler();
  }

  return null;
}
