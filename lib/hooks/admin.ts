import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createUser, deleteUser, listUsers, updateRole, type UserRole } from "@/lib/api/admin";

export const useUsers = (page = 0) =>
  useQuery({ queryKey: ["admin", "users", page], queryFn: () => listUsers(page) });

export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ username, password, role }: { username: string; password: string; role: UserRole }) =>
      createUser(username, password, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
};

export const useUpdateRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) => updateRole(userId, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
};
