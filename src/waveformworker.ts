import { MandelbrotOutline } from "./calcMandelbrotOutline";
export let storage: MandelbrotOutline[] = []
console.log("worker initialized")

// at storage[0] the mandelbrotOutline of iterationDepth 2 is stored
self.onmessage = (event) => {
    console.log("worker requested")
    const request: number = event.data;

    if (request < 2){
        self.postMessage( "minimum iterationDepth is 2" );
        return
    } else 

    if(request > 14){
        self.postMessage("maximum algorithm capability is 14")
        return
    }else

    if (storage[request-2]){
        self.postMessage( "data already set" );
    } else {

        const outline = new MandelbrotOutline(request)
        storage.push(outline)
        self.postMessage(storage)
        console.log(`pushed ${request}, length should be ${request-2} an is actually ${storage.length}`)
    }
}