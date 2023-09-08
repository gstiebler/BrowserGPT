import React from 'react';
import './App.css';

function App() {

  const buttonClick = () => {
    console.log('Button clicked!');
    chrome.runtime.sendMessage({ type: 'execute' });
  }

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
          <button onClick={buttonClick}>Click me!</button>
        </li>
      </ul>
    </div>
  );
}

export default App;
