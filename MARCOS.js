let widthInput, heightInput;
let img;
let imgFileInput;

// Moldura (frame) images as .jpg
let blanca, negra, natural;
let molduras;
let currentMaskImg;
let maskSelect;

// Corner variables
let InternalTopRight, InternalTopLeft, InternalBottomLeft, InternalBottomRight;
let External1TopRight, External1TopLeft, External1BottomLeft, External1BottomRight;
let External2TopRight, External2TopLeft, External2BottomLeft, External2BottomRight;

// Uniform offsets
let offset1Input;
let offset1 = 3;
let offset2 = 2; // <-- changed from 30 to 15

// PAN & ZOOM variables
let panX = 0, panY = 0;
let dragging = false, lastMouseX = 0, lastMouseY = 0;
let zoomFactor = 1;

// Overlay square variables
let colorPicker;
let squareColor;
let overlayOn = false;
let overlayToggleBtn;

function preload() {
  blanca = loadImage('moldura/blanca.jpg', null, () => { console.error('Could not load blanca.jpg!'); });
  negra = loadImage('moldura/negra.jpg', null, () => { console.error('Could not load negra.jpg!'); });
  natural = loadImage('moldura/natural.jpg', null, () => { console.error('Could not load natural.jpg!'); });
}

function setup() {
  createCanvas(700, 700, WEBGL);
  angleMode(DEGREES);

  createSpan('Width:').position(10, 10);
  widthInput = createInput('40').position(70, 10);

  createSpan('Height:').position(10, 40);
  heightInput = createInput('40').position(70, 40);

  imgFileInput = createFileInput(handleFile);
  imgFileInput.position(10, 70);

  createSpan('Frame Offset:').position(10, 130);
  offset1Input = createInput('3').position(110, 130);

  molduras = {
    'blanca': blanca,
    'negra': negra,
    'natural': natural
  };
  maskSelect = createSelect();
  maskSelect.position(10, 100);
  maskSelect.option('blanca');
  maskSelect.option('negra');
  maskSelect.option('natural');
  maskSelect.changed(updateMaskSelection);

  currentMaskImg = blanca; // Default

  // Color picker for overlay square color
  colorPicker = createColorPicker('#FFFFFF');
  colorPicker.position(10, 170);

  // Toggle button for overlay visibility
  overlayToggleBtn = createButton('Overlay: OFF');
  overlayToggleBtn.position(10, 200);
  overlayToggleBtn.mousePressed(toggleOverlay);

  // For mouse wheel zoom
  canvas.addEventListener('wheel', onWheelEvent, {passive: false});
}

function toggleOverlay() {
  overlayOn = !overlayOn;
  overlayToggleBtn.html('Paspartú: ' + (overlayOn ? 'ON' : 'OFF'));
}

function mousePressed() {
  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    dragging = true;
    lastMouseX = mouseX;
    lastMouseY = mouseY;
  }
}
function mouseDragged() {
  if (dragging) {
    panX += (mouseX - lastMouseX);
    panY += (mouseY - lastMouseY);
    lastMouseX = mouseX;
    lastMouseY = mouseY;
  }
}
function mouseReleased() {
  dragging = false;
}
function onWheelEvent(e) {
  e.preventDefault();
  let delta = -e.deltaY * 0.001;
  let newZoom = zoomFactor * (1 + delta);
  zoomFactor = constrain(newZoom, 0.1, 10);
}

function updateMaskSelection() {
  let sel = maskSelect.value();
  currentMaskImg = molduras[sel];
}

function handleFile(file) {
  if (file.type === 'image') {
    img = loadImage(file.data);
  }
}

