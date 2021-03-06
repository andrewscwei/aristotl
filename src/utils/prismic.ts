import Cookies from 'js-cookie';
import _ from 'lodash';
import PrismicDOM from 'prismic-dom';
import Prismic from 'prismic-javascript';
import { Document } from 'prismic-javascript/types/documents';
import ResolvedApi, { QueryOptions } from 'prismic-javascript/types/ResolvedApi';
import resolveLinks from '../links.conf';
import { getLocalizedPath } from './i18n';

const debug = (process.env.NODE_ENV === 'development' || __APP_CONFIG__.enableDebugInProduction === true) ? require('debug')('app:prismic') : () => {};

/**
 * Sets the page title, adds the preview tag if currently in preview mode.
 *
 * @param title - The title of the page to set to.
 */
export function setPageTitle(title: string) {
  document.title = hasPreviewToken() ? `[PREVIEW] ${title}` : title;
}

/**
 * Maps a Prismic document to its URL in the app. An example of when this is
 * used is when a modified document on Prismic is being previewed.
 *
 * @param doc - The Prismic document to map.
 *
 * @returns The corresponding URL.
 */
export function linkResolver(doc: Document): string {
  const locale = doc.lang ? localeResolver(doc.lang, true) : 'en';
  return getLocalizedPath(resolveLinks(doc), locale);
}

/**
 * Maps Prismic locale code to local locale code. Set `reverse` to `true` to
 * reverse the mapping (from local locale code to Prismic locale code instead).
 * Note that only local locale codes listed in `appConf#locales` will be
 * supported. Any unmappable or unsupported locale codes will yield English
 * locale as default.
 *
 * @param locale - Locale code to map.
 * @param reverse - Indicates if the operation is reversed. If `false` a Prismic
 *                  locale code is expected and will be mapped to a local locale
 *                  code. If `true` the mapping will be reversed.
 *
 * @returns The mapped locale code.
 */
export function localeResolver(locale: string, reverse = false): string {
  const defaultLocale = __I18N_CONFIG__.defaultLocale;
  const supportedLocales = __I18N_CONFIG__.locales;

  if (reverse) {
    const matches = locale.match(/^([a-zA-Z0-9]*)-?.*$/);
    return matches && matches.length > 0 && matches[1] || 'en';
  }
  else {
    if (supportedLocales.indexOf(locale) < 0) return defaultLocale;

    switch (locale) {
    case 'ar': return 'ar-ae'; // Arabic
    case 'bg': return 'bg'; // Bulgarian
    case 'ca': return 'ca'; // Catalan
    case 'cs': return 'cs-cz'; // Czech
    case 'da': return 'da-dk'; // Danish
    case 'de': return 'de-de'; // German
    case 'el': return 'el-gr'; // Greek
    case 'es': return 'es-es'; // Spanish
    case 'eu': return 'eu'; // Basque
    case 'fa': return 'fa-ir'; // Farsi
    case 'fi': return 'fi'; // Finnish
    case 'fr': return 'fr-fr'; // French
    case 'he': return 'he'; // Hebrew
    case 'hi': return 'hi-in'; // Hindi
    case 'hr': return 'hr'; // Croatian
    case 'hu': return 'hu'; // Hungarian
    case 'hy': return 'hy-am'; // Armenian
    case 'id': return 'id'; // Indonesian
    case 'is': return 'is'; // Icelandic
    case 'it': return 'it-it'; // Italian
    case 'ja': return 'ja-jp'; // Japanese
    case 'ko': return 'ko-kr'; // Korean
    case 'lt': return 'lt'; // Lithuanian
    case 'lv': return 'lv'; // Latvian
    case 'ms': return 'ms-my'; // Malay
    case 'nl': return 'nl-nl'; // Dutch
    case 'no': return 'no'; // Norwegian
    case 'pl': return 'pl'; // Polish
    case 'pt': return 'pt-pt'; // Portuguese
    case 'ro': return 'ro'; // Romanian
    case 'ru': return 'ru'; // Russian
    case 'sk': return 'sk'; // Slovak
    case 'sl': return 'sl'; // Slovenian
    case 'sv': return 'sv-se'; // Swedish
    case 'th': return 'th'; // Thai
    case 'tr': return 'tr'; // Turkish
    case 'vi': return 'vi'; // Vietnamese
    case 'zh': return 'zh-cn'; // Chinese
    default: return 'en-us'; // English
    }
  }
}

