export interface CompetitionResult {
  winner?: string;
  runnerUp?: string;
  semifinalists?: [string, string];
  note?: string;
}

export interface YearResults {
  year: number;
  cup?: CompetitionResult;
  shield?: CompetitionResult;
  silverFox?: CompetitionResult;
  manser?: CompetitionResult;
  pairs?: CompetitionResult;
  plusCup?: CompetitionResult;
  ladiesDay?: CompetitionResult;
}

export const pastResults: YearResults[] = [
  {
    year: 2026,
  },
  {
    year: 2025,
    // Populate as records become available
  },
  {
    year: 2024,
  },
  {
    year: 2023,
  },
];

export function getYearResults(year: number): YearResults | undefined {
  return pastResults.find((r) => r.year === year);
}

export const VALID_YEARS = pastResults.map((r) => r.year);

/** Years whose results are stored in the archived_seasons DB table (not static data). */
export const DB_YEARS: number[] = [2026];
