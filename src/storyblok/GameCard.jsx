import { useRef } from 'react';
import { storyblokEditable } from '@storyblok/react';
import LibraryCard from './LibraryCard';

export default function GameCard({ blok }) {
	const dialogRef = useRef(null);

	// `blok.game` is a reference field. With `resolve_relations` set in App.jsx the
	// API client swaps the UUID for the full story. If the game is not available
	// (for example a draft while fetching published content) it stays a plain
	// UUID string, so there is nothing to show.
	const game = blok.game;
	if (!game || typeof game === 'string') {
		return null;
	}
	const { name, cover } = game.content;
	const close = () => dialogRef.current?.close();

	return (
		<article {...storyblokEditable(blok)} className="game-card">
			<button
				type="button"
				className="game-card__open"
				onClick={() => dialogRef.current?.showModal()}
				aria-label={`Show details for ${name}`}
			>
				{cover?.filename && (
					<img src={cover.filename} alt={cover.alt || name} width="300" height="400" />
				)}
				{/* The name is real text from the game's name field, not part of the cover image. */}
				<span className="game-card__name">{name}</span>
			</button>

			<dialog
				ref={dialogRef}
				className="game-dialog"
				aria-label={name}
				onClick={(event) => {
					// A click on the backdrop targets the dialog element itself.
					if (event.target === dialogRef.current) close();
				}}
			>
				<LibraryCard game={game.content} onClose={close} />
			</dialog>
		</article>
	);
}
