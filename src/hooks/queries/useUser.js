import { useQuery } from '@tanstack/react-query';
import { api } from '../../mockApi';

export function useUser(id) {
  return useQuery({
    queryKey: ['aio-users', id],
    queryFn: () => api.getUserById(id),
    enabled: !!id,
    staleTime: 1000 * 30,
  });
}
