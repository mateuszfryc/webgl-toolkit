import { getWebGLContext, newWebGLRenderer } from '../webgl-toolkit.mjs';

const rectangleVertex = `
  attribute vec2 a_position;
  uniform mat3 u_projection;

  // all shaders have a main function
  void main() {
    gl_Position = vec4(u_projection * vec3(a_position, 1), 1);
  }
`;

const rectangleFragment = `
  precision mediump float;

  void main() {
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
const buffersData = {
  position: [
    // triangle in top right corner of the ractangle
    100, 300, // top left point
    800, 200, // bottom right point
    800, 300,  // top right point

    // triangle in the left bottom corner of the rectangle
    100, 200,  // left bottom point
    800, 200, // right bottom point
    100, 300,  // top left point
  ]
};

window.addEventListener('load', () => {
  const [gl] = getWebGLContext();
  const drawRectangle = newWebGLRenderer(gl, rectangleVertex, rectangleFragment, buffersData);
  drawRectangle();
});
