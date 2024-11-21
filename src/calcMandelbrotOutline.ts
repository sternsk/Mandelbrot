import { iterationDepth, spectraSvg } from "src"

export let boundaryPoints: {real: number, imag:number}[] = []

let allSteps: {startPoint: {
                    real: number, 
                    imag: number}, 
                endPoint: {
                    real: number, 
                    imag: number}, 
                color: string}[]= 
                []

let done = false
const actualSample = document.createElementNS("http://www.w3.org/2000/svg", "line")

export function calcMandelbrotOutline(){
    //initialize spectraSvg
    done = false
    allSteps = []
    spectraSvg.innerHTML = ""

    const begin = Date.now()
    
    actualSample.setAttribute("vector-effect", "non-scaling-stroke")
    actualSample.setAttribute("stroke-width", "1px")    
    actualSample.setAttribute("id", "actualSample")
    spectraSvg.appendChild(actualSample)

    let duration: number

    boundaryPoints=[]
    
    // start from the well known left tip of the mandelbrot-set
    const startPoint = {real: -2, imag:0}
    
    //step slightly out of the mandelbrotset at samplingRate/2 step
    let directionVector = {real: -1, imag: 0}
    const sampleLength = 1/Math.pow(iterationDepth,3)
    const sampleAngle = Math.PI/8
    let actualPoint = add(startPoint, scale(directionVector, sampleLength/2))
    
    console.log("samplingRate: "+sampleLength+" at iterationDepth: "+iterationDepth)
    
    boundaryPoints.push(actualPoint)
    
    // then move upwards from here on
    directionVector = {real: 0, imag: 1}

    //move around for a reasonable amount
    while (actualPoint.imag >= 0){
    //for (let i = 0; i  < 1500; i++) {
       
        // test if actualPoint + directionVector is inside the Mandelbrot
        // cover the case, where we pierce into the set
        if(mandelbrot(add(actualPoint, scale(directionVector, sampleLength)))){
                /*
                setTimeout in Schleifen:

setTimeout führt den angegebenen Callback asynchron aus. Dadurch wird der Inhalt von setTimeout nicht blockierend ausgeführt, sondern in die Warteschlange (Event Loop) gestellt. Das kann zu unerwartetem Verhalten führen, insbesondere wenn die Schleife schnell durchläuft.
Da die Schleife nicht wartet, bis der setTimeout-Callback ausgeführt wurde, können Werte von Variablen wie directionVector oder actualPoint zwischenzeitlich weiter verändert werden, was zu falschen Ergebnissen führen kann.
         */
            while (mandelbrot(add(actualPoint, scale(directionVector, sampleLength)))){
                
                const endPoint = add(actualPoint, scale(directionVector, sampleLength))
                allSteps.push({startPoint: actualPoint, endPoint, color: "brown"})
                
                // adjust by rotating the directionvector away from the set
                directionVector = rotate(directionVector, sampleAngle)
                
                
                /*
                actualSample.setAttribute("x1", `${actualPoint.real}`)
                actualSample.setAttribute("y1", `${actualPoint.imag}`)
                actualSample.setAttribute("x2", `${endPoint.real}`)
                actualSample.setAttribute("y2", `${endPoint.imag}`)
                actualSample.setAttribute("stroke", "brown")
            */
            
                    
            }
            const endpoint = add(actualPoint, scale(directionVector, sampleLength))
            allSteps.push({startPoint: actualPoint, endPoint: endpoint, color: "red"})
            actualPoint = endpoint


            /*
            actualSample.setAttribute("x1", `${actualPoint.real}`)
            actualSample.setAttribute("y1", `${actualPoint.imag}`)
            actualSample.setAttribute("x2", `${add(actualPoint, scale(directionVector, sampleLength)).real}`)
            actualSample.setAttribute("y2", `${add(actualPoint, scale(directionVector, sampleLength)).imag}`)
            actualSample.setAttribute("stroke", "black")
            const calculatedSample = actualSample.cloneNode(false) as SVGLineElement
            calculatedSample.setAttribute("id", "calculatedSample")
            spectraSvg.appendChild(calculatedSample)
*/
            
            boundaryPoints.push(actualPoint)
            
        }
    
        // cover the case, where we do not pierce into the set
        if(!mandelbrot(add(actualPoint, scale(directionVector, sampleLength)))){
            while(!mandelbrot(add(actualPoint, scale(directionVector, sampleLength))))    {
                const endPoint = add(actualPoint, scale(directionVector, sampleLength))
                allSteps.push({startPoint: actualPoint, endPoint, color: "blue"})
                
                //rotate the other way around
                directionVector = rotate(directionVector, -sampleAngle)
            }
            // then rotate back to get out of the set again
            directionVector = rotate(directionVector, sampleAngle)

            const endpoint = add(actualPoint, scale(directionVector, sampleLength))
            allSteps.push({startPoint: actualPoint, endPoint: endpoint, color: "red"})

            actualPoint = endpoint
            boundaryPoints.push(actualPoint)
            
        }
    done = true
    animateOutline()
    }

    
        
    console.log("boundaryPoints.length: "+boundaryPoints.length)
    duration = Date.now() - begin
    console.log(`sampling mb-outline in ${duration} ms`)
}

let currentAnimation: NodeJS.Timeout | null = null; // Speichert das aktuelle Intervall

function animateOutline(){
    if(done){
        let i = 0
        if (currentAnimation !== null) {
            clearInterval(currentAnimation);
            currentAnimation = null;
            console.log("Vorherige Animation abgebrochen");
        }
        
        currentAnimation = setInterval(() =>{
            
            if (i >= allSteps.length || !done) {
                clearInterval(currentAnimation!); // Intervall beenden
                console.log("intervall cleared")
                return;
            }

            const startPoint = allSteps[i].startPoint
            const endPoint = allSteps[i].endPoint
            const color = allSteps[i].color
            
            actualSample.setAttribute("x1", `${startPoint.real}`)
            actualSample.setAttribute("y1", `${startPoint.imag}`)
            actualSample.setAttribute("x2", `${endPoint.real}`)
            actualSample.setAttribute("y2", `${endPoint.imag}`)
            actualSample.setAttribute("stroke", `${color}`)

            // spectraSvg.setAttribute("viewBox", `${startPoint.real - .05} 
            //                                     ${startPoint.imag  - .05} 
            //                                     ${endPoint.real - startPoint.real + .1}
            //                                     ${endPoint.imag - startPoint.imag + .1}`)

            const calculatedSample = actualSample.cloneNode(false) as SVGLineElement
            calculatedSample.setAttribute("id", "calculatedSample")
            spectraSvg.appendChild(calculatedSample)

            
            i++
        }, 100)
    }
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