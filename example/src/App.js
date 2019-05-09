import React from 'react'

import Example1 from './Example1'
import Example2 from './Example2'

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

    </div>
  )
}

export default App
