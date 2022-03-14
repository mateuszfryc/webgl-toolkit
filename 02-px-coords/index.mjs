import initializeOnce from './tools.mjs';

const rectangleVertex = `
  // an attribute will receive data from a buffer
  attribute vec2 a_position;
  uniform vec2 u_resolution;

  // all shaders have a main function
  void main() {
    // convert the position from pixels to 0.0 to 1.0
    vec2 zeroToOne = a_position / u_resolution;

    // convert from 0->1 to 0->2
    vec2 zeroToTwo = zeroToOne * 2.0;

    // convert from 0->2 to -1->+1 (clip space)
    vec2 clipSpace = zeroToTwo - 1.0;

    gl_Position = vec4(clipSpace, 0., 1.);
  }
`;

const rectangleFragment = `
  // fragment shaders don't have a default precision so we need
  // to pick one. mediump is a good default
  precision mediump float;

  void main() {
    // gl_FragColor is a special variable a fragment shader
    // is responsible for setting
    gl_FragColor = vec4(1, 0, 0.5, 1); // return reddish-purple
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
const rectanglePositions = [
  // triangle in top right corner of the ractangle
  100, 300, // top left point
  800, 200, // bottom right point
  800, 300,  // top right point

  // triangle in the left bottom corner of the rectangle
  100, 200,  // left bottom point
  800, 200, // right bottom point
  100, 300,  // top left point
];

window.addEventListener('load', () => {
  const drawRectangle = initializeOnce(rectangleVertex, rectangleFragment, rectanglePositions);
  drawRectangle();
});
