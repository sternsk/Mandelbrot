"use strict";
(() => {
  // src/calcMandelbrotOutline.ts
  var boundaryPoints = [];
  function calcMandelbrotOutline() {
    const begin = Date.now();
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
          directionVector = rotate(directionVector, 0.5 * sampleAngle);
        }
        const endpoint = add(actualPoint, scale(directionVector, sampleLength));
        actualPoint = endpoint;
        boundaryPoints.push(actualPoint);
      }
      if (!mandelbrot(add(actualPoint, scale(directionVector, sampleLength)))) {
        if (mandelbrot(add(actualPoint, scale(directionVector, sampleLength / 2)))) {
          console.log("actualPoint + directionVector is not, but actualPoint + directionVector/2 is inside the Mandelbrot");
          directionVector = rotate(directionVector, 2 * sampleAngle);
        }
        while (!mandelbrot(add(actualPoint, scale(directionVector, sampleLength)))) {
          directionVector = rotate(directionVector, -0.5 * sampleAngle);
        }
        directionVector = rotate(directionVector, 0.5 * sampleAngle);
        const endpoint = add(actualPoint, scale(directionVector, sampleLength));
        actualPoint = endpoint;
        boundaryPoints.push(actualPoint);
      }
    }
    console.log("boundaryPoints.length: " + boundaryPoints.length);
    duration = Date.now() - begin;
    console.log(`sampling duration: ${duration} ms`);
    return boundaryPoints;
  }
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

  // src/library.ts
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
  function idft(coefficients, N) {
    const result = [];
    for (let n = 0; n < N; n++) {
      let sum = { real: 0, imag: 0 };
      for (let k = 0; k < coefficients.length; k++) {
        const angle = 2 * Math.PI * k * n / N;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        sum.real += coefficients[k].real * cos - coefficients[k].imag * sin;
        sum.imag += coefficients[k].real * sin + coefficients[k].imag * cos;
      }
      result.push(sum);
    }
    return result;
  }
  function extractValuesAsFloat32Array(points, part) {
    return new Float32Array(points.map((complex) => complex[part]));
  }

  // src/index.ts
  console.log("ver 2219");
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
  var idftSample = [];
  var idftPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  var inversionAccuracy = 169;
  var headline = document.createElement("h1");
  updateHeadline();
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
  var idftSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  idftSvg.setAttribute("id", "IDFTSvg");
  idftSvg.setAttribute("viewBox", `${xMin} ${yMin} ${width} 4`);
  idftSvg.setAttribute("width", `${overviewSvgWidth}px`);
  idftSvg.setAttribute("height", `${overviewSvgHeight}px`);
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
  rawSample = mirrorX(calcMandelbrotOutline());
  rawCurvePath = drawLines(rawSample);
  rawsampleSvg.appendChild(rawCurvePath);
  dftsample = dft(rawSample);
  dftPath = drawLines(dftsample);
  dftSvg.appendChild(dftPath);
  idftSample = idft(dftsample, inversionAccuracy);
  idftPath = drawLines(idftSample);
  idftSvg.appendChild(idftPath);
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
      else if (sampleSelector.value == "idft")
        sample = idftSample;
      else
        sample = rawSample;
      const wave = audioContext.createPeriodicWave(
        extractValuesAsFloat32Array(sample, "real"),
        extractValuesAsFloat32Array(sample, "imag")
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
  var selectIDFT = document.createElement("option");
  selectRawSample.setAttribute("value", "RawSample");
  selectDFT.setAttribute("value", "dft");
  selectIDFT.setAttribute("value", "idft");
  selectRawSample.textContent = "RawSample";
  selectDFT.textContent = "Fourier-transformed Data";
  selectIDFT.textContent = "retransformed Fourier Data";
  sampleSelector.appendChild(selectRawSample);
  sampleSelector.appendChild(selectDFT);
  sampleSelector.appendChild(selectIDFT);
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
  var inversionAccuracySliderLabel = document.createElement("label");
  inversionAccuracySliderLabel.setAttribute("for", "inversionAmountSlider");
  inversionAccuracySliderLabel.innerHTML = "reversion accuracy: ";
  var inversionAccuracySlider = document.createElement("input");
  inversionAccuracySlider.id = "sampleAmountSlider";
  inversionAccuracySlider.type = "range";
  inversionAccuracySlider.min = "1";
  inversionAccuracySlider.max = `${rawSample.length}`;
  inversionAccuracySlider.step = "1";
  inversionAccuracySlider.value = `${inversionAccuracy}`;
  soundControlsContainer.appendChild(soundButton);
  soundControlsContainer.appendChild(frequencySliderLabel);
  soundControlsContainer.appendChild(frequencySlider);
  soundControlsContainer.appendChild(sampleSelector);
  viewControlsContainer.appendChild(iterationDepthSliderLabel);
  viewControlsContainer.appendChild(iterationDepthSlider);
  viewControlsContainer.appendChild(inversionAccuracySliderLabel);
  viewControlsContainer.appendChild(inversionAccuracySlider);
  viewElementsContainer.appendChild(rawsampleSvg);
  viewElementsContainer.appendChild(dftSvg);
  wrapper == null ? void 0 : wrapper.appendChild(headline);
  wrapper == null ? void 0 : wrapper.appendChild(soundControlsContainer);
  wrapper == null ? void 0 : wrapper.appendChild(viewControlsContainer);
  wrapper == null ? void 0 : wrapper.appendChild(viewElementsContainer);
  iterationDepthSlider.addEventListener("input", function(event) {
    iterationDepth = parseInt(iterationDepthSlider.value);
    updateHeadline();
    rawSample = mirrorX(calcMandelbrotOutline());
    rawCurvePath = drawLines(mirrorX(rawSample));
    rawsampleSvg.innerHTML = "";
    rawsampleSvg.appendChild(rawCurvePath);
    inversionAccuracySlider.max = rawSample.length.toString();
    dftsample = dft(rawSample);
    dftSvg.innerHTML = "";
    dftSvg.appendChild(drawLines(dftsample));
    idftSvg.innerHTML = "";
    idftSvg.appendChild(drawDots(idft(dftsample, inversionAccuracy)));
  });
  inversionAccuracySlider.addEventListener("input", function() {
    inversionAccuracy = parseFloat(inversionAccuracySlider.value);
    updateHeadline();
    idftPath = drawDots(idft(dftsample, inversionAccuracy));
    idftSvg.innerHTML = "";
    idftSvg.appendChild(idftPath);
  });
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
  idftSvg.addEventListener("mousedown", (event) => {
    mousedown = true;
    const coords = getSvgCoords(idftSvg, event);
    xOffset = coords.x;
    yOffset = coords.y;
  });
  idftSvg.addEventListener("mousemove", (event) => {
    if (!mousedown)
      return;
    const coords = getSvgCoords(idftSvg, event);
    xMin += xOffset - coords.x;
    yMin += yOffset - coords.y;
    idftSvg.setAttribute("viewBox", `${xMin} ${yMin} ${width} ${height}`);
  });
  idftSvg.addEventListener("mouseup", () => {
    mousedown = false;
  });
  idftSvg.addEventListener("wheel", (event) => {
    const clientWidth = idftSvg.getBoundingClientRect().width;
    const mouseX = event.x - idftSvg.getBoundingClientRect().x;
    const clientHeight = idftSvg.getBoundingClientRect().height;
    const mouseY = event.y - idftSvg.getBoundingClientRect().y;
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
    idftSvg.setAttribute("viewBox", `${xMin} ${yMin} ${width} ${height}`);
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
  function drawDots(samplePoints) {
    const sampleCurvePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    if (samplePoints.length < 2) {
      console.warn("Not enough points to draw lines");
      return sampleCurvePath;
    }
    let pathData = "";
    for (let i = 1; i < samplePoints.length; i++) {
      pathData += ` M ${samplePoints[i].real} ${samplePoints[i].imag} v .01`;
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
    headline.innerHTML = headline.innerHTML = `Providing Audiosamples of the Mandelbrot-set at iteration-depth: ${iterationDepth} is transformed by discrete-Fourier-transformation and transformed back the first ${inversionAccuracy} elements of the transformed values`;
  }
})();
//# sourceMappingURL=index.js.map
