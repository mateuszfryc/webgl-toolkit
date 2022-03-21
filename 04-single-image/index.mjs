import { getWebGLContext, initializeOnce, getRectangleCoords } from '../tools.mjs';

const vertexSource = `
  attribute vec2 a_position;
  attribute vec2 a_uv;

  uniform vec2 u_resolution;

  varying vec2 v_uv;

  void main() {
    // convert the rectangle from pixels to 0.0 to 1.0
    vec2 zeroToOne = a_position / u_resolution;

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

window.addEventListener('load', () => {
  const image = new Image();
  image.src = './leaves.jpg';

  image.onload = () => {
    const buffersData = {
      position: getRectangleCoords(0, 0, image.width, image.height),
    };
    const [gl] = getWebGLContext();
    const renderImage = initializeOnce(
      gl,
      vertexSource,
      fragmentSource,
      buffersData,
      undefined,
      image,
    );

    renderImage();
  };
});
