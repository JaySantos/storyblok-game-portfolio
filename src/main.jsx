import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';

import './index.css';
import App from './App.jsx';
import { storyblokInit, apiPlugin } from '@storyblok/react';

import Page from './storyblok/Page';
import Teaser from './storyblok/Teaser';
import Feature from './storyblok/Feature';
import Grid from './storyblok/Grid';
import GamesPage from './storyblok/GamesPage';
import GameGrid from './storyblok/GameGrid';
import GameCard from './storyblok/GameCard';
import Game from './storyblok/Game';
import { accessToken } from './storyblok/mode';

storyblokInit({
	accessToken,
	apiOptions: {
		/** Set the correct region for your space. Learn more: https://www.storyblok.com/docs/packages/storyblok-js */
		region: import.meta.env.STORYBLOK_REGION || 'eu',
		/** The following code is only required when creating a Storyblok space directly via the Blueprints feature. */
		endpoint: import.meta.env.STORYBLOK_API_BASE_URL
			? `${new URL(import.meta.env.STORYBLOK_API_BASE_URL).origin}/v2`
			: undefined,
	},
	use: [apiPlugin],
	components: {
		page: Page,
		teaser: Teaser,
		feature: Feature,
		grid: Grid,
		games_page: GamesPage,
		game_grid: GameGrid,
		game_card: GameCard,
		game: Game,
	},
});
const router = createBrowserRouter([
	{
		path: '/*',
		Component: App,
	},
]);
const root = document.getElementById('root');

createRoot(root).render(
	<StrictMode>
		<RouterProvider router={router} />
	</StrictMode>,
);
