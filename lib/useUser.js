// lib/useUser.js
import useSWR from 'swr';

export function useUser() {
  const fetcher = url =>
    fetch(url, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      });

  const { data, error } = useSWR('/api/auth/me', fetcher);

  return {
    user:    data,
    loading: !error && !data,
    isError: !!error
  };
}
