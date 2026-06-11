"use client";

import { useEffect, useState } from "react";

import MatchCard from "@/components/MatchCard";
import { matches } from "@/data/matches";
import { usePlayerTips } from "@/hooks/usePlayerTips";
import { usePlayers } from "@/hooks/usePlayers";
import { calculateFinalPoints, isWinningTip } from "@/utils";

function flagForTeam(team: string) {
  const flags: Record<string, string> = {
    Deutschland: "🇩🇪",
    Frankreich: "🇫🇷",
    Spanien: "🇪🇸",
    Italien: "🇮🇹",
    England: "🏴",
    Brasilien: "🇧🇷",
    Argentinien: "🇦🇷",
    Portugal: "🇵🇹",
    Niederlande: "🇳🇱",
    Mexiko: "🇲🇽",
    USA: "🇺🇸",
    Kanada: "🇨🇦",
    Japan: "🇯🇵",
    Schweiz: "🇨🇭",
    Kroatien: "🇭🇷",
    Marokko: "🇲🇦",
    Uruguay: "🇺🇾",
    Südkorea: "🇰🇷",
    Tschechien: "🇨🇿",
    Südafrika: "🇿🇦",
    Katar: "🇶🇦",
    Ghana: "🇬🇭",
    Australien: "🇦🇺",
  };

  return flags[team] ?? "";
}

function withFlag(team: string) {
  const flag = flagForTeam(team);
  return flag ? `${flag} ${team}` : team;
}

