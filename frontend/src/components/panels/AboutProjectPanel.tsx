/**
 * About the Project panel content.
 *
 * English copy migrated faithfully from the existing
 * `src/pages/the-orange-garden.astro` (story / planned features / partners).
 * The original page is intentionally left untouched; a later assembly step
 * removes the duplicate copy from the page.
 */
export default function AboutProjectPanel() {
	return (
		<>
			<section aria-labelledby="story-heading">
				<h2 id="story-heading">A living space for memory, healing, and hope</h2>
				<p>
					After two and a half years of pain and upheaval, a new initiative brings a message of
					life, healing, and hope to Israel. We are launching The Orange Garden — the first space of
					its kind in Israel, connecting memory, nature, children, and healing.
				</p>
				<p>
					Across 20 dunams (about 5 hectares), a living space of nature, water, play, family, and
					healing will be built — open to everyone. A place where children can run and play,
					families gather, and people pause to breathe and reconnect. It will include a dignified
					memorial space for all the children of October 7.
				</p>
				<p>
					The Orange Garden is being built in Migdal HaEmek, near the "Ariel" and "Kfir"
					kindergartens currently under construction.
				</p>
			</section>

			<section aria-labelledby="features-heading">
				<h2 id="features-heading">Planned features</h2>
				<ul>
					<li>
						<strong>Therapeutic community gardening complex</strong> — healing through nature and
						soil for trauma survivors, the elderly, people with special needs, at-risk youth, and
						communities in need of renewal.
					</li>
					<li>
						<strong>Fruit orchards</strong> — walking among fruit trees and scents, inspired by the
						fruits Shiri and Ariel loved.
					</li>
					<li>
						<strong>An ecological stream</strong> — flowing water with small wooden bridges and a
						calming walking experience.
					</li>
					<li>
						<strong>A memorial space for all the children of October 7</strong> — a dignified,
						light-filled corner.
					</li>
					<li>
						<strong>The Orange Omega and play structures</strong> — because children's laughter is
						the strongest answer to pain.
					</li>
					<li>
						<strong>A Wishing Wall</strong> — where every child in Israel can leave a wish, prayer,
						hope, or dream.
					</li>
					<li>
						<strong>Family picnic areas</strong> — green, inviting meeting spots for new memories.
					</li>
					<li>An amphitheater, outdoor classrooms, and cultural spaces.</li>
					<li>An outdoor library and inspiration space.</li>
				</ul>
			</section>

			<section aria-labelledby="partners-heading">
				<h2 id="partners-heading">Together, we can build it</h2>
				<p>
					The Migdal HaEmek municipality has donated the land and committed to ongoing maintenance.
					The plans are ready. Now it depends on us.
				</p>
				<p>
					The project is an initiative of the Venatata NGO, together with the Bibas family, the
					Migdal HaEmek municipality, and landscape architect Izzy Blank.
				</p>
				<blockquote>
					<p>"When we saw the garden plans, we just started crying."</p>
					<footer>— Ofri Bibas. She pictured Ariel running between the trees.</footer>
				</blockquote>
				<p>
					<strong>Goal:</strong> ₪5,000,000.
				</p>
			</section>
		</>
	);
}
