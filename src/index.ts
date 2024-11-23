
console.log("ver 2219")

import { calcMandelbrotOutline, mirrorX} from "./calcMandelbrotOutline.js";
import { Complex, dft, idft, createOscillatorFromWaveform, stopSound, oscillator} from "./library.js";

const wrapper = document.getElementById("wrapper")

export const overviewSvgWidth =480
export const overviewSvgHeight = 420
const dftSvgWidth = 480
const dftSvgHeight = 420

let width = 2.5
let height = width
export let iterationDepth = 4;  // Iterationstiefe
export let xMin = -2, xMax = xMin + width
export let yMin = -1.2, yMax = yMin + height
export let animationRequest = true

let samplePoints: Complex[] = []
let sampleCurvePath = document.createElementNS("http://www.w3.org/2000/svg", "path")
let dftPoints: Complex[] = []
let dftPath = document.createElementNS("http://www.w3.org/2000/svg", "path") 
let idftPoints: Complex[] = []
let idftPath = document.createElementNS("http://www.w3.org/2000/svg", "path")
let inversionAccuracy = 169

const headline: HTMLHeadElement = document.createElement("h1")
updateHeadline()

// there is the constructed mandelbrot line in the left window
export const sampleCurveSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
sampleCurveSvg.setAttribute("id", "sampleCurveSvg")
sampleCurveSvg.setAttribute("viewBox", `${xMin} ${yMin} ${width} ${height}`)
sampleCurveSvg.setAttribute("width", `${overviewSvgWidth}px`)
sampleCurveSvg.setAttribute("height", `${overviewSvgHeight}px`)

// and there is the place where the transformed sampleCurve is plotted
const dftSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
dftSvg.setAttribute("id", "dftSvg")
dftSvg.setAttribute("width", `${dftSvgWidth}`)
dftSvg.setAttribute("height", `${dftSvgHeight}`)
dftSvg.setAttribute("viewBox", "-1 -1 2 2")

// there is the reconstructed Fourier-analysed curve in the right window (Inverse Discrete Fourier-Transformation)
export const idftSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
idftSvg.setAttribute("id", "IDFTSvg")
idftSvg.setAttribute("viewBox", `${xMin} ${yMin} ${width} 4`)
idftSvg.setAttribute("width", `${overviewSvgWidth}px`)
idftSvg.setAttribute("height", `${overviewSvgHeight}px`)

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


samplePoints = calcMandelbrotOutline()

sampleCurvePath = drawLines(mirrorX(samplePoints))
sampleCurveSvg.appendChild(sampleCurvePath)

dftPoints = dft(samplePoints)
dftPath = drawLines(dftPoints)
dftSvg.appendChild(dftPath)

idftPoints = idft(dftPoints, inversionAccuracy)
idftPath = drawLines(idftPoints)
idftSvg.appendChild(idftPath)

// control-element for the iteration-depth
const iterationDepthSliderLabel = document.createElement("label")
iterationDepthSliderLabel.setAttribute("for", "iterationsSlider")
iterationDepthSliderLabel.innerHTML = "iterations: "
const iterationDepthSlider = document.createElement("input")
iterationDepthSlider.id = "iterationsSlider"
iterationDepthSlider.type = "range"
iterationDepthSlider.min = "2"
iterationDepthSlider.max = "14"
iterationDepthSlider.step = "1"
iterationDepthSlider.value = `${iterationDepth}`

// control-Element for the amount of samples used for the inverse Fourier-Transformation
const inversionAccuracySliderLabel = document.createElement("label")
inversionAccuracySliderLabel.setAttribute("for", "inversionAmountSlider")
inversionAccuracySliderLabel.innerHTML = "reversion accuracy: "
const inversionAccuracySlider = document.createElement("input")
inversionAccuracySlider.id = "sampleAmountSlider"
inversionAccuracySlider.type = "range"
inversionAccuracySlider.min = "1"
inversionAccuracySlider.max = `${samplePoints.length}`
inversionAccuracySlider.step = "1"
inversionAccuracySlider.value = `${inversionAccuracy}`