export default function TippsPage() {
  const { players, loading, errorMessage } = usePlayers();

  const [currentPlayerId, setCurrentPlayerId] =
    useState<number | undefined>(undefined);

  const [selectedLoginPlayerId, setSelectedLoginPlayerId] =
    useState<number | undefined>(undefined);

  const [pinInput, setPinInput] = useState("");
  const [loginError, setLoginError] = useState("");

  const [openPhases, setOpenPhases] =
    useState<Record<string, boolean>>({
      Vorrunde: true,
      Sechzehntelfinale: true,
      Achtelfinale: true,
      Viertelfinale: true,
      Halbfinale: true,
      Finale: true,
    });

  const {
    selectedTips,
    jokerMatches,
    loadingTips,
    saveTip,
    saveJoker,
  } = usePlayerTips(currentPlayerId);

  useEffect(() => {
    const savedPlayerId =
      localStorage.getItem("currentPlayerId");

    if (savedPlayerId) {
      setCurrentPlayerId(Number(savedPlayerId));
    }
  }, []);

  useEffect(() => {
    if (
      selectedLoginPlayerId === undefined &&
      players.length > 0
    ) {
      setSelectedLoginPlayerId(players[0].id);
    }
  }, [selectedLoginPlayerId, players]);

  const currentPlayer = players.find(
    (player) => player.id === currentPlayerId
  );

  const currentPlayerName =
    currentPlayer?.name ?? "Spieler";

  const isLoggedIn = currentPlayerId !== undefined;

  const jokerLimits: Record<string, number> = {
    Vorrunde: 4,
    Sechzehntelfinale: 3,
    Achtelfinale: 2,
    Viertelfinale: 1,
  };

  function isMatchLocked(startsAt: string) {
    return new Date() >= new Date(startsAt);
  }

  function login() {
    const player = players.find(
      (p) => p.id === selectedLoginPlayerId
    );

    if (!player) {
      setLoginError("Spieler nicht gefunden.");
      return;
    }

    if (player.pin !== pinInput) {
      setLoginError("Falsche PIN.");
      return;
    }

    setCurrentPlayerId(player.id);
    localStorage.setItem(
      "currentPlayerId",
      String(player.id)
    );

    setPinInput("");
    setLoginError("");
  }

  function logout() {
    setCurrentPlayerId(undefined);
    localStorage.removeItem("currentPlayerId");
    setPinInput("");
    setLoginError("");
  }

  async function selectTip(matchId: number, tip: string) {
    if (!isLoggedIn) return;

    const match = matches.find((m) => m.id === matchId);
    if (!match) return;

    if (isMatchLocked(match.startsAt)) {
      alert(
        "Dieses Spiel hat bereits begonnen. Tipps können nicht mehr geändert werden."
      );
      return;
    }

    await saveTip(matchId, tip);
  }

  async function toggleJoker(matchId: number) {
    if (!isLoggedIn) return;

    const match = matches.find((m) => m.id === matchId);
    if (!match) return;

    if (isMatchLocked(match.startsAt)) {
      alert(
        "Dieses Spiel hat bereits begonnen. Joker können nicht mehr geändert werden."
      );
      return;
    }

    const alreadySelected = jokerMatches.includes(matchId);

    const currentJokersInPhase = jokerMatches.filter((id) => {
      const jokerMatch = matches.find((m) => m.id === id);
      return jokerMatch?.phase === match.phase;
    }).length;

    if (!alreadySelected) {
      const limit = jokerLimits[match.phase] ?? 0;

      if (currentJokersInPhase >= limit) {
        alert(`Maximal ${limit} Joker in ${match.phase}`);
        return;
      }
    }

    await saveJoker(matchId, !alreadySelected);
  }

  function togglePhase(phase: string) {
    setOpenPhases({
      ...openPhases,
      [phase]: !openPhases[phase],
    });
  }

  const totalPossiblePoints = matches.reduce((total, match) => {
    const selectedTip = selectedTips[match.id];

    if (!selectedTip) return total;

    const selectedOption = match.options.find(
      (option) => option.label === selectedTip
    );

    if (!selectedOption) return total;

    return (
      total +
      calculateFinalPoints(
        selectedOption.quote,
        match.phase,
        jokerMatches.includes(match.id)
      )
    );
  }, 0);

  const totalWonPoints = matches.reduce((total, match) => {
    const selectedTip = selectedTips[match.id];

    if (!selectedTip) return total;

    if (
      match.homeScore === undefined ||
      match.awayScore === undefined
    ) {
      return total;
    }

    const hasWon = isWinningTip(
      match.homeScore,
      match.awayScore,
      selectedTip
    );

    if (!hasWon) return total;

    const selectedOption = match.options.find(
      (option) => option.label === selectedTip
    );

    if (!selectedOption) return total;

    return (
      total +
      calculateFinalPoints(
        selectedOption.quote,
        match.phase,
        jokerMatches.includes(match.id)
      )
    );
  }, 0);

  const groupedMatches = matches.reduce(
    (groups, match) => {
      if (!groups[match.phase]) {
        groups[match.phase] = [];
      }

      groups[match.phase].push(match);
      return groups;
    },
    {} as Record<string, typeof matches>
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 p-10 space-y-8 text-white">
      <section className="rounded-3xl border border-cyan-400/30 bg-white/5 p-8 shadow-2xl">
        <p className="text-cyan-300 font-semibold tracking-wide">
          FIFA WORLD CUP 2026
        </p>

        <h1 className="text-5xl font-extrabold mt-2">
          Tipps
        </h1>

        <p className="text-zinc-300 mt-3">
          Spiele tippen, Joker setzen und Punkte sammeln.
        </p>
      </section>

      {!isLoggedIn && (
        <section className="bg-slate-900/90 border border-cyan-500/20 rounded-2xl p-6 space-y-4">
          <h2 className="text-2xl font-bold">Einloggen</h2>

          <label className="block text-zinc-300">
            Spieler auswählen
          </label>

          <select
            value={selectedLoginPlayerId ?? ""}
            onChange={(event) =>
              setSelectedLoginPlayerId(
                Number(event.target.value)
              )
            }
            className="bg-slate-950 border border-cyan-500/30 rounded-xl px-4 py-3 text-white w-full md:w-80"
          >
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name}
              </option>
            ))}
          </select>

          <input
            type="password"
            inputMode="numeric"
            placeholder="PIN eingeben"
            value={pinInput}
            onChange={(event) =>
              setPinInput(event.target.value)
            }
            className="bg-slate-950 border border-cyan-500/30 rounded-xl px-4 py-3 text-white w-full md:w-80 block"
          />

          {loginError && (
            <p className="text-red-400">{loginError}</p>
          )}

          {loading && (
            <p className="text-zinc-400">
              Lade Spieler...
            </p>
          )}

          {errorMessage && (
            <p className="text-red-400">
              Supabase-Fehler: {errorMessage}
            </p>
          )}

          <button
            onClick={login}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition px-6 py-3 rounded-xl font-bold"
          >
            Einloggen
          </button>
        </section>
      )}

      {isLoggedIn && (
        <section className="bg-slate-900/90 border border-cyan-500/20 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-zinc-400">
              Eingeloggt als
            </p>

            <p className="text-2xl font-bold">
              {currentPlayerName}
            </p>
          </div>

          <button
            onClick={logout}
            className="bg-slate-700 hover:bg-slate-600 transition px-5 py-3 rounded-xl font-semibold"
          >
            Ausloggen
          </button>
        </section>
      )}

      {isLoggedIn && (
        <section className="bg-slate-900/90 border border-yellow-400/30 rounded-2xl p-6 space-y-2">
          <p className="text-zinc-300">
            Gewonnene Spielpunkte
          </p>

          <p className="text-5xl font-extrabold text-yellow-300">
            {totalWonPoints}
          </p>

          <p className="text-zinc-300 pt-2">
            Mögliche Spielpunkte:{" "}
            <span className="text-emerald-300 font-semibold">
              {totalPossiblePoints}
            </span>
          </p>
        </section>
      )}

      {isLoggedIn && (
        <>
          {loadingTips && (
            <p className="text-zinc-400">
              Lade Tipps...
            </p>
          )}

          {Object.entries(groupedMatches).map(
            ([phase, phaseMatches]) => (
              <section key={phase} className="space-y-4">
                <button
                  onClick={() => togglePhase(phase)}
                  className="w-full text-left bg-slate-900/90 hover:bg-slate-800 transition rounded-2xl px-6 py-4 border border-cyan-500/20"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold">
                      {phase}
                    </h2>

                    <span className="text-2xl">
                      {openPhases[phase] ? "−" : "+"}
                    </span>
                  </div>
                </button>

                {openPhases[phase] && (
                  <div className="space-y-6">
                    {phaseMatches.map((match) => {
                      const locked = isMatchLocked(
                        match.startsAt
                      );

                      return (
                        <div
                          key={match.id}
                          className="space-y-2"
                        >
                          {locked && (
                            <p className="text-red-400 font-semibold">
                              🔒 Dieses Spiel ist gesperrt.
                            </p>
                          )}

                          <MatchCard
                            phase={match.phase}
                            date={match.date}
                            homeScore={match.homeScore}
                            awayScore={match.awayScore}
                            homeTeam={withFlag(match.homeTeam)}
                            awayTeam={withFlag(match.awayTeam)}
                            options={match.options}
                            selectedTip={
                              selectedTips[match.id]
                            }
                            jokerActive={jokerMatches.includes(
                              match.id
                            )}
                            showJokerButton={
                              (jokerLimits[match.phase] ?? 0) >
                              0
                            }
                            onSelectTip={(tip) =>
                              selectTip(match.id, tip)
                            }
                            onToggleJoker={() =>
                              toggleJoker(match.id)
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )
          )}
        </>
      )}
    </main>
  );
}