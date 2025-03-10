let slider = document.querySelector("#gridsize");
let screen = document.querySelector(".screen");
let display = document.querySelector("#display");

const DISPLAY_RATIO = 2;
const ERROR_MARGIN = 0.999;

const BACKGROUND_COLOR = "#C0C0C0";
let lineColor = "#A9A9A9";

let height = slider.value;
let width = height * DISPLAY_RATIO;

let rainbow = false;
let grayscale = false;

let keyControls = false;
let dir = null;

let pixels = [];

let pixelIndex = {
    firstPixel: {
        x: null,
        y: null
    },
    secondPixel: {
        x: null,
        y: null
    }
}

let pointer = {
    x: null,
    y: null
};

function buildEtchSketch(height) {

    updateDisplay();
    let dimensions = calcDimensions(height);
    pixels = [];
    let tmp = {
        grayscale: grayscale,
        rainbow: rainbow
    }
    grayscale = false;
    rainbow = false;
    createDivisions(dimensions);
    grayscale = tmp.grayscale;
    rainbow = tmp.rainbow;
    resetPointer();
    clearPixelIndex();
    dir = null;
}

function createDivisions(dimensions) {

    let fragment = document.createDocumentFragment();

    for (i = 0; i < dimensions[0]; i++) {

        let pixel = document.createElement("div");
        pixel.style.width = dimensions[1] + "px";
        pixel.style.height = dimensions[2] + "px";
        colorPixel(pixel, BACKGROUND_COLOR);
        pixel.lightness = 75;
        pixels.push(pixel);
        fragment.appendChild(pixel);
    }

    screen.appendChild(fragment);
}

function calcDimensions(height) {

    let area = height * width;
    let pixelWidth = (screen.clientWidth / width) * ERROR_MARGIN;
    let pixelHeight = screen.clientHeight / height;

    return [area, pixelWidth, pixelHeight];
}

function resizeScreen() {

    let colorOrder = [];

    let colorMode = {
        grayscale: grayscale,
        rainbow, rainbow
    }
    grayscale = false;
    rainbow = false;

    for (let pixel of pixels) {

        colorOrder.push(pixel.style.backgroundColor);
    }

    let tmp = pixelIndex;
    rebuildScreen();
    pixelIndex = tmp;

    for (i = 0; i < colorOrder.length - 1; i++) {

        colorPixel(pixels[i], colorOrder[i]);
    }

    grayscale = colorMode.grayscale;
    rainbow = colorMode.rainbow;
}

function clearScreen() {

    let tmp = {
        grayscale: grayscale,
        rainbow: rainbow
    }
    grayscale = false;
    rainbow = false;

    for (let pixel of pixels) {

        colorPixel(pixel, BACKGROUND_COLOR);
        pixel.lightness = 75;
    }
    clearPixelIndex();
    resetPointer();
    grayscale = tmp.grayscale;
    rainbow = tmp.rainbow;
    dir = null;
}

function removeDivisions() {

    for (let pixel of pixels) {

        pixel.remove();
    }
}

function rebuildScreen() {
    
    height = document.querySelector("#gridsize").value;
    width = height * DISPLAY_RATIO;

    removeDivisions();
    buildEtchSketch(height);
}

function updateDisplay() {

    let height = document.querySelector("#gridsize").value;
    let width = height * DISPLAY_RATIO;
    
    display.innerHTML = `${width}x${height}`;
}

function resetPointer() {

    pointer.x = 0;
    pointer.y = height - 1;
}

function findPixels(pixelIndex) {

    let x1 = pixelIndex.firstPixel.x;
    let y1 = pixelIndex.firstPixel.y;

    let x2 = pixelIndex.secondPixel.x;
    let y2 = pixelIndex.secondPixel.y;

    let line = [];

    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = (x1 < x2) ? 1 : -1;
    const sy = (y1 < y2) ? 1 : -1;
    let err = dx - dy;

    while (true) {

        line.push([x1, y1]);

        if (x1 === x2 && y1 === y2) {
            break;
        }

        const e2 = 2 * err;

        if (e2 > -dy) {
            err -= dy;
            x1 += sx;
        }

        if (e2 < dx) {
            err += dx;
            y1 += sy;
        }
    }

    buildLine(line);
}

function buildLine(line) {

    line.shift();
    line.pop();
    
    for (const point of line) {

        let pixelId = point[0] + (point[1] * width);
        
        colorPixel(pixels[pixelId]);
        
    }
}

