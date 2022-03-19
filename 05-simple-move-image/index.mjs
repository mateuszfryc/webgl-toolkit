import { initializeOnce, getRectangleCoords } from '../tools.mjs';

const vertexSource = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;

  uniform vec2 u_resolution;
  uniform vec2 u_translation;

  varying vec2 v_texCoord;

  void main() {
    vec2 position = a_position + u_translation;

    // convert the rectangle from pixels to 0.0 to 1.0
    vec2 zeroToOne = position / u_resolution;

    // convert from 0->1 to 0->2
    vec2 zeroToTwo = zeroToOne * 2.0;

    // convert from 0->2 to -1->+1 (clipspace)
    vec2 clipSpace = zeroToTwo - 1.0;

    // flip y coordiantes to match the usual browser approach
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

    // pass the texCoord to the fragment shader
    // The GPU will interpolate this value between points.
    v_texCoord = a_texCoord;
  }
`;

const fragmentSource = `
  precision mediump float;

  // our texture
  uniform sampler2D u_image;

  // the texCoords passed in from the vertex shader.
  varying vec2 v_texCoord;

  void main() {
    gl_FragColor = texture2D(u_image, v_texCoord);
  }
`;

const mousePosition = {
  x: 0,
  y: 0,
};

document.addEventListener('mousemove', (event) => {
  const e = event ?? window.event;
  mousePosition.x = e.pageX ?? e.clientX ?? 0;
  mousePosition.y = e.pageY ?? e.clientY ?? 0;
});

function render(gl, uniforms) {
  // set the translation (change to initial position)
  gl.uniform2f(uniforms.translation.location, mousePosition.x, mousePosition.y);

  return true;
}

window.addEventListener('load', () => {
  const image = new Image();
  image.src = './leaves.jpg';

  image.onload = () => {
    const buffersData = {
      position: getRectangleCoords(0, 0, image.width, image.height),
    };
    const renderImage = initializeOnce(vertexSource, fragmentSource, buffersData, render, image);

    function frame() {
      renderImage();

      requestAnimationFrame(frame);
    }

    frame();
  };
});
