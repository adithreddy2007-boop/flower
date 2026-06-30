// ============================================================
// BUILDER — drives the 6-stage sender wizard on index.html
// ============================================================
const STAGES = ["bouquet","lock","card","details","music","share"];
let currentStage = 0;
let state = {
  flowers: [],          // {uid, flowerId, xPct, yPct, rot}
  pinEnabled: false,
  pin: "",
  cardId: null,
  from: "", to: "", note: "",
  photos: [],            // base64 strings, max 3
  spotify: null,          // {trackId, start, end}
};

function $(sel){ return document.querySelector(sel); }
function $all(sel){ return Array.from(document.querySelectorAll(sel)); }

// ---------- STAGE NAV ----------
function goToStage(i){
  currentStage = Math.max(0, Math.min(STAGES.length-1, i));
  STAGES.forEach((s,idx)=>{
    $("#stage-"+s).style.display = idx===currentStage ? "flex" : "none";
  });
  $all(".stage-dots span").forEach((d,idx)=> d.classList.toggle("active", idx<=currentStage));
  $("#backBtn").style.visibility = currentStage===0 ? "hidden" : "visible";
  window.scrollTo(0,0);
}
$("#backBtn").addEventListener("click", ()=> goToStage(currentStage-1));

// ---------- STAGE 1: BOUQUET ----------
function renderTray(){
  const tray = $("#flowerTray");
  tray.innerHTML = "";
  FLOWER_LIBRARY.forEach(f=>{
    const el = document.createElement("div");
    el.className = "tray-flower";
    el.title = f.name;
    el.innerHTML = f.svg;
    el.draggable = false;
    el.addEventListener("pointerdown", e=> startDragNewFlower(e, f.id));
    tray.appendChild(el);
  });
}

function startDragNewFlower(e, flowerId){
  e.preventDefault();
  const zone = $("#bouquetSlots");
  const ghost = document.createElement("div");
  ghost.className = "placed-flower";
  ghost.innerHTML = flowerSvgById(flowerId);
  ghost.style.position = "fixed";
  ghost.style.left = e.clientX-32+"px";
  ghost.style.top = e.clientY-32+"px";
  ghost.style.zIndex = 999;
  ghost.style.pointerEvents = "none";
  document.body.appendChild(ghost);

  function move(ev){
    ghost.style.left = ev.clientX-32+"px";
    ghost.style.top = ev.clientY-32+"px";
  }
  function up(ev){
    document.removeEventListener("pointermove", move);
    document.removeEventListener("pointerup", up);
    ghost.remove();
    const rect = zone.getBoundingClientRect();
    if(ev.clientX>=rect.left && ev.clientX<=rect.right && ev.clientY>=rect.top && ev.clientY<=rect.bottom){
      const xPct = ((ev.clientX-rect.left)/rect.width)*100;
      const yPct = ((ev.clientY-rect.top)/rect.height)*100;
      addFlower(flowerId, xPct, yPct);
    }
  }
  document.addEventListener("pointermove", move);
  document.addEventListener("pointerup", up);
}

function addFlower(flowerId, xPct, yPct){
  if(state.flowers.length>=14){ return; }
  const uid = "f"+Date.now()+Math.random().toString(36).slice(2,6);
  const rot = Math.round((Math.random()*40)-20);
  state.flowers.push({uid, flowerId, xPct, yPct, rot});
  renderBouquet();
}

function renderBouquet(){
  const zone = $("#bouquetSlots");
  zone.innerHTML = "";
  state.flowers.forEach(f=>{
    const el = document.createElement("div");
    el.className = "placed-flower";
    el.style.left = `calc(${f.xPct}% - 32px)`;
    el.style.top = `calc(${f.yPct}% - 32px)`;
    el.style.transform = `rotate(${f.rot}deg)`;
    el.innerHTML = flowerSvgById(f.flowerId) + `<div class="remove-x">×</div>`;
    el.querySelector(".remove-x").addEventListener("pointerdown", ev=>{
      ev.stopPropagation();
      state.flowers = state.flowers.filter(x=>x.uid!==f.uid);
      renderBouquet();
    });
    el.addEventListener("pointerdown", ev=> startRepositionFlower(ev, f.uid));
    zone.appendChild(el);
  });
  $("#bouquetCount").textContent = `${state.flowers.length} flower${state.flowers.length===1?"":"s"} placed`;
  $("#bouquetNextBtn").disabled = state.flowers.length===0;
}

