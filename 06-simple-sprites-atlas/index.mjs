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

const spritesData = [
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

const renderrablesData = [
  {
    spriteIndex: 0,
    position: [30, 120],
  },
  {
    spriteIndex: 0,
    position: [400, 20],
  },
  {
    spriteIndex: 1,
    position: [700, 420],
  },
  {
    spriteIndex: 1,
    position: [40, 320],
  },
  {
    spriteIndex: 0,
    position: [30, 120],
  },
  {
    spriteIndex: 0,
    position: [400, 20],
  },
  {
    spriteIndex: 1,
    position: [700, 420],
  },
  {
    spriteIndex: 1,
    position: [40, 320],
  },
  {
    spriteIndex: 0,
    position: [30, 120],
  },
  {
    spriteIndex: 0,
    position: [400, 20],
  },
];

const random = (min, max) => Math.random() * (max - min) + min;

renderrablesData.forEach((image) => {
  image.position[0] += random(0, 500);
  image.position[1] += random(0, 500);
});

window.addEventListener('load', () => {
  const image = new Image();
  image.src = './tiles.jpg';

  image.onload = () => {
    const { width, height } = image;

    // create triangles points (position) and texture coordiantes (UVs) from sprites data
    const buffersData = {
      position: spritesData.map(({ size }) => getRectangleCoords(0, 0, size[0], size[1])).flat(),

      texCoord: spritesData
        .map(({ position, size }) =>
          getRectangleCoords(
            position[0] / width,
            position[1] / height,
            size[0] / width,
            size[1] / height,
          ),
        )
        .flat(),
    };

    function update(gl, uniforms, _, renderables) {
      renderables.forEach(({ spriteIndex, position }) => {
        gl.uniform2f(uniforms.translation.location, position[0], position[1]);

        gl.drawArrays(
          gl.TRIANGLES, // gl.TRIANGLES
          spriteIndex * 6, // offset
          6, // count
        );
      });

      return false;
    }

    const renderImage = initializeOnce(vertexSource, fragmentSource, buffersData, update, image);

    function frame() {
      renderrablesData.forEach((image) => {
        image.position[0] += random(-0.5, 0.5);
        image.position[1] += random(-0.5, 0.5);
      });

      renderImage(renderrablesData);

      requestAnimationFrame(frame);
    }

    frame();
  };
});
