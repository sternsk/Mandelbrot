"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // src/library.ts
  function mirrorX(samplePoints) {
    const arrayLength = samplePoints.length;
    const mirroredPoints = [...samplePoints];
    for (let index = arrayLength - 2; index >= 0; index--) {
      const reversedPoint = { real: samplePoints[index].real, imag: -samplePoints[index].imag };
      mirroredPoints.push(reversedPoint);
    }
    return mirroredPoints;
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
  function dft(data) {
    const N = data.length;
    const result = [];
    for (let k = 0; k < N; k++) {
      let sum = { real: 0, imag: 0 };
      for (let n = 0; n < N; n++) {
        const angle = 2 * Math.PI * k * n / N;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        sum.real += data[n].real * cos + data[n].imag * sin;
        sum.imag += data[n].imag * cos - data[n].real * sin;
      }
      sum.real /= N;
      sum.imag /= N;
      result.push(sum);
    }
    return result;
  }
  function extractValuesAsFloat32Array(points, part) {
    return new Float32Array(points.map((complex) => complex[part]));
  }

  // src/calcMandelbrotOutline.ts
  var MandelbrotOutline = class {
    constructor(iterationDepth2) {
      __publicField(this, "_iterationDepth");
      __publicField(this, "boundaryPoints", []);
      this._iterationDepth = iterationDepth2;
    }
    set iterationDepth(n) {
      this._iterationDepth = n;
    }
    get iterationDepth() {
      return this._iterationDepth;
    }
    calcMandelbrotOutline() {
      const begin = Date.now();
      let duration;
      this.boundaryPoints = [];
      const startPoint = { real: -2, imag: 0 };
      let directionVector = { real: -1, imag: 0 };
      const sampleLength = 0.1 / Math.pow(this.iterationDepth, 3);
      const sampleAngle = Math.PI / 8;
      let actualPoint = add(startPoint, scale(directionVector, sampleLength / 2));
      console.log("sampleLength: " + sampleLength + " at iterationDepth: " + this.iterationDepth);
      this.boundaryPoints.push(actualPoint);
      directionVector = { real: 0, imag: 1 };
      while (actualPoint.imag >= 0) {
        if (this.mandelbrot(add(actualPoint, scale(directionVector, sampleLength)))) {
          directionVector = rotate(directionVector, 0.5 * sampleAngle);
          while (this.mandelbrot(add(actualPoint, scale(directionVector, sampleLength)))) {
            directionVector = rotate(directionVector, 0.5 * sampleAngle);
          }
          const endpoint = add(actualPoint, scale(directionVector, sampleLength));
          actualPoint = endpoint;
          this.boundaryPoints.push(actualPoint);
        }
        if (!this.mandelbrot(add(actualPoint, scale(directionVector, sampleLength)))) {
          if (this.mandelbrot(add(actualPoint, scale(directionVector, sampleLength / 2)))) {
            console.log("actualPoint + directionVector is not, but actualPoint + directionVector/2 is inside the Mandelbrot");
            directionVector = rotate(directionVector, 2 * sampleAngle);
          }
          while (!this.mandelbrot(add(actualPoint, scale(directionVector, sampleLength)))) {
            directionVector = rotate(directionVector, -0.5 * sampleAngle);
          }
          directionVector = rotate(directionVector, 0.5 * sampleAngle);
          const endpoint = add(actualPoint, scale(directionVector, sampleLength));
          actualPoint = endpoint;
          this.boundaryPoints.push(actualPoint);
        }
      }
      console.log("boundaryPoints.length: " + this.boundaryPoints.length);
      duration = Date.now() - begin;
      console.log(`sampling duration: ${duration} ms`);
      return this.boundaryPoints;
    }
    mandelbrot(c) {
      let z = { real: c.real, imag: c.imag };
      let iterations = 0;
      while (iterations < this.iterationDepth && z.real * z.real + z.imag * z.imag <= 4) {
        let realTemp = z.real * z.real - z.imag * z.imag + c.real;
        z.imag = 2 * z.real * z.imag + c.imag;
        z.real = realTemp;
        iterations++;
        if (iterations == this.iterationDepth) {
          return true;
        }
      }
      return false;
    }
  };

  // src/index.ts
  console.log("ver 2237");
  var wrapper = document.getElementById("wrapper");
  var audioContext = null;
  var oscillator = null;
  var overviewSvgWidth = 480;
  var overviewSvgHeight = 420;
  var dftSvgWidth = 480;
  var dftSvgHeight = 420;
  var width = 2.5;
  var height = width;
  var iterationDepth = 4;
  var xMin = -2;
  var xMax = xMin + width;
  var yMin = -1.2;
  var yMax = yMin + height;
  var animationRequest = true;
  var rawSample = [];
  var rawCurvePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  var dftsample = [];
  var dftPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  var headline = document.createElement("h1");
  var rawsampleSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  rawsampleSvg.setAttribute("id", "sampleCurveSvg");
  rawsampleSvg.setAttribute("viewBox", `${xMin} ${yMin} ${width} ${height}`);
  rawsampleSvg.setAttribute("width", `${overviewSvgWidth}px`);
  rawsampleSvg.setAttribute("height", `${overviewSvgHeight}px`);
  var dftSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  dftSvg.setAttribute("id", "dftSvg");
  dftSvg.setAttribute("width", `${dftSvgWidth}`);
  dftSvg.setAttribute("height", `${dftSvgHeight}`);
  dftSvg.setAttribute("viewBox", "-1 -1 2 2");
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
  var mandelbrotOutline = new MandelbrotOutline(iterationDepth);
  updateHeadline();
  rawSample = mirrorX(mandelbrotOutline.calcMandelbrotOutline());
  rawCurvePath = drawLines(rawSample);
  rawsampleSvg.appendChild(rawCurvePath);
  dftsample = dft(rawSample);
  dftPath = drawLines(dftsample);
  dftSvg.appendChild(dftPath);
  var soundButton = document.createElement("button");
  soundButton.innerHTML = "oscillate boundary points";
  soundButton.style.width = "200px";
  var isPlaying = false;
  soundButton.addEventListener("click", () => {
    if (!audioContext) {
      audioContext = new AudioContext();
    }
    if (!oscillator) {
      oscillator = audioContext.createOscillator();
    }
    if (!isPlaying) {
      soundButton.textContent = "stop sound";
      console.log(sampleSelector.value);
      let sample;
      if (sampleSelector.value == "dft")
        sample = dftsample;
      else
        sample = rawSample;
      const wave = audioContext.createPeriodicWave(
        extractValuesAsFloat32Array(sample, "imag"),
        extractValuesAsFloat32Array(sample, "real")
      );
      oscillator.setPeriodicWave(wave);
      oscillator.connect(audioContext.destination);
      oscillator.frequency.value = parseInt(frequencySlider.value);
      oscillator.start();
    }
    if (isPlaying) {
      if (oscillator) {
        oscillator.stop();
        oscillator.disconnect();
        oscillator = null;
      }
      if (audioContext) {
        audioContext.close();
        audioContext = null;
      }
      soundButton.textContent = "oscillate boundary points";
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
  var sampleSelector = document.createElement("select");
  var selectRawSample = document.createElement("option");
  var selectDFT = document.createElement("option");
  selectRawSample.setAttribute("value", "RawSample");
  selectRawSample.textContent = "RawSample";
  selectDFT.setAttribute("value", "dft");
  selectDFT.setAttribute("selected", "true");
  selectDFT.textContent = "Fourier-transformed Data";
  sampleSelector.appendChild(selectRawSample);
  sampleSelector.appendChild(selectDFT);
  sampleSelector.addEventListener("change", () => {
  });
  var iterationDepthSliderLabel = document.createElement("label");
  iterationDepthSliderLabel.setAttribute("for", "iterationsSlider");
  iterationDepthSliderLabel.innerHTML = "iterations: ";
  var iterationDepthSlider = document.createElement("input");
  iterationDepthSlider.id = "iterationsSlider";
  iterationDepthSlider.type = "range";
  iterationDepthSlider.min = "2";
  iterationDepthSlider.max = "14";
  iterationDepthSlider.step = "1";
  iterationDepthSlider.value = `${iterationDepth}`;
  iterationDepthSlider.addEventListener("input", function(event) {
    mandelbrotOutline.iterationDepth = parseInt(iterationDepthSlider.value);
    updateHeadline();
    rawSample = mirrorX(mandelbrotOutline.calcMandelbrotOutline());
    rawCurvePath = drawLines(rawSample);
    rawsampleSvg.innerHTML = "";
    rawsampleSvg.appendChild(rawCurvePath);
    dftsample = dft(rawSample);
    dftSvg.innerHTML = "";
    dftSvg.appendChild(drawLines(dftsample));
  });
  soundControlsContainer.appendChild(soundButton);
  soundControlsContainer.appendChild(frequencySliderLabel);
  soundControlsContainer.appendChild(frequencySlider);
  soundControlsContainer.appendChild(sampleSelector);
  viewControlsContainer.appendChild(iterationDepthSliderLabel);
  viewControlsContainer.appendChild(iterationDepthSlider);
  viewElementsContainer.appendChild(rawsampleSvg);
  viewElementsContainer.appendChild(dftSvg);
  wrapper == null ? void 0 : wrapper.appendChild(headline);
  wrapper == null ? void 0 : wrapper.appendChild(soundControlsContainer);
  wrapper == null ? void 0 : wrapper.appendChild(viewControlsContainer);
  wrapper == null ? void 0 : wrapper.appendChild(viewElementsContainer);
  rawsampleSvg.addEventListener("mouseleave", () => {
    mousedown = false;
  });
  var xOffset;
  var yOffset;
  var mousedown = false;
  rawsampleSvg.addEventListener("mousedown", (event) => {
    mousedown = true;
    const coords = getSvgCoords(rawsampleSvg, event);
    xOffset = coords.x;
    yOffset = coords.y;
  });
  rawsampleSvg.addEventListener("mousemove", (event) => {
    if (!mousedown)
      return;
    const coords = getSvgCoords(rawsampleSvg, event);
    xMin += xOffset - coords.x;
    yMin += yOffset - coords.y;
    rawsampleSvg.setAttribute("viewBox", `${xMin} ${yMin} ${width} ${height}`);
  });
  rawsampleSvg.addEventListener("mouseup", () => {
    mousedown = false;
    drawLines(rawSample);
  });
  rawsampleSvg.addEventListener("wheel", (event) => {
    let deltaY = event.deltaY;
    const clientWidth = rawsampleSvg.getBoundingClientRect().width;
    const mouseX = event.x - rawsampleSvg.getBoundingClientRect().x;
    const clientHeight = rawsampleSvg.getBoundingClientRect().height;
    const mouseY = event.y - rawsampleSvg.getBoundingClientRect().y;
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
    rawsampleSvg.setAttribute("viewBox", `${xMin} ${yMin} ${width} ${height}`);
  });
  dftSvg.addEventListener("mousedown", (event) => {
    mousedown = true;
    const coords = getSvgCoords(dftSvg, event);
    xOffset = coords.x;
    yOffset = coords.y;
  });
  dftSvg.addEventListener("mousemove", (event) => {
    if (!mousedown)
      return;
    const coords = getSvgCoords(dftSvg, event);
    xMin += xOffset - coords.x;
    yMin += yOffset - coords.y;
    dftSvg.setAttribute("viewBox", `${xMin} ${yMin} ${width} ${height}`);
  });
  dftSvg.addEventListener("mouseup", () => {
    mousedown = false;
  });
  dftSvg.addEventListener("wheel", (event) => {
    const clientWidth = dftSvg.getBoundingClientRect().width;
    const mouseX = event.x - dftSvg.getBoundingClientRect().x;
    const clientHeight = dftSvg.getBoundingClientRect().height;
    const mouseY = event.y - dftSvg.getBoundingClientRect().y;
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
    dftSvg.setAttribute("viewBox", `${xMin} ${yMin} ${width} ${height}`);
  });
  function getSvgCoords(svgElement, event) {
    const point = svgElement.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const svgCoords = point.matrixTransform(svgElement.getScreenCTM().inverse());
    return svgCoords;
  }
  function drawLines(samplePoints) {
    const sampleCurvePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    if (samplePoints.length < 2) {
      console.warn("Not enough points to draw lines");
      return sampleCurvePath;
    }
    let pathData = `M${samplePoints[0].real} ${samplePoints[0].imag}`;
    for (let i = 1; i < samplePoints.length; i++) {
      pathData += `L ${samplePoints[i].real} ${samplePoints[i].imag}`;
    }
    sampleCurvePath.setAttribute("id", "outlinePath");
    sampleCurvePath.setAttribute("fill", "none");
    sampleCurvePath.setAttribute("stroke", "black");
    sampleCurvePath.setAttribute("stroke-width", ".5 px");
    sampleCurvePath.setAttribute("vector-effect", "non-scaling-stroke");
    sampleCurvePath.setAttribute("d", `${pathData}`);
    return sampleCurvePath;
  }
  function updateHeadline() {
    headline.innerHTML = headline.innerHTML = `Sonification of the Mandelbrot-set at iteration-depth ${mandelbrotOutline.iterationDepth}`;
  }
})();
//# sourceMappingURL=index.js.map
