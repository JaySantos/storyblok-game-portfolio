// Shared "library card" layout for a game. Used inside the popup on the portfolio
// page and as the page for a game story itself, so both look the same.
// `game` is the content of a `game` story. Its `genre` and `studio` references are
// objects when resolved (see `resolve_relations` in App.jsx) and strings otherwise.
export default function LibraryCard({ game, onClose }) {
	const { name, cover, description, release_date: releaseDate } = game;
	const genre = typeof game.genre === 'object' ? game.genre.content : null;
	const studio = typeof game.studio === 'object' ? game.studio.content : null;

	return (
		<div className="library-card">
			{onClose && (
				<button type="button" className="library-card__close" onClick={onClose} aria-label="Close">
					&times;
				</button>
			)}
			<header className="library-card__header">
				{cover?.filename && (
					<img src={cover.filename} alt={cover.alt || name} width="300" height="400" />
				)}
				<div>
					<h2>{name}</h2>
					{genre && <p className="library-card__genre">{genre.name}</p>}
				</div>
			</header>
			<div className="library-card__body">
				{description && <p>{description}</p>}
				<dl>
					{releaseDate && (
						<>
							<dt>Release date</dt>
							<dd>{releaseDate}</dd>
						</>
					)}
					{studio && (
						<>
							<dt>Studio</dt>
							<dd>{studio.name}</dd>
							{studio.description && (
								<>
									<dt>About the studio</dt>
									<dd>{studio.description}</dd>
								</>
							)}
							{studio.contact && (
								<>
									<dt>Contact</dt>
									<dd>{studio.contact}</dd>
								</>
							)}
						</>
					)}
				</dl>
			</div>
		</div>
	);
}
