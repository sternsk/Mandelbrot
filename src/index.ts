
console.log("ver 2220")
import WorkerURL from './waveformworker.ts?worker';
import { MandelbrotOutline } from "./calcMandelbrotOutline.js";
import { Complex, drawLines, drawDots, pixelHeight, mirrorX, dft, idft, extractValuesAsFloat32Array, storage, createOscillatorFromWaveform, stopSound} from "./library.js";


const wrapper = document.getElementById("wrapper")
let audioContext: AudioContext | null = null
let oscillator: OscillatorNode | null = null

export const rawDataSvgWidth =480
export const rawDataSvgHeight = 420
const dftSvgWidth = 480
const dftSvgHeight = 420
const idftSvgWidth = 480
const idftSvgHeight = 420

let width = 2.5
let height = width
let iterationDepth = 4;  // initial iteration-depth
let accuracy = 169      //iniitial accuracy for inverse discrete fourier transformation
export let xMin = -2, xMax = xMin + width
export let yMin = -1.2, yMax = yMin + height


// // outsource the calculations to a worker
// const worker = new Worker('waveformWorker.js');
// console.log("worker: "+worker)
// worker.postMessage( iterationDepth );
// worker.onmessage = (event) => {
//     console.log("Worker response:", event.data);
//     //renderWaveform(event.data.waveform);
// };

let rawSample: Complex[] = []
let rawCurvePath = document.createElementNS("http://www.w3.org/2000/svg", "path")
let dftSample: Complex[] = []
let dftPath = document.createElementNS("http://www.w3.org/2000/svg", "path") 

const headline: HTMLHeadElement = document.createElement("h1")

// there is the constructed mandelbrot line in the left window
export const rawSampleSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
rawSampleSvg.setAttribute("id", "sampleCurveSvg")
rawSampleSvg.setAttribute("viewBox", `${xMin} ${yMin} ${width} ${height}`)
rawSampleSvg.setAttribute("width", `${rawDataSvgWidth}px`)
rawSampleSvg.setAttribute("height", `${rawDataSvgHeight}px`)

// and there is the place where the transformed sampleCurve is plotted
const dftSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
dftSvg.setAttribute("id", "dftSvg")
dftSvg.setAttribute("width", `${dftSvgWidth}`)
dftSvg.setAttribute("height", `${dftSvgHeight}`)
dftSvg.setAttribute("viewBox", "-0.000003941525533301985 -0.000004073599120061317 0.000007750550196828558 0.000007750550196828558")

const idftSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
idftSvg.setAttribute("id", "idftSvg")
idftSvg.setAttribute("width", `${idftSvgWidth}`)
idftSvg.setAttribute("height", `${idftSvgHeight}`)
idftSvg.setAttribute("viewBox", "-1.9 -1.25 2.5 2.5")


const viewControlsContainer = document.createElement("div")
viewControlsContainer.id = "viewControlsContainer"
viewControlsContainer.style.border = "1px solid black"
viewControlsContainer.style.padding = "10px"

const viewElementsContainer = document.createElement("div")
viewElementsContainer.id = "viewElementsContainer"
viewElementsContainer.style.border = "1px solid black"
viewElementsContainer.style.padding = "10px"

const soundControlsContainer = document.createElement("div")
soundControlsContainer.id = "soundControlsContainer"
soundControlsContainer.style.border = "1px solid black"
soundControlsContainer.style.padding = "10px"

const mandelbrotOutline = new MandelbrotOutline(iterationDepth)
updateHeadline()
rawSample = mirrorX(mandelbrotOutline.calcMandelbrotOutline())
const rawLines = drawLines(rawSample)

dftSample = dft(rawSample)
const dftDots = drawDots(dftSample, pixelHeight(dftSvg))
let idftSample = idft(dftSample, accuracy)
storage.set(iterationDepth, {rawSample: rawSample, rawLines: rawLines, dftSample: dftSample, dftDots: dftDots})

const soundButton = document.createElement("button")
soundButton.innerHTML = "oscillate boundary points"
soundButton.style.width = "200px"
let isPlaying = false

soundButton.addEventListener("click", ()=>{
    if(!audioContext){
        audioContext = new AudioContext()
    }
    if(!oscillator){
        oscillator = audioContext.createOscillator()
    }
    if(!isPlaying){
        soundButton.textContent = "stop sound"
        console.log(sampleSelector.value)
        let sample
        if (sampleSelector.value == "dft")
            sample = dftSample
        else    
        sample = rawSample
    
    const wave = audioContext.createPeriodicWave(extractValuesAsFloat32Array(sample, "imag"), 
    extractValuesAsFloat32Array(sample, "real")
)
oscillator.setPeriodicWave(wave)
oscillator.connect(audioContext.destination)
oscillator.frequency.value = parseInt(frequencySlider.value)
oscillator.start()
}

if(isPlaying){
    if (oscillator) {
        oscillator.stop();
        oscillator.disconnect();
        oscillator = null;
    }
    
    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }
    soundButton.textContent = "oscillate boundary points"
}
isPlaying = !isPlaying

})

