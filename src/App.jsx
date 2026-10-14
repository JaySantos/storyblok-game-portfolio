import { StoryblokComponent, useStoryblok } from '@storyblok/react';
import { useParams } from 'react-router';

export default function App() {
	const currentYear = new Date().getFullYear();
	const { '*': slug } = useParams();
	const story = useStoryblok(slug || 'portfolio', {
		version: 'draft',
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
