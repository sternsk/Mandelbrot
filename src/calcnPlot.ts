
import { canvas, xMax, xMin, yMax, yMin, iterationDepth} from "src";

export class Mandelbrot{
    ctx = canvas.getContext("2d");
    width = canvas.width;
    height = canvas.height;
   
    boundaryPoints: {x:number, y: number}[]  = []

    // Skalierungsfunktionen von Canvas-Koordinaten auf komplexe Zahlenebene
    scaleX(x: number) { return xMin + (x / this.width) * (xMax - xMin); }
    scaleY(y: number) { return yMin + (y / this.height) * (yMax - yMin); }

    // Mandelbrot-Iteration
    mandelbrot(viewPortCoordinate: {x: number, y: number}) {
        const c = {real: this.scaleX(viewPortCoordinate.x), imag: this.scaleY(viewPortCoordinate.y)}
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
        this.boundaryPoints = [];

        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                const c = { x: x, y: y };
                const borderPoint = this.mandelbrot(c);

                // Nur Punkte, die genau nach der Iterationstiefe die Grenze überschreiten, werden aufgenommen
                if(borderPoint)
                    this.boundaryPoints.push(borderPoint)
            }
        }

        // Punkte auf der Canvas zeichnen
        if(this.ctx){
            this.ctx.fillStyle = "white"
            this.ctx.fillRect(0,0,canvas.width, canvas.height)
            
            this.ctx.fillStyle = "blue";
                this.boundaryPoints.forEach(point => {
                    this.ctx!.fillRect(point.x, point.y, 1, 1);
                });
        }
    }
    
}    