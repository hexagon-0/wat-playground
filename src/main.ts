import wabt from 'wabt';


function throwExpression (message: string): never {
  throw new Error(message);
}

document.addEventListener('DOMContentLoaded', function () {
  const editor = document.querySelector<HTMLTextAreaElement>('#editor') ?? throwExpression('`#editor` not found');
  const buttonInstantiate = document.querySelector<HTMLButtonElement>('#instantiate') ?? throwExpression('`#instantiate` not found');
  const canvas = document.querySelector<HTMLCanvasElement>('#display') ?? throwExpression('`#display` not found');
  const ctx = canvas.getContext('2d') ?? throwExpression('Could not obtain 2D context from display');

  const displayMemory = new WebAssembly.Memory({ initial: 1 });
  const displayData = new Uint8ClampedArray(displayMemory.buffer, 0, 1024);
  const displayImage = ctx.createImageData(32, 32);

  const colorMap: Record<number, number> = {
    [0]: 0x000000ff,
    [1]: 0xff0000ff,
    [2]: 0x00ff00ff,
    [3]: 0x0000ffff,
    [4]: 0xffffffff,
  };

  requestAnimationFrame(function draw (_time: DOMHighResTimeStamp) {
    requestAnimationFrame(draw);
    
    const dv = new DataView(displayImage.data.buffer);
    for (let i = 0; i < displayData.byteLength; i++) {
      const index = displayData[i];
      const value = colorMap[index];
      dv.setUint32(i * 4, value);
    }

    ctx.putImageData(displayImage, 0, 0);
  });

  wabt().then(wabt => {
    buttonInstantiate.disabled = false;

    buttonInstantiate.addEventListener('click', async function (_evt: MouseEvent) {
      const wat = editor.value;
      const module = wabt.parseWat('mylib', wat, { multi_memory: true } as any); // https://github.com/AssemblyScript/wabt.js/pull/50
      const bin = module.toBinary({ log: true });
      const wasm = await WebAssembly.instantiate(bin.buffer, { js: { display: displayMemory } });
    });
  }).catch(reason => {
    if (typeof reason.message === 'string') {
      console.error(reason.message);
    } else {
      console.error(reason);
    }
  });
});
