/**
 * @file Client app root.
 */

import React from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router'
import PreviewIndicator from '../components/PreviewIndicator'
import { hasPreviewToken } from '../utils/prismic'
import Home from './Home'
import NotFound from './NotFound'
import Preview from './Preview'

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <>
      {hasPreviewToken() && <PreviewIndicator/>}
      <Routes>
        <Route path='/' element={<Home location={location} navigate={navigate}/>}/>
        <Route path='about' element={<Preview/>}/>
        <Route path='*' element={<NotFound/>}/>
      </Routes>
    </>
  )
}
