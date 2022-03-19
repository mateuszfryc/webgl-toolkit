const vertexSource = `
  // an attribute will receive data from a buffer
  attribute vec4 a_position;

  // all shaders have a main function
  void main() {

    // gl_Position is a special variable a vertex shader
    // is responsible for setting
    gl_Position = a_position;
  }
`;

const fragmentSource = `
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
  coordinates in screen clip space,
  where width and height of the drawing plane
  is defined from the center of the screen (point 0, 0), where:
  - left edge is -1
  - right edge is 1
  - top edge is 1
  - bottom is -1

  like this:

              1
      ----------------
      |              |
  -1  |      0,0     |  1
      |              |
      ----------------
             -1
*/

// prettier-ignore
const positions = [
  0, 0,
  0.5, 0,
  0, 0.5
];

const err = (message) => {
  throw new Error(message);
};

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

  if (!success) {
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    err('Could not create shader');
  }

  return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);

  if (!success) {
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    err('Could not create GLSL program');
  }

  return program;
}

function initializeOnce() {
  const canvas = document.getElementById('canvas');
  !canvas && err('Could not find canvas in document');

  // try to get the webgl context, if not present the browser doesn't supports it
  const gl = canvas.getContext('webgl');
  !gl && err('WebGL context not avilable');

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = createProgram(gl, vertexShader, fragmentShader);

  // looking up locations should be done during initialisation, not in the render loop
  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');

  // create buffer that will hold data of that attribute
  const positionBuffer = gl.createBuffer();
  // use it
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Now we can put data in that buffer by referencing it through the bind point
  // six 2d points - two triangles that make up the rectangle
  // prettier-ignore
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(positions),
    gl.DYNAMIC_DRAW //gl.STATIC_DRAW
  );

  return function render() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // gl.viewport tells WebGL how to convert from clip space (-1 to +1) back to pixels and where to do it within the canvas
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Turn on the attribute
    gl.enableVertexAttribArray(positionAttributeLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    const size = 2; // 2 components per iteration
    const type = gl.FLOAT; // the data is 32bit floats
    const normalize = false; // don't normalize the data
    const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
    const offset = 0; // start at the beginning of the buffer
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

    const count = positions.length / size;
    gl.drawArrays(gl.TRIANGLES, offset, count);
  };
}

window.addEventListener('load', () => {
  const drawTriangle = initializeOnce();
  drawTriangle();
});
