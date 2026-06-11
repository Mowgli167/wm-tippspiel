import {
  calculateFinalPoints,
  isWinningTip,
} from "@/utils";

type Option = {
  label: string;
  quote: number;
  row: number;
  col: number;
};

type MatchCardProps = {
  phase: string;
  date: string;

  homeScore?: number;
  awayScore?: number;

  homeTeam: string;
  awayTeam: string;

  options: Option[];

  selectedTip?: string;

  jokerActive?: boolean;

  showJokerButton?: boolean;

  onSelectTip: (tip: string) => void;

  onToggleJoker?: () => void;
};

function displayTipLabel(
  label: string,
  homeTeam: string,
  awayTeam: string
) {
  switch (label) {
    case "H2":
      return `${homeTeam} gewinnt deutlich`;
    case "H1":
      return `${homeTeam} gewinnt knapp`;
    case "H":
      return `${homeTeam} gewinnt`;
    case "X":
      return "Unentschieden";
    case "A":
      return `${awayTeam} gewinnt`;
    case "A1":
      return `${awayTeam} gewinnt knapp`;
    case "A2":
      return `${awayTeam} gewinnt deutlich`;
    default:
      return label;
  }
}

export default function MatchCard(props: MatchCardProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-cyan-400/25 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 p-6 shadow-2xl space-y-6">
      <div className="absolute right-[-60px] top-[-60px] h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute left-[-40px] bottom-[-40px] h-32 w-32 rounded-full bg-yellow-400/10 blur-3xl" />

      <div className="relative">
        <div className="flex items-center justify-between gap-4">
          <p className="text-cyan-300 text-sm font-semibold tracking-wide uppercase">
            {props.phase}
          </p>

          <p className="text-zinc-400 text-sm">
            {props.date}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
            <p className="text-sm text-zinc-400">
              Heim
            </p>

            <h2 className="text-2xl font-extrabold mt-1">
              {props.homeTeam}
            </h2>
          </div>

          <div className="text-center">
            <div className="text-zinc-400 text-sm">
              vs
            </div>

            {props.homeScore !== undefined &&
            props.awayScore !== undefined ? (
              <div className="mt-2 rounded-2xl border border-red-400/40 bg-red-500/15 px-5 py-3">
                <p className="text-xs text-red-300 font-bold uppercase">
                  Resultat
                </p>

                <p className="text-3xl font-black text-red-200">
                  {props.homeScore}:{props.awayScore}
                </p>
              </div>
            ) : (
              <div className="mt-2 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-3">
                <p className="text-xs text-cyan-300 font-bold uppercase">
                  offen
                </p>
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-right">
            <p className="text-sm text-zinc-400">
              Auswärts
            </p>

            <h2 className="text-2xl font-extrabold mt-1">
              {props.awayTeam}
            </h2>
          </div>
        </div>
      </div>

      <div className="relative grid grid-cols-3 gap-3">
        {props.options.map((option) => {
          const isSelected =
            props.selectedTip === option.label;

          const isWinner =
            props.homeScore !== undefined &&
            props.awayScore !== undefined &&
            isWinningTip(
              props.homeScore,
              props.awayScore,
              option.label
            );

          const points = calculateFinalPoints(
            option.quote,
            props.phase,
            props.jokerActive
          );

          return (
            <button
              key={option.label}
              onClick={() =>
                props.onSelectTip(option.label)
              }
              style={{
                gridColumn: option.col,
                gridRow: option.row,
              }}
              className={`rounded-2xl p-4 text-left transition border shadow-lg min-h-36 flex flex-col justify-between ${
                isWinner
                  ? "bg-emerald-500/25 border-emerald-300 ring-2 ring-emerald-300/40"
                  : isSelected
                    ? "bg-cyan-500/25 border-cyan-300 ring-2 ring-cyan-300/40"
                    : "bg-slate-950/70 border-slate-700 hover:border-cyan-400/60 hover:bg-slate-800"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-base font-black leading-tight">
                    {displayTipLabel(
                      option.label,
                      props.homeTeam,
                      props.awayTeam
                    )}
                  </p>

                  <div className="flex flex-col gap-1 items-end">
                    {isSelected && (
                      <span className="text-xs rounded-full bg-cyan-300 text-slate-950 px-2 py-1 font-bold">
                        Tipp
                      </span>
                    )}

                    {isWinner && (
                      <span className="text-xs rounded-full bg-emerald-300 text-slate-950 px-2 py-1 font-bold">
                        Richtig
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-sm text-zinc-300">
                  Quote{" "}
                  <span className="font-bold text-white">
                    {option.quote}
                  </span>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-white/5 px-3 py-2 flex items-center justify-between">
                <span className="text-xs text-zinc-400">
                  Punkte
                </span>

                <span className="text-lg font-black text-yellow-300">
                  {points}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {props.showJokerButton && (
        <button
          onClick={props.onToggleJoker}
          className={`relative w-full rounded-2xl px-5 py-4 font-black tracking-wide transition ${
            props.jokerActive
              ? "bg-yellow-300 text-slate-950 shadow-[0_0_30px_rgba(250,204,21,0.35)]"
              : "bg-slate-950 border border-yellow-400/40 text-yellow-300 hover:bg-yellow-400/10"
          }`}
        >
          {props.jokerActive
            ? "⭐ JOKER AKTIV"
            : "⭐ JOKER SETZEN"}
        </button>
      )}
    </section>
  );
}