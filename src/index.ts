
console.log("ver 2104")

import { boundaryPoints, calcMandelbrotOutline } from "./calcMandelbrotOutline.js";
import { Mandelbrot } from "./calcnPlot.js";
import { extrapolateReal, extrapolateImag, extrapolate } from "./extrapolate.js";
import { createOscillatorFromWaveform, stopSound, oscillator} from "./library.js";


const wrapper = document.getElementById("wrapper")

export const overviewSvgWidth =480
export const overviewSvgHeight = 420
let width = 2.5
let height = width
export let iterationDepth = 4;  // Iterationstiefe
export let xMin = -2, xMax = xMin + width
export let yMin = -1.2, yMax = yMin + height

const headline: HTMLHeadElement = document.createElement("h1")
headline.innerHTML = `View and oszillate the mandelbrot at depth: ${iterationDepth}`

export const overviewSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
overviewSvg.setAttribute("id", "mandelbrotSvg")
overviewSvg.setAttribute("viewBox", `${xMin} ${yMin} ${width} ${height}`)
overviewSvg.setAttribute("width", `${overviewSvgWidth}px`)
overviewSvg.setAttribute("height", `${overviewSvgHeight}px`)

export const spectraSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
spectraSvg.setAttribute("id", "spectraSvg")
spectraSvg.setAttribute("viewBox", `${xMin} ${yMin} ${width} ${height}`)
spectraSvg.setAttribute("width", `${overviewSvgWidth}px`)
spectraSvg.setAttribute("height", `${overviewSvgHeight}px`)
// if(document.documentElement.clientWidth < 1004){
//     spectraSvg.style.display = "none"
// }else{
// spectraSvg.style.display = "block" // setting display somehow ruins the default layout
// spectraSvg.style.position = "static"
// }

window.addEventListener("resize", () =>{
    if (document.documentElement.clientWidth < 1004){
        spectraSvg.style.display = "none"
    } 
})


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

const xDataSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
const xDataSvgWidth = 200
const xDataSvgHeight = 100
xDataSvg.style.marginLeft = "5px"
xDataSvg.setAttribute("id", "xDataSvg")
xDataSvg.setAttribute("width", `${xDataSvgWidth}`)
xDataSvg.setAttribute("height", `${xDataSvgHeight}`)
/*xDataSvg.style.position = "absolute"
xDataSvg.style.x = "800px"
xDataSvg.style.top = "400px"
*/
const yDataSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
const yDataSvgWidth = 200
const yDataSvgHeight = 100
yDataSvg.style.marginLeft = "5px"
yDataSvg.setAttribute("id", "yDataSvg")
yDataSvg.setAttribute("width", `${yDataSvgWidth}`)
yDataSvg.setAttribute("height", `${yDataSvgHeight}`)

const outlinePath = document.createElementNS("http://www.w3.org/2000/svg", "path")
overviewSvg.appendChild(outlinePath)

const iterationsSliderLabel = document.createElement("label")
iterationsSliderLabel.setAttribute("for", "iterationsSlider")
iterationsSliderLabel.innerHTML = "iterations: "
const iterationsSlider = document.createElement("input")
iterationsSlider.id = "iterationsSlider"
iterationsSlider.type = "range"
iterationsSlider.min = "2"
iterationsSlider.max = "15"
iterationsSlider.step = "1"
iterationsSlider.value = `${iterationDepth}`

const xMinSliderLabel = document.createElement("label")
xMinSliderLabel.setAttribute("for", "xMinSlider")
xMinSliderLabel.innerHTML = "x-move:"
const xMinSlider = document.createElement("input")
xMinSlider.id = "xMinSlider"
xMinSlider.type = "range"
xMinSlider.min = "-6"
xMinSlider.max = "2.0"
xMinSlider.step = ".1"
xMinSlider.value = `${xMin}`

const yMinSliderLabel = document.createElement("label")
yMinSliderLabel.setAttribute("for", "yMinSlider")
yMinSliderLabel.innerHTML = "y-move:"
const yMinSlider = document.createElement("input")
yMinSlider.id = "yMinslider"
yMinSlider.type = "range"
yMinSlider.min ="-6"
yMinSlider.max = "2"
yMinSlider.step = ".1"
yMinSlider.value = `${yMin}`

const zoomSliderLabel = document.createElement("label")
zoomSliderLabel.setAttribute("for", "zoomSlider")
zoomSliderLabel.innerHTML = "zoom: "
const zoomSlider = document.createElement("input")
zoomSlider.id = "zoomSlider"
zoomSlider.type = "range"
zoomSlider.min = ".1"
zoomSlider.max = "4"
zoomSlider.step = ".1"
zoomSlider.value = `${width}`



const oscillateButton = document.createElement("button")
oscillateButton.innerHTML = "oscillate boundary points"
oscillateButton.style.width = "200px"
let isPlaying = false
oscillateButton.addEventListener("click", ()=>{
    if(!isPlaying){
        createOscillatorFromWaveform(boundaryPoints)
        oscillateButton.textContent = "stop sound"
    }
    if(isPlaying){
        stopSound()
        oscillateButton.textContent = "oscillate boundary points"
    }
    isPlaying = !isPlaying

})

