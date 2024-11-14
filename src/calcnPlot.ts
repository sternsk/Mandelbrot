import { overviewSvg, xMax, xMin, yMax, yMin, iterationDepth, svgWidth, svgHeight} from "src";

export class Mandelbrot{
    
    width:number = overviewSvg.getBBox().width;
    height:number = overviewSvg.getBBox().height;
   
    boundaryPoints: {real:number, imag: number}[]  = []

    // Skalierungsfunktionen von Canvas-Koordinaten auf komplexe Zahlenebene
    scaleX(x: number) { return xMin + (x / this.width) * (xMax - xMin); }
    scaleY(y: number) { return yMin + (y / this.height) * (yMax - yMin); }

    // Mandelbrot-Iteration
    mandelbrot(viewPortCoordinate: {real: number, imag: number}) {
        //const c = {real: this.scaleX(viewPortCoordinate.x), imag: this.scaleY(viewPortCoordinate.y)}
        const c = viewPortCoordinate
        let z = { real: 0, imag: 0 };
        let iterations = 0;
        
        while (iterations < iterationDepth && ( z.real * z.real + z.imag * z.imag <= 4)) {
            let realTemp = z.real * z.real - z.imag * z.imag + c.real;
            z.imag = 2 * z.real * z.imag + c.imag;
            z.real = realTemp;
            iterations++;
            if (iterations == iterationDepth && z.real * z.real + z.imag * z.imag > 3.5 && z.real * z.real + z.imag * z.imag <= 4.5){
                return viewPortCoordinate
            }
        }
    }

    // Grenzlinie berechnen und plotten
    drawCloud() {
        /*
        // Selektiere alle Elemente mit der Klasse "cloudDot"
        const cloudDots = document.querySelectorAll('cloudDot');
        // Iteriere über die NodeList und entferne jedes Element
        cloudDots.forEach(dot => dot.remove());
*/
        this.boundaryPoints = [];
        const sampleWidth = (xMax - xMin)/svgWidth
        const sampleHeight = (yMax - yMin)/svgHeight
        for (let x = xMin; x < xMax; x += sampleWidth) {
            
            for (let y = yMin; y < yMax; y += sampleHeight) {
                
                const c = { real: x, imag: y };
                const borderPoint = this.mandelbrot(c);

                // Nur Punkte, die genau nach der Iterationstiefe die Grenze überschreiten, werden aufgenommen
                if(borderPoint)
                    this.boundaryPoints.push(borderPoint)
                
            }
        }
        
        //reference object to insert the dots before
        const outlinePath = document.getElementById("outlinePath")
        
        const oldCloudPath = document.getElementById("cloudPath")
        oldCloudPath?.parentNode?.removeChild(oldCloudPath)
        
        const cloudPath = document.createElementNS("http://www.w3.org/2000/svg", "path")
        cloudPath.setAttribute("fill", "none")
        cloudPath.setAttribute("stroke", "darkblue")
        cloudPath.setAttribute("stroke-width", `${sampleHeight}`)
        cloudPath.setAttribute("id", "cloudPath")
        //cloudPath.setAttribute("vector-effect", `non-scaling-stroke`)
        overviewSvg.insertBefore(cloudPath, outlinePath)
        
    
        let pathData = `M${this.boundaryPoints[0].real} ${this.boundaryPoints[0].imag} v${sampleWidth}`
        
        for(let i = 1; i<this.boundaryPoints.length; i++){
            pathData += `M ${this.boundaryPoints[i].real}${this.boundaryPoints[i].imag} v${sampleWidth}`
        }
    
        cloudPath.setAttribute("d", `${pathData}`)
        
/*      //example for a cloud out of circle Elements
        this.boundaryPoints.forEach(point => {
            
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
            circle.setAttribute("cx", `${point.real}`)
            circle.setAttribute("cy", `${point.imag}`)
            circle.setAttribute("r", `${sampleWidth}`)
            circle.setAttribute("fill", "lightgrey")
            circle.setAttribute("class", "cloudDot")


            svg.insertBefore(circle, outlinePath[0]);
        });
*/
    }
    
}    