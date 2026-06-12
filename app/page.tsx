"use client";

import Link from "next/link";

import { matches } from "@/data/matches";
import { useAllTips } from "@/hooks/useAllTips";
import { usePlayers } from "@/hooks/usePlayers";
import { calculateFinalPoints, isWinningTip } from "@/utils";

const TOTAL_WORLD_CUP_MATCHES = 104;

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

export default function HomePage() {
  const { players } = usePlayers();
  const { allTips } = useAllTips();

  const finishedMatches = matches.filter(
    (match) =>
      match.homeScore !== undefined &&
      match.awayScore !== undefined
  );

  const latestResult = [...finishedMatches].sort(
    (a, b) =>
      new Date(b.startsAt).getTime() -
      new Date(a.startsAt).getTime()
  )[0];

  const nextMatch = [...matches]
    .filter((match) => new Date(match.startsAt) > new Date())
    .sort(
      (a, b) =>
        new Date(a.startsAt).getTime() -
        new Date(b.startsAt).getTime()
    )[0];

  function calculatePlayerPoints(playerId: number) {
    const playerTips = allTips.filter(
      (tip) => tip.player_id === playerId
    );

    return playerTips.reduce((total, storedTip) => {
      if (!storedTip.tip) return total;

      const match = matches.find(
        (m) => m.id === storedTip.match_id
      );

      if (
        !match ||
        match.homeScore === undefined ||
        match.awayScore === undefined
      ) {
        return total;
      }

      const hasWon = isWinningTip(
        match.homeScore,
        match.awayScore,
        storedTip.tip
      );

      if (!hasWon) return total;

      const selectedOption = match.options.find(
        (option) => option.label === storedTip.tip
      );

      if (!selectedOption) return total;

      return (
        total +
        calculateFinalPoints(
          selectedOption.quote,
          match.phase,
          storedTip.joker ?? false
        )
      );
    }, 0);
  }

  const topThree = players
    .map((player) => ({
      id: player.id,
      name: player.name,
      points: calculatePlayerPoints(player.id),
    }))
    .sort((a, b) => b.points - a.points)
    .slice(0, 3);

  const biggestCoup = allTips
    .map((storedTip) => {
      if (!storedTip.tip) return null;

      const match = matches.find(
        (m) => m.id === storedTip.match_id
      );

      const player = players.find(
        (p) => p.id === storedTip.player_id
      );

      if (
        !match ||
        !player ||
        match.homeScore === undefined ||
        match.awayScore === undefined
      ) {
        return null;
      }

      const hasWon = isWinningTip(
        match.homeScore,
        match.awayScore,
        storedTip.tip
      );

      if (!hasWon) return null;

      const selectedOption = match.options.find(
        (option) => option.label === storedTip.tip
      );

      if (!selectedOption) return null;

      const points = calculateFinalPoints(
        selectedOption.quote,
        match.phase,
        storedTip.joker ?? false
      );

      return {
        playerName: player.name,
        match,
        tip: storedTip.tip,
        quote: selectedOption.quote,
        points,
        joker: storedTip.joker ?? false,
      };
    })
    .filter(
      (coup): coup is NonNullable<typeof coup> =>
        coup !== null
    )
    .sort((a, b) => b.points - a.points)[0];

  const remainingMatches =
    TOTAL_WORLD_CUP_MATCHES - finishedMatches.length;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 p-6 md:p-10 text-white">
      <section className="max-w-6xl mx-auto space-y-8">
        <div className="relative overflow-hidden rounded-3xl border border-cyan-400/30 bg-white/5 p-8 md:p-10 shadow-2xl">
          <div className="absolute right-[-80px] top-[-80px] h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute left-[-60px] bottom-[-60px] h-44 w-44 rounded-full bg-yellow-400/10 blur-3xl" />

          <div className="relative">
            <p className="text-cyan-300 font-semibold tracking-wide">
              FIFA WORLD CUP 2026
            </p>

            <h1 className="text-5xl md:text-7xl font-extrabold mt-3">
              WM Tippspiel 2026
            </h1>

            <p className="text-zinc-300 mt-5 text-lg max-w-2xl">
              Willkommen zum familieninternen Quotentippspiel ⚽
              Tippen, Joker setzen, Bonusfragen beantworten und um die Spitze kämpfen.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/tipps"
                className="rounded-2xl bg-cyan-400 px-6 py-4 text-slate-950 font-black hover:bg-cyan-300 transition text-center"
              >
                🎯 Zu den Tipps
              </Link>

              <Link
                href="/tabelle"
                className="rounded-2xl border border-yellow-400/50 bg-yellow-400/10 px-6 py-4 text-yellow-300 font-black hover:bg-yellow-400/20 transition text-center"
              >
                🏆 Zur Tabelle
              </Link>
            </div>
          </div>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-3xl border border-cyan-400/25 bg-slate-900/90 p-6 shadow-xl">
            <p className="text-4xl">⚽</p>
            <h2 className="text-2xl font-extrabold mt-4">
              Spielübersicht
            </h2>

            {latestResult ? (
              <>
                <p className="text-zinc-400 mt-4">
                  Letztes Ergebnis
                </p>

                <p className="text-3xl font-black mt-1">
                  {latestResult.homeTeam}{" "}
                  {latestResult.homeScore}:{latestResult.awayScore}{" "}
                  {latestResult.awayTeam}
                </p>
              </>
            ) : (
              <p className="text-zinc-400 mt-3">
                Noch kein Spiel ausgewertet.
              </p>
            )}

            <div className="mt-5 border-t border-white/10 pt-5">
              <p className="text-zinc-400">
                Nächstes Spiel
              </p>

              {nextMatch ? (
                <>
                  <p className="text-2xl font-black mt-1">
                    {nextMatch.homeTeam} – {nextMatch.awayTeam}
                  </p>

                  <p className="text-cyan-300 font-semibold mt-2">
                    {nextMatch.date}
                  </p>
                </>
              ) : (
                <p className="text-zinc-400 mt-2">
                  Kein weiteres Spiel eingetragen.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-yellow-400/25 bg-slate-900/90 p-6 shadow-xl">
            <p className="text-4xl">👑</p>
            <h2 className="text-2xl font-extrabold mt-4">
              Top 3
            </h2>

            <div className="mt-4 space-y-3">
              {topThree.map((player, index) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3"
                >
                  <span className="font-bold">
                    {index === 0
                      ? "🥇"
                      : index === 1
                      ? "🥈"
                      : "🥉"}{" "}
                    {player.name}
                  </span>

                  <span className="text-yellow-300 font-black">
                    {player.points}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-cyan-400/25 bg-slate-900/90 p-6 shadow-xl">
            <p className="text-4xl">📊</p>
            <h2 className="text-2xl font-extrabold mt-4">
              Turnierstatus
            </h2>

            <p className="text-zinc-300 mt-4">
              {players.length} Teilnehmer
            </p>

            <p className="text-zinc-300 mt-2">
              {remainingMatches} Spiele ausstehend
            </p>
          </div>

          <div className="rounded-3xl border border-emerald-400/25 bg-slate-900/90 p-6 shadow-xl">
            <p className="text-4xl">🎯</p>
            <h2 className="text-2xl font-extrabold mt-4">
              Größter Coup
            </h2>

            {biggestCoup ? (
              <>
                <p className="text-2xl font-black mt-3">
                  {biggestCoup.playerName}
                </p>

                <p className="text-zinc-300 mt-2">
                  {displayTipLabel(
                    biggestCoup.tip,
                    biggestCoup.match.homeTeam,
                    biggestCoup.match.awayTeam
                  )}
                </p>

                <p className="text-zinc-400 mt-1">
                  Quote {biggestCoup.quote}
                  {biggestCoup.joker ? " · Joker ⭐" : ""}
                </p>

                <p className="text-yellow-300 text-3xl font-black mt-3">
                  {biggestCoup.points} Punkte
                </p>
              </>
            ) : (
              <p className="text-zinc-400 mt-3">
                Noch kein gewonnener Tipp.
              </p>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}