import { getMeetOurTeamMembersData } from "pageEditor/data/getTeamMembersData";
import { MeetOurTeamSectionProps } from "../components/MeetOurTeam/fields";

export interface TeamMembersResolvedData {
  teamMembers: Array<{
    id: string;
    name: string;
    designation: string;
    image: string;
    socialUrl?: {
      facebookUrl?: string;
      twitterUrl?: string;
      linkedinUrl?: string;
      instagramUrl?: string;
      [key: string]: string | undefined;
    };
  }>;
  loading: boolean;
  error: string | null;
  totalCount: number;
}

export class TeamMembersDataContext {
  private static instance: TeamMembersDataContext;

  private constructor() {}

  static getInstance(): TeamMembersDataContext {
    if (!TeamMembersDataContext.instance) {
      TeamMembersDataContext.instance = new TeamMembersDataContext();
    }
    return TeamMembersDataContext.instance;
  }

  async getResolvedData(props: MeetOurTeamSectionProps): Promise<TeamMembersResolvedData> {
    try {
      // Call the data function (which has its own simple caching)
      const result = await getMeetOurTeamMembersData({ props });

      // Extract the resolved data from the result
      const resolvedData: TeamMembersResolvedData = {
        teamMembers: result.props.advanceSettings.teamMembers || [],
        loading: result.props.advanceSettings.loading || false,
        error: result.props.advanceSettings.error || null,
        totalCount: result.props.advanceSettings.totalCount || 0
      };

      return resolvedData;
    } catch (error) {

      // Return fallback data instead of throwing
      return {
        teamMembers: [],
        loading: false,
        error: error instanceof Error ? error.message : "Failed to fetch team members",
        totalCount: 0
      };
    }
  }
}

// Export singleton instance
export const teamMembersDataContext = TeamMembersDataContext.getInstance(); 