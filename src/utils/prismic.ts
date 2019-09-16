import cookie from 'cookie';
import Prismic from 'prismic-javascript';
import { Document } from 'prismic-javascript/d.ts/documents';
import ResolvedApi from 'prismic-javascript/d.ts/ResolvedApi';
import { getLocalizedPath } from '../routes';

const debug = process.env.NODE_ENV === 'development' ? require('debug')('app:prismic') : () => {};

export function linkResolver(doc: Document): string {
  const locale = doc.lang ? localeResolver(doc.lang, true) : 'en';

  switch (doc.type) {
  case 'home': return getLocalizedPath('/', locale);
  case 'blog_post': return getLocalizedPath(`/blog/${doc.uid}`, locale);
  default: return '/';
  }
}

export function localeResolver(locale: string, reverse: boolean = false): string {
  const defaultLocale = __I18N_CONFIG__.defaultLocale;
  const supportedLocales = __I18N_CONFIG__.locales;

  if (reverse) {
    switch (locale) {
    default: return 'en';
    }
  }
  else {
    if (supportedLocales.indexOf(locale) < 0) return defaultLocale;

    switch (locale) {
    default: return 'en-us';
    }
  }
}

export function getAPI(): Promise<ResolvedApi> {
  const { apiEndpoint, accessToken } = __APP_CONFIG__.prismic;
  return Prismic.api(apiEndpoint, { accessToken });
}

export async function getPreviewPath(token: string): Promise<string> {
  const api = await getAPI();
  return api.previewSession(token, linkResolver, '/');
}

export function savePreviewToken(token: string) {
  document.cookie = cookie.serialize(Prismic.previewCookie, token, {
    expires: new Date(Date.now() + 60 * 60 * 1000),
    path: '/',
  });

  if (cookie.parse(document.cookie)[Prismic.previewCookie]) {
    debug('Saving preview token to cookies...', 'OK');
  }
  else {
    debug('Saving preview token to cookies...', 'ERR');
  }
}

export function loadPreviewToken(): string | undefined {
  const token = cookie.parse(document.cookie)[Prismic.previewCookie];
  return token;
}