// control of the frequency
const frequencySliderLabel = document.createElement("label")
frequencySliderLabel.setAttribute("for", "frequencySlider")
frequencySliderLabel.innerHTML = " frequency: "
const frequencySlider = document.createElement("input")
frequencySlider.id = "frequencySlider"
frequencySlider.type = "range"
frequencySlider.min = "1"
frequencySlider.max = "440"
frequencySlider.value = "1"

frequencySlider.addEventListener("input", (event) => {
    const frequency = (event.target as HTMLInputElement).valueAsNumber;
    if(oscillator)
        oscillator.frequency.value = frequency; 
});

// control of the retransformation accuracy
const accuracySliderLabel = document.createElement("label")
accuracySliderLabel.setAttribute("for", "accuracySliderLabel")
accuracySliderLabel.innerHTML = "accuracy: "
const accuracySlider = document.createElement("input")
accuracySlider.id = "accuracySlider"
accuracySlider.type = "range"
accuracySlider.min = "1"
accuracySlider.max = `${rawSample.length}`
accuracySlider.value = "169"

accuracySlider.addEventListener("input", (event) => {
    accuracy = (event.target as HTMLInputElement).valueAsNumber;
    idftSample = idft(dftSample, accuracy)
    idftSvg.innerHTML = ""
    idftSvg.appendChild(drawLines(idftSample))
});

//select the sample to play
const sampleSelector = document.createElement("select")
const selectRawSample = document.createElement("option")
const selectDFT = document.createElement("option")
selectRawSample.setAttribute("value", "RawSample")
selectRawSample.textContent = "RawSample"
selectDFT.setAttribute("value", "dft")
selectDFT.setAttribute("selected", "true")
selectDFT.textContent = "Fourier-transformed Data"

sampleSelector.appendChild(selectRawSample)
sampleSelector.appendChild(selectDFT)
sampleSelector.addEventListener("change", ()=>{
})

// control-element for the iteration-depth
const iterationDepthSliderLabel = document.createElement("label")
iterationDepthSliderLabel.setAttribute("for", "iterationDepthSlider")
iterationDepthSliderLabel.innerHTML = "iterations: "
const iterationDepthSlider = document.createElement("input")
iterationDepthSlider.id = "iterationsSlider"
iterationDepthSlider.type = "range"
iterationDepthSlider.min = "3"
iterationDepthSlider.max = `${iterationDepth}`
iterationDepthSlider.step = "1"
iterationDepthSlider.value = `${iterationDepth}`
iterationDepthSlider.addEventListener("input", async function(event){
    mandelbrotOutline.iterationDepth = Number(iterationDepthSlider.value)
    iterationDepthInput.value = iterationDepthSlider.value
    updateHeadline()
    
    const storedData = storage.get(mandelbrotOutline.iterationDepth);
    if (storedData && storedData.rawSample) {
        // Daten aus dem Speicher holen
        rawSample = storedData.rawSample
        rawSampleSvg.appendChild(storedData.rawLines)
        dftSample = storedData.dftSample
        console.log(`Loaded raw data for iteration depth ${mandelbrotOutline.iterationDepth}`);
    } else { 
        
        //Daten berechnen und in den Speicher laden 
        console.log(`Calculating data for iteration depth ${mandelbrotOutline.iterationDepth}...`);
        const newRawData = await mirrorX(mandelbrotOutline.calcMandelbrotOutline())
        const newRawLines = await drawLines(newRawData)
        const newDftSample = await dft(newRawData)
        const newDftDots = await drawDots(newDftSample, pixelHeight(dftSvg))

        storage.set(mandelbrotOutline.iterationDepth, {rawSample: newRawData, 
                                                        rawLines: newRawLines, 
                                                        dftSample: newDftSample,
                                                        dftDots: newDftDots });
        rawSample = storage.get(iterationDepth)?.rawSample || []; // Fallback auf leeres Array
        console.log(`Calculated and loaded raw data for iteration depth ${mandelbrotOutline.iterationDepth}`);
    }

    rawSampleSvg.innerHTML = ""
    rawSampleSvg.appendChild(drawLines(rawSample))
    
    dftSample = dft(rawSample)
    dftSvg.innerHTML = ""
    dftSvg.appendChild(drawDots(dftSample, pixelHeight(dftSvg)))
    /*
    idftSample = idft(dftSample, accuracy)
    idftSvg.innerHTML = ""
    idftSvg.appendChild(drawLines(idftSample))
    */
})

