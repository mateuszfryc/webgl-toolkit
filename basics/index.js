window.addEventListener('load', () => {
  // draw triangle by positioning it with points made of clip space coordinates (0 - 1)
  const drawTriangle = initializeOnce(
    triangleVertex,
    triangleFragment,
    trianglePositions
  );
  drawTriangle();

  const drawRectangle = initializeOnce(
    rectangleVertex,
    rectangleFragment,
    rectanglePositions
  );
  drawRectangle();
});
