import React, { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useSearchParams } from 'react-router-dom'
import { getPreviewPath, savePreviewToken } from '../utils/prismic'

const debug = (process.env.NODE_ENV === 'development' || __APP_CONFIG__.enableDebugInProduction === true) ? require('debug')('app:preview') : () => {}

export default function Preview() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const documentId = searchParams.get('documentId')

  const preview = async () => {
    if (!token || !documentId) return

    debug(`Previewing document <${documentId}>...`)

    savePreviewToken(token)

    const path = await getPreviewPath(token, documentId)

    navigate(path)
  }

  useEffect(() => {
    preview()
  }, [])

  return (
    <></>
  )
}
