import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../mockApi';

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['updateUser'],
    mutationFn: ({ id, data }) => api.updateUser(id, data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ['aio-users'] });
      qc.setQueryData(['aio-users', updated.id], updated);
    },
  });
}
