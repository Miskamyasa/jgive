import { useMemo, useState } from "react";
import { useDebouncedValue } from "../../lib/useDebouncedValue";

/**
 * Ambassador Leaderboard panel — static placeholder.
 *
 * Renders a ranked, flat (list-only) leaderboard from the top ambassadors
 * listed in docs/page-example-content.md (Tab 3). Search + sort are
 * client-side over the static data; there is no grid view and no API call.
 */
type Ambassador = {
  rank: number;
  name: string;
  raised: number;
  goal: number | null;
  donors: number;
};

const ambassadors: Ambassador[] = [
  { rank: 1, name: "For the Family", raised: 30813, goal: null, donors: 123 },
  { rank: 2, name: "Yochi Davis", raised: 18523, goal: 20340, donors: 103 },
  { rank: 3, name: "Yifat Bachar", raised: 17116, goal: 20000, donors: 76 },
  { rank: 4, name: "Talia Burak", raised: 15899, goal: null, donors: 64 },
  { rank: 5, name: "Yael Keren", raised: 6720, goal: null, donors: 28 },
  { rank: 6, name: "Michal Weizman", raised: 6387, goal: 6000, donors: 16 },
  { rank: 7, name: "Ilan Kfir", raised: 2637, goal: 7829, donors: 20 },
];

const TOTAL_AMBASSADORS = 59;

const nf = new Intl.NumberFormat("en-US");

/** Whole-shekel comma-grouped string, e.g. ₪18,523. */
function formatShekels(amount: number): string {
  return `\u20AA${nf.format(amount)}`;
}

/** Person glyph used for the donor count. */
function PersonIcon() {
  return (
    <svg
      className="amb-person-icon"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export default function AmbassadorLeaderboardPanel() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 250);

  const visible = useMemo(() => {
    const needle = debouncedQuery.trim().toLowerCase();
    const filtered = needle
      ? ambassadors.filter((a) => a.name.toLowerCase().includes(needle))
      : ambassadors;
    // Sort by "Most donations" (raised desc); copy before sorting so the
    // source array order is preserved.
    return [...filtered].sort((a, b) => b.raised - a.raised);
  }, [debouncedQuery]);

  return (
    <section aria-labelledby="ambassadors-heading" className="amb-panel">
      <h2 id="ambassadors-heading">Ambassadors</h2>
      <p className="amb-count">{TOTAL_AMBASSADORS} ambassadors</p>

      <div className="amb-controls">
        <label className="amb-search">
          <span className="amb-visually-hidden">Search ambassadors</span>
          <input
            type="search"
            placeholder="Search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label className="amb-sort">
          <span>Sort by</span>
          <select defaultValue="most-donations">
            <option value="most-donations">Most donations</option>
          </select>
        </label>
      </div>

      {visible.length === 0
        ? <p className="amb-empty">No ambassadors match your search.</p>
        : (
          <ol className="amb-list">
            {visible.map((a) => {
              const pct = a.goal
                ? Math.min(100, Math.round((a.raised / a.goal) * 100))
                : 0;
              return (
                <li key={a.name} className="amb-card">
                  <div className="amb-card-head">
                    <span className="amb-rank-name">
                      {a.rank}. {a.name}
                    </span>
                    <span className="amb-donors">
                      <PersonIcon />
                      {a.donors}
                    </span>
                  </div>
                  <div className="amb-figures">
                    <span className="amb-raised">
                      {formatShekels(a.raised)} raised
                    </span>
                    {a.goal
                      ? (
                        <span className="amb-goal">
                          Goal: {formatShekels(a.goal)}
                        </span>
                      )
                      : null}
                  </div>
                  {a.goal
                    ? (
                      <div
                        className="amb-progress"
                        role="progressbar"
                        aria-valuenow={pct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <span
                          className="amb-progress-fill"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    )
                    : null}
                </li>
              );
            })}
          </ol>
        )}

      <style>
        {`
				.amb-panel {
					color: var(--text, #1f2937);
				}
				.amb-count {
					margin: 0.25rem 0 1rem;
					color: var(--text-muted, #6b7280);
				}
				.amb-controls {
					display: flex;
					flex-wrap: wrap;
					align-items: end;
					gap: 1rem;
					margin-bottom: 1rem;
				}
				.amb-search {
					flex: 1 1 16rem;
				}
				.amb-search input,
				.amb-sort select {
					width: 100%;
					padding: 0.5rem 0.75rem;
					border: 1px solid var(--border, #e5e7eb);
					border-radius: 0.5rem;
					background: #fff;
					color: var(--text, #1f2937);
					font: inherit;
				}
				.amb-sort {
					display: flex;
					flex-direction: column;
					gap: 0.25rem;
					flex: 0 1 14rem;
				}
				.amb-sort > span {
					font-size: 0.85rem;
					color: var(--text-muted, #6b7280);
				}
				.amb-visually-hidden {
					position: absolute;
					width: 1px;
					height: 1px;
					padding: 0;
					margin: -1px;
					overflow: hidden;
					clip: rect(0 0 0 0);
					white-space: nowrap;
					border: 0;
				}
				.amb-list {
					list-style: none;
					margin: 0;
					padding: 0;
					display: flex;
					flex-direction: column;
					gap: 0.75rem;
				}
				.amb-card {
					border: 1px solid var(--border, #e5e7eb);
					border-radius: 0.75rem;
					padding: 0.875rem 1rem;
				}
				.amb-card-head {
					display: flex;
					align-items: baseline;
					justify-content: space-between;
					gap: 1rem;
				}
				.amb-rank-name {
					font-weight: 700;
					color: var(--text, #1f2937);
				}
				.amb-donors {
					display: inline-flex;
					align-items: center;
					gap: 0.35rem;
					color: var(--text-muted, #6b7280);
					font-size: 0.9rem;
					white-space: nowrap;
				}
				.amb-person-icon {
					display: block;
				}
				.amb-figures {
					display: flex;
					align-items: baseline;
					justify-content: space-between;
					gap: 1rem;
					margin-top: 0.4rem;
				}
				.amb-raised {
					font-weight: 700;
					color: var(--progress-green);
				}
				.amb-goal {
					color: var(--text-muted, #6b7280);
					font-size: 0.9rem;
					white-space: nowrap;
				}
				.amb-progress {
					margin-top: 0.5rem;
					height: 0.5rem;
					border-radius: 999px;
					background: #d1d5db;
					overflow: hidden;
				}
				.amb-progress-fill {
					display: block;
					height: 100%;
					background: var(--progress-green);
				}
				.amb-empty {
					color: var(--text-muted, #6b7280);
				}
			`}
      </style>
    </section>
  );
}
