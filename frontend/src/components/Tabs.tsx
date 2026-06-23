import { useState, type ReactNode } from 'react';

/**
 * Tabs — interactive 6-tab content selector island.
 *
 * Content API
 * -----------
 * The island is content-agnostic: it receives an ordered array of tab
 * descriptors via the `tabs` prop. Each descriptor carries the tab's
 * `label` (text shown in the tab bar) and its `content` (any ReactNode
 * rendered in the panel when that tab is active).
 *
 *   <Tabs tabs={[{ id: 'about', label: 'About the Project', content: <…/> }, …]} />
 *
 * How S13 (page assembly) should use this from Astro
 * --------------------------------------------------
 * Astro can pass server-rendered HTML into a React island as children via
 * named slots wrapped in <Fragment slot="...">. Author the panel copy as
 * normal Astro markup and forward each slot as a `content` entry, e.g.:
 *
 *   ---
 *   import Tabs from '../components/Tabs.tsx';
 *   ---
 *   <Tabs client:visible
 *     tabsAstro={[
 *       { id: 'about', label: 'About the Project' },
 *       { id: 'donations', label: 'Recent Donations' },
 *       … all 6 in order …
 *     ]}>
 *     <Fragment slot="about"> …Astro About-the-Project markup… </Fragment>
 *     <Fragment slot="donations"> …mount placeholder… </Fragment>
 *     …
 *   </Tabs>
 *
 * For that slot-driven flow use the `slots` + `tabsAstro` props instead of
 * `tabs`: each entry in `tabsAstro` is `{ id, label }`, and the matching
 * slot child (keyed by `id`) supplies the panel content. Astro injects
 * named slots into the `slots` object Astro's React renderer provides; the
 * component reads them by id.
 *
 * Use a hydration directive on the page (e.g. `client:visible`) so the tab
 * toggling runs in the browser.
 *
 * The default-active tab is the first entry (About the Project).
 */

export interface TabItem {
	id: string;
	label: string;
	content: ReactNode;
}

interface TabsProps {
	/** Ordered tab descriptors with inline React content. */
	tabs?: TabItem[];
	/** Slot-driven alternative: ordered `{ id, label }` pairs. */
	tabsAstro?: Array<{ id: string; label: string }>;
	/**
	 * Named slot content keyed by tab id, supplied by Astro's React renderer
	 * when used with `<Fragment slot="...">` children.
	 */
	slots?: Record<string, ReactNode>;
}

export default function Tabs({ tabs, tabsAstro, slots }: TabsProps) {
	// Normalize the two supported APIs into a single list of items.
	const items: TabItem[] =
		tabs ??
		(tabsAstro ?? []).map((t) => ({
			id: t.id,
			label: t.label,
			content: slots?.[t.id] ?? null,
		}));

	const [activeId, setActiveId] = useState<string>(items[0]?.id ?? '');

	return (
		<div className="tabs">
			<div className="tabs__bar" role="tablist" aria-label="Campaign sections">
				{items.map((item) => {
					const isActive = item.id === activeId;
					return (
						<button
							key={item.id}
							type="button"
							role="tab"
							id={`tab-${item.id}`}
							aria-selected={isActive}
							aria-controls={`panel-${item.id}`}
							className={`tabs__tab${isActive ? ' tabs__tab--active' : ''}`}
							onClick={() => setActiveId(item.id)}
						>
							{item.label}
						</button>
					);
				})}
			</div>

			{items.map((item) => {
				const isActive = item.id === activeId;
				return (
					<div
						key={item.id}
						role="tabpanel"
						id={`panel-${item.id}`}
						aria-labelledby={`tab-${item.id}`}
						className="tabs__panel"
						hidden={!isActive}
					>
						{item.content}
					</div>
				);
			})}

			<style>{`
				.tabs__bar {
					display: flex;
					gap: 2rem;
					border-bottom: 1px solid var(--border, #e5e7eb);
					overflow-x: auto;
				}
				.tabs__tab {
					appearance: none;
					background: none;
					border: none;
					border-bottom: 2px solid transparent;
					margin-bottom: -1px;
					padding: 0.75rem 0.25rem;
					font: inherit;
					font-weight: 500;
					white-space: nowrap;
					color: var(--text, #1f2937);
					cursor: pointer;
				}
				.tabs__tab:hover {
					color: var(--accent-magenta, #c026d3);
				}
				.tabs__tab--active {
					color: var(--accent-magenta-bright, #d400ff);
					border-bottom-color: var(--accent-magenta-bright, #d400ff);
				}
				.tabs__panel {
					padding-top: 1.5rem;
				}
			`}</style>
		</div>
	);
}
