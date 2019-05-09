import React from 'react'

import Example1 from './Example1'
import Example2 from './Example2'
import Example3 from './Example3'

const App = () => {
  return (
    <div className="container">

      <h1>
        <a
          href="https://github.com/nickmcmillan/react-physics-dragger"
          target="_blank"
          rel="noopener noreferrer"
          className="title-anchor"
        >
          React Physics Dragger
        </a>
      </h1>

      <Example1 />
      <Example2 />
      <Example3 />

      <p>The images and names used on this page are from the Scott Pilgrim graphic novels by Bryan Lee O'Malley.</p>

    </div>
  )
}

export default App
