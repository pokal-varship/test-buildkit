import {getTeamMembersDataServer } from '@services/about-us';
import { MeetOurTeamSectionProps, TeamMember } from '../components/MeetOurTeam/fields';

export interface TeamMembersResolvedData {
  teamMembers: TeamMember[];
  loading: boolean;
  error: string | null;
  totalCount: number;
}

interface TeamMembersApiResponse {
  status: string;
  message: string;
  data: any[];
  totalCount: number;
}

// Simple in-memory cache (5 minutes)
let teamMembersCache: {
  data: TeamMembersApiResponse | null;
  timestamp: number;
} | null = null;

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Simple cached function with server-side approach
const getCachedTeamMembersData = async (): Promise<TeamMembersApiResponse> => {
  const now = Date.now();
  
  // Check if we have valid cached data
  if (teamMembersCache && (now - teamMembersCache.timestamp) < CACHE_DURATION) {

    return teamMembersCache.data!;
  }
  
  // Fetch fresh data using server-side function

  try {
    const data = await getTeamMembersDataServer() as TeamMembersApiResponse;
    
    // Cache the data
    teamMembersCache = {
      data,
      timestamp: now
    };
    
    return data;
  } catch (error) {

    // Return cached data if available, otherwise throw
    if (teamMembersCache?.data) {

      return teamMembersCache.data;
    }
    throw error;
  }
};

export const getMeetOurTeamMembersData = async ({ props }: { props: MeetOurTeamSectionProps & Record<string, any> }) => {
  try {
    // Call the cached service function
    const result = await getCachedTeamMembersData();

    // Check if the response matches the expected structure
    if (result.data && Array.isArray(result.data)) {
      // If data is empty (204 or empty array), return empty team members
      if (result.data.length === 0) {
        return {
          props: {
            ...props,
            advanceSettings: {
              ...props.advanceSettings,
              teamMembers: [],
              loading: false,
              error: null,
              totalCount: 0
            }
          }
        };
      }
      
      // Transform API data to match TeamMember interface
      const transformedTeamMembers: TeamMember[] = result.data.map((member: any, index: number) => ({
        id: member._id || `member-${index}`,
        name: `${member.firstName || ''} ${member.lastName || ''}`.trim(),
        designation: member.role || 'Team Member',
        image: member.imageUrl || 'https://via.placeholder.com/300x220/e5e5e5/999999?text=Team+Member',
        socialUrl: member.socialUrl || undefined
      }));

      return {
        props: {
          ...props,
          advanceSettings: {
            ...props.advanceSettings,
            teamMembers: transformedTeamMembers,
            loading: false,
            error: null,
            totalCount: result.totalCount || result.data.length
          }
        }
      };
    } else {
      throw new Error('Invalid API response structure');
    }
  } catch (error) {

    // Return error state with fallback to static data
    return {
      props: {
        ...props,
        advanceSettings: {
          ...props.advanceSettings,
          teamMembers: props.advanceSettings?.teamMembers || [],
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch team members',
          totalCount: 0
        }
      }
    };
  }
};

// For development/testing purposes, you can also return mock data
export const getMockTeamMembersData = (): TeamMembersResolvedData => {
  return {
    teamMembers: [
      {
        id: "6863bb99061c9ab09a1ecbb1",
        name: "Salim",
        designation: "Sub-Manager",
        image: "/plateaway//1751366254530_qr.jpeg"
      },
      {
        id: "6863ba79061c9ab09a1ecbb0",
        name: "Umar Bashir",
        designation: "Sub-Manager",
        image: "/plateaway//1751366254530_qr.jpeg"
      },
      {
        id: "6863b608061c9ab09a1ecbad",
        name: "Sameer Khan",
        designation: "Sub-Manager",
        image: "/plateaway//1751365058257_Media.jpeg"
      },
      {
        id: "686280952a01171210e182d3",
        name: "Riyaz Khan",
        designation: "Admin",
        image: "/plateaway//1751285901924_3-EMB-573_id_card.png"
      }
    ],
    loading: false,
    error: null,
    totalCount: 4,
  };
}; 