function buildPixelIndex(pixel) {

    let pixelId = pixels.indexOf(pixel);
    let pixelX;
    let pixelY;

    //compare the pixel id to the pixel id of the first pixel in x row
    //if greater than
        //continue to the next row
        //return to line 1
    //else
        //pixel must be on the previous row

    for (i = 0; i <= width * height; i += width) {

        if (pixelId < i) {

            pixelY = i -= width;
            break;
        }
    }
    
    pixelX = pixelId - pixelY;
    pixelY /= width;

    if (pixelIndex.firstPixel.x === null) {

        pixelIndex.firstPixel.x = pixelX;
        pixelIndex.firstPixel.y = pixelY;
    } else if (pixelIndex.secondPixel.x === null) {

        pixelIndex.secondPixel.x = pixelX;
        pixelIndex.secondPixel.y = pixelY;

        findPixels(pixelIndex);
    } else {

        pixelIndex.firstPixel.x = pixelIndex.secondPixel.x;
        pixelIndex.firstPixel.y = pixelIndex.secondPixel.y;
        pixelIndex.secondPixel.x = null;
        buildPixelIndex(pixel);
    }
}

function clearPixelIndex() {

    pixelIndex = {
        firstPixel: {
            x: null,
            y: null
        },
        secondPixel: {
            x: null,
            y: null
        }
    }
}

function toggleRainbow() {

    rainbow = !rainbow;
    if (grayscale && rainbow) grayscale = !grayscale;

    // recolorPixels();
}

function toggleGrayScale() {

    grayscale = !grayscale;
    if (grayscale && rainbow) rainbow = !rainbow;

    // recolorPixels();
}

function recolorPixels() {

    for (let pixel of pixels) {

        let pixelColor = pixel.style.backgroundColor.split("(")[1].split(")")[0];
        pixelColor = pixelColor.split(",");
        var tmp = pixelColor.map((x) => {
            x = parseInt(x).toString(16);
            return (x.length == 1) ? "0" + x : x;
        });
        pixelColor = "#" + tmp.join("").toUpperCase();

        if (pixelColor != BACKGROUND_COLOR) {

            if (grayscale && pixel.lightness !== 75) {

                pixel.lightness += 10;
            }
            colorPixel(pixel);
        }
    }
}

function toggleKeyControls() {

    keyControls = !keyControls;

    clearScreen();

    if (keyControls) {
        document.querySelector("#keycontrols").innerHTML = "Mouse Controls!"
    } else {
        document.querySelector("#keycontrols").innerHTML = "Arrow Key Controls!"
    }
}

function handleClicks(e) {

    if (e.button === 2 || e.button === 1) return;

    if (keyControls) return;

    if (e.target !== screen) {

        buildPixelIndex(e.target);
        colorPixel(e.target);
    }
}

function handleKeys(e) {

    let key = e.key;
    if (e.key === 'e') clearScreen();

    if (!keyControls) return;

    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;

    let pointerId = pointer.x + pointer.y * width;
    if (dir === null) {
        
        colorPixel(pixels[pointerId]);
        dir = -1;
        return;
    };

    switch (key) {

        case 'ArrowUp':
            e.preventDefault();

            if (dir === 1) {

                colorPixel(pixels[pointerId]);
                dir = 0;
                return;
            }

            if (pointer.y > 0) pointer.y--;
            dir = 0;
            break;
        case 'ArrowDown':
            e.preventDefault();

            if (dir === 0) {

                colorPixel(pixels[pointerId]);
                dir = 1;
                return;
            }

            if (pointer.y < height - 1) pointer.y++;
            dir = 1;
            break;
        case 'ArrowLeft':
            e.preventDefault();

            if (dir === 3) {

                colorPixel(pixels[pointerId]);
                dir = 2;
                return;
            }

            if (pointer.x > 0) pointer.x--;
            dir = 2;
            break;
        case 'ArrowRight':
            e.preventDefault();

            if (dir === 2) {

                colorPixel(pixels[pointerId]);
                dir = 3;
                return;
            }

            if (pointer.x < width - 1) pointer.x++;
            dir = 3;
            break;
    }

    let pixelId = pointer.x + pointer.y * width;
    colorPixel(pixels[pixelId]);
}

function colorPixel(pixel, color = lineColor) {

    if (rainbow) {

        color = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    } else if (grayscale) {

        if (pixel.lightness !== 0) pixel.lightness -= 10;
        let lightness = pixel.lightness;
        color = `hsl(0, 0%, ${lightness}%)`;
    }

    pixel.style.backgroundColor = color;
}

function setLineColor() {

    let color = document.querySelector("#colorselector").value;
    lineColor = color;
}

screen.addEventListener('mousedown', handleClicks);

window.addEventListener('keydown', handleKeys);

window.addEventListener('resize', resizeScreen);

buildEtchSketch(height);