function draw() {
  background(220);

  scale(zoomFactor);
  translate(panX / zoomFactor, panY / zoomFactor, 0);

  let w = float(widthInput.value()) / 2;
  let h = float(heightInput.value()) / 2;
  offset1 = float(offset1Input.value());

  // Internal corners
  InternalTopRight    = createVector( w,  h, 0);
  InternalTopLeft     = createVector(-w,  h, 0);
  InternalBottomLeft  = createVector(-w, -h, 0);
  InternalBottomRight = createVector( w, -h, 0);

  // External1 corners (all sides offset by offset1)
  External1TopRight    = createVector( w + offset1,  h + offset1, 0);
  External1TopLeft     = createVector(-w - offset1,  h + offset1, 0);
  External1BottomLeft  = createVector(-w - offset1, -h - offset1, 0);
  External1BottomRight = createVector( w + offset1, -h - offset1, 0);

  // External2 corners (all sides offset from External1 by offset2 = 15)
  External2TopRight    = createVector( w + offset1 + offset2,  h + offset1 + offset2, 0);
  External2TopLeft     = createVector(-w - offset1 - offset2,  h + offset1 + offset2, 0);
  External2BottomLeft  = createVector(-w - offset1 - offset2, -h - offset1 - offset2, 0);
  External2BottomRight = createVector( w + offset1 + offset2, -h - offset1 - offset2, 0);

  // --- Overlay square BELOW all ---
  squareColor = colorPicker.color();
  squareColor.setAlpha(overlayOn ? 255 : 0); // Fully opaque or transparent

  fill(squareColor);
  noStroke();
  beginShape();
  vertex(External1TopLeft.x,    External1TopLeft.y,    0);
  vertex(External1TopRight.x,   External1TopRight.y,   0);
  vertex(External1BottomRight.x,External1BottomRight.y,0);
  vertex(External1BottomLeft.x, External1BottomLeft.y, 0);
  endShape(CLOSE);

  // --- Image ---
  if (img) {
    textureMode(NORMAL);
    beginShape();
    texture(img);
    vertex(InternalTopLeft.x,    InternalTopLeft.y,    0, 0, 1);
    vertex(InternalTopRight.x,   InternalTopRight.y,   0, 1, 1);
    vertex(InternalBottomRight.x,InternalBottomRight.y,0, 1, 0);
    vertex(InternalBottomLeft.x, InternalBottomLeft.y, 0, 0, 0);
    endShape(CLOSE);
  }

  // --- Frame ---
  if (currentMaskImg) {
    textureMode(NORMAL);

    // Top
    beginShape();
    texture(currentMaskImg);
    vertex(External1TopLeft.x,    External1TopLeft.y,    0, 0, 1);
    vertex(External1TopRight.x,   External1TopRight.y,   0, 1, 1);
    vertex(External2TopRight.x,   External2TopRight.y,   0, 1, 0);
    vertex(External2TopLeft.x,    External2TopLeft.y,    0, 0, 0);
    endShape(CLOSE);

    // Right
    beginShape();
    texture(currentMaskImg);
    vertex(External1TopRight.x,    External1TopRight.y,    0, 0, 1);
    vertex(External1BottomRight.x, External1BottomRight.y, 0, 1, 1);
    vertex(External2BottomRight.x, External2BottomRight.y, 0, 1, 0);
    vertex(External2TopRight.x,    External2TopRight.y,    0, 0, 0);
    endShape(CLOSE);

    // Bottom
    beginShape();
    texture(currentMaskImg);
    vertex(External1BottomLeft.x,    External1BottomLeft.y,    0, 0, 1);
    vertex(External1BottomRight.x,   External1BottomRight.y,   0, 1, 1);
    vertex(External2BottomRight.x,   External2BottomRight.y,   0, 1, 0);
    vertex(External2BottomLeft.x,    External2BottomLeft.y,    0, 0, 0);
    endShape(CLOSE);

    // Left
    beginShape();
    texture(currentMaskImg);
    vertex(External1TopLeft.x,    External1TopLeft.y,    0, 0, 1);
    vertex(External1BottomLeft.x, External1BottomLeft.y, 0, 1, 1);
    vertex(External2BottomLeft.x, External2BottomLeft.y, 0, 1, 0);
    vertex(External2TopLeft.x,    External2TopLeft.y,    0, 0, 0);
    endShape(CLOSE);
  }
}