function startRepositionFlower(e, uid){
  e.preventDefault(); e.stopPropagation();
  const zone = $("#bouquetSlots");
  const rect = zone.getBoundingClientRect();
  function move(ev){
    let xPct = ((ev.clientX-rect.left)/rect.width)*100;
    let yPct = ((ev.clientY-rect.top)/rect.height)*100;
    xPct = Math.max(0, Math.min(100, xPct));
    yPct = Math.max(0, Math.min(100, yPct));
    const f = state.flowers.find(x=>x.uid===uid);
    if(f){ f.xPct=xPct; f.yPct=yPct; renderBouquet(); }
  }
  function up(){
    document.removeEventListener("pointermove", move);
    document.removeEventListener("pointerup", up);
  }
  document.addEventListener("pointermove", move);
  document.addEventListener("pointerup", up);
}

$("#clearBouquetBtn").addEventListener("click", ()=>{ state.flowers=[]; renderBouquet(); });
$("#bouquetNextBtn").addEventListener("click", ()=> goToStage(1));

// ---------- STAGE 2: LOCK ----------
$("#lockToggle").addEventListener("change", e=>{
  state.pinEnabled = e.target.checked;
  $("#pinEntryBlock").style.display = state.pinEnabled ? "block" : "none";
});
function renderPinBoxes(){
  $all(".pin-box").forEach((box,i)=>{
    box.textContent = state.pin[i] ? "•" : "";
    box.classList.toggle("filled", !!state.pin[i]);
  });
}
$all(".keypad button[data-num]").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    if(state.pin.length<4) state.pin += btn.dataset.num;
    renderPinBoxes();
  });
});
$("#pinDelete").addEventListener("click", ()=>{
  state.pin = state.pin.slice(0,-1);
  renderPinBoxes();
});
$("#lockNextBtn").addEventListener("click", ()=>{
  if(state.pinEnabled && state.pin.length!==4){
    $("#lockError").textContent = "Enter a full 4-digit PIN, or turn the lock off.";
    return;
  }
  $("#lockError").textContent = "";
  goToStage(2);
});

// ---------- STAGE 3: CARD ----------
function renderCards(){
  const grid = $("#cardGrid");
  grid.innerHTML = "";
  CARD_LIBRARY.forEach(c=>{
    const el = document.createElement("div");
    el.className = "pick-card";
    el.style.background = c.bg;
    el.innerHTML = `<div class="check">✓</div><h4>${c.name}</h4><p>${c.desc}</p>`;
    el.addEventListener("click", ()=>{
      state.cardId = c.id;
      $all(".pick-card").forEach(p=>p.classList.remove("selected"));
      el.classList.add("selected");
      $("#cardNextBtn").disabled = false;
    });
    grid.appendChild(el);
  });
}
$("#cardNextBtn").addEventListener("click", ()=> goToStage(3));

// ---------- STAGE 4: DETAILS ----------
$("#fromInput").addEventListener("input", e=> state.from = e.target.value);
$("#toInput").addEventListener("input", e=> state.to = e.target.value);
$("#noteInput").addEventListener("input", e=> state.note = e.target.value);

