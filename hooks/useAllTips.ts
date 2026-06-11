import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

export type StoredTip = {
  player_id: number;
  match_id: number;
  tip: string | null;
  joker: boolean | null;
};

export function useAllTips() {
  const [allTips, setAllTips] =
    useState<StoredTip[]>([]);

  const [loadingAllTips, setLoadingAllTips] =
    useState(true);

  useEffect(() => {
    async function loadAllTips() {
      const { data, error } =
        await supabase
          .from("tips")
          .select("player_id, match_id, tip, joker");

      if (error) {
        console.error(error);
        setLoadingAllTips(false);
        return;
      }

      setAllTips(data ?? []);
      setLoadingAllTips(false);
    }

    loadAllTips();
  }, []);

  return {
    allTips,
    loadingAllTips,
  };
}