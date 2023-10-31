import React from 'react';
import ReactDOM from 'react-dom/client';
import GsplatViewer from './GsplatViewer';
import './index.css';

const container = document.getElementById('gsplat-viewer');
// const fileUrl = 'https://media.reshot.ai/models/nike_next/model.splat';
const fileUrl = container?.getAttribute('data-splat-file') as RequestInfo;

// Use this for the platform app
// ReactDOM.createRoot(document.getElementById('root')!).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
// )

// Use this for the viewer to support multiple viewers on the same page
const mountApp = (rootId: string) => {
  const rootElement = document.getElementById(rootId);
  if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <GsplatViewer fileUrl={fileUrl} />
      </React.StrictMode>
    );
  }
};

// Function to check the page for root elements and mount the app on them
const checkAndMountApp = () => {
  let count = 1;
  let rootElement = document.getElementById('root' + count);
  while (rootElement) {
    mountApp('root' + count);
    count++;
    rootElement = document.getElementById('root' + count);
  }
};

// Call the function on page load
window.addEventListener('DOMContentLoaded', checkAndMountApp);