function renderPhotoSlots(){
  for(let i=0;i<3;i++){
    const slot = $(`#photoSlot${i}`);
    slot.innerHTML = "";
    if(state.photos[i]){
      const img = document.createElement("img");
      img.src = state.photos[i];
      const rm = document.createElement("div");
      rm.className = "rm"; rm.textContent = "×";
      rm.addEventListener("click", ev=>{
        ev.stopPropagation();
        state.photos.splice(i,1);
        renderPhotoSlots();
      });
      slot.appendChild(img); slot.appendChild(rm);
    } else {
      slot.innerHTML = `<span style="opacity:.5;font-size:1.4rem;">+</span>`;
    }
  }
}
function compressImage(file){
  return new Promise((resolve,reject)=>{
    const reader = new FileReader();
    reader.onload = ()=>{
      const img = new Image();
      img.onload = ()=>{
        const maxW = 480;
        const scale = Math.min(1, maxW/img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width*scale;
        canvas.height = img.height*scale;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img,0,0,canvas.width,canvas.height);
        resolve(canvas.toDataURL("image/jpeg",0.6));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
for(let i=0;i<3;i++){
  $(`#photoSlot${i}`).addEventListener("click", ()=>{
    if(state.photos[i]) return;
    const input = document.createElement("input");
    input.type = "file"; input.accept = "image/*";
    input.onchange = async ()=>{
      if(input.files[0]){
        const dataUrl = await compressImage(input.files[0]);
        state.photos[i] = dataUrl;
        renderPhotoSlots();
      }
    };
    input.click();
  });
}
$("#detailsNextBtn").addEventListener("click", ()=>{
  if(!state.to.trim()){
    $("#detailsError").textContent = "Add a name in “To” at least \u2014 who is this for?";
    return;
  }
  $("#detailsError").textContent = "";
  goToStage(4);
});

// ---------- STAGE 5: MUSIC (SPOTIFY) ----------
function parseSpotifyTrackId(url){
  if(!url) return null;
  const m = url.match(/track\/([a-zA-Z0-9]+)/);
  if(m) return m[1];
  if(/^[a-zA-Z0-9]{20,24}$/.test(url.trim())) return url.trim();
  return null;
}
$("#musicNextBtn").addEventListener("click", ()=>{
  const url = $("#spotifyUrl").value.trim();
  const start = parseFloat($("#startSec").value || "0");
  const end = parseFloat($("#endSec").value || "0");
  $("#musicError").textContent = "";
  if(url){
    const trackId = parseSpotifyTrackId(url);
    if(!trackId){
      $("#musicError").textContent = "That doesn't look like a valid Spotify track link.";
      return;
    }
    if(end <= start || (end-start) < 3){
      $("#musicError").textContent = "End time must be at least 3 seconds after start time.";
      return;
    }
    state.spotify = { trackId, start, end };
  } else {
    state.spotify = null;
  }
  goToStage(5);
  generateGift();
});
$("#skipMusicBtn").addEventListener("click", ()=>{
  state.spotify = null;
  goToStage(5);
  generateGift();
});

// ---------- STAGE 6: GENERATE + SHARE ----------
function shortId(len=7){
  const chars = "abcdefghijkmnpqrstuvwxyzACDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "";
  for(let i=0;i<len;i++) id += chars[Math.floor(Math.random()*chars.length)];
  return id;
}

async function generateGift(){
  $("#shareLoading").style.display = "block";
  $("#shareResult").style.display = "none";
  const id = shortId();
  const payload = {
    flowers: state.flowers,
    pin: state.pinEnabled ? state.pin : null,
    cardId: state.cardId,
    from: state.from,
    to: state.to,
    note: state.note,
    photos: state.photos,
    spotify: state.spotify,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  try{
    await db.collection("gifts").doc(id).set(payload);
    const base = location.href.replace(/index\.html.*$/,"").replace(/\/$/,"");
    const link = `${base}/gift.html?g=${id}`;
    $("#shareLoading").style.display = "none";
    $("#shareResult").style.display = "block";
    $("#shareLink").textContent = link;
    const qr = drawHeartQR($("#heartCanvas"), link, {size:280});
    $("#copyLinkBtn").onclick = ()=>{
      navigator.clipboard.writeText(link);
      $("#copyLinkBtn").textContent = "Copied!";
      setTimeout(()=> $("#copyLinkBtn").textContent = "Copy", 1500);
    };
    $("#nativeShareBtn").onclick = async ()=>{
      if(navigator.share){
        try{ await navigator.share({title:"A gift for you", url: link}); }catch(e){}
      } else {
        navigator.clipboard.writeText(link);
      }
    };
  }catch(err){
    $("#shareLoading").innerHTML = `<p class="error-msg">Couldn't save the gift: ${err.message}. Check your Firebase config + Firestore rules.</p>`;
  }
}

$("#startOverBtn").addEventListener("click", ()=>{
  state = { flowers:[], pinEnabled:false, pin:"", cardId:null, from:"", to:"", note:"", photos:[], spotify:null };
  $("#lockToggle").checked = false;
  $("#pinEntryBlock").style.display = "none";
  $("#fromInput").value=""; $("#toInput").value=""; $("#noteInput").value="";
  $("#spotifyUrl").value=""; $("#startSec").value=""; $("#endSec").value="";
  renderBouquet(); renderPinBoxes(); renderCards(); renderPhotoSlots();
  goToStage(0);
});

// ---------- INIT ----------
function initBuilder(){
  renderTray();
  renderBouquet();
  renderPinBoxes();
  renderCards();
  renderPhotoSlots();
  goToStage(0);
}
