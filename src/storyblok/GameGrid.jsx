import { StoryblokComponent, storyblokEditable } from '@storyblok/react';

export default function GameGrid({ blok }) {
	return (
		<div {...storyblokEditable(blok)} className="game-grid">
			{blok.columns?.map((nestedBlok) => (
				<StoryblokComponent blok={nestedBlok} key={nestedBlok._uid} />
			))}
		</div>
	);
}
