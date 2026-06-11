export function calculatePoints(
  quote: number
) {
  return Math.floor(
    (quote - 1) * 10
  );
}

export function calculateFinalPoints(
  quote: number,
  phase: string,
  jokerActive?: boolean
) {
  const basePoints =
    calculatePoints(quote);

  const phaseMultipliers: Record<string, number> = {
    Vorrunde: 1,
    Sechzehntelfinale: 2,
    Achtelfinale: 3,
    Viertelfinale: 4,
    Halbfinale: 5,
    Finale: 6,
  };

  const multiplier =
    phaseMultipliers[phase] ?? 1;

  let total =
    basePoints * multiplier;

  if (jokerActive) {
    total *= 2;
  }

  return total;
}

export function enrichOptions(
  options: {
    label: string;
    quote: number;
  }[]
): {
  label: string;
  quote: number;
  row: number;
  col: number;
}[] {
  const positions: Record<
    string,
    { row: number; col: number }
  > = {
    H2: { row: 1, col: 1 },
    X: { row: 2, col: 2 },
    A2: { row: 1, col: 3 },

    H1: { row: 2, col: 1 },
    A1: { row: 2, col: 3 },

    H: { row: 3, col: 1 },
    A: { row: 3, col: 3 },
  };

  return options.map((option) => ({
    ...option,
    ...positions[option.label],
  }));
}

export function isWinningTip(
  homeScore: number,
  awayScore: number,
  tip: string
) {
  const diff =
    homeScore - awayScore;

  switch (tip) {
    case "H":
      return diff > 0;

    case "H1":
      return diff === 1;

    case "H2":
      return diff >= 2;

    case "X":
      return diff === 0;

    case "A":
      return diff < 0;

    case "A1":
      return diff === -1;

    case "A2":
      return diff <= -2;

    default:
      return false;
  }
}