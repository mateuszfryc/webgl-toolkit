import { getWebGLContext, newWebGLRenderer, getRectangleCoords } from '../webgl-toolkit.mjs';

const vertexSource = `
  attribute vec2 a_position;
  attribute vec2 a_uv;
  uniform mat3 u_projection;
  varying vec2 v_uv;

  void main() {
    gl_Position = vec4(u_projection * vec3(a_position, 1), 1);

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
    const renderImage = newWebGLRenderer(
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
