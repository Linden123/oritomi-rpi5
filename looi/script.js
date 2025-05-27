const faceEl = document.querySelector(".face-display");
const voiceEl = document.querySelector(".voice-line");
const container = document.querySelector(".robot-container");

const xpBarContainer = document.getElementById("xpBarContainer");
const xpBar = document.getElementById("xpBar");
const moodMeter = document.getElementById("moodMeter");

let faceTimeout, sleepTimeout, angryTimeout, angryTapTimeout;
let isSleeping = false;
let isAngry = false;
let angryTapCount = 0;
let xpFillInterval;

const normalFaces = [
  "(⚆_⚆)", "(☉_☉)", "(◕‿◕)", "(◕‿◕)", "(⇀‿‿↼)", "(≖‿‿≖)", "(◕‿‿◕)", "(-__-)", "(°▃▃°)", "(⌐■_■)",
  "(•‿‿•)", "(ᵔ◡◡ᵔ)", "(^‿‿^)", "(☼‿‿☼)", "(≖__≖)", "(✜‿‿✜)", "(ب__ب)", "(╥☁╥)", "(-_-')", "(♥‿‿♥)",
  "(☓‿‿☓)", "(#__#)", "(1__0)", "(1__1)", "(1__2)"
];

const normalLines = [
  "Hello!", "How are you?", "I'm here.", "What's up?", "Let's have fun!", "Feeling good!", "Ready to play!", "Let's go!", "Beep beep!", "Wanna chat?"
];

const angryFace = "(╬ಠ益ಠ)";
const angryLines = [
  "Grrrr... I'm angry!", "Stop poking me!", "Go away!", "I'm mad now!", "Leave me alone!", "Don't touch me!", "I'm furious!", "Back off!", "Seriously!", "No more!"
];

const petFaces = [
  "(•ᴥ•)", "(❛ᴥ❛)", "(ʕ•ᴥ•ʔ)", "(◕ᴥ◕)", "(=^･ω･^=)", "(=^.^=)", "(＾• ω •＾)", "(•ω•)", "(=^･ｪ･^=)", "(｡･ω･｡)"
];
const petLines = [
  "Yay! Thanks!", "So cute!", "I love pets!", "Keep going!", "Aww!", "More please!", "Feeling loved!", "You're nice!", "Happiness!", "Purrrr!"
];

const feedEmojis = ["🍎", "🍌", "🍪", "🍩", "🍇", "🍉", "🍒", "🥕", "🥨", "🍕"];
const feedFaces = [
  "(っ˘ڡ˘ς)", "(＾～＾)", "(⌒▽⌒)", "(◕‿◕✿)", "(ˆڡˆ)", "(￣～￣)", "(❍ᴥ❍ʋ)", "(╯﹏╰）", "(＾ω＾)", "(＾◡＾)"
];
const feedLines = [
  "Yummy!", "Delicious!", "More please!", "Nom nom!", "Thanks for food!", "Tasty!", "Feeling full!", "So good!", "Feeding time!", "Mmm!"
];

const hackFaces = [
  "(╭ರ_⊙)", "(⌐■_■)", "(◕_◕)", "(⚡_⚡)", "(╯°□°）╯", "(°ロ°)☝", "(•̀o•́)ง", "(◉_◉)", "(¬_¬)", "(ಠ_ಠ)"
];
const hackLines = [
  "Hacking...", "Access granted!", "Bypassing...", "Loading...", "Decrypting...", "Virus alert!", "Firewall down!", "Processing...", "Infiltrating...", "Mission complete!"
];

const sleepFaces = [
  "(≖‿‿≖ Zzz)", "(⇀‿‿↼ Zzz)", "(－_－) zzZ", "(˘﹃˘)", "(ಥ﹏ಥ Zzz)", "(ᴗ˳ᴗ)", "(－.－) zz", "(ღ˘⌣˘ღ)", "(◡‿◡✿)", "(－‸ლ)"
];
const sleepLines = [
  "Zzz...", "I'm sleeping.", "Do not disturb.", "Sweet dreams.", "Shhh...", "Resting now.", "Wake me later.", "Snore...", "Quiet please.", "Time to nap."
];

