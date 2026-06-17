"use client";

import { matches } from "@/data/matches";
import { useAllTips } from "@/hooks/useAllTips";
import { usePlayers } from "@/hooks/usePlayers";
import { calculateFinalPoints, isWinningTip } from "@/utils";

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

export default function AuswertungPage() {
  const { players, loading, errorMessage } = usePlayers();
  const { allTips, loadingAllTips } = useAllTips();

  function isMatchVisible(startsAt: string) {
    return new Date() >= new Date(startsAt);
  }

  function getPointsForTip(
    match: (typeof matches)[number],
    tip: string | null,
    joker: boolean | null
  ) {
    if (!tip) return 0;

    if (
      match.homeScore === undefined ||
      match.awayScore === undefined
    ) {
      return 0;
    }

    const hasWon = isWinningTip(
      match.homeScore,
      match.awayScore,
      tip
    );

    if (!hasWon) return 0;

    const selectedOption = match.options.find(
      (option) => option.label === tip
    );

    if (!selectedOption) return 0;

    return calculateFinalPoints(
      selectedOption.quote,
      match.phase,
      joker ?? false
    );
  }

  const visibleMatches = matches
    .filter((match) => isMatchVisible(match.startsAt))
    .sort(
      (a, b) =>
        new Date(b.startsAt).getTime() -
        new Date(a.startsAt).getTime()
    );

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 p-6 md:p-10 space-y-8 text-white">
      <section className="rounded-3xl border border-cyan-400/30 bg-white/5 p-8 shadow-2xl">
        <p className="text-cyan-300 font-semibold tracking-wide">
          FIFA WORLD CUP 2026
        </p>

        <h1 className="text-5xl font-extrabold mt-2">
          Auswertung
        </h1>

        <p className="text-zinc-300 mt-3">
          Hier siehst du nach Spielbeginn, wer was getippt hat.
        </p>
      </section>

      {(loading || loadingAllTips) && (
        <p className="text-zinc-400">
          Lade Auswertung...
        </p>
      )}

      {errorMessage && (
        <p className="text-red-400">
          Supabase-Fehler: {errorMessage}
        </p>
      )}

      <section className="space-y-6">
        {visibleMatches.length === 0 ? (
          <section className="rounded-2xl border border-cyan-500/20 bg-slate-900/90 p-6">
            <p className="text-zinc-300">
              Noch kein Spiel wurde freigegeben.
            </p>
          </section>
        ) : (
          visibleMatches.map((match) => {
            const matchTips = players.map((player) => {
              const storedTip = allTips.find(
                (tip) =>
                  tip.player_id === player.id &&
                  tip.match_id === match.id
              );

              const points = getPointsForTip(
                match,
                storedTip?.tip ?? null,
                storedTip?.joker ?? false
              );

              return {
                player,
                tip: storedTip?.tip ?? null,
                joker: storedTip?.joker ?? false,
                points,
              };
            });

            const sortedTips = [...matchTips].sort(
              (a, b) => b.points - a.points
            );

            const hasResult =
              match.homeScore !== undefined &&
              match.awayScore !== undefined;

            return (
              <section
                key={match.id}
                className="rounded-3xl border border-cyan-400/25 bg-slate-900/90 p-6 shadow-xl space-y-5"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-cyan-300 font-semibold">
                      {match.date} · {match.phase}
                    </p>

                    <h2 className="text-3xl font-extrabold mt-1">
                      {match.homeTeam} – {match.awayTeam}
                    </h2>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-center">
                    <p className="text-xs text-zinc-400 uppercase font-bold">
                      Ergebnis
                    </p>

                    <p className="text-3xl font-black text-yellow-300">
                      {hasResult
                        ? `${match.homeScore}:${match.awayScore}`
                        : "offen"}
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-white/10">
                  <div className="min-w-[720px]">
                    <div className="grid grid-cols-[1fr_1.5fr_auto_auto] gap-3 bg-slate-950/80 px-4 py-3 text-sm font-bold text-zinc-400">
                      <div>Spieler</div>
                      <div>Tipp</div>
                      <div>Joker</div>
                      <div className="text-right">Punkte</div>
                    </div>

                    <div className="divide-y divide-white/10">
                      {sortedTips.map((entry) => (
                        <div
                          key={entry.player.id}
                          className="grid grid-cols-[1fr_1.5fr_auto_auto] gap-3 px-4 py-4 items-center"
                        >
                          <div className="font-bold">
                            {entry.player.name}
                          </div>

                          <div className="text-zinc-300">
                            {entry.tip
                              ? displayTipLabel(
                                  entry.tip,
                                  match.homeTeam,
                                  match.awayTeam
                                )
                              : "Kein Tipp"}
                          </div>

                          <div className="text-center">
                            {entry.joker ? "⭐" : "–"}
                          </div>

                          <div className="text-right font-black text-yellow-300">
                            {entry.points}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            );
          })
        )}
      </section>
    </main>
  );
}