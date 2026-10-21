// Decorative QR-style mark (not scannable). Swap for a real QR (e.g. qrcode.react) in production.
export const N = 21;
const corners = [[0, 0], [0, N - 7], [N - 7, 0]];
const inFinder = (r, c) => corners.some(([a, b]) => r >= a && r < a + 7 && c >= b && c < b + 7);
const finderOn = (r, c) => {
  const [fr, fc] = corners.find(([a, b]) => r >= a && r < a + 7 && c >= b && c < b + 7);
  const y = r - fr, x = c - fc;
  return y === 0 || y === 6 || x === 0 || x === 6 || (y >= 2 && y <= 4 && x >= 2 && x <= 4);
};
export const qrCells = [];
let seed = 7;
for (let r = 0; r < N; r++)
  for (let c = 0; c < N; c++) {
    seed = (seed * 9301 + 49297) % 233280;
    if (inFinder(r, c) ? finderOn(r, c) : seed / 233280 > 0.52) qrCells.push([r, c]);
  }

export default function QRMark({ className = "" }) {
  return (
    <svg viewBox={`0 0 ${N} ${N}`} className={className} shapeRendering="crispEdges" role="img" aria-label="Sample QR code">
      {qrCells.map(([r, c]) => <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="currentColor" />)}
    </svg>
  );
}