const iterationDepthInput = document.createElement("input")
iterationDepthInput.type = "number"
iterationDepthInput.id = "iterationDepthInput"
iterationDepthInput.value = iterationDepthSlider.value
iterationDepthInput.oninput = () =>{
    // check if desired iterationDepth is already stored
    iterationDepthSlider.max = iterationDepthInput.value
    console.log("iterationDepthSlider.max: "+iterationDepthSlider.max)
}

soundControlsContainer.appendChild(soundButton)
soundControlsContainer.appendChild(frequencySliderLabel)
soundControlsContainer.appendChild(frequencySlider)
soundControlsContainer.appendChild(sampleSelector)

viewControlsContainer.appendChild(iterationDepthSliderLabel)
viewControlsContainer.appendChild(iterationDepthSlider)
viewControlsContainer.appendChild(iterationDepthInput)
viewControlsContainer.appendChild(accuracySliderLabel)
viewControlsContainer.appendChild(accuracySlider)

viewElementsContainer.appendChild(rawSampleSvg)
viewElementsContainer.appendChild(dftSvg)
viewElementsContainer.appendChild(idftSvg)

wrapper?.appendChild(headline)
wrapper?.appendChild(soundControlsContainer)
wrapper?.appendChild(viewControlsContainer)
wrapper?.appendChild(viewElementsContainer)

rawCurvePath = drawLines(rawSample)
rawSampleSvg.appendChild(rawCurvePath)


dftPath = drawDots(dftSample, pixelHeight(dftSvg))
dftSvg.appendChild(dftPath)

let idftPath = drawLines(idftSample)
idftSvg.appendChild(idftPath)

let xOffset: number
let yOffset: number
let mousedown = false


rawSampleSvg.addEventListener("mousedown", (event) =>{
    mousedown = true
    const coords = getSvgCoords(rawSampleSvg, event);
    xOffset = coords.x;
    yOffset = coords.y;
})

rawSampleSvg.addEventListener("mousemove", (event) =>{
    if(!mousedown)
        return
    const coords = getSvgCoords(rawSampleSvg, event);
    xMin += xOffset - coords.x
    yMin += yOffset - coords.y
    rawSampleSvg.setAttribute("viewBox", `${xMin} ${yMin} ${width} ${height}`)
    
})

rawSampleSvg.addEventListener("mouseleave", () => {
    mousedown = false
})

rawSampleSvg.addEventListener("mouseup", ()=>{
    mousedown = false
})

rawSampleSvg.addEventListener("wheel", (event) =>{
    
    let deltaY = event.deltaY
    const clientWidth = rawSampleSvg.getBoundingClientRect().width
    const mouseX = event.x - rawSampleSvg.getBoundingClientRect().x
    const clientHeight = rawSampleSvg.getBoundingClientRect().height
    const mouseY = event.y - rawSampleSvg.getBoundingClientRect().y

    if(Math.abs(deltaY) < 100){
        if(deltaY <= 0)
            deltaY -= 100
        else
            deltaY += 100
    }
    const oldWidth = width
    const oldHeight = height
    width += width * 10 / deltaY 
    height = width
    
    xMin -= (width - oldWidth) * mouseX / clientWidth 
    xMax = xMin + width
    yMin -=(height - oldHeight) * mouseY / clientHeight 
    yMax = yMin + height

    rawSampleSvg.setAttribute("viewBox", `${xMin} ${yMin} ${width} ${height}`)
    
})

dftSvg.addEventListener("mouseleave", () => {
    mousedown = false
})
dftSvg.addEventListener("mousedown", (event) =>{
    mousedown = true
    const coords = getSvgCoords(dftSvg, event);
    xOffset = coords.x;
    yOffset = coords.y;
})
dftSvg.addEventListener("mousemove", (event) =>{
    if(!mousedown)
        return
    const coords = getSvgCoords(dftSvg, event);
    let x = dftSvg.viewBox.baseVal.x
    let y = dftSvg.viewBox.baseVal.y
    let width = dftSvg.viewBox.baseVal.width
    let height = dftSvg.viewBox.baseVal.height
    x += xOffset - coords.x
    y += yOffset - coords.y
    dftSvg.setAttribute("viewBox", `${x} ${y} ${width} ${height}`)
})

