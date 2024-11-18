





function normalizeWaveform(data: { index: number; value: number }[]): Float32Array {
  const values = data.map((d) => d.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  return Float32Array.from(values.map((v) => 2 * (v - min) / (max - min) - 1)); // Normierung auf [-1, 1]
}

export async function createOscillatorFromWaveform(data: { index: number; value: number }[]) {
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
  // Normalisiere die Wellenform
  const normalizedWaveform = normalizeWaveform(data);

  // Erstelle eine PeriodicWave
  const wave = audioContext.createPeriodicWave(normalizedWaveform, new Float32Array(normalizedWaveform.length));

  // Oszillator erstellen
  
  oscillator.setPeriodicWave(wave);
  oscillator.connect(audioContext.destination);

  // Frequenz einstellen
  oscillator.frequency.value = 440; // A4-Ton als Beispiel

  // Starte den Oszillator
  console.log("oscillator about to start")  
  oscillator.start();
  console.log("oscillator started")  
  oscillator.stop(audioContext.currentTime + 5); // Spielt 5 Sekunden ab
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