/**
 * @file Client app root.
 */

import React from 'react'
import { Route, Routes } from 'react-router'
import PreviewIndicator from '../components/PreviewIndicator'
import { hasPreviewToken } from '../utils/prismic'
import Home from './Home'
import NotFound from './NotFound'
import Preview from './Preview'

export default function App() {
  return (
    <>
      {hasPreviewToken() && <PreviewIndicator/>}
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='preview' element={<Preview/>}/>
        <Route path='*' element={<NotFound/>}/>
      </Routes>
    </>
  )
}
