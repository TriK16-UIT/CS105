// Initialize

var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

var width = 800;
var height = 600;

var bgRgba = [240, 240, 200, 255];
var lineRgba = [0, 0, 0, 255];

canvas.setAttribute("width", width);
canvas.setAttribute("height", height);

function Painter(context, width, height) {
    this.context = context;
    this.imageData = context.createImageData(width, height);
    this.points = [];
    this.width = width;
    this.height = height;

    this.getPixelIndex = function(x, y) {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height)
            return -1;
        return (x + y * width) << 2;
    }

    this.setPixel = function(x, y, rgba) {
        pixelIndex = this.getPixelIndex(x, y);
        if (pixelIndex == -1) return;
        for (var i = 0; i < 4; i++) {
            this.imageData.data[pixelIndex + i] = rgba[i];
        }
    }

    this.drawBkg = function(rgba) {
        for (var i = 0; i < this.width; i++)
            for (var j = 0; j < this.height; j++)
                this.setPixel(i, j, rgba);
    }   

    this.clear = function() {
        this.drawBkg(bgRgba);
        this.context.putImageData(this.imageData, 0, 0);
    }

    this.drawEllipse = function(cx, cy, rx, ry, rgba) {
        var x = 0, y = ry;
        var rx2 = rx * rx, ry2 = ry * ry;
        var twoRx2 = 2 * rx2, twoRy2 = 2 * ry2;
        var px = 0, py = twoRx2 * y;
        
        var p1 = ry2 - (rx2 * ry) + (0.25 * rx2);
        while (px < py) {
            this.setPixel(cx + x, cy + y, rgba);
            this.setPixel(cx - x, cy + y, rgba);
            this.setPixel(cx + x, cy - y, rgba);
            this.setPixel(cx - x, cy - y, rgba);
            x++;
            px += twoRy2;
            if (p1 < 0) {
                p1 += ry2 + px;
            } else {
                y--;
                py -= twoRx2;
                p1 += ry2 + px - py;
            }
        }
        
        var p2 = ry2 * (x + 0.5) * (x + 0.5) + rx2 * (y - 1) * (y - 1) - rx2 * ry2;
        while (y >= 0) {
            this.setPixel(cx + x, cy + y, rgba);
            this.setPixel(cx - x, cy + y, rgba);
            this.setPixel(cx + x, cy - y, rgba);
            this.setPixel(cx - x, cy - y, rgba);
            y--;
            py -= twoRx2;
            if (p2 > 0) {
                p2 += rx2 - py;
            } else {
                x++;
                px += twoRy2;
                p2 += rx2 - py + px;
            }
        }
    }


    this.draw = function() {
        this.context.putImageData(this.imageData, 0, 0);
    };

    this.clear();
    this.draw();
}

state = 0; // 0: waiting 1: drawing 2: finished
clickPos = [-1, -1];
var painter = new Painter(context, width, height);

getPosOnCanvas = function(x, y) {
    var bbox = canvas.getBoundingClientRect();
    return [Math.floor(x - bbox.left * (canvas.width / bbox.width) + 0.5),
            Math.floor(y - bbox.top * (canvas.height / bbox.height) + 0.5)];
}

doMouseMove = function(e) {
    if (state == 0 || state == 2) {
        return;
    }
    var p = getPosOnCanvas(e.clientX, e.clientY);
    var rx = Math.abs(p[0] - clickPos[0]);
    var ry = Math.abs(p[1] - clickPos[1]);
    painter.clear();
    painter.drawEllipse(clickPos[0], clickPos[1], rx, ry, pointRgba);
    painter.draw();
}

doMouseDown = function(e) {
    if (state == 2 || e.button != 0) {
        return;
    }
    clickPos = getPosOnCanvas(e.clientX, e.clientY);
    state = 1;
}

doMouseUp = function(e) {
    if (state != 1) {
        return;
    }
    state = 2;
}

doKeyDown = function(e) {
    if (state == 2) {
        return;
    }
    var keyId = e.keyCode ? e.keyCode : e.which;
    if (keyId == 27 && state == 1) { // esc
        state = 2;
    }
}

doReset = function() {
    if (state == 0) {
        return;
    }
    state = 0;
    painter.clear();
}

canvas.addEventListener("mousedown", doMouseDown, false);
canvas.addEventListener("mousemove", doMouseMove, false);
canvas.addEventListener("mouseup", doMouseUp, false);
window.addEventListener("keydown", doKeyDown, false);

var resetButton = document.getElementById("reset");
resetButton.addEventListener("click", doReset, false);