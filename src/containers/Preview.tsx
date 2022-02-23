import _ from 'lodash'
import qs from 'query-string'
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useSearchParams } from 'react-router-dom'
import { getPreviewPath, savePreviewToken } from '../utils/prismic'

const debug = (process.env.NODE_ENV === 'development' || __APP_CONFIG__.enableDebugInProduction === true) ? require('debug')('app:preview') : () => {}

export default function Preview() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token')
  const documentId = params.get('documentId')

  const preview = async () => {
    if (!token || !documentId) return

    debug(`Previewing document <${documentId}>...`)

    savePreviewToken(token)

    const path = await getPreviewPath(token, documentId)
    const parsed = qs.parseUrl(path, { parseFragmentIdentifier: true })

    navigate({
      pathname: parsed.url,
      hash: parsed.fragmentIdentifier,
      search: _.isEmpty(params) ? undefined : `?${qs.stringify(parsed.query)}`,
    })
  }

  useEffect(() => {
    preview()
  }, [])

  return (
    <></>
  )
}
