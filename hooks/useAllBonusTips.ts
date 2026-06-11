import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

export type StoredBonusTip = {
  player_id: number;
  question: string;
  answer: string;
};

export function useAllBonusTips() {
  const [allBonusTips, setAllBonusTips] =
    useState<StoredBonusTip[]>([]);

  const [loadingAllBonusTips, setLoadingAllBonusTips] =
    useState(true);

  useEffect(() => {
    async function loadAllBonusTips() {
      const { data, error } =
        await supabase
          .from("bonus_tips")
          .select("player_id, question, answer");

      if (error) {
        setAllBonusTips([]);
        setLoadingAllBonusTips(false);
        return;
      }

      setAllBonusTips(data ?? []);
      setLoadingAllBonusTips(false);
    }

    loadAllBonusTips();
  }, []);

  return {
    allBonusTips,
    loadingAllBonusTips,
  };
}