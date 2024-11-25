import { Complex, add, scale, rotate } from "./library"

export class MandelbrotOutline{

private _iterationDepth: number
boundaryPoints: {real: number, imag:number}[] = []

constructor(iterationDepth: number){
    this._iterationDepth = iterationDepth
}

set iterationDepth(n: number){
    this._iterationDepth = n
}

get iterationDepth(): number{
    return this._iterationDepth
}

async calcMandelbrotOutline(): Promise<Complex[]>{
    
    const begin = Date.now()
    let duration: number

    this.boundaryPoints=[]
    
    // start from the well known left tip of the mandelbrot-set
    const startPoint = {real: -2, imag:0}
    
    //step slightly out of the mandelbrotset at samplingRate/2 step
    let directionVector = {real: -1, imag: 0}
    const sampleLength = .1/Math.pow(this.iterationDepth,3)
    const sampleAngle = Math.PI/8
    let actualPoint = add(startPoint, scale(directionVector, sampleLength/2))
    
    console.log("sampleLength: "+sampleLength+" at iterationDepth: "+this.iterationDepth)
    
    this.boundaryPoints.push(actualPoint)
    
    // then move upwards from here on
    directionVector = {real: 0, imag: 1}

    //move around half a time
    while (actualPoint.imag >= 0){
    
        // test if actualPoint + directionVector/2 is inside the Mandelbrot
        // if(mandelbrot(add(actualPoint, scale(directionVector, sampleLength/2)))){
        //     // adjust by rotating the directionvector away from the set
        //     directionVector = rotate(directionVector, sampleAngle)
        // }
        // cover the case, where we pierce into the set
        if(this.mandelbrot(add(actualPoint, scale(directionVector, sampleLength)))){
            directionVector = rotate(directionVector, .5 * sampleAngle)
                
            while (this.mandelbrot(add(actualPoint, scale(directionVector, sampleLength)))){
           
                // adjust by rotating the directionvector away from the set
                directionVector = rotate(directionVector, .5 * sampleAngle)
                    
            }
            const endpoint = add(actualPoint, scale(directionVector, sampleLength))
            actualPoint = endpoint
            
            this.boundaryPoints.push(actualPoint)
            
        }
        
    
        // cover the case, where we do not pierce into the set
        if(!this.mandelbrot(add(actualPoint, scale(directionVector, sampleLength)))){
        // test if actualPoint + directionVector/2 is inside the Mandelbrot
            if(this.mandelbrot(add(actualPoint, scale(directionVector, sampleLength/2)))){
                // adjust by rotating the directionvector away from the set
                console.log("actualPoint + directionVector is not, but actualPoint + directionVector/2 is inside the Mandelbrot")
                directionVector = rotate(directionVector, 2*sampleAngle)
            }
            while(!this.mandelbrot(add(actualPoint, scale(directionVector, sampleLength))))    {
                
                //rotate the other way around towards the set
                directionVector = rotate(directionVector, -.5*sampleAngle)
            }
            // then rotate away from the set to get out of the set again
            directionVector = rotate(directionVector, .5*sampleAngle)

            const endpoint = add(actualPoint, scale(directionVector, sampleLength))

            actualPoint = endpoint
            this.boundaryPoints.push(actualPoint)
            
        }
    
    }
        
    console.log("boundaryPoints.length: "+this.boundaryPoints.length)
    duration = Date.now() - begin
    console.log(`sampling duration: ${duration} ms`)

    return this.boundaryPoints
}




mandelbrot(c: {real: number, imag: number}): boolean{
    let z = { real: c.real, imag: c.imag };
    let iterations = 0;
    while((iterations < this.iterationDepth) && (z.real * z.real + z.imag * z.imag) <= 4){
        let realTemp  = z.real * z.real - z.imag * z.imag + c.real
        z.imag = 2 * z.real * z.imag + c.imag
        z.real = realTemp
        
        iterations ++
        if(iterations == this.iterationDepth){
            return true
        }
        
    }
    return false
}
}
/*
                setTimeout in Schleifen:

setTimeout führt den angegebenen Callback asynchron aus. Dadurch wird der Inhalt von setTimeout nicht blockierend ausgeführt, sondern in die Warteschlange (Event Loop) gestellt. Das kann zu unerwartetem Verhalten führen, insbesondere wenn die Schleife schnell durchläuft.
Da die Schleife nicht wartet, bis der setTimeout-Callback ausgeführt wurde, können Werte von Variablen wie directionVector oder actualPoint zwischenzeitlich weiter verändert werden, was zu falschen Ergebnissen führen kann.
         */