viewControlsContainer.appendChild(iterationDepthSliderLabel)
viewControlsContainer.appendChild(iterationDepthSlider)
viewControlsContainer.appendChild(inversionAccuracySliderLabel)
viewControlsContainer.appendChild(inversionAccuracySlider)

viewElementsContainer.appendChild(sampleCurveSvg)
viewElementsContainer.appendChild(dftSvg)
viewElementsContainer.appendChild(idftSvg)

wrapper?.appendChild(headline)
wrapper?.appendChild(soundControlsContainer)
wrapper?.appendChild(viewControlsContainer)
wrapper?.appendChild(viewElementsContainer)

iterationDepthSlider.addEventListener("input", function(event){
    iterationDepth = parseInt(iterationDepthSlider.value)
    updateHeadline()

    samplePoints = calcMandelbrotOutline()
    sampleCurvePath = drawLines(mirrorX(samplePoints))
    sampleCurveSvg.innerHTML = ""
    sampleCurveSvg.appendChild(sampleCurvePath)

    inversionAccuracySlider.max = samplePoints.length.toString()

    dftPoints = dft(samplePoints)
    dftSvg.innerHTML = ""
    dftSvg.appendChild(drawLines(dftPoints))

    idftSvg.innerHTML = ""
    idftSvg.appendChild(drawDots(idft(dftPoints, inversionAccuracy)))
})

inversionAccuracySlider.addEventListener("input", function(){
    inversionAccuracy = parseFloat(inversionAccuracySlider.value)
    updateHeadline()

    idftPath = drawDots(idft(dftPoints, inversionAccuracy))
    idftSvg.innerHTML = ""
    idftSvg.appendChild(idftPath)
    
})

sampleCurveSvg.addEventListener("mouseleave", () => {
    mousedown = false
})

let xOffset: number
let yOffset: number
let mousedown = false
sampleCurveSvg.addEventListener("mousedown", (event) =>{
    mousedown = true
    const coords = getSvgCoords(sampleCurveSvg, event);
    xOffset = coords.x;
    yOffset = coords.y;
})

sampleCurveSvg.addEventListener("mousemove", (event) =>{
    if(!mousedown)
        return
    const coords = getSvgCoords(sampleCurveSvg, event);
    xMin += xOffset - coords.x
    yMin += yOffset - coords.y
    sampleCurveSvg.setAttribute("viewBox", `${xMin} ${yMin} ${width} ${height}`)
    
})
sampleCurveSvg.addEventListener("mouseup", ()=>{
    mousedown = false
    drawLines(samplePoints)
})

