import wabt from 'wabt';

function throwExpression (message: string): never {
  throw new Error(message);
}

document.addEventListener('DOMContentLoaded', function () {
  const editor = document.querySelector<HTMLTextAreaElement>('#editor') ?? throwExpression('`#editor` not found');
  const buttonInstantiate = document.querySelector<HTMLButtonElement>('#instantiate') ?? throwExpression('`#instantiate` not found');
  const buttonRun = document.querySelector<HTMLButtonElement>('#run') ?? throwExpression('`#run` not found');
  const buttonStop = document.querySelector<HTMLButtonElement>('#stop') ?? throwExpression('`#stop` not found');
  const canvas = document.querySelector<HTMLCanvasElement>('#display') ?? throwExpression('`#display` not found');
  const ctx = canvas.getContext('2d') ?? throwExpression('Could not obtain 2D context from display');

  const memory = new WebAssembly.Memory({ initial: 1 });
  const displayData = new Uint8ClampedArray(memory.buffer, 0x200, 1024);
  const displayImage = ctx.createImageData(32, 32);

  const colorMap: Record<number, number> = {
    [0]: 0x000000ff,
    [1]: 0xff0000ff,
    [2]: 0x00ff00ff,
    [3]: 0x0000ffff,
    [4]: 0xffffffff,
  };

  function draw () {
    const dv = new DataView(displayImage.data.buffer);
    for (let i = 0; i < displayData.byteLength; i++) {
      const index = displayData[i];
      const value = colorMap[index] ?? colorMap[0];
      dv.setUint32(i * 4, value);
    }

    ctx.putImageData(displayImage, 0, 0);
  }

  draw();

  let raf: number;
  const defaultUpdateFn = function () {};
  let updateFn: Function = defaultUpdateFn;

  function update (_time: DOMHighResTimeStamp) {
    raf = requestAnimationFrame(update);
    updateFn();
    draw();
  }

  wabt().then(wabt => {
    buttonInstantiate.disabled = false;

    let wasm: WebAssembly.WebAssemblyInstantiatedSource | null;

    buttonInstantiate.addEventListener('click', async function (_evt: MouseEvent) {
      const wat = editor.value;
      const module = wabt.parseWat('mylib', wat, { multi_memory: true } as any); // https://github.com/AssemblyScript/wabt.js/pull/50
      const bin = module.toBinary({ log: true });
      wasm = await WebAssembly.instantiate(bin.buffer, { js: { mem: memory } });
      buttonRun.disabled = false;
    });

    buttonRun.addEventListener('click', function (_evt) {
      if (!wasm) return;

      if (typeof wasm.instance.exports.start === 'function') {
        wasm.instance.exports.start();
        draw();
      }

      if (typeof wasm.instance.exports.update === 'function') {
        updateFn = wasm.instance.exports.update;
      }

      raf = requestAnimationFrame(update);

      buttonRun.disabled = true;
      buttonStop.disabled = false;
    });

    buttonStop.addEventListener('click', function (_evt) {
      cancelAnimationFrame(raf);
      buttonRun.disabled = false;
      buttonStop.disabled = true;
    });
  }).catch(reason => {
    if (typeof reason.message === 'string') {
      console.error(reason.message);
    } else {
      console.error(reason);
    }
  });
});
