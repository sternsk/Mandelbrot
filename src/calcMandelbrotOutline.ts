
import { Complex } from "./library"
import { iterationDepth } from "src"

let boundaryPoints: {real: number, imag:number}[] = []



export function calcMandelbrotOutline(): Complex[]{
    
    const begin = Date.now()
    let duration: number

    boundaryPoints=[]
    
    // start from the well known left tip of the mandelbrot-set
    const startPoint = {real: -2, imag:0}
    
    //step slightly out of the mandelbrotset at samplingRate/2 step
    let directionVector = {real: -1, imag: 0}
    const sampleLength = .1/Math.pow(iterationDepth,3)
    const sampleAngle = Math.PI/8
    let actualPoint = add(startPoint, scale(directionVector, sampleLength/2))
    
    console.log("sampleLength: "+sampleLength+" at iterationDepth: "+iterationDepth)
    
    boundaryPoints.push(actualPoint)
    
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
        if(mandelbrot(add(actualPoint, scale(directionVector, sampleLength)))){
            directionVector = rotate(directionVector, .5 * sampleAngle)
                
            while (mandelbrot(add(actualPoint, scale(directionVector, sampleLength)))){
           
                // adjust by rotating the directionvector away from the set
                directionVector = rotate(directionVector, .5 * sampleAngle)
                    
            }
            const endpoint = add(actualPoint, scale(directionVector, sampleLength))
            actualPoint = endpoint
            
            boundaryPoints.push(actualPoint)
            
        }
        
    
        // cover the case, where we do not pierce into the set
        if(!mandelbrot(add(actualPoint, scale(directionVector, sampleLength)))){
        // test if actualPoint + directionVector/2 is inside the Mandelbrot
            if(mandelbrot(add(actualPoint, scale(directionVector, sampleLength/2)))){
                // adjust by rotating the directionvector away from the set
                console.log("actualPoint + directionVector is not, but actualPoint + directionVector/2 is inside the Mandelbrot")
                directionVector = rotate(directionVector, 2*sampleAngle)
            }
            while(!mandelbrot(add(actualPoint, scale(directionVector, sampleLength))))    {
                
                //rotate the other way around towards the set
                directionVector = rotate(directionVector, -.5*sampleAngle)
            }
            // then rotate away from the set to get out of the set again
            directionVector = rotate(directionVector, .5*sampleAngle)

            const endpoint = add(actualPoint, scale(directionVector, sampleLength))

            actualPoint = endpoint
            boundaryPoints.push(actualPoint)
            
        }
    
    }
        
    console.log("boundaryPoints.length: "+boundaryPoints.length)
    duration = Date.now() - begin
    console.log(`sampling duration: ${duration} ms`)

    return boundaryPoints
}

export function mirrorX(samplePoints: Complex[]): Complex[]{
    const arrayLength = samplePoints.length
    const mirroredPoints = [...samplePoints]
        for ( let index = arrayLength - 2; index >= 0; index--){
            const reversedPoint = {real: samplePoints[index].real, imag: -samplePoints[index].imag}
            mirroredPoints.push(reversedPoint)
        }
        return mirroredPoints
}

function rotate(vector: {real: number, imag: number}, rotationAngle: number): {real: number, imag: number}{
    const originLength = Math.sqrt(Math.pow(vector.real,2)+ Math.pow(vector.imag,2))
    const originAngle = Math.atan2(vector.imag, vector.real)
    const destinationAngle = originAngle + rotationAngle
    const rotatedVector = scale({real: Math.cos(destinationAngle), imag: Math.sin(destinationAngle)}, originLength)
    return rotatedVector
}

function scale(vector: {real: number, imag: number}, amount: number): {real: number, imag: number}{
    return {real: vector.real * amount, imag: vector.imag * amount}
}

function add(v1: {real: number, imag: number}, v2: {real: number, imag: number}): {real: number, imag: number}{
    return {real: v1.real + v2.real, imag: v1.imag + v2.imag}
}

function mandelbrot(c: {real: number, imag: number}): boolean{
    let z = { real: c.real, imag: c.imag };
    let iterations = 0;
    while((iterations < iterationDepth) && (z.real * z.real + z.imag * z.imag) <= 4){
        let realTemp  = z.real * z.real - z.imag * z.imag + c.real
        z.imag = 2 * z.real * z.imag + c.imag
        z.real = realTemp
        
        iterations ++
        if(iterations == iterationDepth){
            return true
        }
        
    }
    return false
}

/*
                setTimeout in Schleifen:

setTimeout führt den angegebenen Callback asynchron aus. Dadurch wird der Inhalt von setTimeout nicht blockierend ausgeführt, sondern in die Warteschlange (Event Loop) gestellt. Das kann zu unerwartetem Verhalten führen, insbesondere wenn die Schleife schnell durchläuft.
Da die Schleife nicht wartet, bis der setTimeout-Callback ausgeführt wurde, können Werte von Variablen wie directionVector oder actualPoint zwischenzeitlich weiter verändert werden, was zu falschen Ergebnissen führen kann.
         */