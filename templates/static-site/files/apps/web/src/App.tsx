/**
 * Main App Component
 *
 * Static site starter with React and Vite.
 */

import React from 'react';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="hero">
        <h1>{{projectName}}</h1>
        <p>Your static site is ready!</p>
        <div className="buttons">
          <a href="#features" className="btn btn-primary">
            Get Started
          </a>
          <a
            href="https://stacksolo.dev/docs"
            className="btn btn-secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </header>

      <section id="features" className="features">
        <h2>Features</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <span className="feature-icon">⚡</span>
            <h3>Fast</h3>
            <p>Built with Vite for lightning-fast development and optimized production builds.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🎯</span>
            <h3>TypeScript</h3>
            <p>Full TypeScript support out of the box for type-safe development.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🚀</span>
            <h3>Deploy Ready</h3>
            <p>One command to deploy to GCP Cloud Storage with CDN.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📦</span>
            <h3>Minimal</h3>
            <p>Clean starting point without unnecessary dependencies.</p>
          </div>
        </div>
      </section>

      <section className="cta">
        <h2>Ready to build?</h2>
        <p>Start editing <code>src/App.tsx</code> to customize your site.</p>
        <pre className="code-block">
          <code>stacksolo deploy</code>
        </pre>
      </section>

      <footer className="footer">
        <p>
          Built with{' '}
          <a href="https://stacksolo.dev" target="_blank" rel="noopener noreferrer">
            StackSolo
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
