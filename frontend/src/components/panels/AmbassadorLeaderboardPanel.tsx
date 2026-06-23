/**
 * Ambassador Leaderboard panel — static placeholder.
 *
 * Renders a static, non-interactive sample table from the top ambassadors
 * listed in docs/page-example-content.md (Tab 3). Not data-driven.
 */
const ambassadors = [
  { rank: 1, name: "בשביל המשפחה", raised: "₪30,813", goal: "—", donors: 123 },
  {
    rank: 2,
    name: "יוכי דיוויס",
    raised: "₪18,523",
    goal: "₪20,340",
    donors: 103,
  },
  { rank: 3, name: "יפעת בכר", raised: "₪17,116", goal: "₪20,000", donors: 76 },
  { rank: 4, name: "טליה בורק", raised: "₪15,899", goal: "—", donors: 64 },
  { rank: 5, name: "יעל קרן", raised: "₪6,720", goal: "—", donors: 28 },
  { rank: 6, name: "מיכל ויצמן", raised: "₪6,387", goal: "₪6,000", donors: 16 },
  { rank: 7, name: "אילן כפיר", raised: "₪2,637", goal: "₪7,829", donors: 20 },
];

export default function AmbassadorLeaderboardPanel() {
  return (
    <section aria-labelledby="ambassadors-heading">
      <h2 id="ambassadors-heading">Ambassador Leaderboard</h2>
      <p>59 total ambassadors. Top 7 shown.</p>
      <table>
        <thead>
          <tr>
            <th scope="col">Rank</th>
            <th scope="col">Name</th>
            <th scope="col">Raised</th>
            <th scope="col">Goal</th>
            <th scope="col">Donors</th>
          </tr>
        </thead>
        <tbody>
          {ambassadors.map((a) => (
            <tr key={a.rank}>
              <td>{a.rank}</td>
              <td>{a.name}</td>
              <td>{a.raised}</td>
              <td>{a.goal}</td>
              <td>{a.donors}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
