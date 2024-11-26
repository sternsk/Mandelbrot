import { MandelbrotOutline } from "./calcMandelbrotOutline";
import { Mandelbrot } from "./calcnPlot";

export interface Complex{
  real: number
  imag: number
}

export interface IterationData {
  rawSample: Complex[];
  rawLines: SVGPathElement;
  dftSample: Complex[];
  dftLines?: SVGPathElement;
  dftDots?: SVGPathElement;
}

export const storage: Map<number, IterationData> = new Map();

async function calculateRawData(iterationDepth: number): Promise<Complex[]> {
  const outline = new MandelbrotOutline(iterationDepth);
  const rawData: Complex[] = await outline.calcMandelbrotOutline();
  return rawData;
}


async function calculateAndStore(iterationDepth: number): Promise<void> {
  if (iterationDepth < 3) {
      console.error("Minimum iteration depth is 3");
      return;
  }
  if (iterationDepth > 14) {
      console.error("Maximum algorithm capability is 14");
      return;
  }

  if (storage.has(iterationDepth)) {
      console.log(`Data for iteration depth ${iterationDepth} already exists.`);
      return;
  }

  console.log(`Calculating data for iteration depth ${iterationDepth}...`);

  // First calculate:
  const rawSample: Complex[] = await calculateRawData(iterationDepth)
  const dftSample: Complex[] = await dft(rawSample);
  

  // Daten in der Map speichern
  storage.set(iterationDepth, { rawSample: rawSample, rawLines: drawLines(rawSample), dftSample: dftSample});

  console.log(`Data for iteration depth ${iterationDepth} stored.`);
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

export function rotate(vector: {real: number, imag: number}, rotationAngle: number): {real: number, imag: number}{
  const originLength = Math.sqrt(Math.pow(vector.real,2)+ Math.pow(vector.imag,2))
  const originAngle = Math.atan2(vector.imag, vector.real)
  const destinationAngle = originAngle + rotationAngle
  const rotatedVector = scale({real: Math.cos(destinationAngle), imag: Math.sin(destinationAngle)}, originLength)
  return rotatedVector
}

export function scale(vector: {real: number, imag: number}, amount: number): {real: number, imag: number}{
  return {real: vector.real * amount, imag: vector.imag * amount}
}

export function add(v1: {real: number, imag: number}, v2: {real: number, imag: number}): {real: number, imag: number}{
  return {real: v1.real + v2.real, imag: v1.imag + v2.imag}
}


// Discrete Fourier-Transformation
export function dft(data: Complex[]): Complex[] {
  const N = data.length;
  const result: Complex[] = [];

  for (let k = 0; k < N; k++) {
    let sum: Complex = { real: 0, imag: 0 };

    for (let n = 0; n < N; n++) {
      const angle = (2 * Math.PI * k * n) / N;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      sum.real += data[n].real * cos + data[n].imag * sin;
      sum.imag += data[n].imag * cos - data[n].real * sin;
    }

    // Amplituden normalisieren
    sum.real /= N;
    sum.imag /= N;

    result.push(sum);
  }

  return result;
}

// inverse discrete fourier transformation
export function idft(coefficients: Complex[], N: number): Complex[] {
  const result: Complex[] = [];

  for (let n = 0; n < N; n++) {
    let sum: Complex = { real: 0, imag: 0 };

    for (let k = 0; k < coefficients.length; k++) {
      const angle = (2 * Math.PI * k * n) / N;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      sum.real += coefficients[k].real * cos - coefficients[k].imag * sin;
      sum.imag += coefficients[k].real * sin + coefficients[k].imag * cos;
    }

    result.push(sum);
  }

  return result;
}

export function drawLines(samplePoints: Complex[]): SVGPathElement {
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

export function pixelHeight(svgElem: SVGSVGElement): number{
  
  return(svgElem.viewBox.baseVal.height / svgElem.getBoundingClientRect().height)
}

export function drawDots(samplePoints: Complex[], pixelHeight: number): SVGPathElement {
  const sampleCurvePath = document.createElementNS("http://www.w3.org/2000/svg", "path")
  const strokeWidth = .5

  console.log(pixelHeight)

  let pathData = ""
  for(let i = 1; i<samplePoints.length; i++){
      pathData += `M ${samplePoints[i].real} ${samplePoints[i].imag} v ${pixelHeight}`
  }
  sampleCurvePath.setAttribute("id", "outlinePath")
  sampleCurvePath.setAttribute("fill", "none")
  sampleCurvePath.setAttribute("stroke", "black")
  sampleCurvePath.setAttribute("stroke-width", `${strokeWidth}`)
  sampleCurvePath.setAttribute("vector-effect", "non-scaling-stroke")
  sampleCurvePath.setAttribute("d", `${pathData}`)

  return sampleCurvePath
}

export function extract(
  points: {real: number, imag: number}[], 
  part: "real" | "imag"
): {index: number, value: number}[] {
      return points.map((complex,index)=>({
          index,
          value: complex[part]

      }))
  }

  export function extractValuesAsFloat32Array(
    points: { real: number; imag: number }[],
    part: "real" | "imag"
  ): Float32Array {
    return new Float32Array(points.map((complex) => complex[part]));
  }

let audioContext: AudioContext | null = null;
export let oscillator: OscillatorNode | null = null;

/**
 * Create an oscillator from a custom waveform.
 * @param data - Array of objects with `real` and `imag` properties defining the waveform.
 */
export async function createOscillatorFromWaveform(frequency: number, data: { real: number; imag: number }[]) {
    if (!audioContext) {
        audioContext = new AudioContext();
    }
    oscillator = audioContext.createOscillator();

    // Extract real and imag values into separate arrays
    const realValues = new Float32Array(data.map(point => point.real));
    const imagValues = new Float32Array(data.map(point => point.imag));

    // Create a PeriodicWave
    const wave = audioContext.createPeriodicWave(realValues, imagValues);

    // Set the waveform and connect the oscillator
    oscillator.setPeriodicWave(wave);
    oscillator.connect(audioContext.destination);

    // Set frequency
    oscillator.frequency.value = frequency

    // Start the oscillator
    oscillator.start();
}



/**
 * Stop the sound and release resources.
 */
export function stopSound() {
    if (oscillator) {
        oscillator.stop();
        oscillator.disconnect();
        oscillator = null;
    }

    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }
}

function normalizeWaveform(data: { index: number; value: number }[]): Float32Array {
    const values = data.map((d) => d.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    return Float32Array.from(values.map((v) => 2 * (v - min) / (max - min) - 1)); // Normierung auf [-1, 1]
  }
  


/*

Falls dein Array keine periodische Wellenform darstellt oder du es direkt ohne Interpolation abspielen möchtest, kannst du stattdessen einen AudioBuffer verwenden. Dies erzeugt einen einzelnen Klang und ist keine kontinuierliche Schwingung:
const data = [
  { index: 0, value: 0 },
  { index: 1, value: 0.5 },
  { index: 2, value: 1 },
  { index: 3, value: 0.5 },
  { index: 4, value: 0 },
  { index: 5, value: -0.5 },
  { index: 6, value: -1 },
  { index: 7, value: -0.5 },
]; // Beispiel einer Wellenform

createOscillatorFromWaveform(data).catch((err) => console.error(err));

async function playWaveform(data: { index: number; value: number }[], sampleRate = 44100) {
  const audioContext = new AudioContext();

  // Normalisiere die Wellenform
  const normalizedWaveform = normalizeWaveform(data);

  // Erstelle einen AudioBuffer
  const buffer = audioContext.createBuffer(1, normalizedWaveform.length, sampleRate);
  const channelData = buffer.getChannelData(0);
  channelData.set(normalizedWaveform);

  // AudioBufferSourceNode erstellen
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);

  // Abspielen
  source.start();
}
*/