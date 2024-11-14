
import { boundaryPoints, calcMandelbrotOutline } from "./calcMandelbrotOutline.js";
import { Mandelbrot } from "./calcnPlot.js";

const wrapper = document.getElementById("wrapper")
export const svgWidth = 600
export const svgHeight = 480
let width = 2.5
let height = width
export let iterationDepth = 5;  // Iterationstiefe
export let xMin = -2, xMax = xMin + width
export let yMin = -1.2, yMax = yMin + height

const headline: HTMLHeadElement = document.createElement("h1")
headline.innerHTML = `Mandelbrot-Grenzlinie bei Iterationstiefe i = ${iterationDepth}`

export const overviewSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
overviewSvg.setAttribute("id", "mandelbrotSvg")
overviewSvg.setAttribute("viewBox", `${xMin} ${yMin} ${width} ${height}`)
overviewSvg.setAttribute("width", `${svgWidth}px`)
overviewSvg.setAttribute("height", `${svgHeight}px`)

const outlinePath = document.createElementNS("http://www.w3.org/2000/svg", "path")
overviewSvg.appendChild(outlinePath)

const iterationsSliderLabel = document.createElement("label")
iterationsSliderLabel.setAttribute("for", "iterationsSlider")
iterationsSliderLabel.innerHTML = "iterations: "
const iterationsSlider = document.createElement("input")
iterationsSlider.id = "iterationsSlider"
iterationsSlider.type = "range"
iterationsSlider.min = "2"
iterationsSlider.max = "13"
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

wrapper?.appendChild(headline)
wrapper?.appendChild(iterationsSliderLabel)
wrapper?.appendChild(iterationsSlider)
wrapper?.appendChild(xMinSliderLabel)
wrapper?.appendChild(xMinSlider)
wrapper?.appendChild(yMinSliderLabel)
wrapper?.appendChild(yMinSlider)
wrapper?.appendChild(zoomSliderLabel)
wrapper?.appendChild(zoomSlider)
wrapper?.appendChild(overviewSvg)


// calc and plot MandelbrotOutline
calcMandelbrotOutline()
drawLines()


// Draw a Mandelbrot cloud for reference
const mandelbrot = new Mandelbrot();
mandelbrot.drawCloud();

iterationsSlider.addEventListener("input", function(event){
    iterationDepth = parseInt(iterationsSlider.value)
    headline.innerHTML = `Mandelbrot-Grenzlinie bei Iterationstiefe i = ${iterationDepth}`
    mandelbrot.drawCloud()
    calcMandelbrotOutline()
    drawLines()
})

xMinSlider.addEventListener("input", function(){
    xMin = parseFloat(xMinSlider.value)
    xMax = xMin + width
    mandelbrot.drawCloud()
    drawLines()
})

yMinSlider.addEventListener("input", function(){
    yMin = parseFloat(yMinSlider.value)
    yMax = yMin + height
    mandelbrot.drawCloud()
    drawLines()
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
    mandelbrot.drawCloud()
    drawLines()
})

overviewSvg.addEventListener("mouseenter", () => {
    console.log("mouse entered");
})

function mapToCanvas(point: {real: number, imag: number}): {x: number, y: number}{
    const x = ((point.real - xMin) / (xMax - xMin)) * svgWidth; // Bereich real -2 bis 2 auf 0 bis canvasWidth skalieren
    const y =   ((point.imag - yMin) / (yMax - yMin)) * svgHeight; // Bereich imag -2 bis 2 auf 0 bis canvasHeight skalieren (invertiert für Canvas-Koordinaten)
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
