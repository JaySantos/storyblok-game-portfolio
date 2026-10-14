import { storyblokEditable } from '@storyblok/react';
import LibraryCard from './LibraryCard';

// The page for a `game` story (for example /games/ember-descent). Opening a game
// story in the Visual Editor shows this, so its fields can be edited with a live preview.
export default function Game({ blok }) {
	return (
		<main {...storyblokEditable(blok)} className="game-page">
			<LibraryCard game={blok} />
		</main>
	);
}
