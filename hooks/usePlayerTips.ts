import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

export function usePlayerTips(
  playerId?: number
) {
  const [selectedTips, setSelectedTips] =
    useState<Record<number, string>>({});

  const [jokerMatches, setJokerMatches] =
    useState<number[]>([]);

  const [loadingTips, setLoadingTips] =
    useState(false);

  useEffect(() => {
    async function loadTips() {
      if (!playerId) return;

      setLoadingTips(true);

      const { data, error } =
        await supabase
          .from("tips")
          .select("match_id, tip, joker")
          .eq("player_id", playerId);

      if (error) {
        console.error(error);
        setLoadingTips(false);
        return;
      }

      const tips: Record<number, string> =
        {};

      const jokers: number[] = [];

      data?.forEach((row) => {
        tips[row.match_id] = row.tip;

        if (row.joker) {
          jokers.push(row.match_id);
        }
      });

      setSelectedTips(tips);
      setJokerMatches(jokers);
      setLoadingTips(false);
    }

    loadTips();
  }, [playerId]);

  async function saveTip(
    matchId: number,
    tip: string
  ) {
    if (!playerId) return;

    setSelectedTips((current) => ({
      ...current,
      [matchId]: tip,
    }));

    await supabase
      .from("tips")
      .upsert(
        {
          player_id: playerId,
          match_id: matchId,
          tip,
        },
        {
          onConflict:
            "player_id,match_id",
        }
      );
  }

  async function saveJoker(
    matchId: number,
    active: boolean
  ) {
    if (!playerId) return;

    setJokerMatches((current) =>
      active
        ? [...current, matchId]
        : current.filter(
            (id) => id !== matchId
          )
    );

    await supabase
      .from("tips")
      .upsert(
        {
          player_id: playerId,
          match_id: matchId,
          joker: active,
        },
        {
          onConflict:
            "player_id,match_id",
        }
      );
  }

  return {
    selectedTips,
    jokerMatches,
    loadingTips,
    saveTip,
    saveJoker,
  };
}