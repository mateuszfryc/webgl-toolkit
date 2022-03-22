import { getWebGLContext, newWebGLRenderer, setRectangle } from '../webgl-toolkit.mjs';
import { randomInt } from '../math.mjs';

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
  uniform vec4 u_color;

  void main() {
    gl_FragColor = u_color;
  }
`;

function render(gl, _, uniforms) {
  // draw 50 random rectangles in random colors
  for (let ii = 0; ii < 50; ++ii) {
    // Setup a random rectangle
    // This will write to positionBuffer because
    // its the last thing we bound on the ARRAY_BUFFER
    // bind point
    setRectangle(gl, randomInt(0, 300), randomInt(0, 300), randomInt(0, 300), randomInt(0, 300));

    // Set a random color.
    gl.uniform4f(uniforms.color.location, Math.random(), Math.random(), Math.random(), 1);

    // Draw the rectangle.
    const primitiveType = gl.TRIANGLES;
    const offset = 0;
    const count = 6;
    gl.drawArrays(primitiveType, offset, count);
  }
}

window.addEventListener('load', () => {
  const [gl] = getWebGLContext();
  const drawRectangle = newWebGLRenderer(gl, rectangleVertex, rectangleFragment, undefined, render);
  drawRectangle();
});
