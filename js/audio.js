const audio = document.getElementById('audioTag');
const playPauseBtn = document.getElementById('playPause');
const progressBar = document.getElementById('progress');
const progressTotal = document.getElementById('progress-total');
const playedTime = document.getElementById('playedTime');
const audioTime = document.getElementById('audioTime');
const skipPrev = document.getElementById('skipForward');
const skipNext = document.getElementById('skipBackward');
const volumeIcon = document.getElementById('volume');
const volumeSlider = document.getElementById('volumn-togger');
const speedBtn = document.getElementById('speed');
const playModeBtn = document.getElementById('playMode');
const recordImg = document.getElementById('record-img');
const musicTitle = document.getElementById('music-title');
const authorName = document.getElementById('author-name');
const listBtn = document.getElementById('list');
const musicList = document.getElementById('music-list');
const allListItems = document.querySelectorAll('.all-list div');

const mvBtn = document.getElementById('MV');
const mvMask = document.getElementById('mvMask');
const mvVideo = document.getElementById('mv-video');
const mvClose = document.getElementById('mvClose');

let isPlaying = false;
let syncMV = false;
let isVideoSeeking = false;

const musicData = [
  { title: "SPIRAL", author: "longman", url: "./music/spiral.MP3", bgImg: "./img/bg0.png", albumImg: "./img/record1.jpg", songTime: 90, videoTime: 89, mvUrl: "./video/spiral.mp4" },
  { title: "Test ME", author: "chanmina", url: "./music/testme.MP3", bgImg: "./img/bg2.png", albumImg: "./img/record2.jpg", songTime: 90, videoTime: 125, mvUrl: "./video/testme.mp4" },
  { title: "風のたより", author: "tayori", url: "./music/wind.mp3", bgImg: "./img/bg3.png", albumImg: "./img/record3.jpg", songTime: 240, videoTime: 338, mvUrl: "./video/video0.mp4" },
  { title: "Coming Home", author: "Diddy", url: "./music/music1.mp3", bgImg: "./img/bg1.png", albumImg: "./img/record4.jpg", songTime: 191, videoTime: 218, mvUrl: "./video/video3.mp4" }
];

let currentIndex = 0;
let nowSongTime = musicData[0].songTime;
let volumeVisible = false;
let playMode = 0;
let speed = 1.0;
let isDragging = false;

const BG_CHANGE_INTERVAL = 20000;
let bgTimer = null;

let tooltip = null;
function createTooltip() {
  tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  document.body.appendChild(tooltip);
}
function showTooltip(el, text) {
  if (!tooltip) createTooltip();
  tooltip.innerText = text;
  const rect = el.getBoundingClientRect();
  tooltip.style.left = rect.left + rect.width / 2 + 'px';
  tooltip.style.top = rect.top + 'px';
  tooltip.classList.add('show');
}
function hideTooltip() {
  if (tooltip) tooltip.classList.remove('show');
}

// 初始化默认图标
playModeBtn.style.backgroundImage = "url('./img/mode1.png')";

loadMusic(currentIndex);
startAutoBgChange();

function loadMusic(index) {
  currentIndex = index;
  const data = musicData[index];
  audio.src = data.url;
  musicTitle.innerText = data.title;
  authorName.innerText = data.author;
  recordImg.style.backgroundImage = `url('${data.albumImg}')`;
  document.body.style.backgroundImage = `url('${data.bgImg}')`;
  nowSongTime = data.songTime;
  allListItems.forEach((item, i) => {
    item.style.color = i === index ? "#fff" : "#ccc";
  });
  updateProgress();
  recordImg.classList.remove('rotate-play');
}

function startAutoBgChange() {
  if (bgTimer) clearInterval(bgTimer);
  bgTimer = setInterval(() => {
    let rand = Math.floor(Math.random() * musicData.length);
    document.body.style.backgroundImage = `url('${musicData[rand].bgImg}')`;
  }, BG_CHANGE_INTERVAL);
}