const frequencySliderLabel = document.createElement("label")
frequencySliderLabel.setAttribute("for", "frequencySlider")
frequencySliderLabel.innerHTML = " frequency: "
export const frequencySlider = document.createElement("input")
frequencySlider.id = "frequencySlider"
frequencySlider.type = "range"
frequencySlider.min = "1"
frequencySlider.max = "440"
frequencySlider.value = "1"

frequencySlider.addEventListener("input", (event) => {
    const frequency = (event.target as HTMLInputElement).valueAsNumber;
    if(oscillator)
        oscillator.frequency.value = frequency; // Ändert die Frequenz in Echtzeit
  });


soundControlsContainer.appendChild(oscillateButton)
soundControlsContainer.appendChild(frequencySliderLabel)
soundControlsContainer.appendChild(frequencySlider)

viewControlsContainer.appendChild(iterationsSliderLabel)
viewControlsContainer.appendChild(iterationsSlider)
viewControlsContainer.appendChild(iterationsSlider)
viewControlsContainer.appendChild(xMinSliderLabel)
viewControlsContainer.appendChild(xMinSlider)
viewControlsContainer.appendChild(yMinSliderLabel)
viewControlsContainer.appendChild(yMinSlider)
viewControlsContainer.appendChild(zoomSliderLabel)
viewControlsContainer.appendChild(zoomSlider)

viewElementsContainer.appendChild(overviewSvg)
viewElementsContainer.appendChild(spectraSvg)
viewElementsContainer.appendChild(xDataSvg)
viewElementsContainer.appendChild(yDataSvg)

// calc and plot MandelbrotOutline
calcMandelbrotOutline()
drawLines()

let xDataLine = drawExtrapolatedCurve(extrapolate(boundaryPoints, "real"))
let yDataLine = drawExtrapolatedCurve(extrapolate(boundaryPoints, "imag"))

xDataSvg.appendChild(xDataLine)
yDataSvg.appendChild(yDataLine)

wrapper?.appendChild(headline)
wrapper?.appendChild(soundControlsContainer)
wrapper?.appendChild(viewControlsContainer)
wrapper?.appendChild(viewElementsContainer)

// Draw a Mandelbrot cloud for reference
const mandelbrot = new Mandelbrot();
window.onload = () =>{
    
    mandelbrot.drawCloud();
    
}

iterationsSlider.addEventListener("input", function(event){
    iterationDepth = parseInt(iterationsSlider.value)
    headline.innerHTML = `Mandelbrot-Grenzlinie bei Iterationstiefe i = ${iterationDepth}`
    mandelbrot.drawCloud()
    calcMandelbrotOutline()
    if(isPlaying) createOscillatorFromWaveform(boundaryPoints)
    drawLines()

    xDataLine = drawExtrapolatedCurve(extrapolate(boundaryPoints, "real"))
    xDataSvg.innerHTML = ""
    xDataSvg.appendChild(xDataLine)
    
    yDataLine = drawExtrapolatedCurve(extrapolate(boundaryPoints, "imag"))
    yDataSvg.innerHTML = ""
    yDataSvg.appendChild(yDataLine)
})

xMinSlider.addEventListener("input", function(){
    xMin = parseFloat(xMinSlider.value)
    xMax = xMin + width
    overviewSvg.setAttribute("viewBox", `${xMin} ${yMin} ${width} ${height}`)
})

yMinSlider.addEventListener("input", function(){
    yMin = parseFloat(yMinSlider.value)
    yMax = yMin + height
    overviewSvg.setAttribute("viewBox", `${xMin} ${yMin} ${width} ${height}`)
})

zoomSlider.addEventListener("input", function(){
    const oldWidth = width
    const oldHeight = height
    width = parseFloat(zoomSlider.value)
    height = width
    xMin -= (width - oldWidth )/2
    xMax = xMin + width
    
    yMin -=(height - oldHeight)/2
    yMax = yMin + height

    overviewSvg.setAttribute("viewBox", `${xMin} ${yMin} ${width} ${height}`)
    xMinSlider.step = (parseFloat(zoomSlider.value)/40).toString()
    yMinSlider.step = (parseFloat(zoomSlider.value)/40).toString()
    zoomSlider.step = zoomSlider.min
})

zoomSlider.addEventListener("mouseup", () =>{
    mandelbrot.drawCloud()
    const sliderMinAttribute =zoomSlider.getAttribute("min")
    let minValue
    if (sliderMinAttribute){
        minValue = parseFloat(sliderMinAttribute)
        zoomSlider.min = `${minValue/10}`
        
    }
})

overviewSvg.addEventListener("mouseleave", () => {
    mousedown = false
})

let xOffset: number
let yOffset: number
let mousedown = false
overviewSvg.addEventListener("mousedown", (event) =>{
    mousedown = true
    const coords = getSvgCoords(event);
    xOffset = coords.x;
    yOffset = coords.y;
})

