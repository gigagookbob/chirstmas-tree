/**
 * 🎄 크리스마스 트리 꾸미기 - 클라이언트 앱
 */

// ============================================
// 초기화
// ============================================

// 사용자 ID 생성 또는 로드 (localStorage 사용)
function getUserId() {
  let userId = localStorage.getItem('uid');
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem('uid', userId);
    console.log('🆕 새 사용자 ID 생성:', userId);
  } else {
    console.log('👤 기존 사용자 ID 로드:', userId);
  }
  return userId;
}

const userId = getUserId();
const socket = io({
  query: { userId }
});

// DOM 요소
const treeContainer = document.getElementById('treeContainer');
const tree = document.getElementById('tree');
const decorationsLayer = document.getElementById('decorationsLayer');
const decorationPanel = document.getElementById('decorationPanel');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const messagesContainer = document.getElementById('messagesContainer');
const snowContainer = document.getElementById('snowContainer');
const draggingDecoration = document.getElementById('draggingDecoration');

// 음악 관련 요소
const bgMusic = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');
const musicControl = document.getElementById('musicControl');
const volumeSlider = document.getElementById('volumeSlider');
const startOverlay = document.getElementById('startOverlay');
const startBtn = document.getElementById('startBtn');

// 상태
let selectedEmoji = '⭐';
let isDragging = false;
let dragStartPos = { x: 0, y: 0 };
let isMusicPlaying = false;

// ============================================
// 음악 컨트롤
// ============================================

function initMusic() {
  // 초기 볼륨 설정 (최대)
  bgMusic.volume = 1.0;
  
  // iOS 오디오 초기화를 위한 로드
  bgMusic.load();
  
  // iOS AudioContext 잠금 해제 함수
  const unlockAudio = () => {
    // AudioContext 생성 및 활성화
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      const audioCtx = new AudioContext();
      const source = audioCtx.createBufferSource();
      source.buffer = audioCtx.createBuffer(1, 1, 22050);
      source.connect(audioCtx.destination);
      source.start(0);
      audioCtx.resume();
    }
  };
  
  // 시작 함수 (모바일 호환)
  const startExperience = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // iOS AudioContext 잠금 해제
    unlockAudio();
    
    // 오디오 재생 시도 (여러 방법)
    const tryPlay = () => {
      // 방법 1: 기존 audio 엘리먼트 사용
      bgMusic.play().then(() => {
        isMusicPlaying = true;
        musicToggle.classList.add('playing');
        updateMusicIcon();
        console.log('🎵 음악 재생 시작 (방법 1)');
      }).catch(err => {
        console.log('방법 1 실패:', err);
        
        // 방법 2: 새 Audio 객체 생성
        const newAudio = new Audio('https://files.catbox.moe/y8ix0p.mp3');
        newAudio.loop = true;
        newAudio.volume = 1.0;
        newAudio.play().then(() => {
          // 성공하면 기존 엘리먼트 교체
          bgMusic.pause();
          bgMusic.src = newAudio.src;
          bgMusic.play();
          isMusicPlaying = true;
          musicToggle.classList.add('playing');
          updateMusicIcon();
          console.log('🎵 음악 재생 시작 (방법 2)');
        }).catch(e => {
          console.log('방법 2도 실패:', e);
        });
      });
    };
    
    tryPlay();
    startOverlay.classList.add('hidden');
  };
  
  // 시작 버튼 - 클릭과 터치 모두 지원
  startBtn.addEventListener('click', startExperience);
  startBtn.addEventListener('touchend', startExperience);
  
  // 오버레이 클릭/터치
  startOverlay.addEventListener('click', (e) => {
    if (e.target === startOverlay) {
      startExperience(e);
    }
  });
  startOverlay.addEventListener('touchend', (e) => {
    if (e.target === startOverlay) {
      startExperience(e);
    }
  });
  
  // 재생/일시정지 토글
  musicToggle.addEventListener('click', toggleMusic);
  musicToggle.addEventListener('touchend', (e) => {
    e.preventDefault();
    toggleMusic();
  });
  
  // 볼륨 조절
  volumeSlider.addEventListener('input', (e) => {
    bgMusic.volume = e.target.value / 100;
    updateMusicIcon();
  });
  
  // 오디오 재생 상태 변경 감지
  bgMusic.addEventListener('play', () => {
    isMusicPlaying = true;
    musicToggle.classList.add('playing');
    updateMusicIcon();
  });
  
  bgMusic.addEventListener('pause', () => {
    isMusicPlaying = false;
    musicToggle.classList.remove('playing');
    updateMusicIcon();
  });
}

function toggleMusic() {
  if (isMusicPlaying) {
    pauseMusic();
  } else {
    playMusic();
  }
}

function playMusic() {
  bgMusic.play().then(() => {
    isMusicPlaying = true;
    musicToggle.classList.add('playing');
    updateMusicIcon();
  }).catch(err => {
    console.log('음악 재생 실패:', err);
  });
}

