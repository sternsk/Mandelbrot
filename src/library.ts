import { frequencySlider } from "src";

let audioContext: AudioContext | null = null;
export let oscillator: OscillatorNode | null = null;

/**
 * Create an oscillator from a custom waveform.
 * @param data - Array of objects with `real` and `imag` properties defining the waveform.
 */
export async function createOscillatorFromWaveform(data: { real: number; imag: number }[]) {
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
    oscillator.frequency.value = parseFloat(frequencySlider.value)

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