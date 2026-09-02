const parseEventData = (block: string) => {
  const dataLines: string[] = [];

  for (const line of block.split(/\r?\n/)) {
    if (!line || line.startsWith(':')) {
      continue;
    }

    const separatorIndex = line.indexOf(':');
    const field = separatorIndex === -1 ? line : line.slice(0, separatorIndex);

    if (field !== 'data') {
      continue;
    }

    let value = separatorIndex === -1 ? '' : line.slice(separatorIndex + 1);
    if (value.startsWith(' ')) {
      value = value.slice(1);
    }
    dataLines.push(value);
  }

  return dataLines.length > 0 ? dataLines.join('\n') : null;
};

const pullEventBlock = (buffer: string) => {
  const match = /\r?\n\r?\n/.exec(buffer);

  if (!match || match.index === undefined) {
    return null;
  }

  return {
    block: buffer.slice(0, match.index),
    rest: buffer.slice(match.index + match[0].length),
  };
};

export const consumeSseData = async (
  stream: ReadableStream<Uint8Array>,
  onData: (data: string) => boolean | void,
) => {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let shouldStop = false;

  const consumeBuffer = () => {
    let eventBlock = pullEventBlock(buffer);

    while (eventBlock) {
      buffer = eventBlock.rest;
      const data = parseEventData(eventBlock.block);

      if (data !== null && onData(data) === false) {
        shouldStop = true;
        return;
      }

      eventBlock = pullEventBlock(buffer);
    }
  };

  try {
    while (!shouldStop) {
      const { done, value } = await reader.read();

      if (done) {
        buffer += decoder.decode();
        consumeBuffer();
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      consumeBuffer();
    }

    if (!shouldStop && buffer.trim()) {
      const data = parseEventData(buffer);
      if (data !== null) {
        onData(data);
      }
    }
  } catch (error) {
    await reader.cancel().catch(() => undefined);
    throw error;
  } finally {
    if (shouldStop) {
      await reader.cancel().catch(() => undefined);
    }
    reader.releaseLock();
  }
};
