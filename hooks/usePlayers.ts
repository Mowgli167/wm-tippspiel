import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

export type Player = {
  id: number;
  name: string;
  points: number;
  pin: string;
};

export function usePlayers() {
  const [players, setPlayers] =
    useState<Player[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    async function loadPlayers() {
      const { data, error } =
        await supabase
          .from("players")
          .select("id, name, points, pin")
          .order("id", {
            ascending: true,
          });

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      if (data) {
        setPlayers(
          data.map((player) => ({
            id: Number(player.id),
            name: player.name,
            points: player.points ?? 0,
            pin: player.pin ?? "",
          }))
        );
      }

      setLoading(false);
    }

    loadPlayers();
  }, []);

  return {
    players,
    loading,
    errorMessage,
  };
}