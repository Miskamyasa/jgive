import DonorListIsland from "../DonorListIsland";

/**
 * Recent Donations panel.
 *
 * Mounts the live donor-list island into the `[data-donors-island]`
 * container. The island wraps itself in QueryProvider and fetches donor
 * data from the API.
 */
export default function RecentDonationsPanel() {
  return (
    <section aria-labelledby="donations-heading">
      <h2 id="donations-heading">Recent Donations</h2>
      <div data-donors-island>
        <DonorListIsland />
      </div>
    </section>
  );
}