const doNotTouchFace = "(ノಠ益ಠ)ノ彡┻━┻";
const doNotTouchLines = [
  "I warned you!", "Stop it!", "No more!", "Too far!", "Back away!", "I'm mad!", "Seriously!", "Enough!", "Do not touch!", "Final warning!"
];

let flyingFaces = [];

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function setFace(face, linesArr) {
  faceEl.textContent = face;
  let idx = 0;

  function cycleLines() {
    voiceEl.textContent = linesArr[idx];
    idx = (idx + 1) % linesArr.length;
  }
  cycleLines();
  clearInterval(faceTimeout);
  faceTimeout = setInterval(cycleLines, 3000);
}

function normalCycle() {
  if (isSleeping || isAngry) return;
  const face = randomChoice(normalFaces);
  setFace(face, normalLines);
  const delay = Math.floor(Math.random() * 4000) + 1000;
  clearTimeout(faceTimeout);
  faceTimeout = setTimeout(normalCycle, delay);
}

function onFaceTap() {
  if (isSleeping) return;
  angryTapCount++;
  if (angryTapCount >= 3 && !isAngry) {
    enterAngryMode();
  } else if (!isAngry) {
    setFace("(¬‿¬)", ["Don't poke meee!", "Hey!", "Stop that!", "I'm watching you!", "Cut it out!"]);
  }
  resetAngryTapTimeout();
}

function resetAngryTapTimeout() {
  clearTimeout(angryTapTimeout);
  angryTapTimeout = setTimeout(() => {
    angryTapCount = 0;
  }, 10000);
}

function enterAngryMode() {
  isAngry = true;
  angryTapCount = 0;
  document.body.classList.add("angry");
  setFace(angryFace, angryLines);
  startXPBar();

  // After 10 seconds, calm down
  clearTimeout(angryTimeout);
  angryTimeout = setTimeout(() => {
    exitAngryMode();
  }, 10000);
}

function exitAngryMode() {
  isAngry = false;
  document.body.classList.remove("angry");
  stopXPBar();
  normalCycle();
}

function startXPBar() {
  let progress = 0;
  xpBar.style.height = "0%";
  xpBarContainer.style.display = "flex";
  clearInterval(xpFillInterval);

  xpFillInterval = setInterval(() => {
    progress += 1;
    if (progress > 100) progress = 100;
    xpBar.style.height = progress + "%";
    if (progress >= 100) clearInterval(xpFillInterval);
  }, 100);
}

function stopXPBar() {
  clearInterval(xpFillInterval);
  xpBar.style.height = "0%";
  xpBarContainer.style.display = "none";
}

function updateMoodMeter() {
  if (isAngry) {
    moodMeter.style.height = "10%";
    moodMeter.style.backgroundColor = "#ff0000";
  } else if (isSleeping) {
    moodMeter.style.height = "30%";
    moodMeter.style.backgroundColor = "#006666";
  } else {
    moodMeter.style.height = "90%";
    moodMeter.style.backgroundColor = "#00ffcc";
  }
}

function onPet() {
  if (isSleeping) return;
  const face = randomChoice(petFaces);
  setFace(face, petLines);
}

function onFeed() {
  if (isSleeping) return;
  const face = randomChoice(feedFaces);
  const emoji = randomChoice(feedEmojis);
  setFace(face, feedLines.map(l => emoji + " " + l));
}

function onHack() {
  if (isSleeping) return;
  let idx = 0;
  setFace(hackFaces[idx], [hackLines[idx]]);
  let hackInterval = setInterval(() => {
    idx++;
    if (idx >= hackFaces.length) {
      clearInterval(hackInterval);
      normalCycle();
    } else {
      setFace(hackFaces[idx], [hackLines[idx]]);
    }
  }, 1000);
}

