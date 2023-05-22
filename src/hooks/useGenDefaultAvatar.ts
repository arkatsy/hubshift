import { useQuery } from "@tanstack/react-query"

export const useGenDefaultAvatar = (username: string) => {
  return useQuery({
    queryKey: ["avatar", username],
    queryFn: () => fetchCustomAvatar(username),
    staleTime: 60 * 4 * 1000, // 4 min
    enabled: false,
  })
}

const fetchCustomAvatar = async (username: string): Promise<Blob> =>
  fetch(`https://ui-avatars.com/api/?name=${username}?background=random`).then((res) => res.blob())
