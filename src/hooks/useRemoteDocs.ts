import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getDefinitions, getFallacies, getMetadata } from '../selectors'
import { fetchDefinitionsAction } from '../store/definitions'
import { fetchFallaciesAction } from '../store/fallacies'
import { fetchMetadataAction } from '../store/metadata'
import { useLocale } from '../utils/i18n'
import { hasPreviewToken } from '../utils/prismic'

export default function useRemoteDocs() {
  const dispatch = useDispatch()
  const locale = useLocale()

  const definitions = useSelector(getDefinitions(locale))
  const fallacies = useSelector(getFallacies(locale))
  const metadataDoc = useSelector(getMetadata(locale))

  useEffect(() => {
    const isPreviewing = hasPreviewToken()

    if (!metadataDoc || isPreviewing) dispatch(fetchMetadataAction() as any)
    if ((fallacies.length === 0) || isPreviewing) dispatch(fetchFallaciesAction() as any)
    if ((definitions.length === 0) || isPreviewing) dispatch(fetchDefinitionsAction() as any)
  }, [])
}
