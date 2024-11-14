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
      __publicField(this, "width", overviewSvg.getBBox().width);
      __publicField(this, "height", overviewSvg.getBBox().height);
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
      const c = viewPortCoordinate;
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
      var _a;
      this.boundaryPoints = [];
      const sampleWidth = (xMax - xMin) / svgWidth;
      const sampleHeight = (yMax - yMin) / svgHeight;
      for (let x = xMin; x < xMax; x += sampleWidth) {
        for (let y = yMin; y < yMax; y += sampleHeight) {
          const c = { real: x, imag: y };
          const borderPoint = this.mandelbrot(c);
          if (borderPoint)
            this.boundaryPoints.push(borderPoint);
        }
      }
      const outlinePath2 = document.getElementById("outlinePath");
      const oldCloudPath = document.getElementById("cloudPath");
      (_a = oldCloudPath == null ? void 0 : oldCloudPath.parentNode) == null ? void 0 : _a.removeChild(oldCloudPath);
      const cloudPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
      cloudPath.setAttribute("fill", "none");
      cloudPath.setAttribute("stroke", "darkblue");
      cloudPath.setAttribute("stroke-width", `${sampleHeight}`);
      cloudPath.setAttribute("id", "cloudPath");
      overviewSvg.insertBefore(cloudPath, outlinePath2);
      let pathData = `M${this.boundaryPoints[0].real} ${this.boundaryPoints[0].imag} v${sampleWidth}`;
      for (let i = 1; i < this.boundaryPoints.length; i++) {
        pathData += `M ${this.boundaryPoints[i].real}${this.boundaryPoints[i].imag} v${sampleWidth}`;
      }
      cloudPath.setAttribute("d", `${pathData}`);
    }
  };

  // src/index.ts
  var wrapper = document.getElementById("wrapper");
  var svgWidth = 600;
  var svgHeight = 480;
  var width = 2.5;
  var height = width;
  var iterationDepth = 5;
  var xMin = -2;
  var xMax = xMin + width;
  var yMin = -1.2;
  var yMax = yMin + height;
  var headline = document.createElement("h1");
  headline.innerHTML = `Mandelbrot-Grenzlinie bei Iterationstiefe i = ${iterationDepth}`;
  var overviewSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  overviewSvg.setAttribute("id", "mandelbrotSvg");
  overviewSvg.setAttribute("viewBox", `${xMin} ${yMin} ${width} ${height}`);
  overviewSvg.setAttribute("width", `${svgWidth}px`);
  overviewSvg.setAttribute("height", `${svgHeight}px`);
  var outlinePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  overviewSvg.appendChild(outlinePath);
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
  zoomSlider.id = "zoomSlider";
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
  wrapper == null ? void 0 : wrapper.appendChild(overviewSvg);
  calcMandelbrotOutline();
  drawLines();
  var mandelbrot2 = new Mandelbrot();
  mandelbrot2.drawCloud();
  iterationsSlider.addEventListener("input", function(event) {
    iterationDepth = parseInt(iterationsSlider.value);
    headline.innerHTML = `Mandelbrot-Grenzlinie bei Iterationstiefe i = ${iterationDepth}`;
    mandelbrot2.drawCloud();
    calcMandelbrotOutline();
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
    overviewSvg.setAttribute("viewBox", `${xMin} ${yMin} ${width} ${height}`);
    xMinSlider.step = (parseFloat(zoomSlider.value) / 40).toString();
    yMinSlider.step = (parseFloat(zoomSlider.value) / 40).toString();
    mandelbrot2.drawCloud();
    drawLines();
  });
  overviewSvg.addEventListener("mouseenter", () => {
    console.log("mouse entered");
  });
  function drawLines() {
    if (boundaryPoints.length < 2) {
      console.warn("Not enough points to draw lines");
      return;
    }
    outlinePath.innerHTML = "";
    let pathData = `M${boundaryPoints[0].real} ${boundaryPoints[0].imag}`;
    for (let i = 1; i < boundaryPoints.length; i++) {
      pathData += `L ${boundaryPoints[i].real} ${boundaryPoints[i].imag}`;
    }
    outlinePath.setAttribute("id", "outlinePath");
    outlinePath.setAttribute("fill", "none");
    outlinePath.setAttribute("stroke", "black");
    outlinePath.setAttribute("stroke-width", ".5 px");
    outlinePath.setAttribute("vector-effect", "non-scaling-stroke");
    outlinePath.setAttribute("d", `${pathData}`);
  }
})();
//# sourceMappingURL=index.js.map
