/**
 * @file Client app root.
 */

import React, { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router'
import PreviewIndicator from '../components/PreviewIndicator'
import { hasPreviewToken } from '../utils/prismic'
import Home from './Home'
import NotFound from './NotFound'
import Preview from './Preview'

export default function App() {
  const [isPreviewing, setIsPreviewing] = useState(hasPreviewToken())

  useEffect(() => {
    setIsPreviewing(hasPreviewToken())
  }, [])

  return (
    <>
      {isPreviewing && <PreviewIndicator/>}
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='preview' element={<Preview/>}/>
        <Route path='*' element={<NotFound/>}/>
      </Routes>
    </>
  )
}
