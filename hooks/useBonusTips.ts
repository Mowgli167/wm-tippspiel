import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

export function useBonusTips(
  playerId: number | undefined
) {
  const [bonusTips, setBonusTips] =
    useState<Record<string, string>>({});

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadBonusTips() {
      if (!playerId) {
        setBonusTips({});
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data, error } = await supabase
        .from("bonus_tips")
        .select("question, answer")
        .eq("player_id", playerId);

      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }

      const tips: Record<string, string> = {};

      data?.forEach((tip) => {
        tips[tip.question] = tip.answer;
      });

      setBonusTips(tips);
      setLoading(false);
    }

    loadBonusTips();
  }, [playerId]);

  async function saveBonusTip(
    question: string,
    answer: string
  ) {
    if (!playerId) return;

    setBonusTips((prev) => ({
      ...prev,
      [question]: answer,
    }));

    const { error } = await supabase
      .from("bonus_tips")
      .upsert(
        {
          player_id: playerId,
          question,
          answer,
        },
        {
          onConflict: "player_id,question",
        }
      );

    if (error) {
      alert(error.message);
    }
  }

  return {
    bonusTips,
    loading,
    saveBonusTip,
  };
}