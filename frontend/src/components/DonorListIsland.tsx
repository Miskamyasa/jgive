import { useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

import { type Donation, fetchDonations } from "../lib/api";
import { useDebouncedValue } from "../lib/useDebouncedValue";
import { donationsQueryKey, QueryProvider } from "../lib/queryClient";

const nf = new Intl.NumberFormat("en-US");
const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

type SortMode = "recent" | "amount";

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

const controlStyles = (
  <style>
    {`
			.donor-controls {
				display: flex;
				flex-wrap: wrap;
				gap: 0.75rem;
				align-items: flex-end;
				margin-bottom: 1rem;
			}
			.donor-control {
				display: flex;
				flex-direction: column;
				gap: 0.25rem;
				flex: 1 1 12rem;
				min-width: 12rem;
			}
			.donor-control__label {
				font-size: 0.8rem;
				color: var(--text-muted, #6b7280);
			}
			.donor-control__field {
				padding: 0.5rem 0.75rem;
				border: 1px solid var(--border, #e5e7eb);
				border-radius: 0.5rem;
				background: #fff;
				color: var(--text, #1f2937);
				font-size: 0.95rem;
			}
			.donor-control__field:focus {
				outline: 2px solid var(--accent-magenta, #c026d3);
				outline-offset: 1px;
			}
		`}
  </style>
);

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

function DonorListView() {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: donationsQueryKey,
    queryFn: ({ pageParam }) => fetchDonations(pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
  });

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("recent");
  const debouncedSearch = useDebouncedValue(search, 250);

  const loaded = useMemo(
    () => data?.pages.flatMap((page) => page.donations) ?? [],
    [data],
  );

  const donations = useMemo(() => {
    const all = loaded;
    const query = debouncedSearch.trim().toLowerCase();

    const filtered = query
      ? all.filter((d) => donorName(d).toLowerCase().includes(query))
      : all.slice();

    filtered.sort((a, b) => {
      if (sort === "amount") return b.amount_cents - a.amount_cents;
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

    return filtered;
  }, [loaded, debouncedSearch, sort]);

  const controls = (
    <div className="donor-controls">
      <label className="donor-control">
        <span className="donor-control__label">Search</span>
        <input
          className="donor-control__field"
          type="search"
          placeholder="Search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </label>
      <label className="donor-control">
        <span className="donor-control__label">Sort by</span>
        <select
          className="donor-control__field"
          value={sort}
          onChange={(event) => setSort(event.target.value as SortMode)}
        >
          <option value="recent">Most recent</option>
          <option value="amount">Highest amount</option>
        </select>
      </label>
      {controlStyles}
    </div>
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

  return (
    <div className="donor-panel">
      {controls}

      {donations.length === 0
        ? (
          <p className="donor-status">
            {loaded.length === 0
              ? "No donations yet."
              : "No donors match your search."}
            {statusStyles}
          </p>
        )
        : (
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
          </ul>
        )}

      {hasNextPage && (
        <button
          type="button"
          className="donor-load-more"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? "Loading…" : "Load more"}
        </button>
      )}

      <style>
        {`
				.donor-list {
					list-style: none;
					margin: 0;
					padding: 0;
					display: flex;
					flex-direction: column;
					border: 1px solid var(--border, #e5e7eb);
					border-radius: 0.75rem;
				}
				.donor-row {
					padding: 0.9rem 1rem;
					border-bottom: 1px solid var(--border, #e5e7eb);
				}
				.donor-row:last-child {
					border-bottom: none;
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
				.donor-load-more {
					display: block;
					margin: 1rem auto 0;
					padding: 0.55rem 1.25rem;
					font: inherit;
					font-weight: 600;
					color: var(--accent-magenta, #c026d3);
					background: #fff;
					border: 1px solid var(--border, #e5e7eb);
					border-radius: 999px;
					cursor: pointer;
				}
				.donor-load-more:hover:not(:disabled) {
					border-color: var(--accent-magenta, #c026d3);
				}
				.donor-load-more:disabled {
					opacity: 0.6;
					cursor: progress;
				}
			`}
      </style>
    </div>
  );
}

export default function DonorListIsland() {
  return (
    <QueryProvider>
      <DonorListView />
    </QueryProvider>
  );
}
