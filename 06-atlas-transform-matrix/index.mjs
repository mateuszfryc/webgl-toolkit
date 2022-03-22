import { newWebGLRenderer, getWebGLContext } from '../webgl-toolkit.mjs';
import { randomFloat, randomInt } from '../math.mjs';

const vertexSource = `
  precision mediump float;
  attribute vec2 a_position;
  attribute vec2 a_pivot;
  attribute vec2 a_uv;
  uniform mat3 u_projection;

  // x = x coordinate translation
  // y = y coordinate translation
  // z = scale or "zoom"
  // w = for rotation
  uniform vec4 u_transform;

  varying vec2 v_uv;

  void main() {
    mat3 translation = mat3(
      1, 0, 0,
      0, 1, 0,
      u_transform.x, u_transform.y, 1
    );

    float c = cos(u_transform.w);
    float s = sin(u_transform.w);
    mat3 rotation = mat3(
      c, s, 0,
      -s, c, 0,
      0, 0, 1
    );

    mat3 scaling = mat3(
      u_transform.z, 0, 0,
      0, u_transform.z, 0,
      0, 0, 1
    );

    mat3 pivot = mat3(
      1, 0, 0,
      0, 1, 0,
      a_pivot.x * u_transform.z, a_pivot.y * u_transform.z, 1
    );

    vec3 position = u_projection * translation * rotation * pivot * scaling * vec3(a_position, 1.);

    gl_Position = vec4(position, 1);
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

function render(gl, _c, uniforms, _a, renderables) {
  renderables.forEach(([index, x, y, scale, angle]) => {
    gl.uniform4f(uniforms.transform.location, x, y, scale, angle);

    gl.drawArrays(
      gl.TRIANGLES, // gl.TRIANGLES
      index * 6, // offset
      6, // count
    );
  });
}

window.addEventListener('load', () => {
  const image = new Image();
  image.src = './tiles.jpg';

  image.onload = () => {
    const [gl, canvas] = getWebGLContext();

    // generate renderable sprites data, where each entry
    // consists of:
    // [spriteIndex, x position, y position]
    const renderrablesData = Array.from({ length: 1500 }, () => [
      // random index
      randomInt(0, 1),
      // random x and y
      randomInt(0, canvas.width),
      randomInt(0, canvas.height),
      // random scale
      randomFloat(0.01, 0.2),
      // random rotation
      randomFloat(0, Math.PI * 2),
    ]);

    const renderImage = newWebGLRenderer(
      gl,
      vertexSource,
      fragmentSource,
      undefined,
      render,
      image,
      spritesAtlasData,
    );

    function frame() {
      renderrablesData.forEach((data) => {
        data[3] = (Math.sin(performance.now() * 0.001) + 1.5) * 0.2;
        data[4] += 0.01;
      });
      renderImage(renderrablesData);

      requestAnimationFrame(frame);
    }

    frame();
  };
});
