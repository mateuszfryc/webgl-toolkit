import { getWebGLContext, newWebGLRenderer, getRectangleCoords } from '../webgl-toolkit.mjs';

const vertexSource = `
  attribute vec2 a_position;
  attribute vec2 a_uv;
  uniform mat3 u_projection;
  uniform vec2 u_translation;
  varying vec2 v_uv;

  void main() {
    gl_Position = vec4(u_projection * vec3(a_position + u_translation, 1), 1);
    v_uv = a_uv;
  }
`;

const fragmentSource = `
  precision mediump float;

  uniform sampler2D u_image;
  varying vec2 v_uv;

  void main() {
    gl_FragColor = texture2D(u_image, v_uv);
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

function render(gl, _, uniforms) {
  // set the translation (change to initial position)
  gl.uniform2f(uniforms.translation.location, mousePosition.x, mousePosition.y);

  gl.drawArrays(
    gl.TRIANGLES, // gl.TRIANGLES
    0, // offset
    6, // count
  );
}

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
      render,
      image,
    );

    function frame() {
      renderImage();

      requestAnimationFrame(frame);
    }

    frame();
  };
});
