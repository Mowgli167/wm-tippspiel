export type MatchOption = {
  label: string;
  quote: number;
  row: number;
  col: number;
};

export type Match = {
  id: number;
  phase: string;
  date: string;
  startsAt: string;
  homeTeam: string;
  awayTeam: string;

  homeScore?: number;
  awayScore?: number;

  options: MatchOption[];
};