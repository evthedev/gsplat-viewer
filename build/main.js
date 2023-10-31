import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import ReactDOM from 'react-dom/client';
import GsplatViewer from './GsplatViewer';
import './index.css';
const container = document.getElementById('gsplat-viewer-1');
// const fileUrl = 'https://media.reshot.ai/models/nike_next/model.splat';
const fileUrl = container?.getAttribute('data-splat-file');
console.log('🚀 ~ file: main.tsx:9 ~ fileUrl:', fileUrl);
// Use this for the platform app
// ReactDOM.createRoot(document.getElementById('root')!).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
// )
// Use this for the viewer to support multiple viewers on the same page
const mountApp = (rootId) => {
    console.log('🚀 ~ file: main.tsx:19 ~ mountApp ~ rootId:', rootId);
    const rootElement = document.getElementById(rootId);
    console.log('🚀 ~ file: main.tsx:21 ~ mountApp ~ rootElement:', rootElement);
    if (rootElement) {
        ReactDOM.createRoot(rootElement).render(_jsx(React.StrictMode, { children: _jsx(GsplatViewer, { fileUrl: fileUrl }) }));
    }
};
// Function to check the page for root elements and mount the app on them
const checkAndMountApp = () => {
    let count = 1;
    let rootElement = document.getElementById('gsplat-viewer-' + count);
    while (rootElement) {
        mountApp('gsplat-viewer-' + count);
        count++;
        rootElement = document.getElementById('gsplat-viewer-' + count);
    }
};
// Call the function on page load
window.addEventListener('DOMContentLoaded', checkAndMountApp);
