import { useQuery } from '@tanstack/react-query';
import { api } from '../../mockApi';

export function useUsers() {
  return useQuery({
    queryKey: ['aio-users'],
    queryFn: api.getUsers,
    staleTime: 1000 * 30,
  });
}
