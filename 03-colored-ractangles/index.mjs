import { getWebGLContext, initializeOnce, setRectangle, randomInt } from '../tools.mjs';

const rectangleVertex = `
  attribute vec2 a_position;
  uniform vec2 u_resolution;

  void main() {
    // convert the rectangle from pixels to 0.0 to 1.0
    vec2 zeroToOne = a_position / u_resolution;

    // convert from 0->1 to 0->2
    vec2 zeroToTwo = zeroToOne * 2.0;

    // convert from 0->2 to -1->+1 (clipspace)
    vec2 clipSpace = zeroToTwo - 1.0;

    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
  }
`;

const rectangleFragment = `
  precision mediump float;
  uniform vec4 u_color;

  void main() {
    gl_FragColor = u_color;
  }
`;

/*
  Two triangles, three points each

  top right triangle
   _____
    \  |
  |\ \ |
  | \ \|
  |__\

  bottom left triangle

*/
// prettier-ignore
const buffersData = {position:[
  // triangle in top right corner of the ractangle
  100, 300, // top left point
  800, 200, // bottom right point
  800, 300,  // top right point

  // triangle in the left bottom corner of the rectangle
  100, 200,  // left bottom point
  800, 200, // right bottom point
  100, 300,  // top left point
]};

function render(gl, _, uniforms) {
  // draw 50 random rectangles in random colors
  for (let ii = 0; ii < 50; ++ii) {
    // Setup a random rectangle
    // This will write to positionBuffer because
    // its the last thing we bound on the ARRAY_BUFFER
    // bind point
    setRectangle(gl, randomInt(300), randomInt(300), randomInt(300), randomInt(300));

    // Set a random color.
    gl.uniform4f(uniforms.color.location, Math.random(), Math.random(), Math.random(), 1);

    // Draw the rectangle.
    const primitiveType = gl.TRIANGLES;
    const offset = 0;
    const count = 6;
    gl.drawArrays(primitiveType, offset, count);
  }

  return false;
}

window.addEventListener('load', () => {
  const [gl] = getWebGLContext();
  const drawRectangle = initializeOnce(gl, rectangleVertex, rectangleFragment, buffersData, render);
  drawRectangle();
});
