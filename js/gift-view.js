// ============================================================
// GIFT VIEW — recipient side. Loads the gift doc, plays the
// flower-wipe loading transition, gates with PIN if set, then
// reveals the bouquet/card/note/photos/music.
// ============================================================
function $(sel){ return document.querySelector(sel); }

function buildFlowerTileDataUri(){
  const petals = FLOWER_LIBRARY.slice(0,3).map(f=>f.svg).join("");
  const tile = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160">
    <rect width="160" height="160" fill="#16331f"/>
    <g transform="translate(5,5) scale(0.45)">${FLOWER_LIBRARY[0].svg}</g>
    <g transform="translate(85,15) scale(0.4)">${FLOWER_LIBRARY[2].svg}</g>
    <g transform="translate(20,90) scale(0.4)">${FLOWER_LIBRARY[1].svg}</g>
    <g transform="translate(95,95) scale(0.45)">${FLOWER_LIBRARY[4].svg}</g>
  </svg>`;
  return "url('data:image/svg+xml;utf8," + encodeURIComponent(tile) + "')";
}

let GIFT = null;
let GIFT_ID = null;
let spotifyController = null;

async function loadGift(){
  const params = new URLSearchParams(location.search);
  GIFT_ID = params.get("g");
  document.querySelectorAll(".wipe-panel").forEach(p=>{
    p.style.backgroundImage = buildFlowerTileDataUri();
  });

  if(!GIFT_ID){
    showError("This gift link looks incomplete.");
    return;
  }
  try{
    const doc = await db.collection("gifts").doc(GIFT_ID).get();
    if(!doc.exists){
      showError("This gift couldn't be found — the link may be wrong.");
      return;
    }
    GIFT = doc.data();
    // small deliberate pause so the wipe animation reads as "loading"
    setTimeout(openWipe, 900);
  }catch(err){
    showError("Couldn't load this gift: " + err.message);
  }
}

function showError(msg){
  $("#wipeCenterLabel").textContent = msg;
  setTimeout(()=>{
    $("#wipeLoader").classList.add("opening");
    $("#errorStage").style.display = "flex";
    $("#errorStage p.error-msg").textContent = msg;
  }, 600);
}

function openWipe(){
  $("#wipeLoader").classList.add("opening");
  setTimeout(()=>{
    $("#wipeLoader").style.display = "none";
    if(GIFT.pin){
      $("#unlockStage").style.display = "flex";
    } else {
      revealGift();
    }
  }, 1150);
}

// ---------- PIN UNLOCK ----------
let enteredPin = "";
function renderUnlockPin(){
  $all2(".unlock-pin-box").forEach((box,i)=>{
    box.textContent = enteredPin[i] ? "•" : "";
    box.classList.toggle("filled", !!enteredPin[i]);
  });
}
function $all2(sel){ return Array.from(document.querySelectorAll(sel)); }

function attachUnlockKeypad(){
  $all2(".unlock-keypad button[data-num]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      if(enteredPin.length<4) enteredPin += btn.dataset.num;
      renderUnlockPin();
      if(enteredPin.length===4) checkPin();
    });
  });
  $("#unlockDelete").addEventListener("click", ()=>{
    enteredPin = enteredPin.slice(0,-1);
    renderUnlockPin();
  });
}
function checkPin(){
  if(enteredPin === GIFT.pin){
    $("#unlockError").textContent = "";
    $("#unlockStage").style.display = "none";
    revealGift();
  } else {
    $("#unlockError").textContent = "That's not quite it — try again.";
    setTimeout(()=>{ enteredPin=""; renderUnlockPin(); }, 500);
  }
}

// ---------- REVEAL ----------
function revealGift(){
  $("#revealStage").style.display = "flex";

  // bouquet
  const zone = $("#revealBouquetSlots");
  zone.innerHTML = "";
  (GIFT.flowers||[]).forEach(f=>{
    const el = document.createElement("div");
    el.className = "placed-flower";
    el.style.position = "absolute";
    el.style.left = `calc(${f.xPct}% - 32px)`;
    el.style.top = `calc(${f.yPct}% - 32px)`;
    el.style.transform = `rotate(${f.rot}deg)`;
    el.innerHTML = flowerSvgById(f.flowerId);
    zone.appendChild(el);
  });

  // card back
  const card = cardById(GIFT.cardId);
  if(card){
    $("#revealCardBack").style.background = card.bg;
    $("#revealCardBack h3").textContent = card.name;
  }

  $("#revealFromTo").textContent = `From ${GIFT.from || "someone"} to ${GIFT.to}`;
  $("#revealNote").textContent = GIFT.note || "";

  const photoRow = $("#revealPhotos");
  photoRow.innerHTML = "";
  (GIFT.photos||[]).forEach(src=>{
    const img = document.createElement("img");
    img.src = src;
    photoRow.appendChild(img);
  });

  if(GIFT.spotify && GIFT.spotify.trackId){
    setupSpotifyClip(GIFT.spotify);
  } else {
    $("#playerBar").style.display = "none";
  }
}

// ---------- SPOTIFY CLIP (no premium / no login required) ----------
function setupSpotifyClip(spotify){
  $("#playerBar").style.display = "flex";
  $("#trackInfo").textContent = `Clip · ${Math.round(spotify.start)}s–${Math.round(spotify.end)}s`;

  window.onSpotifyIframeApiReady = (IFrameAPI)=>{
    const element = document.getElementById("spotifyEmbed");
    const options = {
      uri: `spotify:track:${spotify.trackId}`,
      width: "1", height: "1"
    };
    IFrameAPI.createController(element, options, controller=>{
      spotifyController = controller;
      let started = false;
      controller.addListener("playback_update", e=>{
        const posSec = (e.data.position||0);
        if(started && posSec >= spotify.end){
          controller.pause();
        }
      });
      $("#playPauseBtn").addEventListener("click", ()=>{
        if(!started){
          started = true;
          controller.play();
          setTimeout(()=> controller.seek(spotify.start), 400);
        } else {
          controller.togglePlay();
        }
      });
    });
  };
  if(!document.getElementById("spotifyApiScript")){
    const s = document.createElement("script");
    s.id = "spotifyApiScript";
    s.src = "https://open.spotify.com/embed/iframe-api/v1";
    document.body.appendChild(s);
  }
}

document.addEventListener("DOMContentLoaded", ()=>{
  attachUnlockKeypad();
  loadGift();
});
