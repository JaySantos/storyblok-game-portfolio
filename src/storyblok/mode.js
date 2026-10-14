import { isVisualEditor } from '@storyblok/react';

// Inside the Visual Editor we read draft content with the preview token.
// Everywhere else we read published content with the public token.
export const inEditor = isVisualEditor();
export const version = inEditor ? 'draft' : 'published';

const previewToken = import.meta.env.STORYBLOK_PREVIEW_API_TOKEN;
export const accessToken =
	inEditor && previewToken ? previewToken : import.meta.env.STORYBLOK_PUBLIC_API_TOKEN;
