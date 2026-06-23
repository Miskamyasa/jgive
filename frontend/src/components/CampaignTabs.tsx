import Tabs from "./Tabs";
import AboutProjectPanel from "./panels/AboutProjectPanel";
import RecentDonationsPanel from "./panels/RecentDonationsPanel";
import AmbassadorLeaderboardPanel from "./panels/AmbassadorLeaderboardPanel";
import GroupsPanel from "./panels/GroupsPanel";
import AboutNgoPanel from "./panels/AboutNgoPanel";
import UpdatesPanel from "./panels/UpdatesPanel";

/**
 * CampaignTabs — single React entry point that composes the 6 campaign tabs.
 *
 * Mounting the whole composition as one React island (instead of passing
 * pre-rendered React elements across the Astro prop boundary) keeps every
 * panel — including the nested React Query `DonorListIsland` in Recent
 * Donations — inside one hydrated React tree. The Astro page mounts only this
 * wrapper with a client directive; no non-serializable values cross the island
 * boundary.
 *
 * "About the Project" is first and therefore active by default.
 */
export default function CampaignTabs() {
  return (
    <Tabs
      tabs={[
        {
          id: "about",
          label: "About the Project",
          content: <AboutProjectPanel />,
        },
        {
          id: "donations",
          label: "Recent Donations",
          content: <RecentDonationsPanel />,
        },
        {
          id: "ambassadors",
          label: "Ambassador Leaderboard",
          content: <AmbassadorLeaderboardPanel />,
        },
        { id: "groups", label: "Groups", content: <GroupsPanel /> },
        { id: "ngo", label: "About the NGO", content: <AboutNgoPanel /> },
        { id: "updates", label: "Updates", content: <UpdatesPanel /> },
      ]}
    />
  );
}
