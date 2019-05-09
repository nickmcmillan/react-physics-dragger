import React, { useState, useRef, useEffect } from "react";
import ResizeObserver from "resize-observer-polyfill";
import Dragger from "react-physics-dragger";

function reverseNumber(num, min, max) {
  return max + min - num;
}

const Example2 = () => {
  const [frame, setFrame] = useState({});
  const ref = useRef(null);

  useEffect(
    () => {
      const width = frame.innerWidth > frame.outerWidth ? frame.outerWidth : frame.innerWidth
      const x = frame.x / (width - ref.current.offsetWidth);
      const opacity = reverseNumber(x, 0, 1);
      ref.current.style.opacity = opacity;
    },
    [frame.x, frame.innerWidth]
  );

  return (
    <section className="section">
      <p>Or use onFrame to change other CSS properties...</p>

      <Dragger
        ResizeObserver={ResizeObserver}
        onFrame={frame => setFrame(frame)}
        className="dragger dragger--full"
      >
        <div className="item-standard" ref={ref}>
          You once were a ve-gone, but now... you will be gone →
        </div>
      </Dragger>
    </section>
  );
};

export default Example2;
