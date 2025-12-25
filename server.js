const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// 오디오 캐시 (메모리)
const AUDIO_URL = 'https://files.catbox.moe/y8ix0p.mp3';
let audioCache = null;
let audioCacheLoading = false;

// 서버 시작 시 오디오 미리 로드
async function preloadAudio() {
  if (audioCache || audioCacheLoading) return;
  
  audioCacheLoading = true;
  console.log('🎵 오디오 파일 미리 로딩 중...');
  
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(AUDIO_URL);
    const buffer = await response.buffer();
    audioCache = buffer;
    console.log(`🎵 오디오 캐시 완료! (${(buffer.length / 1024 / 1024).toFixed(1)}MB)`);
  } catch (err) {
    console.error('오디오 캐시 실패:', err);
  }
  
  audioCacheLoading = false;
}

// 오디오 프록시 (캐시 사용)
app.get('/audio/music.mp3', async (req, res) => {
  // 캐시가 없으면 먼저 로드
  if (!audioCache && !audioCacheLoading) {
    await preloadAudio();
  }
  
  // 캐시 로딩 중이면 대기
  while (audioCacheLoading && !audioCache) {
    await new Promise(r => setTimeout(r, 100));
  }
  
  if (audioCache) {
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioCache.length,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=86400',
      'Accept-Ranges': 'bytes'
    });
    res.send(audioCache);
  } else {
    res.status(500).send('Audio not available');
  }
});

// 정적 파일 서빙
app.use(express.static(path.join(__dirname, 'public')));

// In-memory 데이터 저장소
let decorations = [];
const MAX_DECORATIONS = 200; // 최대 장식 개수

// Socket.IO 연결 처리
io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId || socket.id;
  console.log('🎄 사용자 연결:', userId);
  
  // 새 사용자에게 기존 장식 전송
  socket.emit('init-decorations', decorations);
  
  // 장식 추가 이벤트
  socket.on('add-decoration', (decoration) => {
    // 최대 개수 제한
    if (decorations.length >= MAX_DECORATIONS) {
      decorations.shift(); // 가장 오래된 것 제거
    }
    
    // 클릭한 위치 그대로 저장 (겹침 허용)
    decorations.push(decoration);
    
    // 모든 클라이언트에 브로드캐스트
    io.emit('decoration-added', decoration);
  });
  
  // 메시지 rate limit 추적
  let lastMessageTime = 0;
  const MESSAGE_COOLDOWN = 3000; // 3초
  
  // 메시지 전송 이벤트 (rate limit 적용)
  socket.on('send-message', (message) => {
    const now = Date.now();
    
    // Rate limit 체크
    if (now - lastMessageTime < MESSAGE_COOLDOWN) {
      console.log(`⚠️ Rate limit: ${socket.id}`);
      return; // 무시
    }
    
    lastMessageTime = now;
    
    const messageData = {
      id: now + '-' + Math.random().toString(36).substr(2, 9),
      text: message.text.slice(0, 50), // 최대 50자
      x: Math.random() * 80 + 10,
      timestamp: now
    };
    
    // 모든 클라이언트에 브로드캐스트
    io.emit('message-received', messageData);
    console.log(`💬 메시지: "${messageData.text}"`);
  });
  
  socket.on('disconnect', () => {
    console.log('👋 사용자 연결 해제:', userId);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🎄 크리스마스 트리 서버가 http://localhost:${PORT} 에서 실행 중!`);
  // 서버 시작 시 오디오 미리 로드
  preloadAudio();
});
