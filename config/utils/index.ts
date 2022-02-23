/* tslint:disable no-reference */
/// <reference path='../../src/custom.d.ts' />
/**
 * @file Utility functions for the build process.
 */

import fs from 'fs'
import path from 'path'
import requireDir from 'require-dir'

export function getLocalesFromDir(dir: string, defaultLocale?: string, whitelistedLocales?: string[]): string[] {
  const t = fs
    .readdirSync(dir)
    .filter((val: string) => !(/(^|\/)\.[^/.]/g).test(val))
    .map((val: string) => path.basename(val, '.json'))
    .filter((val: string) => whitelistedLocales ? ~whitelistedLocales.indexOf(val) : true)

  if (defaultLocale && ~t.indexOf(defaultLocale)) {
    t.splice(t.indexOf(defaultLocale), 1)
    t.unshift(defaultLocale)
  }

  return t
}

export function getTranslationsFromDir(dir: string, whitelistedLocales?: string[]): TranslationDataDict {
  const dict: TranslationDataDict = {}
  const locales = whitelistedLocales ? whitelistedLocales : getLocalesFromDir(dir)
  const t: { [key: string]: any } = requireDir(path.resolve(dir))

  for (const locale in t) {
    if (~locales.indexOf(locale)) {
      dict[locale] = t[locale]
    }
  }

  return dict
}
