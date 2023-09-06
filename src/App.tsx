import React from 'react';
import './App.css';

import 'chrome' 

function App() {
 return (
   <div className="App">
     <h1>SEO Extension built with React!</h1>
 
     <ul className="SEOForm">
       <li className="SEOValidation">
         <div className="SEOValidationField">
           <span className="SEOValidationFieldTitle">Title</span>
           <span className="SEOValidationFieldStatus Error">
             90 Characters
           </span>
         </div>
         <div className="SEOVAlidationFieldValue">
           The title of the page
         </div>
       </li>
 
       <li className="SEOValidation">
         <div className="SEOValidationField">
           <span className="SEOValidationFieldTitle">Main Heading</span>
           <span className="SEOValidationFieldStatus Ok">
             1
           </span>
         </div>
         <div className="SEOVAlidationFieldValue">
           The main headline of the page (H1)
         </div>
       </li>
     </ul>
   </div>
 );
}

// open chrome side panel
chrome.devtools.panels.create("SEO", null, function(panel) {
  panel.onShown.addListener(function(window) {
    // append react app to the panel
    window.document.body.appendChild(App());
  });
});

chrome.sidePanel.open({ tabId: 5});
 
export default App;