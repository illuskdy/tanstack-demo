import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../mockApi';

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['aio-users'] }),
  });
}
