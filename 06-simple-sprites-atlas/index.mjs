import { initializeOnce, getWebGLContext } from '../tools.mjs';

const vertexSource = `
  attribute vec2 a_position;
  attribute vec2 a_uv;
  uniform vec2 u_resolution;
  uniform vec2 u_translation;
  varying vec2 v_uv;

  void main() {
    vec2 position = a_position + u_translation;

    // convert the rectangle from pixels to 0.0 to 1.0
    vec2 zeroToOne = position / u_resolution;

    // convert from 0->1 to 0->2
    vec2 zeroToTwo = zeroToOne * 2.0;

    // convert from 0->2 to -1->+1 (clipspace)
    vec2 clipSpace = zeroToTwo - 1.0;

    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

    // pass the uv to the fragment shader
    // The GPU will interpolate this value between points.
    v_uv = a_uv;
  }
`;

const fragmentSource = `
  precision mediump float;

  // our texture
  uniform sampler2D u_image;

  // the uvs passed in from the vertex shader.
  varying vec2 v_uv;

  void main() {
    gl_FragColor = texture2D(u_image, v_uv);
  }
`;

const spritesAtlasData = [
  // sprite index 0
  {
    position: [0, 0],
    size: [330, 330],
  },
  // sprite index 1
  {
    position: [450, 100],
    size: [160, 160],
  },
];

const randomInt = (min, max) => Math.round(Math.random() * (max - min) + min);

// generate renderable sprites data, where each entry
// consists of:
// [spriteIndex, x position, y position]
const renderrablesData = Array.from({ length: 100 }, () => [
  // random index
  randomInt(0, 1),
  // random x and y
  randomInt(0, 500),
  randomInt(0, 500),
]);

window.addEventListener('load', () => {
  const image = new Image();
  image.src = './tiles.jpg';

  image.onload = () => {
    function render(gl, _c, uniforms, _a, renderables) {
      renderables.forEach((data) => {
        gl.uniform2f(uniforms.translation.location, data[1], data[2]);

        gl.drawArrays(
          gl.TRIANGLES, // gl.TRIANGLES
          data[0] * 6, // offset
          6, // count
        );
      });
    }

    const [gl] = getWebGLContext();
    const renderImage = initializeOnce(
      gl,
      vertexSource,
      fragmentSource,
      null,
      render,
      image,
      spritesAtlasData,
    );

    function frame() {
      renderrablesData.forEach((data) => {
        data[1] += randomInt(-1, 1);
        data[2] += randomInt(-1, 1);
      });

      renderImage(renderrablesData);

      requestAnimationFrame(frame);
    }

    frame();
  };
});
