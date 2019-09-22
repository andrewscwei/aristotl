import cookie from 'cookie';
import _ from 'lodash';
import PrismicDOM from 'prismic-dom';
import Prismic from 'prismic-javascript';
import { Document } from 'prismic-javascript/d.ts/documents';
import ResolvedApi, { QueryOptions } from 'prismic-javascript/d.ts/ResolvedApi';
import { getLocalizedPath } from './i18n';

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

/**
 * Fetches Prismic docs by doc type and optional UID. This operation uses the
 * default locale and automatically accounts for existing preview tokens in
 * browser cookies.
 *
 * @param type - Prismic doc type.
 * @param uid - Prismic doc UID.
 * @param options - Customizable options for the API query. @see QueryOptions
 * @param pages - Number of pages to fetch.
 *
 * @returns Fetched documents as fulfilment value.
 */
export async function fetchDocsByType(type: string, uid?: string, options: Partial<QueryOptions> = {}, pages: number = 1): Promise<ReadonlyArray<Document>> {
  const api = await getAPI();
  const previewToken = loadPreviewToken();
  const opts: any = {
    lang: localeResolver(__I18N_CONFIG__.defaultLocale),
    orderings : '[document.first_publication_date desc]',
    ref: previewToken || api.master(),
    ...options,
  };

  let docs: Array<Document> = [];
  const startingPage = opts.page || 1;

  for (let i = 0; i < pages; i++) {
    const res = uid
      ? await api.query(Prismic.Predicates.at(`my.${type}.uid`, uid), { ...opts, page: Number(startingPage) + i })
      : await api.query(Prismic.Predicates.at('document.type', type), { ...opts, page: Number(startingPage) + i });

    docs = docs.concat(res.results);
  }

  if (opts.ref === previewToken) {
    debug(`Previewing docs from Prismic for type "${type}" and language "${opts.lang}"...`, 'OK', docs);
  }
  else {
    debug(`Fetching docs from Prismic for type "${type}" and language "${opts.lang}"...`, 'OK', docs);
  }

  return docs;
}

export function getText(doc?: Document, path: string = ''): string | undefined {
  const fragment = _.get(doc, path);

  if (!fragment) return undefined;
  if (typeof fragment === 'string') return fragment;

  return PrismicDOM.RichText.asText(fragment);
}

export function getMarkup(doc?: Document, path: string = ''): string | undefined {
  const fragment = _.get(doc, path);

  if (!fragment) return undefined;

  return PrismicDOM.RichText.asHtml(fragment, linkResolver);
}

export function getTexts(doc?: Document, path: string = '', subpath: string = ''): ReadonlyArray<string> | undefined {
  const fragments = _.get(doc, path);

  if (!_.isArray(fragments)) return undefined;

  const texts = _.reduce(fragments, (out, curr: any) => {
    const text = _.get(curr, subpath);
    if (!text) return out;

    if (typeof text === 'string') {
      out.push(text);
    }
    else {
      out.push(PrismicDOM.RichText.asText(text));
    }

    return out;
  }, Array<string>());

  return texts;
}

export function getMarkups(doc?: Document, path: string = '', subpath: string = ''): ReadonlyArray<string> | undefined {
  const fragments = _.get(doc, path);

  if (!_.isArray(fragments)) return undefined;

  const markups = _.reduce(fragments, (out, curr: any) => {
    const text = _.get(curr, subpath);
    if (!text) return out;

    out.push(PrismicDOM.RichText.asHtml(text, linkResolver));

    return out;
  }, Array<string>());

  return markups;
}

export function getDoc(doc?: Document, path: string = '', lookupDocs?: ReadonlyArray<Document>): Document | undefined {
  const fragment = _.get(doc, path);

  if (!fragment) return undefined;
  if (!fragment.id) return undefined;

  if (!lookupDocs) return fragment;

  return _.find(lookupDocs, (v) => v.id === fragment.id);
}

export function getDocs(doc?: Document, path: string = '', subpath: string = '', lookupDocs?: ReadonlyArray<Document>): ReadonlyArray<Document> | undefined {
  const fragments = _.get(doc, path);

  if (!fragments) return undefined;

  const docs = _.reduce(fragments, (out, curr: any) => {
    const doc = _.get(curr, subpath);
    if (doc) out.push(doc);
    return out;
  }, Array<Document>());

  if (!lookupDocs) return docs;

  const matchedDocs = _.intersectionWith(lookupDocs, docs, (lookupDoc, doc) => lookupDoc.id === doc.id);

  return matchedDocs;
}
