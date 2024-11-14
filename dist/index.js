"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // src/calcMandelbrotOutline.ts
  var boundaryPoints = [];
  function calcMandelbrotOutline() {
    boundaryPoints = [];
    const startPoint = { real: -2, imag: 0 };
    let directionVector = { real: -1, imag: 0 };
    const samplingRate = 1 / Math.pow(iterationDepth, 3);
    const sampleRotation = Math.PI / 8;
    let actualPoint = add(startPoint, scale(directionVector, samplingRate / 2));
    console.log("samplingRate: " + samplingRate + " at iterationDepth: " + iterationDepth);
    boundaryPoints.push(actualPoint);
    directionVector = { real: 0, imag: 1 };
    while (actualPoint.real < 0) {
      if (mandelbrot(add(actualPoint, scale(directionVector, samplingRate)))) {
        while (mandelbrot(add(actualPoint, scale(directionVector, samplingRate)))) {
          directionVector = rotate(directionVector, sampleRotation);
        }
        actualPoint = add(actualPoint, scale(directionVector, samplingRate));
        boundaryPoints.push(actualPoint);
      }
      if (!mandelbrot(add(actualPoint, scale(directionVector, samplingRate)))) {
        while (!mandelbrot(add(actualPoint, scale(directionVector, samplingRate)))) {
          directionVector = rotate(directionVector, -sampleRotation);
        }
        directionVector = rotate(directionVector, sampleRotation);
        actualPoint = add(actualPoint, scale(directionVector, samplingRate));
        boundaryPoints.push(actualPoint);
      }
    }
    console.log("boundaryPoints.length: " + boundaryPoints.length);
  }
  function rotate(vector, rotationAngle) {
    const originLength = Math.sqrt(Math.pow(vector.real, 2) + Math.pow(vector.imag, 2));
    const originAngle = Math.atan2(vector.imag, vector.real);
    const destinationAngle = originAngle + rotationAngle;
    const rotatedVector = scale({ real: Math.cos(destinationAngle), imag: Math.sin(destinationAngle) }, originLength);
    return rotatedVector;
  }
  function scale(vector, amount) {
    return { real: vector.real * amount, imag: vector.imag * amount };
  }
  function add(v1, v2) {
    return { real: v1.real + v2.real, imag: v1.imag + v2.imag };
  }
  function mandelbrot(c) {
    let z = { real: c.real, imag: c.imag };
    let iterations = 0;
    while (iterations < iterationDepth && z.real * z.real + z.imag * z.imag <= 4) {
      let realTemp = z.real * z.real - z.imag * z.imag + c.real;
      z.imag = 2 * z.real * z.imag + c.imag;
      z.real = realTemp;
      iterations++;
      if (iterations == iterationDepth) {
        return true;
      }
    }
    return false;
  }

  // src/calcnPlot.ts
  var Mandelbrot = class {
    constructor() {
      __publicField(this, "ctx", canvas.getContext("2d"));
      __publicField(this, "width", canvas.width);
      __publicField(this, "height", canvas.height);
      __publicField(this, "boundaryPoints", []);
    }
    // Skalierungsfunktionen von Canvas-Koordinaten auf komplexe Zahlenebene
    scaleX(x) {
      return xMin + x / this.width * (xMax - xMin);
    }
    scaleY(y) {
      return yMin + y / this.height * (yMax - yMin);
    }
    // Mandelbrot-Iteration
    mandelbrot(viewPortCoordinate) {
      const c = { real: this.scaleX(viewPortCoordinate.x), imag: this.scaleY(viewPortCoordinate.y) };
      let z = { real: 0, imag: 0 };
      let iterations = 0;
      while (iterations < iterationDepth && z.real * z.real + z.imag * z.imag <= 4) {
        let realTemp = z.real * z.real - z.imag * z.imag + c.real;
        z.imag = 2 * z.real * z.imag + c.imag;
        z.real = realTemp;
        iterations++;
        if (iterations == iterationDepth && z.real * z.real + z.imag * z.imag > 3.5 && z.real * z.real + z.imag * z.imag <= 4.5) {
          return viewPortCoordinate;
        }
      }
    }
    // Grenzlinie berechnen und plotten
    drawCloud() {
      this.boundaryPoints = [];
      for (let x = 0; x < this.width; x++) {
        for (let y = 0; y < this.height; y++) {
          const c = { x, y };
          const borderPoint = this.mandelbrot(c);
          if (borderPoint)
            this.boundaryPoints.push(borderPoint);
        }
      }
      if (this.ctx) {
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0, 0, canvas.width, canvas.height);
        this.ctx.fillStyle = "blue";
        this.boundaryPoints.forEach((point) => {
          this.ctx.fillRect(point.x, point.y, 1, 1);
        });
      }
    }
  };

  // src/index.ts
  var wrapper = document.getElementById("wrapper");
  var canvasWidth = 800;
  var canvasHeight = 800;
  var width = 4;
  var height = width;
  var iterationDepth = 5;
  var xMin = -2.5;
  var xMax = xMin + width;
  var yMin = -2;
  var yMax = yMin + height;
  var headline = document.createElement("h1");
  headline.innerHTML = `Mandelbrot-Grenzlinie bei Iterationstiefe i = ${iterationDepth}`;
  var canvas = document.createElement("canvas");
  canvas.setAttribute("id", "mandelbrotCanvas");
  canvas.setAttribute("width", `${canvasWidth}px`);
  canvas.setAttribute("height", `${canvasHeight}px`);
  var iterationsSliderLabel = document.createElement("label");
  iterationsSliderLabel.setAttribute("for", "iterationsSlider");
  iterationsSliderLabel.innerHTML = "iterations: ";
  var iterationsSlider = document.createElement("input");
  iterationsSlider.id = "iterationsSlider";
  iterationsSlider.type = "range";
  iterationsSlider.min = "2";
  iterationsSlider.max = "13";
  iterationsSlider.step = "1";
  iterationsSlider.value = `${iterationDepth}`;
  var xMinSliderLabel = document.createElement("label");
  xMinSliderLabel.setAttribute("for", "xMinSlider");
  xMinSliderLabel.innerHTML = "x-move:";
  var xMinSlider = document.createElement("input");
  xMinSlider.id = "xMinSlider";
  xMinSlider.type = "range";
  xMinSlider.min = "-6";
  xMinSlider.max = "2.0";
  xMinSlider.step = ".1";
  xMinSlider.value = `${xMin}`;
  var yMinSliderLabel = document.createElement("label");
  yMinSliderLabel.setAttribute("for", "yMinSlider");
  yMinSliderLabel.innerHTML = "y-move:";
  var yMinSlider = document.createElement("input");
  yMinSlider.id = "yMinslider";
  yMinSlider.type = "range";
  yMinSlider.min = "-6";
  yMinSlider.max = "2";
  yMinSlider.step = ".1";
  yMinSlider.value = `${yMin}`;
  var zoomSliderLabel = document.createElement("label");
  zoomSliderLabel.setAttribute("for", "zoomSlider");
  zoomSliderLabel.innerHTML = "zoom: ";
  var zoomSlider = document.createElement("input");
  zoomSlider.id = "widthSlider";
  zoomSlider.type = "range";
  zoomSlider.min = ".1";
  zoomSlider.max = "4";
  zoomSlider.step = ".1";
  zoomSlider.value = `${width}`;
  wrapper == null ? void 0 : wrapper.appendChild(headline);
  wrapper == null ? void 0 : wrapper.appendChild(iterationsSliderLabel);
  wrapper == null ? void 0 : wrapper.appendChild(iterationsSlider);
  wrapper == null ? void 0 : wrapper.appendChild(xMinSliderLabel);
  wrapper == null ? void 0 : wrapper.appendChild(xMinSlider);
  wrapper == null ? void 0 : wrapper.appendChild(yMinSliderLabel);
  wrapper == null ? void 0 : wrapper.appendChild(yMinSlider);
  wrapper == null ? void 0 : wrapper.appendChild(zoomSliderLabel);
  wrapper == null ? void 0 : wrapper.appendChild(zoomSlider);
  wrapper == null ? void 0 : wrapper.appendChild(canvas);
  var mandelbrot2 = new Mandelbrot();
  mandelbrot2.drawCloud();
  var ctx = canvas.getContext("2d");
  console.log("calling calcMandelbrotOutline");
  calcMandelbrotOutline();
  drawLines();
  iterationsSlider.addEventListener("input", function(event) {
    iterationDepth = parseInt(iterationsSlider.value);
    headline.innerHTML = `Mandelbrot-Grenzlinie bei Iterationstiefe i = ${iterationDepth}`;
    mandelbrot2.drawCloud();
    calcMandelbrotOutline();
    if (iterationDepth < 11)
      drawLines();
  });
  xMinSlider.addEventListener("input", function() {
    xMin = parseFloat(xMinSlider.value);
    xMax = xMin + width;
    mandelbrot2.drawCloud();
    drawLines();
  });
  yMinSlider.addEventListener("input", function() {
    yMin = parseFloat(yMinSlider.value);
    yMax = yMin + height;
    mandelbrot2.drawCloud();
    drawLines();
  });
  zoomSlider.addEventListener("input", function() {
    const oldWidth = width;
    const oldHeight = height;
    width = parseFloat(zoomSlider.value);
    height = width;
    xMin -= (width - oldWidth) / 2;
    xMax = xMin + width;
    yMin -= (height - oldHeight) / 2;
    yMax = yMin + height;
    xMinSlider.step = (parseFloat(zoomSlider.value) / 40).toString();
    yMinSlider.step = (parseFloat(zoomSlider.value) / 40).toString();
    mandelbrot2.drawCloud();
    drawLines();
  });
  function mapToCanvas(point) {
    const x = (point.real - xMin) / (xMax - xMin) * canvasWidth;
    const y = (point.imag - yMin) / (yMax - yMin) * canvasHeight;
    return { x, y };
  }
  function drawLines() {
    if (boundaryPoints.length < 2) {
      console.warn("Not enough points to draw lines");
      return;
    }
    const canvasPoints = boundaryPoints.map((point) => mapToCanvas(point));
    ctx == null ? void 0 : ctx.beginPath();
    ctx == null ? void 0 : ctx.moveTo(canvasPoints[0].x, canvasPoints[0].y);
    for (let i = 1; i < canvasPoints.length; i++) {
      ctx == null ? void 0 : ctx.lineTo(canvasPoints[i].x, canvasPoints[i].y);
      ctx.strokeStyle = "black";
      ctx.lineWidth = 1;
      ctx == null ? void 0 : ctx.stroke();
    }
  }
})();
//# sourceMappingURL=index.js.map
