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
	// Genre and studio are references too; they are objects when resolved, strings otherwise.
	const genreName = typeof game.content.genre === 'object' ? game.content.genre.content.name : null;
	const studioName = typeof game.content.studio === 'object' ? game.content.studio.content.name : null;
	const details = [genreName, studioName].filter(Boolean).join(' · ');
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
				{/* Real text from the game's fields, not part of the cover image. */}
				<span className="game-card__caption">
					<span className="game-card__name">{name}</span>
					{details && <span className="game-card__details">{details}</span>}
				</span>
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
