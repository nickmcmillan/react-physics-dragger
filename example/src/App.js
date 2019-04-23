import React, { Component } from 'react'

import Dragger from 'react-physics-dragger'

export default class App extends Component {
  render() {
    return (
      <div>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Labore perspiciatis, architecto velit amet ad a mollitia commodi nesciunt in consequuntur sit dolore iusto quas, aperiam repudiandae, non error laboriosam. Molestias!</p>
        <Dragger
          friction={0.92}
          stiffness={0.08}
          padding={0}
          style={{
            // width: '300px',
            height: '300px'
          }}
        >
          <button>1</button>
          <button>2</button>
          <button>3</button>
          <button>4</button>
          <button>5</button>
        </Dragger>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Iure omnis atque delectus ea laborum vel, dolorum accusantium. Similique esse ab repellendus impedit quae debitis odit in, totam soluta facere at. </p>
      </div>
    )
  }
}