function pauseMusic() {
  bgMusic.pause();
  isMusicPlaying = false;
  musicToggle.classList.remove('playing');
  updateMusicIcon();
}

function updateMusicIcon() {
  const volume = bgMusic.volume;
  if (!isMusicPlaying || volume === 0) {
    musicToggle.textContent = '🔇';
  } else if (volume < 0.5) {
    musicToggle.textContent = '🔉';
  } else {
    musicToggle.textContent = '🔊';
  }
}

// ============================================
// 눈 내리는 효과
// ============================================

function createSnowflakes() {
  const snowflakes = ['❄', '❅', '❆', '✦', '✧'];
  const count = Math.min(30, Math.floor(window.innerWidth / 30));
  
  for (let i = 0; i < count; i++) {
    createSnowflake(snowflakes);
  }
}

function createSnowflake(snowflakes) {
  const snowflake = document.createElement('div');
  snowflake.className = 'snowflake';
  snowflake.textContent = snowflakes[Math.floor(Math.random() * snowflakes.length)];
  
  // 랜덤 속성
  const startX = Math.random() * 100;
  const duration = 8 + Math.random() * 12;
  const delay = Math.random() * 10;
  const size = 0.5 + Math.random() * 1;
  
  snowflake.style.cssText = `
    left: ${startX}%;
    animation-duration: ${duration}s;
    animation-delay: ${delay}s;
    font-size: ${size}rem;
    opacity: ${0.3 + Math.random() * 0.5};
  `;
  
  snowContainer.appendChild(snowflake);
  
  // 애니메이션 끝나면 재생성
  snowflake.addEventListener('animationend', () => {
    snowflake.remove();
    createSnowflake(['❄', '❅', '❆', '✦', '✧']);
  });
}

// ============================================
// 장식 선택 패널
// ============================================

decorationPanel.addEventListener('click', (e) => {
  const btn = e.target.closest('.decoration-btn');
  if (!btn) return;
  
  // 이전 선택 해제
  document.querySelectorAll('.decoration-btn').forEach(b => b.classList.remove('selected'));
  
  // 새 선택
  btn.classList.add('selected');
  selectedEmoji = btn.dataset.emoji;
});

// 드래그 시작 (데스크톱)
decorationPanel.addEventListener('mousedown', (e) => {
  const btn = e.target.closest('.decoration-btn');
  if (!btn) return;
  
  startDrag(btn.dataset.emoji, e.clientX, e.clientY);
});

// 드래그 시작 (모바일)
decorationPanel.addEventListener('touchstart', (e) => {
  const btn = e.target.closest('.decoration-btn');
  if (!btn) return;
  
  const touch = e.touches[0];
  startDrag(btn.dataset.emoji, touch.clientX, touch.clientY);
}, { passive: true });

function startDrag(emoji, x, y) {
  isDragging = true;
  selectedEmoji = emoji;
  dragStartPos = { x, y };
  
  draggingDecoration.textContent = emoji;
  draggingDecoration.classList.add('active');
  updateDragPosition(x, y);
}

// ============================================
// 드래그 이동 및 드롭
// ============================================

document.addEventListener('mousemove', (e) => {
  if (isDragging) {
    updateDragPosition(e.clientX, e.clientY);
  }
});

document.addEventListener('touchmove', (e) => {
  if (isDragging && e.touches.length > 0) {
    const touch = e.touches[0];
    updateDragPosition(touch.clientX, touch.clientY);
  }
}, { passive: true });

function updateDragPosition(x, y) {
  draggingDecoration.style.left = x + 'px';
  draggingDecoration.style.top = y + 'px';
}

document.addEventListener('mouseup', (e) => {
  if (isDragging) {
    endDrag(e.clientX, e.clientY);
  }
});

document.addEventListener('touchend', (e) => {
  if (isDragging && e.changedTouches.length > 0) {
    const touch = e.changedTouches[0];
    endDrag(touch.clientX, touch.clientY);
  }
});

function endDrag(x, y) {
  isDragging = false;
  draggingDecoration.classList.remove('active');
  
  // 트리 영역 확인
  const treeRect = tree.getBoundingClientRect();
  
  if (isPointInTree(x, y, treeRect)) {
    // 트리 내 상대 위치 계산 (%)
    const relativeX = ((x - treeRect.left) / treeRect.width) * 100;
    const relativeY = ((y - treeRect.top) / treeRect.height) * 100;
    
    addDecoration(selectedEmoji, relativeX, relativeY);
  }
}

// ============================================
// 트리 클릭으로 장식 추가
// ============================================

tree.addEventListener('click', (e) => {
  // 드래그 중이면 무시
  if (isDragging) return;
  
  const rect = tree.getBoundingClientRect();
  const x = e.clientX;
  const y = e.clientY;
  
  if (isPointInTree(x, y, rect)) {
    const relativeX = ((x - rect.left) / rect.width) * 100;
    const relativeY = ((y - rect.top) / rect.height) * 100;
    
    addDecoration(selectedEmoji, relativeX, relativeY);
  }
});

