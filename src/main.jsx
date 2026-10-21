import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './App.css'
import { captureStaticBlock } from '../seo/StaticPage.jsx'

// Keep the prerendered block before React replaces #root. Pages that have no component of
// their own (the answers, the about page) are shown from it. See seo/StaticPage.jsx.
captureStaticBlock()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