dftSvg.addEventListener("mouseup", ()=>{
    mousedown = false
    
})
dftSvg.addEventListener("wheel", (event) =>{
    const clientWidth = dftSvg.getBoundingClientRect().width
    const mouseX = event.x - dftSvg.getBoundingClientRect().x
    const clientHeight = dftSvg.getBoundingClientRect().height
    const mouseY = event.y - dftSvg.getBoundingClientRect().y
    const oldWidth = dftSvg.viewBox.baseVal.width
    const oldHeight = dftSvg.viewBox.baseVal.height
    let x = dftSvg.viewBox.baseVal.x
    let y = dftSvg.viewBox.baseVal.y
    let width: number = oldWidth
    let height: number = oldHeight

    // differentiate between mousewheel and touchpad
    let deltaY = event.deltaY
    if(Math.abs(deltaY) < 100){
        if(deltaY <= 0)
            deltaY -= 100
        else
            deltaY += 100
    }
       
    width += oldWidth * 10 / deltaY 
    height = width
    
    x -= (width - oldWidth) * mouseX / clientWidth 
    y -=(height - oldHeight) * mouseY / clientHeight 
    
    dftSvg.setAttribute("viewBox", `${x} ${y} ${width} ${height}`)
  
})

idftSvg.addEventListener("mousedown", (event) =>{
    mousedown = true
    const coords = getSvgCoords(dftSvg, event);
    xOffset = coords.x;
    yOffset = coords.y;
})

idftSvg.addEventListener("mouseleave", () =>{
    mousedown = false
})

idftSvg.addEventListener("mousemove", (event) =>{
    if(!mousedown)
        return
    const coords = getSvgCoords(idftSvg, event);
    let x = idftSvg.viewBox.baseVal.x
    let y = idftSvg.viewBox.baseVal.y
    const width = idftSvg.viewBox.baseVal.width
    const height = idftSvg.viewBox.baseVal.height
    x += xOffset - coords.x
    y += yOffset - coords.y
    idftSvg.setAttribute("viewBox", `${x} ${y} ${width} ${height}`)
})
idftSvg.addEventListener("mouseup", ()=>{
    mousedown = false
    
})
idftSvg.addEventListener("wheel", (event) =>{
    const clientWidth = idftSvg.getBoundingClientRect().width
    const mouseX = event.x - idftSvg.getBoundingClientRect().x
    const clientHeight = idftSvg.getBoundingClientRect().height
    const mouseY = event.y - idftSvg.getBoundingClientRect().y
    const oldWidth = idftSvg.viewBox.baseVal.width
    const oldHeight = idftSvg.viewBox.baseVal.height
    let width = oldWidth
    let height = oldHeight
    let x = idftSvg.viewBox.baseVal.x
    let y = idftSvg.viewBox.baseVal.y

    // differentiate between mousewheel and touchpad
    let deltaY = event.deltaY
    if(Math.abs(deltaY) < 100){
        if(deltaY <= 0)
            deltaY -= 100
        else
            deltaY += 100
    }
    
    width += width * 10 / deltaY 
    height = width
    
    x -= (width - oldWidth ) * mouseX / clientWidth
    y -= (height - oldHeight) * mouseY / clientHeight
    
    idftSvg.setAttribute("viewBox", `${x} ${y} ${width} ${height}`)
    
})


// Outsource to library
// Helper to get SVG coordinates
function getSvgCoords(svgElement: SVGSVGElement, event: MouseEvent) {
    const point = svgElement.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const svgCoords = point.matrixTransform(svgElement.getScreenCTM()!.inverse());
    return svgCoords; 
}




function drawExtrapolatedCurve(points: {index: number, value: number}[]): SVGPathElement{
    
    // Skalierung für die X- und Y-Koordinaten basierend auf `i` und `real`-Werten
    const width = dftSvgWidth
    const height = dftSvgHeight
    const xScale = width / (points.length - 1); // Breite durch Anzahl der Punkte
    const yMin = Math.min(...points.map(p => p.value));
    const yMax = Math.max(...points.map(p => p.value));
    const yScale = height / (yMax - yMin);

    // Erzeuge die "d"-Attribute für das <path>-Element
    let pathData = `M 0 ${height - (points[0].value - yMin) * yScale}`;
    for (let j = 1; j < points.length; j++) {
        const x = j * xScale;
        const y = height - (points[j].value - yMin) * yScale;
        pathData += ` L ${x} ${y}`;
    }
    

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("id", "extrapolatedCurve")
    path.setAttribute("d", pathData);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "blue");
    path.setAttribute("stroke-width", "2");
    return (path);
}

function updateHeadline(){
    headline.innerHTML = headline.innerHTML = `Sonification of the Mandelbrot-set at iteration-depth ${mandelbrotOutline.iterationDepth}`
}