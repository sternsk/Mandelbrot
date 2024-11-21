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
  var allSteps = [];
  var done = false;
  var actualSample = document.createElementNS("http://www.w3.org/2000/svg", "line");
  function calcMandelbrotOutline() {
    done = false;
    allSteps = [];
    spectraSvg.innerHTML = "";
    const begin = Date.now();
    actualSample.setAttribute("vector-effect", "non-scaling-stroke");
    actualSample.setAttribute("stroke-width", "1px");
    actualSample.setAttribute("id", "actualSample");
    spectraSvg.appendChild(actualSample);
    let duration;
    boundaryPoints = [];
    const startPoint = { real: -2, imag: 0 };
    let directionVector = { real: -1, imag: 0 };
    const sampleLength = 0.1 / Math.pow(iterationDepth, 3);
    const sampleAngle = Math.PI / 8;
    let actualPoint = add(startPoint, scale(directionVector, sampleLength / 2));
    console.log("sampleLength: " + sampleLength + " at iterationDepth: " + iterationDepth);
    boundaryPoints.push(actualPoint);
    directionVector = { real: 0, imag: 1 };
    while (actualPoint.imag >= 0) {
      if (mandelbrot(add(actualPoint, scale(directionVector, sampleLength)))) {
        directionVector = rotate(directionVector, 0.5 * sampleAngle);
        while (mandelbrot(add(actualPoint, scale(directionVector, sampleLength)))) {
          const endPoint = add(actualPoint, scale(directionVector, sampleLength));
          allSteps.push({ startPoint: actualPoint, endPoint, color: "brown" });
          directionVector = rotate(directionVector, 0.5 * sampleAngle);
        }
        const endpoint = add(actualPoint, scale(directionVector, sampleLength));
        allSteps.push({ startPoint: actualPoint, endPoint: endpoint, color: "red" });
        actualPoint = endpoint;
        boundaryPoints.push(actualPoint);
      }
      if (!mandelbrot(add(actualPoint, scale(directionVector, sampleLength)))) {
        if (mandelbrot(add(actualPoint, scale(directionVector, sampleLength / 2)))) {
          console.log("actualPoint + directionVector is not, but actualPoint + directionVector/2 is inside the Mandelbrot");
          directionVector = rotate(directionVector, 2 * sampleAngle);
        }
        while (!mandelbrot(add(actualPoint, scale(directionVector, sampleLength)))) {
          const endPoint = add(actualPoint, scale(directionVector, sampleLength));
          allSteps.push({ startPoint: actualPoint, endPoint, color: "blue" });
          directionVector = rotate(directionVector, -0.5 * sampleAngle);
        }
        directionVector = rotate(directionVector, 0.5 * sampleAngle);
        const endpoint = add(actualPoint, scale(directionVector, sampleLength));
        allSteps.push({ startPoint: actualPoint, endPoint: endpoint, color: "red" });
        actualPoint = endpoint;
        boundaryPoints.push(actualPoint);
      }
    }
    done = true;
    if (animationRequest)
      animateOutline();
    console.log("boundaryPoints.length: " + boundaryPoints.length);
    duration = Date.now() - begin;
    console.log(`sampling duration: ${duration} ms`);
  }
  var currentAnimation = null;
  function animateOutline() {
    if (done) {
      let i = 0;
      if (currentAnimation !== null) {
        clearInterval(currentAnimation);
        currentAnimation = null;
        spectraSvg.innerHTML = "";
      }
      currentAnimation = setInterval(() => {
        if (i >= allSteps.length || !done) {
          clearInterval(currentAnimation);
          console.log("animation restarted");
          return;
        }
        const startPoint = allSteps[i].startPoint;
        const endPoint = allSteps[i].endPoint;
        const color = allSteps[i].color;
        actualSample.setAttribute("x1", `${startPoint.real}`);
        actualSample.setAttribute("y1", `${startPoint.imag}`);
        actualSample.setAttribute("x2", `${endPoint.real}`);
        actualSample.setAttribute("y2", `${endPoint.imag}`);
        actualSample.setAttribute("stroke", `${color}`);
        const calculatedSample = actualSample.cloneNode(false);
        calculatedSample.setAttribute("id", `calculatedSample ${i}`);
        spectraSvg.appendChild(calculatedSample);
        i++;
      }, 1);
    }
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
        if (iterations == iterationDepth && z.real * z.real + z.imag * z.imag > 3.5 && z.real * z.real + z.imag * z.imag <= 4) {
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
  var audioContext = null;
  var oscillator = null;
  function createOscillatorFromWaveform(data) {
    return __async(this, null, function* () {
      if (!audioContext) {
        audioContext = new AudioContext();
      }
      oscillator = audioContext.createOscillator();
      const realValues = new Float32Array(data.map((point) => point.real));
      const imagValues = new Float32Array(data.map((point) => point.imag));
      const wave = audioContext.createPeriodicWave(realValues, imagValues);
      oscillator.setPeriodicWave(wave);
      oscillator.connect(audioContext.destination);
      oscillator.frequency.value = parseFloat(frequencySlider.value);
      oscillator.start();
    });
  }
  function stopSound() {
    if (oscillator) {
      oscillator.stop();
      oscillator.disconnect();
      oscillator = null;
    }
    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }
  }

  // src/index.ts
  console.log("ver 2104");
  var wrapper = document.getElementById("wrapper");
  var overviewSvgWidth = 480;
  var overviewSvgHeight = 420;
  var width = 2.5;
  var height = width;
  var iterationDepth = 4;
  var xMin = -2;
  var xMax = xMin + width;
  var yMin = -1.2;
  var yMax = yMin + height;
  var animationRequest = true;
  var headline = document.createElement("h1");
  headline.innerHTML = `View and oszillate the mandelbrot at depth: ${iterationDepth}`;
  var overviewSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  overviewSvg.setAttribute("id", "mandelbrotSvg");
  overviewSvg.setAttribute("viewBox", `${xMin} ${yMin} ${width} ${height}`);
  overviewSvg.setAttribute("width", `${overviewSvgWidth}px`);
  overviewSvg.setAttribute("height", `${overviewSvgHeight}px`);
  var spectraSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  spectraSvg.setAttribute("id", "spectraSvg");
  spectraSvg.setAttribute("viewBox", `${xMin} ${yMin} ${width} ${height}`);
  spectraSvg.setAttribute("width", `${overviewSvgWidth}px`);
  spectraSvg.setAttribute("height", `${overviewSvgHeight}px`);
  if (document.documentElement.clientWidth < 1004) {
    animationRequest = false;
  }
  var viewControlsContainer = document.createElement("div");
  viewControlsContainer.id = "viewControlsContainer";
  viewControlsContainer.style.border = "1px solid black";
  viewControlsContainer.style.padding = "10px";
  var viewElementsContainer = document.createElement("div");
  viewElementsContainer.id = "viewElementsContainer";
  viewElementsContainer.style.border = "1px solid black";
  viewElementsContainer.style.padding = "10px";
  var soundControlsContainer = document.createElement("div");
  soundControlsContainer.id = "soundControlsContainer";
  soundControlsContainer.style.border = "1px solid black";
  soundControlsContainer.style.padding = "10px";
  var xDataSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  var xDataSvgWidth = 200;
  var xDataSvgHeight = 100;
  xDataSvg.style.marginLeft = "5px";
  xDataSvg.setAttribute("id", "xDataSvg");
  xDataSvg.setAttribute("width", `${xDataSvgWidth}`);
  xDataSvg.setAttribute("height", `${xDataSvgHeight}`);
  var yDataSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  var yDataSvgWidth = 200;
  var yDataSvgHeight = 100;
  yDataSvg.style.marginLeft = "5px";
  yDataSvg.setAttribute("id", "yDataSvg");
  yDataSvg.setAttribute("width", `${yDataSvgWidth}`);
  yDataSvg.setAttribute("height", `${yDataSvgHeight}`);
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
  var oscillateButton = document.createElement("button");
  oscillateButton.innerHTML = "oscillate boundary points";
  oscillateButton.style.width = "200px";
  var isPlaying = false;
  oscillateButton.addEventListener("click", () => {
    if (!isPlaying) {
      createOscillatorFromWaveform(boundaryPoints);
      oscillateButton.textContent = "stop sound";
    }
    if (isPlaying) {
      stopSound();
      oscillateButton.textContent = "oscillate boundary points";
    }
    isPlaying = !isPlaying;
  });
  var frequencySliderLabel = document.createElement("label");
  frequencySliderLabel.setAttribute("for", "frequencySlider");
  frequencySliderLabel.innerHTML = " frequency: ";
  var frequencySlider = document.createElement("input");
  frequencySlider.id = "frequencySlider";
  frequencySlider.type = "range";
  frequencySlider.min = "1";
  frequencySlider.max = "440";
  frequencySlider.value = "1";
  frequencySlider.addEventListener("input", (event) => {
    const frequency = event.target.valueAsNumber;
    if (oscillator)
      oscillator.frequency.value = frequency;
  });
  soundControlsContainer.appendChild(oscillateButton);
  soundControlsContainer.appendChild(frequencySliderLabel);
  soundControlsContainer.appendChild(frequencySlider);
  viewControlsContainer.appendChild(iterationsSliderLabel);
  viewControlsContainer.appendChild(iterationsSlider);
  viewControlsContainer.appendChild(iterationsSlider);
  viewControlsContainer.appendChild(xMinSliderLabel);
  viewControlsContainer.appendChild(xMinSlider);
  viewControlsContainer.appendChild(yMinSliderLabel);
  viewControlsContainer.appendChild(yMinSlider);
  viewControlsContainer.appendChild(zoomSliderLabel);
  viewControlsContainer.appendChild(zoomSlider);
  viewElementsContainer.appendChild(overviewSvg);
  viewElementsContainer.appendChild(spectraSvg);
  calcMandelbrotOutline();
  drawLines();
  var xDataLine = drawExtrapolatedCurve(extrapolate(boundaryPoints, "real"));
  var yDataLine = drawExtrapolatedCurve(extrapolate(boundaryPoints, "imag"));
  xDataSvg.appendChild(xDataLine);
  yDataSvg.appendChild(yDataLine);
  wrapper == null ? void 0 : wrapper.appendChild(headline);
  wrapper == null ? void 0 : wrapper.appendChild(soundControlsContainer);
  wrapper == null ? void 0 : wrapper.appendChild(viewControlsContainer);
  wrapper == null ? void 0 : wrapper.appendChild(viewElementsContainer);
  var mandelbrot2 = new Mandelbrot();
  window.onload = () => {
    mandelbrot2.drawCloud();
  };
  iterationsSlider.addEventListener("input", function(event) {
    iterationDepth = parseInt(iterationsSlider.value);
    headline.innerHTML = `Mandelbrot-Grenzlinie bei Iterationstiefe i = ${iterationDepth}`;
    mandelbrot2.drawCloud();
    calcMandelbrotOutline();
    if (isPlaying) createOscillatorFromWaveform(boundaryPoints);
    drawLines();
  });
  xMinSlider.addEventListener("input", function() {
    xMin = parseFloat(xMinSlider.value);
    xMax = xMin + width;
    overviewSvg.setAttribute("viewBox", `${xMin} ${yMin} ${width} ${height}`);
  });
  yMinSlider.addEventListener("input", function() {
    yMin = parseFloat(yMinSlider.value);
    yMax = yMin + height;
    overviewSvg.setAttribute("viewBox", `${xMin} ${yMin} ${width} ${height}`);
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
    zoomSlider.step = zoomSlider.min;
  });
  zoomSlider.addEventListener("mouseup", () => {
    mandelbrot2.drawCloud();
    const sliderMinAttribute = zoomSlider.getAttribute("min");
    let minValue;
    if (sliderMinAttribute) {
      minValue = parseFloat(sliderMinAttribute);
      zoomSlider.min = `${minValue / 10}`;
    }
  });
  overviewSvg.addEventListener("mouseleave", () => {
    mousedown = false;
  });
  var xOffset;
  var yOffset;
  var mousedown = false;
  overviewSvg.addEventListener("mousedown", (event) => {
    mousedown = true;
    const coords = getSvgCoords(overviewSvg, event);
    xOffset = coords.x;
    yOffset = coords.y;
  });
  overviewSvg.addEventListener("mousemove", (event) => {
    if (!mousedown)
      return;
    const coords = getSvgCoords(overviewSvg, event);
    xMin += xOffset - coords.x;
    yMin += yOffset - coords.y;
    overviewSvg.setAttribute("viewBox", `${xMin} ${yMin} ${width} ${height}`);
  });
  overviewSvg.addEventListener("mouseup", () => {
    mousedown = false;
    mandelbrot2.drawCloud();
    drawLines();
  });
  overviewSvg.addEventListener("wheel", (event) => {
    let deltaY = event.deltaY;
    const clientWidth = overviewSvg.getBoundingClientRect().width;
    const mouseX = event.x - overviewSvg.getBoundingClientRect().x;
    const clientHeight = overviewSvg.getBoundingClientRect().height;
    const mouseY = event.y - overviewSvg.getBoundingClientRect().y;
    if (Math.abs(deltaY) < 100) {
      if (deltaY <= 0)
        deltaY -= 100;
      else
        deltaY += 100;
    }
    const oldWidth = width;
    const oldHeight = height;
    width += width * 10 / deltaY;
    height = width;
    xMin -= (width - oldWidth) * mouseX / clientWidth;
    xMax = xMin + width;
    yMin -= (height - oldHeight) * mouseY / clientHeight;
    yMax = yMin + height;
    overviewSvg.setAttribute("viewBox", `${xMin} ${yMin} ${width} ${height}`);
  });
  spectraSvg.addEventListener("mousedown", (event) => {
    mousedown = true;
    const coords = getSvgCoords(spectraSvg, event);
    xOffset = coords.x;
    yOffset = coords.y;
  });
  spectraSvg.addEventListener("mousemove", (event) => {
    if (!mousedown)
      return;
    const coords = getSvgCoords(spectraSvg, event);
    xMin += xOffset - coords.x;
    yMin += yOffset - coords.y;
    spectraSvg.setAttribute("viewBox", `${xMin} ${yMin} ${width} ${height}`);
  });
  spectraSvg.addEventListener("mouseup", () => {
    mousedown = false;
  });
  spectraSvg.addEventListener("wheel", (event) => {
    const clientWidth = spectraSvg.getBoundingClientRect().width;
    const mouseX = event.x - spectraSvg.getBoundingClientRect().x;
    const clientHeight = spectraSvg.getBoundingClientRect().height;
    const mouseY = event.y - spectraSvg.getBoundingClientRect().y;
    let deltaY = event.deltaY;
    if (Math.abs(deltaY) < 100) {
      if (deltaY <= 0)
        deltaY -= 100;
      else
        deltaY += 100;
    }
    const oldWidth = width;
    const oldHeight = height;
    width += width * 10 / deltaY;
    height = width;
    xMin -= (width - oldWidth) * mouseX / clientWidth;
    xMax = xMin + width;
    yMin -= (height - oldHeight) * mouseY / clientHeight;
    yMax = yMin + height;
    spectraSvg.setAttribute("viewBox", `${xMin} ${yMin} ${width} ${height}`);
  });
  function getSvgCoords(svgElement, event) {
    const point = svgElement.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const svgCoords = point.matrixTransform(svgElement.getScreenCTM().inverse());
    return svgCoords;
  }
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
