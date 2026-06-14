"use client";

import { bonusQuestions } from "@/data/bonusQuestions";
import { bonusResults } from "@/data/bonusResults";
import { matches } from "@/data/matches";
import { useAllBonusTips } from "@/hooks/useAllBonusTips";
import { useAllTips } from "@/hooks/useAllTips";
import { usePlayers } from "@/hooks/usePlayers";

import {
  calculateFinalPoints,
  calculatePoints,
  isWinningTip,
} from "@/utils";

const teams = [
  {
    name: "Team Prince Polo",
    flag: "🇵🇱",
    playerIds: [2, 3],
  },
  {
    name: "Team Toblerone",
    flag: "🇨🇭",
    playerIds: [8, 9],
  },
  {
    name: "Team Kartoffel",
    flag: "🇩🇪",
    playerIds: [1, 7],
  },
];

export default function TabellePage() {
  const { players, loading, errorMessage } = usePlayers();
  const { allTips, loadingAllTips } = useAllTips();
  const { allBonusTips, loadingAllBonusTips } =
    useAllBonusTips();

  function calculatePlayerMatchPoints(playerId: number) {
    const playerTips = allTips.filter(
      (tip) => tip.player_id === playerId
    );

    return playerTips.reduce((total, storedTip) => {
      if (!storedTip.tip) return total;

      const match = matches.find(
        (m) => m.id === storedTip.match_id
      );

      if (!match) return total;

      if (
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

  function calculatePlayerBonusPoints(playerId: number) {
    const playerBonusTips = allBonusTips.filter(
      (tip) => tip.player_id === playerId
    );

    return playerBonusTips.reduce((total, storedBonusTip) => {
      const correctAnswer =
        bonusResults[storedBonusTip.question];

      if (!correctAnswer) return total;

      if (storedBonusTip.answer !== correctAnswer) {
        return total;
      }

      const question = bonusQuestions.find(
        (bonusQuestion) =>
          bonusQuestion.id === storedBonusTip.question
      );

      if (!question) return total;

      const selectedOption = question.options.find(
        (option) => option.label === storedBonusTip.answer
      );

      if (!selectedOption) return total;

      return total + calculatePoints(selectedOption.quote);
    }, 0);
  }

  function calculatePlayerTotalPoints(playerId: number) {
    return (
      calculatePlayerMatchPoints(playerId) +
      calculatePlayerBonusPoints(playerId)
    );
  }

  const leaderboard = players
    .map((player) => {
      const matchPoints =
        calculatePlayerMatchPoints(player.id);

      const bonusPoints =
        calculatePlayerBonusPoints(player.id);

      return {
        id: player.id,
        name: player.name,
        matchPoints,
        bonusPoints,
        points: matchPoints + bonusPoints,
      };
    })
    .sort((a, b) => b.points - a.points);

  const teamLeaderboard = teams
    .map((team) => {
      const members = team.playerIds
        .map((playerId) =>
          players.find((player) => player.id === playerId)
        )
        .filter(
          (player): player is NonNullable<typeof player> =>
            player !== undefined
        );

      const points = team.playerIds.reduce(
        (total, playerId) =>
          total + calculatePlayerTotalPoints(playerId),
        0
      );

      return {
        ...team,
        members,
        points,
      };
    })
    .sort((a, b) => b.points - a.points);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 p-6 md:p-10 space-y-8 text-white">
      <section className="rounded-3xl border border-cyan-400/30 bg-white/5 p-8 shadow-2xl">
        <p className="text-cyan-300 font-semibold tracking-wide">
          FIFA WORLD CUP 2026
        </p>

        <h1 className="text-5xl font-extrabold mt-2">
          Tabelle
        </h1>

        <p className="text-zinc-300 mt-3">
          Rangliste mit Spielpunkten, Bonuspunkten und Gesamtstand.
        </p>
      </section>

      {(loading || loadingAllTips || loadingAllBonusTips) && (
        <p className="text-zinc-400">
          Lade Rangliste...
        </p>
      )}

      {errorMessage && (
        <p className="text-red-400">
          Supabase-Fehler: {errorMessage}
        </p>
      )}

      <section className="bg-slate-900/90 border border-cyan-500/20 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-2xl font-bold">
          🏆 Rangliste
        </h2>

        <div className="space-y-3">
          {leaderboard.map((player, index) => (
            <div
              key={player.id}
              className={`grid grid-cols-[auto_1fr_auto] gap-4 items-center rounded-xl px-4 py-4 ${
                index === 0
                  ? "bg-yellow-400/20 border border-yellow-400"
                  : index === 1
                  ? "bg-slate-200/10 border border-slate-300"
                  : index === 2
                  ? "bg-orange-500/20 border border-orange-400"
                  : "bg-blue-950/70 border border-cyan-500/30"
              }`}
            >
              <div className="text-2xl font-extrabold">
                {index === 0
                  ? "🥇"
                  : index === 1
                  ? "🥈"
                  : index === 2
                  ? "🥉"
                  : `${index + 1}.`}
              </div>

              <div>
                <p className="text-lg font-bold">
                  {player.name}
                </p>

                <p className="text-sm text-zinc-400">
                  Spiele {player.matchPoints} · Bonus{" "}
                  {player.bonusPoints}
                </p>
              </div>

              <div className="text-right">
                <p className="text-2xl font-extrabold text-yellow-300">
                  {player.points}
                </p>

                <p className="text-xs text-zinc-400">
                  Punkte
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-900/90 border border-yellow-400/20 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-2xl font-bold">
          🤝 Teamwertung
        </h2>

        <div className="space-y-3">
          {teamLeaderboard.map((team, index) => (
            <div
              key={team.name}
              className={`grid grid-cols-[auto_1fr_auto] gap-4 items-center rounded-xl px-4 py-4 ${
                index === 0
                  ? "bg-yellow-400/20 border border-yellow-400"
                  : index === 1
                  ? "bg-slate-200/10 border border-slate-300"
                  : index === 2
                  ? "bg-orange-500/20 border border-orange-400"
                  : "bg-blue-950/70 border border-cyan-500/30"
              }`}
            >
              <div className="text-2xl font-extrabold">
                {index === 0
                  ? "🥇"
                  : index === 1
                  ? "🥈"
                  : index === 2
                  ? "🥉"
                  : `${index + 1}.`}
              </div>

              <div>
                <p className="text-lg font-bold">
                  {team.flag} {team.name}
                </p>

                <p className="text-sm text-zinc-400">
                  {team.members
                    .map((member) => member.name)
                    .join(" + ")}
                </p>
              </div>

              <div className="text-right">
                <p className="text-2xl font-extrabold text-yellow-300">
                  {team.points}
                </p>

                <p className="text-xs text-zinc-400">
                  Punkte
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}