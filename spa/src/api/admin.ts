import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";
import type { Booking, DamageReport } from "./types";

export function useDamageReports() {
  return useQuery<DamageReport[]>({
    queryKey: ["admin", "damage-reports"],
    queryFn: async () => {
      const { data } = await api.get<DamageReport[]>("/damage-reports/");
      return data;
    },
  });
}

export function useBookings() {
  return useQuery<Booking[]>({
    queryKey: ["admin", "bookings"],
    queryFn: async () => {
      const { data } = await api.get<Booking[]>("/bookings/");
      return data;
    },
  });
}

export function useBookingStatusAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, action }: { id: string | number; action: string }) => {
      const { data } = await api.post(`/bookings/${id}/${action}/`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "bookings"] });
    },
  });
}

export function useDamageStatusAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, action }: { id: string | number; action: string }) => {
      const { data } = await api.patch(`/damage-reports/${id}/`, { status: action });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "damage-reports"] });
    },
  });
}
