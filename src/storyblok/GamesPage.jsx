import { StoryblokComponent, storyblokEditable } from '@storyblok/react';

// Count the cards that actually render. A card whose game reference could not be
// resolved is skipped by GameCard, so it is not counted.
function countGames(body = []) {
	return body.reduce(
		(total, grid) =>
			total + (grid.columns ?? []).filter((card) => card.game && typeof card.game === 'object').length,
		0,
	);
}

export default function GamesPage({ blok }) {
	const count = countGames(blok.body);

	return (
		<main {...storyblokEditable(blok)} className="games-page">
			<h1>HW&amp;T Game Portfolio</h1>
			<p className="games-count">
				{count} {count === 1 ? 'game' : 'games'}
			</p>
			{blok.body?.map((nestedBlok) => (
				<StoryblokComponent blok={nestedBlok} key={nestedBlok._uid} />
			))}
		</main>
	);
}
