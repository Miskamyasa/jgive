import { useQuery } from "@tanstack/react-query";

import { type Donation, fetchDonations } from "../lib/api";
import { donationsQueryKey, QueryProvider } from "../lib/queryClient";

const nf = new Intl.NumberFormat("en-US");
const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/** cents -> ₪ comma-grouped whole-shekel string. */
function formatShekels(cents: number): string {
  return `\u20AA${nf.format(Math.round(cents / 100))}`;
}

/** Coarse relative time ("~3h ago" style) from an ISO timestamp. */
function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffSeconds = (then - Date.now()) / 1000;
  const minutes = diffSeconds / 60;
  const hours = minutes / 60;
  const days = hours / 24;
  if (Math.abs(days) >= 1) return rtf.format(Math.round(days), "day");
  if (Math.abs(hours) >= 1) return rtf.format(Math.round(hours), "hour");
  return rtf.format(Math.round(minutes), "minute");
}

function donorName(donation: Donation): string {
  const name = donation.display_name?.trim();
  return name ? name : "Anonymous";
}

function DonorListView() {
  const { data, isLoading, isError } = useQuery({
    queryKey: donationsQueryKey,
    queryFn: fetchDonations,
  });

  const statusStyles = (
    <style>
      {`
			.donor-status {
				margin: 0;
				color: var(--text-muted, #6b7280);
				font-size: 0.95rem;
			}
			.donor-status--error {
				color: #b00020;
			}
		`}
    </style>
  );

  if (isLoading) {
    return (
      <p className="donor-status">
        Loading recent donations&hellip;
        {statusStyles}
      </p>
    );
  }

  if (isError) {
    return (
      <p className="donor-status donor-status--error" role="status">
        Couldn&rsquo;t load recent donations.
        {statusStyles}
      </p>
    );
  }

  const donations = data ?? [];

  if (donations.length === 0) {
    return (
      <p className="donor-status">
        No donations yet.
        {statusStyles}
      </p>
    );
  }

  return (
    <ul className="donor-list">
      {donations.map((donation) => (
        <li key={donation.id} className="donor-row">
          <div className="donor-main">
            <span className="donor-name">{donorName(donation)}</span>
            <span className="donor-amount">
              {formatShekels(donation.amount_cents)}
            </span>
          </div>
          {donation.dedication
            ? <p className="donor-dedication">{donation.dedication}</p>
            : null}
          <time className="donor-when" dateTime={donation.created_at}>
            {relativeTime(donation.created_at)}
          </time>
        </li>
      ))}

      <style>
        {`
				.donor-list {
					list-style: none;
					margin: 0;
					padding: 0;
					display: flex;
					flex-direction: column;
				}
				.donor-row {
					padding: 0.75rem 0;
					border-bottom: 1px solid var(--border, #e5e7eb);
				}
				.donor-main {
					display: flex;
					align-items: baseline;
					justify-content: space-between;
					gap: 1rem;
				}
				.donor-name {
					font-weight: 600;
					color: var(--text, #1f2937);
				}
				.donor-amount {
					font-weight: 700;
					color: var(--progress-green);
					white-space: nowrap;
				}
				.donor-dedication {
					margin: 0.25rem 0 0;
					color: var(--text, #1f2937);
					font-size: 0.95rem;
				}
				.donor-when {
					display: block;
					margin-top: 0.25rem;
					color: var(--text-muted, #6b7280);
					font-size: 0.85rem;
				}
			`}
      </style>
    </ul>
  );
}

export default function DonorListIsland() {
  return (
    <QueryProvider>
      <DonorListView />
    </QueryProvider>
  );
}
