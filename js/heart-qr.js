// ============================================================
// HEART QR — draws a QR code's modules clipped into a heart
// silhouette. Finder/timing patterns are always kept intact
// (they sit naturally near the heart's two lobes + base point)
// so the code stays scannable; peripheral modules outside the
// heart are simply omitted, relying on level-H error correction
// to recover them.
// ============================================================
function isInsideHeart(nx, ny){
  // nx, ny in [-1.1, 1.1], heart point at bottom, lobes at top
  const x = nx, y = -ny + 0.35; // flip + shift so point is at bottom
  const eq = Math.pow(x*x + y*y - 1, 3) - x*x*y*y*y;
  return eq <= 0;
}

function isFinderOrTiming(row, col, size){
  const inFinder = (r,c)=> r<7 && c<7;
  const corners =
    inFinder(row,col) ||
    inFinder(row, size-1-col) ||
    inFinder(size-1-row, col);
  const timing = row===6 || col===6;
  const alignmentZone = row > size-10 && col > size-10; // bottom-right area, keep dense
  return corners || timing || alignmentZone;
}

function drawHeartQR(canvas, text, opts={}){
  const size = opts.size || 320;
  const padding = opts.padding ?? 18;
  const dark = opts.dark || "#1f2a1c";
  const light = opts.light || "#f3e8d3";

  const qr = QRCode.create(text, { errorCorrectionLevel: "H" });
  const modules = qr.modules;
  const n = modules.size;
  const cell = (size - padding*2) / n;

  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = light;
  ctx.fillRect(0,0,size,size);

  ctx.fillStyle = dark;
  for(let row=0; row<n; row++){
    for(let col=0; col<n; col++){
      if(!modules.get(row,col)) continue;
      // normalize cell center to [-1.15, 1.15] heart space
      const nx = (col/(n-1)) * 2.3 - 1.15;
      const ny = (row/(n-1)) * 2.3 - 1.15;
      const keep = isFinderOrTiming(row,col,n) || isInsideHeart(nx, ny);
      if(!keep) continue;
      const px = padding + col*cell;
      const py = padding + row*cell;
      const r = Math.min(cell*0.32, 2.4);
      roundRect(ctx, px, py, cell*0.92, cell*0.92, r);
      ctx.fill();
    }
  }
  return qr;
}

function roundRect(ctx,x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
}