/**
 * Gets the object to be used to interact with the Prismic API.
 *
 * @returns The Prismic API object.
 */
export function getAPI(): Promise<ResolvedApi> {
  const { apiEndpoint, accessToken } = __APP_CONFIG__.prismic;
  return Prismic.api(apiEndpoint, { accessToken });
}

/**
 * Gets the preview path of a document.
 *
 * @param token - The preview token generated by Prismic.
 * @param documentId - The UID of the document to preview.
 *
 * @returns The preview path.
 */
export async function getPreviewPath(token: string, documentId: string): Promise<string> {
  const api = await getAPI();
  return api.getPreviewResolver(token, documentId).resolve(linkResolver, '/');
}

/**
 * Indicates if there exists a preview token.
 *
 * @returns `true` if a preview token exists, `false` otherwise.
 */
export function hasPreviewToken(): boolean {
  const token = loadPreviewToken();
  return token !== undefined;
}

/**
 * Saves the preview token to browser cookies.
 *
 * @param token - The preview token.
 */
export function savePreviewToken(token: string) {
  Cookies.set(Prismic.previewCookie, token, { expires: 1/24, path: '/' });

  if (loadPreviewToken()) {
    debug('Saving preview token to cookies...', 'OK');
  }
  else {
    debug('Saving preview token to cookies...', 'ERR');
  }
}

/**
 * Loads and returns the preview token from browser cookies, if available.
 *
 * @returns The preview token.
 */
export function loadPreviewToken(): string | undefined {
  const token = Cookies.get(Prismic.previewCookie);
  return token;
}

/**
 * Removes the preview token from browser cookies.
 */
