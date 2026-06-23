/**
 * Groups panel — static placeholder.
 *
 * The two groups from docs/page-example-content.md (Tab 4), both at ₪0 / 0
 * donors. Not data-driven.
 */
const groups = [
  { name: "Supergirls — The Orange Garden", by: "Venatata" },
  { name: "Mam'tzchik — The Orange Garden", by: "Venatata" },
];

export default function GroupsPanel() {
  return (
    <section aria-labelledby="groups-heading">
      <h2 id="groups-heading">Groups</h2>
      <ul>
        {groups.map((g) => (
          <li key={g.name}>
            <strong>{g.name}</strong> — by {g.by} · ₪0 raised · 0 donors
          </li>
        ))}
      </ul>
    </section>
  );
}
