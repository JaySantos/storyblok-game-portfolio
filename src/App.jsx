import { useEffect, useState } from 'react';
import { StoryblokComponent, useStoryblok, useStoryblokApi } from '@storyblok/react';
import { useParams } from 'react-router';

const VERSION = 'draft';

// On the root path the URL has no slug. Open the first of these stories that exists:
// `portfolio` for this demo, or the starter's `home` story in a space that only has the blueprint.
const DEFAULT_SLUGS = ['portfolio', 'home'];

function Story({ slug }) {
	const currentYear = new Date().getFullYear();
	const story = useStoryblok(slug, {
		version: VERSION,
		resolve_relations: ['game_card.game', 'game.genre', 'game.studio'],
	});
	if (!story?.content) {
		return <div>Loading...</div>;
	}
	return (
		<>
			<StoryblokComponent blok={story.content} />
			<footer>All rights reserved © {currentYear}</footer>
		</>
	);
}

export default function App() {
	const { '*': slug } = useParams();
	const api = useStoryblokApi();
	// null while checking, '' when none of the default stories exists
	const [rootSlug, setRootSlug] = useState(null);

	useEffect(() => {
		if (slug || !api) return;
		let cancelled = false;
		async function findStartPage() {
			for (const candidate of DEFAULT_SLUGS) {
				try {
					await api.get(`cdn/stories/${candidate}`, { version: VERSION });
					if (!cancelled) setRootSlug(candidate);
					return;
				} catch {
					// The story does not exist (404) or cannot be read: try the next one.
				}
			}
			if (!cancelled) setRootSlug('');
		}
		findStartPage();
		return () => {
			cancelled = true;
		};
	}, [slug, api]);

	if (slug) {
		return <Story slug={slug} />;
	}
	if (rootSlug === null) {
		return <div>Loading...</div>;
	}
	if (rootSlug === '') {
		return (
			<div>
				No content found. Create a <code>portfolio</code> or <code>home</code> story in your Storyblok
				space and publish it.
			</div>
		);
	}
	return <Story slug={rootSlug} />;
}