export function removePreviewToken() {
  Cookies.remove(Prismic.previewCookie);
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

/**
 * Convenience method for fetching the text from a document field.
 *
 * @param doc - The document.
 * @param path - The path of the target field relative to the root of the
 *               document object.
 *
 * @returns The text if available, `undefined` otherwise.
 */
export function getText(doc?: Document, path = ''): string | undefined {
  const fragment = _.get(doc, path);

  if (!fragment) return undefined;
  if (typeof fragment === 'string') return fragment;

  return PrismicDOM.RichText.asText(fragment);
}

/**
 * Convenience method for fetching multiple texts from a document array field.
 *
 * @param doc - The document.
 * @param path - The path of the array field relative to the root of the
 *               document object.
 * @param subpath - The path of the target field relative the root of each item
 *                  in the array field.
 *
 * @returns An array of texts if available. If the target path is a valid array
 *          but the target subpath contains no text, an empty array is returned.
 *          If the target path is not an array, `undefined` is returned.
 */
export function getTexts(doc?: Document, path = '', subpath = ''): ReadonlyArray<string> | undefined {
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

/**
 * Convenience method for fetching the number from a document field.
 *
 * @param doc - The document.
 * @param path - The path of the target field relative to the root of the
 *               document object.
 *
 * @returns The number if available, `undefined` otherwise.
 */
export function getNumber(doc?: Document, path = ''): number | undefined {
  const fragment = _.get(doc, path);

  if (!fragment) return undefined;
  if (typeof fragment === 'number') return fragment;

  return fragment;
}

/**
 * Convenience method for fetching multiple numbers from a document array field.
 *
 * @param doc - The document.
 * @param path - The path of the array field relative to the root of the
 *               document object.
 * @param subpath - The path of the target field relative the root of each item
 *                  in the array field.
 *
 * @returns An array of numbers if available. If the target path is a valid
 *          array but the target subpath contains no number, an empty array is
 *          returned. If the target path is not an array, `undefined` is
 *          returned.
 */
export function getNumbers(doc?: Document, path = '', subpath = ''): ReadonlyArray<number> | undefined {
  const fragments = _.get(doc, path);

  if (!_.isArray(fragments)) return undefined;

  const numbers = _.reduce(fragments, (out, curr: any) => {
    const n = _.get(curr, subpath);
    if (n === undefined || n === null) return out;

    if (typeof n === 'number') {
      out.push(n);
    }
    else {
      out.push(n);
    }

    return out;
  }, Array<number>());

  return numbers;
}

/**
 * Convenience method for fetching the URL from a document field.
 *
 * @param doc - The document.
 * @param path - The path of the target field relative to the root of the
 *               document object.
 *
 * @returns The URL if available, `undefined` otherwise.
 */
export function getUrl(doc?: Document, path = ''): string | undefined {
  const fragment = _.get(doc, path);

  if (!fragment) return undefined;

  return PrismicDOM.Link.url(fragment, linkResolver);
}

/**
 * Convenience method for fetching multiple URLs from a document array field.
 *
 * @param doc - The document.
 * @param path - The path of the array field relative to the root of the
 *               document object.
 * @param subpath - The path of the target field relative the root of each item
 *                  in the array field.
 *
 * @returns An array of URLs if available. If the target path is a valid array
 *          but the target subpath contains no URL, an empty array is returned.
 *          If the target path is not an array, `undefined` is returned.
 */
export function getUrls(doc?: Document, path = '', subpath = ''): ReadonlyArray<string> | undefined {
  const fragments = _.get(doc, path);

  if (!_.isArray(fragments)) return undefined;

  const urls = _.reduce(fragments, (out, curr: any) => {
    const url = _.get(curr, subpath);
    if (!url) return out;
    if (url.length === 0) return out;

    out.push(PrismicDOM.Link.url(url, linkResolver));

    return out;
  }, Array<string>());

  return urls;
}

/**
 * Convenience method for fetching the HTML markup from a document field.
 *
 * @param doc - The document.
 * @param path - The path of the target field relative to the root of the
 *               document object.
 *
 * @returns The HTML markup if available, `undefined` otherwise.
 */
export function getMarkup(doc?: Document, path = ''): string | undefined {
  const fragment = _.get(doc, path);

  if (!fragment) return undefined;

  return PrismicDOM.RichText.asHtml(fragment, linkResolver);
}

/**
 * Convenience method for fetching multiple HTML markups from a document array
 * field.
 *
 * @param doc - The document.
 * @param path - The path of the array field relative to the root of the
 *               document object.
 * @param subpath - The path of the target field relative the root of each item
 *                  in the array field.
 *
 * @returns An array of HTML markups if available. If the target path is a valid
 *          array but the target subpath contains no HTML markup, an empty array
 *          is returned. If the target path is not an array, `undefined` is
 *          returned.
 */
export function getMarkups(doc?: Document, path = '', subpath = ''): ReadonlyArray<string> | undefined {
  const fragments = _.get(doc, path);

  if (!_.isArray(fragments)) return undefined;

  const markups = _.reduce(fragments, (out, curr: any) => {
    const markup = _.get(curr, subpath);
    if (!markup) return out;
    if (markup.length === 0) return out;

    out.push(PrismicDOM.RichText.asHtml(markup, linkResolver));

    return out;
  }, Array<string>());

  return markups;
}

/**
 * Convenience method for fetching the inner document from a document field.
 *
 * @param doc - The document.
 * @param path - The path of the target field relative to the root of the
 *               document object.
 *
 * @returns The HTML markup if available, `undefined` otherwise.
 */
export function getDoc(doc?: Document, path = '', lookupDocs?: ReadonlyArray<Document>): Document | undefined {
  const fragment = _.get(doc, path);

  if (!fragment) return undefined;
  if (!fragment.id) return undefined;

  if (!lookupDocs) return fragment;

  return _.find(lookupDocs, (v) => v.id === fragment.id);
}

/**
 * Convenience method for fetching multiple inner documents from a document
 * array field.
 *
 * @param doc - The document.
 * @param path - The path of the array field relative to the root of the
 *               document object.
 * @param subpath - The path of the target field relative the root of each item
 *                  in the array field.
 *
 * @returns An array of inner documents if available. If the target path is a
 *          valid array but the target subpath contains no inner document, an
 *          empty array is returned. If the target path is not an array,
 *          `undefined` is returned.
 */
export function getDocs(doc?: Document, path = '', subpath = '', lookupDocs?: ReadonlyArray<Document>): ReadonlyArray<Document> | undefined {
  const fragments = _.get(doc, path);

  if (!fragments) return undefined;

  const docs = _.reduce(fragments, (out, curr: any) => {
    const doc = _.get(curr, subpath);
    if (doc && doc.id) out.push(doc);
    return out;
  }, Array<Document>());

  if (!lookupDocs) return docs;

  const matchedDocs = _.intersectionWith(lookupDocs, docs, (lookupDoc, doc) => lookupDoc.id === doc.id);

  return matchedDocs;
}
