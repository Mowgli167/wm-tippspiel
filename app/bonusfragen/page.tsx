"use client";

import { useEffect, useState } from "react";

import { bonusQuestions } from "@/data/bonusQuestions";
import { matches } from "@/data/matches";
import { useBonusTips } from "@/hooks/useBonusTips";
import { usePlayers } from "@/hooks/usePlayers";
import { calculatePoints } from "@/utils";

export default function BonusfragenPage() {
  const { players, loading, errorMessage } = usePlayers();

  const [currentPlayerId, setCurrentPlayerId] =
    useState<number | undefined>(undefined);

  const {
    bonusTips,
    loading: loadingBonusTips,
    saveBonusTip,
  } = useBonusTips(currentPlayerId);

  useEffect(() => {
    const savedPlayerId =
      localStorage.getItem("currentPlayerId");

    if (savedPlayerId) {
      setCurrentPlayerId(Number(savedPlayerId));
    }
  }, []);

  const currentPlayer = players.find(
    (player) => player.id === currentPlayerId
  );

  const currentPlayerName =
    currentPlayer?.name ?? "Spieler";

  const isLoggedIn = currentPlayerId !== undefined;

  const firstMatchStart = matches[0]?.startsAt;

  const bonusQuestionsLocked =
    firstMatchStart !== undefined &&
    new Date() >= new Date(firstMatchStart);

  const totalPossibleBonusPoints =
    bonusQuestions.reduce((total, question) => {
      const selectedAnswer = bonusTips[question.id];

      if (!selectedAnswer) return total;

      const selectedOption = question.options.find(
        (option) => option.label === selectedAnswer
      );

      if (!selectedOption) return total;

      return total + calculatePoints(selectedOption.quote);
    }, 0);

  async function selectBonusTip(
    questionId: string,
    answer: string
  ) {
    if (!isLoggedIn) return;

    if (bonusQuestionsLocked) {
      alert(
        "Die Bonusfragen sind gesperrt. Änderungen sind nicht mehr möglich."
      );
      return;
    }

    await saveBonusTip(questionId, answer);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 p-10 space-y-8 text-white">
      <section className="rounded-3xl border border-cyan-400/30 bg-white/5 p-8 shadow-2xl">
        <p className="text-cyan-300 font-semibold tracking-wide">
          FIFA WORLD CUP 2026
        </p>

        <h1 className="text-5xl font-extrabold mt-2">
          Bonusfragen
        </h1>

        <p className="text-zinc-300 mt-3">
          Weltmeister, Torschützenkönig und Gruppensieger tippen.
        </p>
      </section>

      {!isLoggedIn && (
        <section className="bg-slate-900/90 border border-red-500/30 rounded-2xl p-6">
          <p className="text-red-300 font-semibold">
            Bitte zuerst auf der Tipps-Seite einloggen.
          </p>
        </section>
      )}

      {isLoggedIn && (
        <>
          <section className="bg-slate-900/90 border border-cyan-500/20 rounded-2xl p-6 space-y-2">
            <p className="text-zinc-400">
              Eingeloggt als
            </p>

            <p className="text-2xl font-bold">
              {currentPlayerName}
            </p>

            <p className="text-zinc-300 pt-2">
              Mögliche Bonuspunkte:{" "}
              <span className="text-emerald-300 font-semibold">
                {totalPossibleBonusPoints}
              </span>
            </p>

            {bonusQuestionsLocked ? (
              <p className="text-red-300 font-semibold pt-2">
                🔒 Bonusfragen sind gesperrt.
              </p>
            ) : (
              <p className="text-cyan-300 font-semibold pt-2">
                ✅ Bonusfragen können noch geändert werden.
              </p>
            )}
          </section>

          {(loading || loadingBonusTips) && (
            <p className="text-zinc-400">
              Lade Bonusfragen...
            </p>
          )}

          {errorMessage && (
            <p className="text-red-400">
              Supabase-Fehler: {errorMessage}
            </p>
          )}

          <section className="space-y-6">
            {bonusQuestions.map((question) => {
              const selectedAnswer =
                bonusTips[question.id];

              return (
                <div
                  key={question.id}
                  className="bg-slate-900/90 border border-cyan-500/20 rounded-2xl p-6 space-y-4"
                >
                  <div>
                    <h2 className="text-2xl font-bold">
                      {question.label}
                    </h2>

                    {selectedAnswer && (
                      <p className="text-sm text-zinc-400 mt-1">
                        Dein Tipp:{" "}
                        <span className="text-cyan-300 font-semibold">
                          {selectedAnswer}
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {question.options.map((option) => {
                      const selected =
                        selectedAnswer === option.label;

                      const points = calculatePoints(
                        option.quote
                      );

                      return (
                        <button
                          key={option.label}
                          disabled={bonusQuestionsLocked}
                          onClick={() =>
                            selectBonusTip(
                              question.id,
                              option.label
                            )
                          }
                          className={`rounded-xl border px-4 py-3 text-left transition ${
                            selected
                              ? "bg-cyan-400 text-slate-950 border-cyan-300"
                              : bonusQuestionsLocked
                                ? "bg-slate-950/50 text-zinc-500 border-slate-700 cursor-not-allowed"
                                : "bg-slate-950/80 text-white border-cyan-500/20 hover:bg-slate-800"
                          }`}
                        >
                          <span className="block font-bold">
                            {option.label}
                          </span>

                          <span className="block text-sm opacity-80">
                            Quote {option.quote} · {points} Punkte
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </section>
        </>
      )}
    </main>
  );
}