sampleCurveSvg.addEventListener("wheel", (event) =>{
    
    let deltaY = event.deltaY
    const clientWidth = sampleCurveSvg.getBoundingClientRect().width
    const mouseX = event.x - sampleCurveSvg.getBoundingClientRect().x
    const clientHeight = sampleCurveSvg.getBoundingClientRect().height
    const mouseY = event.y - sampleCurveSvg.getBoundingClientRect().y

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

    sampleCurveSvg.setAttribute("viewBox", `${xMin} ${yMin} ${width} ${height}`)
    
})
idftSvg.addEventListener("mousedown", (event) =>{
    mousedown = true
    const coords = getSvgCoords(idftSvg, event);
    xOffset = coords.x;
    yOffset = coords.y;
})
idftSvg.addEventListener("mousemove", (event) =>{
    if(!mousedown)
        return
    const coords = getSvgCoords(idftSvg, event);
    xMin += xOffset - coords.x
    yMin += yOffset - coords.y
    idftSvg.setAttribute("viewBox", `${xMin} ${yMin} ${width} ${height}`)
})
idftSvg.addEventListener("mouseup", ()=>{
    mousedown = false
    
})
idftSvg.addEventListener("wheel", (event) =>{
    const clientWidth = idftSvg.getBoundingClientRect().width
    const mouseX = event.x - idftSvg.getBoundingClientRect().x
    const clientHeight = idftSvg.getBoundingClientRect().height
    const mouseY = event.y - idftSvg.getBoundingClientRect().y

    // differentiate between mousewheel and touchpad
    let deltaY = event.deltaY
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
    
    xMin -= (width - oldWidth ) * mouseX / clientWidth
    xMax = xMin + width
    yMin -=(height - oldHeight) * mouseY / clientHeight
    yMax = yMin + height

    idftSvg.setAttribute("viewBox", `${xMin} ${yMin} ${width} ${height}`)
    
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
    xMin += xOffset - coords.x
    yMin += yOffset - coords.y
    dftSvg.setAttribute("viewBox", `${xMin} ${yMin} ${width} ${height}`)
})
dftSvg.addEventListener("mouseup", ()=>{
    mousedown = false
    
})
dftSvg.addEventListener("wheel", (event) =>{
    const clientWidth = dftSvg.getBoundingClientRect().width
    const mouseX = event.x - dftSvg.getBoundingClientRect().x
    const clientHeight = dftSvg.getBoundingClientRect().height
    const mouseY = event.y - dftSvg.getBoundingClientRect().y

    // differentiate between mousewheel and touchpad
    let deltaY = event.deltaY
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
    
    xMin -= (width - oldWidth ) * mouseX / clientWidth
    xMax = xMin + width
    yMin -=(height - oldHeight) * mouseY / clientHeight
    yMax = yMin + height

    dftSvg.setAttribute("viewBox", `${xMin} ${yMin} ${width} ${height}`)
    
})
// Helper to get SVG coordinates
function getSvgCoords(svgElement: SVGSVGElement, event: MouseEvent) {
    const point = svgElement.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const svgCoords = point.matrixTransform(svgElement.getScreenCTM()!.inverse());
    return svgCoords;
}


function drawLines(samplePoints: Complex[]): SVGPathElement {
    const sampleCurvePath = document.createElementNS("http://www.w3.org/2000/svg", "path")

    if(samplePoints.length < 2){
        console.warn("Not enough points to draw lines")
        return sampleCurvePath
    }
    
    let pathData = `M${samplePoints[0].real} ${samplePoints[0].imag}`
    for(let i = 1; i<samplePoints.length; i++){
        pathData += `L ${samplePoints[i].real} ${samplePoints[i].imag}`
    }
    
    sampleCurvePath.setAttribute("id", "outlinePath")
    sampleCurvePath.setAttribute("fill", "none")
    sampleCurvePath.setAttribute("stroke", "black")
    sampleCurvePath.setAttribute("stroke-width", ".5 px")
    sampleCurvePath.setAttribute("vector-effect", "non-scaling-stroke")
    sampleCurvePath.setAttribute("d", `${pathData}`)

    return sampleCurvePath
}
function drawDots(samplePoints: Complex[]): SVGPathElement {
    const sampleCurvePath = document.createElementNS("http://www.w3.org/2000/svg", "path")

    if(samplePoints.length < 2){
        console.warn("Not enough points to draw lines")
        return sampleCurvePath
    }
    
    let pathData = ""
    for(let i = 1; i<samplePoints.length; i++){
        pathData += ` M ${samplePoints[i].real} ${samplePoints[i].imag} v .01`
    }
    sampleCurvePath.setAttribute("id", "outlinePath")
    sampleCurvePath.setAttribute("fill", "none")
    sampleCurvePath.setAttribute("stroke", "black")
    sampleCurvePath.setAttribute("stroke-width", ".5 px")
    sampleCurvePath.setAttribute("vector-effect", "non-scaling-stroke")
    sampleCurvePath.setAttribute("d", `${pathData}`)

    return sampleCurvePath
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
    headline.innerHTML = headline.innerHTML = `Mandelbrot-outline at depth: ${iterationDepth} is transformed by discrete-Fourier-transformation and transformed back the first ${inversionAccuracy} elements of the transformed values`
}