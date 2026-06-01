import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../mockApi';

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['aio-users'] }),
  });
}
