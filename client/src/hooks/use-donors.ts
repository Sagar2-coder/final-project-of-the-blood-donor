import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { PublicDonorInfo, DonorsQueryParams } from "@shared/schema";

export function useDonors(filters?: DonorsQueryParams) {
  return useQuery<PublicDonorInfo[]>({
    queryKey: ["/api/donors", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.bloodGroup) params.append("bloodGroup", filters.bloodGroup);
      if (filters?.userType) params.append("userType", filters.userType);
      if (filters?.city) params.append("city", filters.city);

      const res = await api.get(`/donors?${params.toString()}`);
      return res.data;
    },
  });
}
