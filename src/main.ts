function throwExpression (message: string): never {
  throw new Error(message);
}

document.addEventListener('DOMContentLoaded', function () {
  const editor = document.querySelector<HTMLTextAreaElement>('#editor') ?? throwExpression('`#editor` not found');
  const canvas = document.querySelector<HTMLCanvasElement>('#display') ?? throwExpression('`#display` not found');
  const ctx = canvas.getContext('2d') ?? throwExpression('Could not obtain 2D context from display');

  const displayData = new Uint8ClampedArray(1024);
  const displayImage = ctx.createImageData(32, 32);

  const colorMap: Record<number, number> = {
    [0]: 0x000000ff,
    [1]: 0xff0000ff,
    [2]: 0x00ff00ff,
    [3]: 0x0000ffff,
    [4]: 0xffffffff,
  };

  // TEST
  for (let i = 0; i < displayData.byteLength; i++) {
    displayData[i] = i % 4 + 1;
  };

  requestAnimationFrame(function (_time: DOMHighResTimeStamp) {
    const dv = new DataView(displayImage.data.buffer);
    for (let i = 0; i < displayData.byteLength; i++) {
      const index = displayData[i];
      const value = colorMap[index];
      dv.setUint32(i * 4, value);
    }

    ctx.putImageData(displayImage, 0, 0);
  });
});
