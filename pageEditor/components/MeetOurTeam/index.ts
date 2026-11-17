import type { ComponentConfig } from "@measured/puck";
import { MeetOurTeamSection } from "./component";
import { meetOurTeamSectionFields as fields, meetOurTeamSectionDefaultProps as defaultProps, type MeetOurTeamSectionProps } from "./fields";
import { getMeetOurTeamMembersData } from "../../data/getTeamMembersData";

export const meetOurTeamSectionConfig: ComponentConfig<MeetOurTeamSectionProps> = {
  fields,
  defaultProps,
  resolveData: getMeetOurTeamMembersData,
  render: MeetOurTeamSection,
  label: "Meet Our Team",
};

export { MeetOurTeamSection };
export type { MeetOurTeamSectionProps } from "./fields"; 