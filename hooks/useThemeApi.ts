import { useQuery } from '@tanstack/react-query';

export const useThemeApi = (tenantId: string) => {
  const fetchTheme = async () => {
    const response = await fetch(`/api/tenants/${tenantId}/theme`, {
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch theme');
    return response.json();
  };

  return useQuery({
    queryKey: ['theme', tenantId],
    queryFn: fetchTheme,
    staleTime: 5 * 60 * 1000,
  });
};

