/**
 * About the NGO panel content.
 *
 * English copy translated faithfully from the authoritative Hebrew source
 * (`docs/page-content.html`): the Venatata description, contact details, a
 * non-interactive placeholder NGO-page link, and the tax-deductibility
 * disclaimer.
 */
export default function AboutNgoPanel() {
  return (
    <>
      <section aria-labelledby="ngo-heading">
        <h2 id="ngo-heading">About Venatata</h2>
        <p>
          <strong>The Venatata NGO</strong>, which leads the project, is a
          national environmental movement for healing Israeli society through
          nature and connection to the land. The NGO builds hundreds of
          therapeutic gardens in rehabilitation, education, and welfare
          institutions, and plants thousands of trees across the country.
        </p>
        <p>
          Since <strong>October 7</strong>, the NGO has launched the "Adamot
          Bracha" project to build hundreds of community healing spaces through
          nature in the Gaza-envelope communities, the north, and at the heart
          of communities harmed by the war. The NGO operates on the model:{" "}
          <strong>Person — Land — Community (Adam — Adama — Kehila)</strong> —
          all of its projects always connect person to person and person to
          land, out of a deep understanding that healing a person in crisis is
          directly tied to healing and rehabilitating the community and
          environment they are part of.
        </p>
        <p>
          The NGO is the winner of the <strong>Israel Earth Prize</strong> for
          2023, for its positive impact on the environment and society in
          Israel.
        </p>
        <p>
          The Orange Garden project is carried out in full cooperation with the
          Migdal HaEmek municipality and the Bibas family.
        </p>
        <p>
          For support from companies and organizations, please get in touch:
          054-2370949, Doriel Rimer, CEO of the Venatata NGO.
        </p>
      </section>

      <section aria-labelledby="contact-heading">
        <h2 id="contact-heading">Contact the NGO</h2>
        <ul>
          <li>Email: info@venatata.org</li>
          <li>Phone: 052-8622966</li>
          <li>Corporate donations: 054-2370949 (Doriel Rimer, CEO)</li>
          <li>Website: venatata.org</li>
          <li>NGO number: 580689537</li>
        </ul>
        <p>
          <span role="link" aria-disabled="true">
            Go to NGO page
          </span>
        </p>
      </section>

      <section aria-labelledby="disclaimer-heading">
        <h2 id="disclaimer-heading">Did you know?</h2>
        <p>
          Donations to this project may be tax deductible in Israel, the US,
          Canada, and the UK, in accordance with the site's terms of use. Every
          donor recommendation must meet the organization's supported purposes
          and may be reallocated in accordance with our policy and terms of use.
        </p>
      </section>
    </>
  );
}