// 터치 지원
tree.addEventListener('touchend', (e) => {
  if (isDragging) return;
  
  const touch = e.changedTouches[0];
  const rect = tree.getBoundingClientRect();
  const x = touch.clientX;
  const y = touch.clientY;
  
  if (isPointInTree(x, y, rect)) {
    const relativeX = ((x - rect.left) / rect.width) * 100;
    const relativeY = ((y - rect.top) / rect.height) * 100;
    
    addDecoration(selectedEmoji, relativeX, relativeY);
  }
});

// 트리 영역 내부인지 확인 (삼각형 형태에 정확히 맞춤, 줄기 제외)
function isPointInTree(x, y, rect) {
  const relX = (x - rect.left) / rect.width;  // 0~1 범위
  const relY = (y - rect.top) / rect.height;  // 0~1 범위
  
  // SVG viewBox: 200x280 기준
  // 트리 본체: y 8%~70% (별 아래 ~ 줄기 위, 줄기 완전 제외)
  if (relY < 0.08 || relY > 0.70) return false;
  
  // 삼각형 형태 정밀 계산
  // 위로 갈수록 중앙으로 좁아짐
  const centerX = 0.5;
  
  // y 위치에 따른 트리 반폭 계산 (SVG 좌표 기반)
  // 상단(y=0.08): 폭 약 ±8%
  // 하단(y=0.70): 폭 약 ±35%
  const normalizedY = (relY - 0.08) / 0.62;  // 0~1로 정규화
  const halfWidth = 0.08 + (normalizedY * 0.27);  // 8%~35%
  
  return Math.abs(relX - centerX) <= halfWidth;
}

// ============================================
// 장식 추가 함수
// ============================================

function addDecoration(emoji, x, y) {
  const decoration = {
    id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
    emoji,
    x,
    y
  };
  
  // 서버에 전송
  socket.emit('add-decoration', decoration);
}

function renderDecoration(decoration) {
  const el = document.createElement('div');
  el.className = 'decoration';
  el.textContent = decoration.emoji;
  el.style.left = decoration.x + '%';
  el.style.top = decoration.y + '%';
  el.dataset.id = decoration.id;
  
  decorationsLayer.appendChild(el);
}

// ============================================
// 메시지 전송 (rate limit 적용 + 시각적 피드백)
// ============================================

let lastMessageTime = 0;
const MESSAGE_COOLDOWN = 3000; // 3초 쿨다운
let isCooldown = false;

function sendMessage() {
  const text = messageInput.value.trim();
  if (!text || isCooldown) return;
  
  lastMessageTime = Date.now();
  socket.emit('send-message', { text });
  messageInput.value = '';
  
  // 쿨다운 시작
  startCooldown();
}

function startCooldown() {
  isCooldown = true;
  sendBtn.disabled = true;
  sendBtn.classList.add('cooldown');
  
  let remaining = MESSAGE_COOLDOWN;
  
  // 프로그레스 바 업데이트
  const updateProgress = () => {
    const progress = (MESSAGE_COOLDOWN - remaining) / MESSAGE_COOLDOWN;
    sendBtn.style.background = `linear-gradient(90deg, 
      var(--accent-red) ${progress * 100}%, 
      rgba(139, 0, 0, 0.3) ${progress * 100}%)`;
  };
  
  updateProgress();
  
  const interval = setInterval(() => {
    remaining -= 50;
    
    if (remaining <= 0) {
      clearInterval(interval);
      isCooldown = false;
      sendBtn.disabled = false;
      sendBtn.classList.remove('cooldown');
      sendBtn.style.background = '';
    } else {
      updateProgress();
    }
  }, 50);
}

sendBtn.addEventListener('click', sendMessage);

messageInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    sendMessage();
  }
});

function renderFallingMessage(message) {
  const el = document.createElement('div');
  el.className = 'falling-message';
  el.textContent = message.text;
  
  // 모바일 대응: X 위치를 5~75% 범위로 제한
  const safeX = Math.max(5, Math.min(75, message.x));
  el.style.left = safeX + '%';
  
  messagesContainer.appendChild(el);
  
  // 애니메이션 끝나면 제거
  el.addEventListener('animationend', () => {
    el.remove();
  });
}

// ============================================
// Socket.IO 이벤트 핸들러
// ============================================

// 초기 장식 로드
socket.on('init-decorations', (decorations) => {
  decorations.forEach(renderDecoration);
  console.log(`🎄 ${decorations.length}개의 장식을 로드했습니다.`);
});

// 새 장식 추가됨
socket.on('decoration-added', (decoration) => {
  renderDecoration(decoration);
});

// 메시지 수신
socket.on('message-received', (message) => {
  renderFallingMessage(message);
});

// 연결 상태
socket.on('connect', () => {
  console.log('🎄 서버에 연결되었습니다!');
});

socket.on('disconnect', () => {
  console.log('❌ 서버 연결이 끊어졌습니다.');
});

// ============================================
// 앱 시작
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  createSnowflakes();
  initMusic();
  console.log('🎄 크리스마스 트리 앱이 시작되었습니다!');
});
