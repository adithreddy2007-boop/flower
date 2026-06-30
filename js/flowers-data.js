// ============================================================
// FLOWER LIBRARY — each entry is a self-contained inline SVG.
// Add more by following the same pattern: id, name, svg string.
// ============================================================
const FLOWER_LIBRARY = [
  {
    id: "pink-rose",
    name: "Pink Rose",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="rg1" cx="50%" cy="40%"><stop offset="0%" stop-color="#f7c6cf"/><stop offset="60%" stop-color="#e892a3"/><stop offset="100%" stop-color="#c9657e"/></radialGradient></defs>
      <path d="M50 75 L46 100 M50 75 L54 100" stroke="#3f6b46" stroke-width="3" fill="none"/>
      <ellipse cx="50" cy="78" rx="14" ry="8" fill="#3f6b46"/>
      <circle cx="50" cy="45" r="28" fill="url(#rg1)"/>
      <path d="M50 20 C38 26 34 38 40 46 C46 54 58 54 60 44 C62 36 56 22 50 20Z" fill="#e3839a"/>
      <path d="M50 30 C44 33 42 40 46 45 C50 50 58 49 59 43 C60 38 55 31 50 30Z" fill="#d4647e"/>
      <circle cx="50" cy="45" r="6" fill="#b94f68"/>
    </svg>`
  },
  {
    id: "white-daisy",
    name: "White Daisy",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 78 L48 100 M50 78 L52 100" stroke="#3f6b46" stroke-width="3" fill="none"/>
      <g>
        ${Array.from({length:10}).map((_,i)=>`<ellipse cx="50" cy="30" rx="6" ry="18" fill="#fdfdfb" transform="rotate(${i*36} 50 50)"/>`).join("")}
      </g>
      <circle cx="50" cy="50" r="11" fill="#e8b948"/>
    </svg>`
  },
  {
    id: "babys-breath",
    name: "Baby's Breath",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 90 L50 50 M50 70 L34 55 M50 65 L66 50 M50 55 L40 38 M50 55 L62 40" stroke="#5a8456" stroke-width="2.5" fill="none"/>
      ${[[50,50],[34,55],[66,50],[40,38],[62,40],[50,30],[30,42],[70,40]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="4.5" fill="#fffdf6" stroke="#f1e9d2" stroke-width="0.5"/>`).join("")}
    </svg>`
  },
  {
    id: "tulip",
    name: "Tulip",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 60 L50 100" stroke="#3f6b46" stroke-width="4" fill="none"/>
      <path d="M50 60 C30 55 28 35 36 25" stroke="#3f6b46" stroke-width="3" fill="none"/>
      <path d="M38 30 C30 18 36 8 50 14 C64 8 70 18 62 30 C68 36 64 50 50 56 C36 50 32 36 38 30Z" fill="#e35c7a"/>
      <path d="M44 30 C40 22 44 16 50 19 C56 16 60 22 56 30 C58 36 54 44 50 48 C46 44 42 36 44 30Z" fill="#c93f63"/>
    </svg>`
  },
  {
    id: "peony",
    name: "Peony",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 75 L50 100" stroke="#3f6b46" stroke-width="3" fill="none"/>
      <circle cx="50" cy="48" r="27" fill="#f6d3da"/>
      ${Array.from({length:8}).map((_,i)=>`<ellipse cx="50" cy="34" rx="9" ry="14" fill="#eeb5c4" transform="rotate(${i*45} 50 48)"/>`).join("")}
      <circle cx="50" cy="48" r="11" fill="#e598ad"/>
      <circle cx="50" cy="48" r="5" fill="#d97891"/>
    </svg>`
  },
  {
    id: "lavender",
    name: "Lavender",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 95 L50 35" stroke="#5e7a4c" stroke-width="3" fill="none"/>
      ${Array.from({length:9}).map((_,i)=>`<ellipse cx="${50+(i%2?6:-6)}" cy="${35+i*7}" rx="6" ry="4" fill="#9a86c9" transform="rotate(${i%2?20:-20} 50 ${35+i*7})"/>`).join("")}
      <ellipse cx="50" cy="28" rx="6" ry="5" fill="#a892d1"/>
    </svg>`
  }
];

// ============================================================
// CARD LIBRARY — 9 designs, gradient + typographic, matching
// the "Pick a card" reference set.
// ============================================================
const CARD_LIBRARY = [
  { id:"flower-fall",     name:"Flower Fall",      desc:"A cascade of flowers reveals your note.",        bg:"linear-gradient(160deg,#6e8f63,#2d4a31)" },
  { id:"sapphire-vineyard",name:"Sapphire Vineyard",desc:"A sapphire-toned vineyard scene.",               bg:"linear-gradient(160deg,#3a5b8c,#1c2f52)" },
  { id:"pink-meadow",     name:"Pink Meadow",      desc:"Petal rain over a pink watercolor field.",       bg:"linear-gradient(160deg,#f3b8c6,#d97f96)" },
  { id:"lilac-dream",     name:"Lilac Dream",      desc:"Lilac petal drift over dreamy watercolor.",      bg:"linear-gradient(160deg,#c6aee3,#8d6fb8)" },
  { id:"xoxo",            name:"XOXO",             desc:"A gift box opens into a shower of pink.",        bg:"linear-gradient(160deg,#f49bb0,#c9587a)" },
  { id:"pink-birthday",   name:"Pink Birthday",    desc:"A cheerful pink celebration card.",              bg:"linear-gradient(160deg,#ffd1dc,#f08bab)" },
  { id:"seafoam",         name:"Seafoam",          desc:"A seafoam celebration with soft waves.",         bg:"linear-gradient(160deg,#9fe0cf,#4f9c8a)" },
  { id:"botanical",       name:"Botanical",        desc:"Pressed-leaf botanical collage.",                bg:"linear-gradient(160deg,#7fae6f,#3a5e35)" },
  { id:"coral-sky",       name:"Coral Sky",        desc:"Blue sky with scattered coral clouds.",          bg:"linear-gradient(160deg,#ffb199,#ff8a73)" }
];

function flowerSvgById(id){
  const f = FLOWER_LIBRARY.find(f=>f.id===id);
  return f ? f.svg : "";
}
function cardById(id){
  return CARD_LIBRARY.find(c=>c.id===id);
}