function onSleep() {
  isSleeping = !isSleeping;
  if (isSleeping) {
    clearTimeout(faceTimeout);
    setFace("(≖‿‿≖ Zzz)", sleepLines);
    document.body.classList.remove("angry");
    stopXPBar();
  } else {
    setFace("(¬▃▃¬)", ["I was trying to sleep!", "Leave me alone!", "Finally awake!", "Good morning!", "What now?"]);
    normalCycle();
  }
  updateMoodMeter();
}

function createFlyingFace(face) {
  const ff = document.createElement("div");
  ff.className = "flying-face";
  ff.textContent = face;
  document.body.appendChild(ff);

  ff.style.left = Math.random() * window.innerWidth + "px";
  ff.style.top = Math.random() * window.innerHeight + "px";

  const angle = Math.random() * 2 * Math.PI;
  const speed = 1 + Math.random() * 3;

  let x = parseFloat(ff.style.left);
  let y = parseFloat(ff.style.top);

  function move() {
    x += Math.cos(angle) * speed;
    y += Math.sin(angle) * speed;
    if (x < 0) x = window.innerWidth;
    if (x > window.innerWidth) x = 0;
    if (y < 0) y = window.innerHeight;
    if (y > window.innerHeight) y = 0;
    ff.style.left = x + "px";
    ff.style.top = y + "px";

    if (isAngry) {
      ff.style.color = "#000";
    } else {
      ff.style.color = "#00ffcc";
    }

    requestAnimationFrame(move);
  }
  move();

  flyingFaces.push(ff);
  return ff;
}

function clearFlyingFaces() {
  flyingFaces.forEach(ff => ff.remove());
  flyingFaces = [];
}

function onDoNotTouch() {
  clearTimeout(faceTimeout);
  isSleeping = false;
  isAngry = true;
  angryTapCount = 0;
  document.body.classList.add("angry");
  setFace(doNotTouchFace, doNotTouchLines);
  startXPBar();
  updateMoodMeter();

  // spawn multiple flying angry faces
  clearFlyingFaces();
  for (let i = 0; i < 15; i++) {
    createFlyingFace(angryFace);
  }

  clearTimeout(angryTimeout);
  angryTimeout = setTimeout(() => {
    exitAngryMode();
    clearFlyingFaces();
  }, 10000);
}

function resetAll() {
  clearTimeout(faceTimeout);
  clearTimeout(sleepTimeout);
  clearTimeout(angryTimeout);
  clearTimeout(angryTapTimeout);
  angryTapCount = 0;
  isSleeping = false;
  isAngry = false;
  document.body.classList.remove("angry");
  stopXPBar();
  clearFlyingFaces();
  setFace("(◕‿◕)", normalLines);
  normalCycle();
  updateMoodMeter();
}

// Initial setup
xpBarContainer.style.display = "none";
setFace("(◕‿◕)", normalLines);
normalCycle();
updateMoodMeter();

// Event listeners
faceEl.addEventListener("click", () => {
  onFaceTap();
  updateMoodMeter();
});

document.getElementById("petBtn").addEventListener("click", () => {
  onPet();
  updateMoodMeter();
});
document.getElementById("feedBtn").addEventListener("click", () => {
  onFeed();
  updateMoodMeter();
});
document.getElementById("hackBtn").addEventListener("click", () => {
  onHack();
  updateMoodMeter();
});
document.getElementById("sleepBtn").addEventListener("click", () => {
  onSleep();
  updateMoodMeter();
});
document.getElementById("dontTouchBtn").addEventListener("click", () => {
  onDoNotTouch();
  updateMoodMeter();
});
document.getElementById("exterminateBtn").addEventListener("click", () => {
  resetAll();
  updateMoodMeter();
});
