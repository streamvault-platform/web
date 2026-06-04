import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createInvite, deleteInvite, listInvites } from "@/lib/api/invites";

export const useInvites = () =>
  useQuery({ queryKey: ["admin", "invites"], queryFn: listInvites });

export const useCreateInvite = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (expiresInDays?: number) => createInvite(expiresInDays),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "invites"] }),
  });
};

export const useDeleteInvite = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteInvite(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "invites"] }),
  });
};
