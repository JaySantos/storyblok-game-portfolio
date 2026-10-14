import { StoryblokComponent, storyblokEditable } from '@storyblok/react';

export default function GamesPage({ blok }) {
	return (
		<main {...storyblokEditable(blok)} className="games-page">
			<h1>HW&amp;T Game Portfolio</h1>
			{blok.body?.map((nestedBlok) => (
				<StoryblokComponent blok={nestedBlok} key={nestedBlok._uid} />
			))}
		</main>
	);
}
