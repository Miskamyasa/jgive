import { useQuery } from "@tanstack/react-query";

import { fetchCampaign } from "../lib/api";
import { campaignQueryKey, QueryProvider } from "../lib/queryClient";

const nf = new Intl.NumberFormat("en-US");

/** cents -> comma-grouped whole-shekel string (no decimals to match the banner). */
function formatShekels(cents: number): string {
  return nf.format(Math.round(cents / 100));
}

interface InitialProgress {
  raised: number;
  goal: number;
  donors: number;
  percent: number;
}

function ProgressView({ initial }: { initial: InitialProgress }) {
  const { data, isError } = useQuery({
    queryKey: campaignQueryKey,
    queryFn: fetchCampaign,
  });

  // On failure, keep the SSR values the banner already rendered rather than a
  // blank/broken bar, with a small inline notice.
  // Before data loads, fall back to the values the banner rendered server-side.
  const percent = data?.progress.percent ?? initial.percent;
  const raisedCents = data ? data.progress.raised_cents : initial.raised * 100;
  const goalCents = data ? data.goal_cents : initial.goal * 100;
  const donors = data?.progress.donor_count ?? initial.donors;

  const raisedFormatted = formatShekels(raisedCents);
  const goalFormatted = formatShekels(goalCents);
  const donorsFormatted = nf.format(donors);

  return (
    <div className="progress-island">
      <div className="stats-top">
        <span className="raised-label">
          Raised &mdash; <strong>{percent}%</strong>
        </span>
        <span className="raised-amount">
          <span className="shekel" aria-hidden="true">
            &#8362;
          </span>
          <span>{raisedFormatted}</span>
        </span>
      </div>

      <div
        className="progress-bar"
        role="img"
        aria-label={`${percent}% of goal raised`}
      >
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${percent}%` }} />
        </div>
        <span
          className="heart-marker"
          style={{ left: `${percent}%` }}
          aria-hidden="true"
        >
          &#10084;
        </span>
      </div>

      <div className="stats-bottom">
        <span className="goal-line">
          Goal:{" "}
          <span className="shekel" aria-hidden="true">
            &#8362;
          </span>
          {goalFormatted}
        </span>
        <span className="donor-line">Donors: {donorsFormatted}</span>
      </div>

      {isError && (
        <p className="progress-error" role="status">
          Couldn&rsquo;t load latest campaign progress.
        </p>
      )}

      <style>
        {`
				.progress-island {
					display: flex;
					flex-direction: column;
					gap: 1.25rem;
				}
				.progress-island .stats-top,
				.progress-island .stats-bottom {
					display: flex;
					align-items: baseline;
					justify-content: space-between;
					gap: 1rem;
					flex-wrap: wrap;
				}
				.progress-island .raised-label {
					color: var(--progress-green);
					font-size: 1.5rem;
					font-weight: 600;
				}
				.progress-island .raised-label strong {
					font-weight: 800;
				}
				.progress-island .raised-amount {
					color: var(--progress-green);
					font-size: clamp(2.5rem, 6vw, 4rem);
					font-weight: 800;
					line-height: 1;
					display: inline-flex;
					align-items: center;
					gap: 0.5rem;
				}
				.progress-island .raised-amount .shekel {
					font-size: 0.7em;
				}
				.progress-island .progress-bar {
					position: relative;
					width: 100%;
				}
				.progress-island .progress-track {
					width: 100%;
					height: 14px;
					border-radius: 999px;
					background: #b8b8b8;
					overflow: hidden;
				}
				.progress-island .progress-fill {
					height: 100%;
					background: var(--progress-green);
					border-radius: 999px 0 0 999px;
				}
				.progress-island .heart-marker {
					position: absolute;
					top: calc(50% - 2px);
					transform: translate(-50%, -50%);
					color: var(--heart-orange);
					font-size: 76px;
					line-height: 1;
					pointer-events: none;
				}
				.progress-island .stats-bottom {
					color: var(--progress-green);
					font-size: 1.4rem;
					font-weight: 600;
				}
				.progress-island .goal-line .shekel,
				.progress-island .donor-line {
					white-space: nowrap;
				}
				.progress-island .progress-error {
					margin: 0;
					color: var(--text-muted, #6b7280);
					font-size: 0.9rem;
				}
			`}
      </style>
    </div>
  );
}

export default function ProgressIsland(props: InitialProgress) {
  return (
    <QueryProvider>
      <ProgressView initial={props} />
    </QueryProvider>
  );
}
