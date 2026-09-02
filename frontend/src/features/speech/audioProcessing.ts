const downmixToMono = (audioBuffer: AudioBuffer) => {
  const mono = new Float32Array(audioBuffer.length);

  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel += 1) {
    const channelData = audioBuffer.getChannelData(channel);
    for (let index = 0; index < audioBuffer.length; index += 1) {
      mono[index] += channelData[index] / audioBuffer.numberOfChannels;
    }
  }

  return mono;
};

const resampleLinear = (
  samples: Float32Array,
  sourceRate: number,
  targetRate: number,
) => {
  if (sourceRate === targetRate) {
    return samples;
  }

  const outputLength = Math.max(
    1,
    Math.round(samples.length * (targetRate / sourceRate)),
  );
  const output = new Float32Array(outputLength);
  const ratio = sourceRate / targetRate;

  for (let index = 0; index < outputLength; index += 1) {
    const sourcePosition = index * ratio;
    const leftIndex = Math.floor(sourcePosition);
    const rightIndex = Math.min(leftIndex + 1, samples.length - 1);
    const mix = sourcePosition - leftIndex;
    output[index] =
      samples[leftIndex] * (1 - mix) + samples[rightIndex] * mix;
  }

  return output;
};

export const decodeAudioBlob = async (
  blob: Blob,
  targetSampleRate = 16_000,
) => {
  if (blob.size === 0) {
    throw new Error('录音内容为空，请重新录制。');
  }

  const AudioContextClass = window.AudioContext;
  if (!AudioContextClass) {
    throw new Error('当前浏览器无法解码录音。');
  }

  const audioContext = new AudioContextClass();
  try {
    const encodedAudio = await blob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(encodedAudio);
    const monoSamples = downmixToMono(audioBuffer);
    return resampleLinear(monoSamples, audioBuffer.sampleRate, targetSampleRate);
  } catch (error) {
    if (error instanceof Error && error.message.includes('录音')) {
      throw error;
    }
    throw new Error('录音解码失败，请重新录制。', { cause: error });
  } finally {
    await audioContext.close().catch(() => undefined);
  }
};
