"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

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
    while (actualPoint.imag >= 0) {
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
      const sampleWidth = (xMax - xMin) / overviewSvgWidth;
      const sampleHeight = (yMax - yMin) / overviewSvgHeight;
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

  // src/extrapolate.ts
  function extrapolate(points, part) {
    return points.map((complex, index) => ({
      index,
      value: complex[part]
    }));
  }

  // src/library.ts
  function normalizeWaveform(data) {
    const values = data.map((d) => d.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    return Float32Array.from(values.map((v) => 2 * (v - min) / (max - min) - 1));
  }
  function createOscillatorFromWaveform(data) {
    return __async(this, null, function* () {
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const normalizedWaveform = normalizeWaveform(data);
      const wave = audioContext.createPeriodicWave(normalizedWaveform, new Float32Array(normalizedWaveform.length));
      oscillator.setPeriodicWave(wave);
      oscillator.connect(audioContext.destination);
      oscillator.frequency.value = 440;
      console.log("oscillator about to start");
      oscillator.start();
      console.log("oscillator started");
      oscillator.stop(audioContext.currentTime + 5);
    });
  }

  // src/index.ts
  console.log("ver 2244");
  var wrapper = document.getElementById("wrapper");
  var overviewSvgWidth = 480;
  var overviewSvgHeight = 420;
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
  overviewSvg.setAttribute("width", `${overviewSvgWidth}px`);
  overviewSvg.setAttribute("height", `${overviewSvgHeight}px`);
  var xDataSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  var xDataSvgWidth = 200;
  var xDataSvgHeight = 100;
  xDataSvg.setAttribute("id", "xDataSvg");
  xDataSvg.setAttribute("width", `${xDataSvgWidth}`);
  xDataSvg.setAttribute("height", `${xDataSvgHeight}`);
  var yDataSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  var yDataSvgWidth = 200;
  var yDataSvgHeight = 100;
  xDataSvg.setAttribute("id", "xDataSvg");
  xDataSvg.setAttribute("width", `${yDataSvgWidth}`);
  xDataSvg.setAttribute("height", `${yDataSvgHeight}`);
  var outlinePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  overviewSvg.appendChild(outlinePath);
  var iterationsSliderLabel = document.createElement("label");
  iterationsSliderLabel.setAttribute("for", "iterationsSlider");
  iterationsSliderLabel.innerHTML = "iterations: ";
  var iterationsSlider = document.createElement("input");
  iterationsSlider.id = "iterationsSlider";
  iterationsSlider.type = "range";
  iterationsSlider.min = "2";
  iterationsSlider.max = "15";
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
  var oscXValues = document.createElement("button");
  oscXValues.innerHTML = "oscillate x values";
  oscXValues.addEventListener("click", () => {
    console.log("trying to create audio context");
    createOscillatorFromWaveform(extrapolate(boundaryPoints, "imag"));
  });
  var frequencySliderLabel = document.createElement("label");
  frequencySliderLabel.setAttribute("for", "frequencySlider");
  frequencySliderLabel.innerHTML = "frequency: ";
  var frequencySlider = document.createElement("input");
  frequencySlider.id = "frequencySlider";
  frequencySlider.type = "range";
  frequencySlider.min = "1";
  frequencySlider.max = "10";
  frequencySlider.addEventListener("input", (event) => {
    const frequency = event.target.valueAsNumber;
  });
  wrapper == null ? void 0 : wrapper.appendChild(headline);
  wrapper == null ? void 0 : wrapper.appendChild(oscXValues);
  wrapper == null ? void 0 : wrapper.appendChild(iterationsSliderLabel);
  wrapper == null ? void 0 : wrapper.appendChild(iterationsSlider);
  wrapper == null ? void 0 : wrapper.appendChild(xMinSliderLabel);
  wrapper == null ? void 0 : wrapper.appendChild(xMinSlider);
  wrapper == null ? void 0 : wrapper.appendChild(yMinSliderLabel);
  wrapper == null ? void 0 : wrapper.appendChild(yMinSlider);
  wrapper == null ? void 0 : wrapper.appendChild(zoomSliderLabel);
  wrapper == null ? void 0 : wrapper.appendChild(zoomSlider);
  wrapper == null ? void 0 : wrapper.appendChild(overviewSvg);
  wrapper == null ? void 0 : wrapper.appendChild(xDataSvg);
  wrapper == null ? void 0 : wrapper.appendChild(yDataSvg);
  calcMandelbrotOutline();
  drawLines();
  var xDataLine = drawExtrapolatedCurve(extrapolate(boundaryPoints, "real"));
  var yDataLine = drawExtrapolatedCurve(extrapolate(boundaryPoints, "imag"));
  xDataSvg.appendChild(xDataLine);
  yDataSvg.appendChild(yDataLine);
  var mandelbrot2 = new Mandelbrot();
  mandelbrot2.drawCloud();
  iterationsSlider.addEventListener("input", function(event) {
    iterationDepth = parseInt(iterationsSlider.value);
    headline.innerHTML = `Mandelbrot-Grenzlinie bei Iterationstiefe i = ${iterationDepth}`;
    mandelbrot2.drawCloud();
    calcMandelbrotOutline();
    drawLines();
    xDataLine = drawExtrapolatedCurve(extrapolate(boundaryPoints, "real"));
    xDataSvg.innerHTML = "";
    xDataSvg.appendChild(xDataLine);
    yDataLine = drawExtrapolatedCurve(extrapolate(boundaryPoints, "imag"));
    yDataSvg.innerHTML = "";
    yDataSvg.appendChild(yDataLine);
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
  function drawExtrapolatedCurve(points) {
    const width2 = xDataSvgWidth;
    const height2 = xDataSvgHeight;
    const xScale = width2 / (points.length - 1);
    const yMin2 = Math.min(...points.map((p) => p.value));
    const yMax2 = Math.max(...points.map((p) => p.value));
    const yScale = height2 / (yMax2 - yMin2);
    let pathData = `M 0 ${height2 - (points[0].value - yMin2) * yScale}`;
    for (let j = 1; j < points.length; j++) {
      const x = j * xScale;
      const y = height2 - (points[j].value - yMin2) * yScale;
      pathData += ` L ${x} ${y}`;
    }
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("id", "extrapolatedCurve");
    path.setAttribute("d", pathData);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "blue");
    path.setAttribute("stroke-width", "2");
    return path;
  }
})();
//# sourceMappingURL=index.js.map
