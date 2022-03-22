const err = (message) => {
  throw new Error(message);
};

export function getWebGLContext() {
  const canvas = document.getElementById('canvas');
  !canvas && err('Could not find canvas in document');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const gl = canvas.getContext('webgl');
  !gl && err('WebGL context not avilable');

  return [gl, canvas];
}

function getPivotPoints(width, height) {
  return Array.from({ length: 6 }, () => [-0.5 * width, -0.5 * height]).flat();
}

export function getRectangleCoords(x, y, width, height) {
  const x1 = x;
  const x2 = x + width;
  const y1 = y;
  const y2 = y + height;

  // prettier-ignore
  return [
    // top left triangle
    x1, y1,
    x2, y1,
    x1, y2,
    // bottom right triangle
    x1, y2,
    x2, y1,
    x2, y2
  ];
}

// Fill the buffer with the values that define a rectangle.
export function setRectangle(gl, x, y, width, height) {
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(getRectangleCoords(x, y, width, height)),
    gl.STATIC_DRAW,
  );
}

function setProjectionMatrix(gl, projectionLocation, viewWidth, viewHeight) {
  // prettier-ignore
  gl.uniformMatrix3fv(projectionLocation, false, [
    2 / viewWidth, 0, 0,
    0, -2 / viewHeight, 0,
    -1, 1, 1
  ]);
}

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

function findParams(gl, program) {
  const params = { uniforms: {}, attributes: {} };
  // Search for uniforms and attributes, where 0 is uniform and 1 is attribute
  let isUniform = 0;

  while (isUniform < 2) {
    const type = isUniform ? gl.ACTIVE_UNIFORMS : gl.ACTIVE_ATTRIBUTES;
    const count = gl.getProgramParameter(program, type);

    for (let i = 0; i < count; i++) {
      const details = isUniform ? gl.getActiveUniform(program, i) : gl.getActiveAttrib(program, i);

      if (details === null) throw new Error('Could not get param details.');
      const location = isUniform
        ? gl.getUniformLocation(program, details.name)
        : gl.getAttribLocation(program, details.name);

      if (location === null) throw new Error('Could not get param location.');

      const name = details.name.replace(/^\w_/, '');
      params[isUniform ? 'uniforms' : 'attributes'][name] = {
        location,
        type: details.type,
      };
    }
    isUniform++;
  }
  console.log(params);
  return params;
}

export function createProgram(gl, vertexShaderSource, fragmentShaderSource) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
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

  const params = findParams(gl, program);

  return { program, params };
}

function createBuffer(gl, data) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

  return buffer;
}

function setupTexture(gl, image) {
  // Create a texture.
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the parameters so we can render any size image.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  // Upload the image into the texture.
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  return texture;
}

function defaultRenderer(gl, passesCount) {
  gl.drawArrays(
    gl.TRIANGLES, // gl.TRIANGLES
    0, // offset
    passesCount, // count
  );
}

function getUvFromSpriteData(image, { position, size }) {
  return getRectangleCoords(
    position[0] / image.width,
    position[1] / image.height,
    size[0] / image.width,
    size[1] / image.height,
  );
}
export function newWebGLRenderer(
  gl,
  vertexSource,
  fragmentSource,
  buffersData = undefined,
  renderer = defaultRenderer,
  image = undefined,
  spritesAtlasData = undefined,
) {
  const { canvas } = gl;
  const { program, params } = createProgram(gl, vertexSource, fragmentSource);
  const { uniforms, attributes } = params;

  // prettier-ignore
  const positions =
    spritesAtlasData?.map(({ size }) => getRectangleCoords(0, 0, size[0], size[1])).flat()
    ?? buffersData?.position
    ?? getRectangleCoords(0, 0, canvas.width, canvas.height);

  const buffers = [[createBuffer(gl, positions), attributes.position.location]];

  if (image) {
    // prettier-ignore
    const uv =
      spritesAtlasData?.map((sprite) => getUvFromSpriteData(image, sprite)).flat()
      ?? buffersData?.uv
      ?? [0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0];

    // prettier-ignore
    const pivot =
      spritesAtlasData?.map(({ size }) => getPivotPoints(size[0], size[1])).flat()
      ?? getPivotPoints(image.width, image.height);

    buffers.push([createBuffer(gl, uv), attributes.uv.location]);
    if (attributes.pivot) buffers.push([createBuffer(gl, pivot), attributes.pivot.location]);
    setupTexture(gl, image);
  }

  return (updatedData) => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const { width, height } = canvas;
    gl.viewport(0, 0, width, height);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    buffers.forEach(([buffer, location]) => {
      // Turn on the uv attribute
      gl.enableVertexAttribArray(location);

      // bind the uv buffer.
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

      // Tell the uv attribute how to get data out of uvBuffer (ARRAY_BUFFER)
      gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
    });

    setProjectionMatrix(gl, uniforms.projection.location, width, height);

    const renderPassesCount = Math.round(positions.length) / 2;
    renderer(gl, renderPassesCount, uniforms, attributes, updatedData);
  };
}
