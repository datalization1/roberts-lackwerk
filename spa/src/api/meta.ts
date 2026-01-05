import { useQuery } from "@tanstack/react-query";
import { api } from "./client";
import type { MetaOptions } from "./types";

export function useMetaOptions() {
  return useQuery<MetaOptions>({
    queryKey: ["meta-options"],
    queryFn: async () => {
      const { data } = await api.get<MetaOptions>("/meta/options/");
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