audio.addEventListener('timeupdate', () => {
  if (isDragging || isVideoSeeking) return;
  let t = audio.currentTime;
  const p = (t / nowSongTime) * 100;
  progressBar.style.width = p + '%';
  progressTotal.style.setProperty('--percent', p + '%');
  playedTime.innerText = formatTime(Math.floor(t));
  audioTime.innerText = formatTime(nowSongTime);
  if(syncMV) audio.muted = t >= nowSongTime;
});

audio.addEventListener('ended', () => {
  if (syncMV) {
    audio.pause(); isPlaying = false;
    playPauseBtn.classList.remove('icon-pause');
    recordImg.classList.remove('rotate-play');
    return;
  }
  if (playMode === 0) {
    audio.currentTime = 0; audio.play();
    isPlaying = true;
    playPauseBtn.classList.add('icon-pause');
    recordImg.classList.add('rotate-play');
  } else nextMusic();
});

function togglePlay() {
  if (isPlaying) {
    audio.pause();
    playPauseBtn.classList.remove('icon-pause');
    recordImg.classList.remove('rotate-play');
  } else {
    audio.play();
    playPauseBtn.classList.add('icon-pause');
    recordImg.classList.add('rotate-play');
  }
  isPlaying = !isPlaying;
}

function prevMusic() {
  let idx;
  if (playMode === 2) do { idx = Math.floor(Math.random() * musicData.length); } while (idx === currentIndex);
  else idx = (currentIndex - 1 + musicData.length) % musicData.length;
  loadMusic(idx);
  if (isPlaying) autoPlay();
}

function nextMusic() {
  let idx;
  if (playMode === 2) do { idx = Math.floor(Math.random() * musicData.length); } while (idx === currentIndex);
  else idx = (currentIndex + 1) % musicData.length;
  loadMusic(idx);
  if (isPlaying) autoPlay();
}

function autoPlay() {
  audio.play(); isPlaying = true;
  playPauseBtn.classList.add('icon-pause');
  recordImg.classList.add('rotate-play');
  audio.playbackRate = speed;
}

function formatTime(t) {
  const m = String(Math.floor(t / 60)).padStart(2, '0');
  const s = String(t % 60).padStart(2, '0');
  return `${m}:${s}`;
}

progressTotal.addEventListener('click', (e) => {
  const r = progressTotal.getBoundingClientRect();
  const pos = (e.clientX - r.left) / r.width;
  audio.currentTime = pos * nowSongTime;
});
progressTotal.addEventListener('mousedown', () => { isDragging = true; });
document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const r = progressTotal.getBoundingClientRect();
  const pos = (e.clientX - r.left) / r.width;
  let t = pos * nowSongTime;
  if (t < 0) t = 0; if (t > nowSongTime) t = nowSongTime;
  const p = (t / nowSongTime) * 100;
  progressBar.style.width = p + '%';
  progressTotal.style.setProperty('--percent', p + '%');
  playedTime.innerText = formatTime(Math.floor(t));
});
document.addEventListener('mouseup', () => {
  if (isDragging) {
    isDragging = false;
    const r = progressTotal.getBoundingClientRect();
    const pos = (event.clientX - r.left) / r.width;
    audio.currentTime = pos * nowSongTime;
  }
});

// 播放模式切换
function togglePlayMode() {
  playMode = (playMode + 1) % 3;
  switch(playMode){
    case 0: playModeBtn.style.backgroundImage = "url('./img/mode1.png')"; break;
    case 1: playModeBtn.style.backgroundImage = "url('./img/mode2.png')"; break;
    case 2: playModeBtn.style.backgroundImage = "url('./img/mode3.png')"; break;
  }
}

function toggleVolume() {
  volumeVisible = !volumeVisible;
  volumeSlider.style.display = volumeVisible ? 'block' : 'none';
}

