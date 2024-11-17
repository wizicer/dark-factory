export interface LayoutProof {
  rate: bigint;
  storage: bigint;
  a: [bigint, bigint];
  b: [[bigint, bigint], [bigint, bigint]];
  c: [bigint, bigint];
}

const MAX_PATH_SIZE = 144;

export async function getLayoutProof(
  layoutPlacements: bigint[],
  pathRaw: bigint[],
): Promise<LayoutProof> {
  if (layoutPlacements.length !== 8 * 18)
    throw new Error(
      'Invalid layoutPlacements length, required 8*18=144 elements',
    );

  const pathMask = new Array(MAX_PATH_SIZE)
    .fill(0n)
    .map((_, i) => (i >= pathRaw.length ? 0n : 1n));
  const path = new Array(MAX_PATH_SIZE)
    .fill(0n)
    .map((_, i) => pathRaw[i] || 0n);
  console.log('proving', {
    layoutPlacements,
    path,
    pathMask,
  });
  const { proof, publicSignals } = await window.snarkjs.groth16.fullProve(
    {
      layoutPlacements,
      path,
      pathMask,
    },

    'circuits/LayoutEligibility.wasm',
    'circuits/LayoutEligibility_final.zkey',
  );

  const ep = await window.snarkjs.groth16.exportSolidityCallData(
    proof,
    publicSignals,
  );
  const eep = JSON.parse('[' + ep + ']');

  return {
    rate: eep[3][0],
    storage: eep[3][1],
    a: eep[0],
    b: eep[1],
    c: eep[2],
  };
}