overviewSvg.addEventListener("mousemove", (event) =>{
    if(!mousedown)
        return
    const coords = getSvgCoords(event);
    xMin += xOffset - coords.x
    yMin += yOffset - coords.y
    overviewSvg.setAttribute("viewBox", `${xMin} ${yMin} ${width} ${height}`)
    
})
overviewSvg.addEventListener("mouseup", ()=>{
    mousedown = false
    mandelbrot.drawCloud()
    drawLines()
})

overviewSvg.addEventListener("wheel", (event) =>{
    
    const oldWidth = width
    const oldHeight = height
    width += width * 10 / event.deltaY 
    height = width
    
    xMin -= (width - oldWidth )/2
    xMax = xMin + width
    yMin -=(height - oldHeight)/2
    yMax = yMin + height

    overviewSvg.setAttribute("viewBox", `${xMin} ${yMin} ${width} ${height}`)
    
})
spectraSvg.addEventListener("mousedown", (event) =>{
    mousedown = true
    const coords = getSpectraCoords(event);
    xOffset = coords.x;
    yOffset = coords.y;
})
spectraSvg.addEventListener("mousemove", (event) =>{
    if(!mousedown)
        return
    const coords = getSpectraCoords(event);
    xMin += xOffset - coords.x
    yMin += yOffset - coords.y
    spectraSvg.setAttribute("viewBox", `${xMin} ${yMin} ${width} ${height}`)
})
spectraSvg.addEventListener("mouseup", ()=>{
    mousedown = false
    
})

spectraSvg.addEventListener("wheel", (event) =>{
    
    const oldWidth = width
    const oldHeight = height
    width += width * 10 / event.deltaY 
    height = width
    
    xMin -= (width - oldWidth )/2
    xMax = xMin + width
    yMin -=(height - oldHeight)/2
    yMax = yMin + height

    spectraSvg.setAttribute("viewBox", `${xMin} ${yMin} ${width} ${height}`)
    
})
// Helper to get SVG coordinates
function getSvgCoords(event: MouseEvent) {
    const point = overviewSvg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const svgCoords = point.matrixTransform(overviewSvg.getScreenCTM()!.inverse());
    return svgCoords;
}

function getSpectraCoords(event: MouseEvent) {
    const point = spectraSvg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const svgCoords = point.matrixTransform(spectraSvg.getScreenCTM()!.inverse());
    return svgCoords;
}

function mapToCanvas(point: {real: number, imag: number}): {x: number, y: number}{
    const x = ((point.real - xMin) / (xMax - xMin)) * overviewSvgWidth; // Bereich real -2 bis 2 auf 0 bis canvasWidth skalieren
    const y =   ((point.imag - yMin) / (yMax - yMin)) * overviewSvgHeight; // Bereich imag -2 bis 2 auf 0 bis canvasHeight skalieren (invertiert für Canvas-Koordinaten)
    return { x, y };
}

function drawLines(){
    if(boundaryPoints.length < 2){
        console.warn("Not enough points to draw lines")
        return;
    }
    outlinePath.innerHTML = ""
    let pathData = `M${boundaryPoints[0].real} ${boundaryPoints[0].imag}`
    for(let i = 1; i<boundaryPoints.length; i++){
        pathData += `L ${boundaryPoints[i].real} ${boundaryPoints[i].imag}`
    }
    outlinePath.setAttribute("id", "outlinePath")
    outlinePath.setAttribute("fill", "none")
    outlinePath.setAttribute("stroke", "black")
    outlinePath.setAttribute("stroke-width", ".5 px")
    outlinePath.setAttribute("vector-effect", "non-scaling-stroke")
    outlinePath.setAttribute("d", `${pathData}`)
}

function drawExtrapolatedCurve(points: {index: number, value: number}[]): SVGPathElement{
    
    // Skalierung für die X- und Y-Koordinaten basierend auf `i` und `real`-Werten
    const width = xDataSvgWidth
    const height = xDataSvgHeight
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

function drawExtrapolatedCurveForImagValues(points: {i: number, imag: number}[]){
    
    // Skalierung für die X- und Y-Koordinaten basierend auf `i` und `real`-Werten
    const width = xDataSvgWidth
    const height = xDataSvgHeight
    const xScale = width / (points.length - 1); // Breite durch Anzahl der Punkte
    const yMin = Math.min(...points.map(p => p.imag));
    const yMax = Math.max(...points.map(p => p.imag));
    const yScale = height / (yMax - yMin);

    // Erzeuge die "d"-Attribute für das <path>-Element
    let pathData = `M 0 ${height - (points[0].imag - yMin) * yScale}`;
    for (let j = 1; j < points.length; j++) {
        const x = j * xScale;
        const y = height - (points[j].imag - yMin) * yScale;
        pathData += ` L ${x} ${y}`;
    }
    const oldPath = document.getElementById("extrapolatedImagCurve")
    oldPath?.parentNode?.removeChild(oldPath)

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("id", "extrapolatedImagCurve")
    path.setAttribute("d", pathData);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "blue");
    path.setAttribute("stroke-width", "2");
    yDataSvg.appendChild(path);
}