// 音量调节
volumeSlider.addEventListener('input', () => {
  audio.volume = volumeSlider.value / 100;
  
  if (volumeSlider.value == 0) {
    volumeIcon.style.backgroundImage = "url('./img/静音.png')";
  } else {
    volumeIcon.style.backgroundImage = "url('./img/音量.png')";
  }
});

function toggleSpeed() {
  const sp = [1.0, 1.2, 1.5, 2.0];
  let i = sp.indexOf(speed);
  i = (i + 1) % sp.length;
  speed = sp[i];
  audio.playbackRate = speed;
  speedBtn.innerText = speed.toFixed(1) + 'X';
}

function toggleList() {
  musicList.classList.toggle('show');
}

allListItems.forEach((el, i) => {
  el.addEventListener('click', () => {
    loadMusic(i); autoPlay();
  });
});

// MV 相关
mvBtn.addEventListener('click', () => {
  mvMask.classList.add('show');
  syncMV = true;
  mvVideo.src = musicData[currentIndex].mvUrl;
  mvVideo.load();
  mvVideo.addEventListener('loadedmetadata', () => {
    mvVideo.currentTime = audio.currentTime;
    mvVideo.play();
    if (!isPlaying) {
      audio.play(); isPlaying = true;
      playPauseBtn.classList.add('icon-pause');
      recordImg.classList.add('rotate-play');
    }
  }, { once: true });
});
mvClose.addEventListener('click', () => {
  mvMask.classList.remove('show');
  mvVideo.pause(); mvVideo.src = '';
  syncMV = false; audio.muted = false; isVideoSeeking = false;
});
mvVideo.addEventListener('play', () => {
  if (!syncMV) return;
  if (!isPlaying) { audio.play(); isPlaying = true; playPauseBtn.classList.add('icon-pause'); recordImg.classList.add('rotate-play'); }
});
mvVideo.addEventListener('pause', () => {
  if (!syncMV) return;
  if (isPlaying) { audio.pause(); isPlaying = false; playPauseBtn.classList.remove('icon-pause'); recordImg.classList.remove('rotate-play'); }
});
mvVideo.addEventListener('seeking', () => { isVideoSeeking = true; });
mvVideo.addEventListener('seeked', () => {
  if (!syncMV) return;
  isVideoSeeking = false;
  audio.currentTime = mvVideo.currentTime;
  audio.muted = mvVideo.currentTime >= nowSongTime;
});

// 鼠标提示
function bindTooltip(el, textFn) {
  el.addEventListener('mouseenter', () => showTooltip(el, textFn()));
  el.addEventListener('mouseleave', hideTooltip);
}
bindTooltip(playModeBtn, () => {
  switch(playMode){ case 0: return "单曲循环"; case 1: return "顺序循环"; case 2: return "随机播放"; }
});
bindTooltip(skipPrev, () => '上一首');
bindTooltip(playPauseBtn, () => isPlaying ? '暂停' : '播放');
bindTooltip(skipNext, () => '下一首');
bindTooltip(volumeIcon, () => '音量调节');
bindTooltip(speedBtn, () => `播放倍速：${speed.toFixed(1)}倍`);
bindTooltip(listBtn, () => '打开播放列表');
bindTooltip(mvBtn, () => '全屏播放MV');

// 事件绑定
playPauseBtn.addEventListener('click', togglePlay);
skipPrev.addEventListener('click', prevMusic);
skipNext.addEventListener('click', nextMusic);
playModeBtn.addEventListener('click', togglePlayMode);
volumeIcon.addEventListener('click', toggleVolume);
speedBtn.addEventListener('click', toggleSpeed);
listBtn.addEventListener('click', toggleList);

function updateProgress() {
  const t = Math.floor(audio.currentTime);
  const p = (t / nowSongTime) * 100;
  progressBar.style.width = p + '%';
  progressTotal.style.setProperty('--percent', p + '%');
  playedTime.innerText = formatTime(t);
  audioTime.innerText = formatTime(nowSongTime);
}
