import { iterationDepth } from "src"

export let boundaryPoints: {real: number, imag:number}[] = []
export function calcMandelbrotOutline(){

    boundaryPoints=[]
    
    // start from the well known left tip of the mandelbrot-set
    const startPoint = {real: -2, imag:0}
    
    //step slightly out of the mandelbrotset at samplingRate/2 step
    let directionVector = {real: -1, imag: 0}
    const samplingRate = 1/Math.pow(iterationDepth,3)
    const sampleRotation = Math.PI/8
    let actualPoint = add(startPoint, scale(directionVector, samplingRate/2))
    
    console.log("samplingRate: "+samplingRate+" at iterationDepth: "+iterationDepth)
    
    boundaryPoints.push(actualPoint)
    
    // then move upwards from here on
    directionVector = {real: 0, imag: 1}

    //move around the whole mandelbroz
    while (actualPoint.imag >= 0){
    //for (let i = 0; i  < 1500; i++) {
       
        // test if actualPoint + directionVector is inside the Mandelbrot
        // cover the case, where we pierce into the set
        if(mandelbrot(add(actualPoint, scale(directionVector, samplingRate)))){
                while (mandelbrot(add(actualPoint, scale(directionVector, samplingRate)))){
                    // adjust by rotating the directionvector away from the set
                    
                    directionVector = rotate(directionVector, sampleRotation)
                }
            actualPoint = add(actualPoint, scale(directionVector, samplingRate))
            boundaryPoints.push(actualPoint)
            
        }
    
        // cover the case, where we do not pierce into the set
        if(!mandelbrot(add(actualPoint, scale(directionVector, samplingRate)))){
            while(!mandelbrot(add(actualPoint, scale(directionVector, samplingRate))))    {
                //rotate the other way around
                directionVector = rotate(directionVector, -sampleRotation)
            }
            // then rotate back to get out of the set again
            directionVector = rotate(directionVector, sampleRotation)
            actualPoint = add(actualPoint, scale(directionVector, samplingRate))
            boundaryPoints.push(actualPoint)
            
        }
    }
    console.log("boundaryPoints.length: "+boundaryPoints.length)
   
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