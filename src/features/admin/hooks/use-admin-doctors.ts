"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  approveDoctor,
  listDoctors,
  listPendingDoctors,
  rejectDoctor,
} from "@/features/admin/api/doctors-admin.api";
import { adminQueries } from "@/features/admin/api/admin-queries";
import type { ApiError } from "@/lib/api/types/api-error.types";

export function useAdminDoctors() {
  return useQuery({
    ...adminQueries.doctors(),
    queryFn: listDoctors,
  });
}

export function usePendingDoctors() {
  return useQuery({
    ...adminQueries.doctorsPending(),
    queryFn: listPendingDoctors,
  });
}

export function useDoctorVerificationActions() {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await queryClient.invalidateQueries({
      queryKey: adminQueries.doctors().queryKey,
    });
    await queryClient.invalidateQueries({
      queryKey: adminQueries.doctorsPending().queryKey,
    });
  };

  const approveMutation = useMutation({
    mutationFn: (doctorId: string) => approveDoctor(doctorId),
    onSuccess: async () => {
      await invalidate();
      toast.success("Doctor approved");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Approval failed");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (doctorId: string) => rejectDoctor(doctorId),
    onSuccess: async () => {
      await invalidate();
      toast.success("Doctor rejected");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Rejection failed");
    },
  });

  return {
    approve: approveMutation,
    reject: rejectMutation,
    isPending: approveMutation.isPending || rejectMutation.isPending,
  };
}
