import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "./client";
import type { Booking, Transporter, Vehicle } from "./types";

export function useTransporters() {
  return useQuery<Transporter[]>({
    queryKey: ["transporters"],
    queryFn: async () => {
      const { data } = await api.get<Transporter[]>("/transporters/");
      return data;
    },
  });
}

export function useVehicles() {
  return useQuery<Vehicle[]>({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const { data } = await api.get<Vehicle[]>("/vehicles/");
      return data;
    },
  });
}

export function useCreateBooking() {
  return useMutation({
    mutationFn: async (payload: Partial<Booking>) => {
      const { data } = await api.post<Booking>("/bookings/", payload);
      return data;
    },
  });
}
