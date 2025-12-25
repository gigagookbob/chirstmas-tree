# 🎄 크리스마스 트리 꾸미기

실시간으로 여러 사람이 함께 하나의 크리스마스 트리를 꾸밀 수 있는 웹앱입니다.

![Demo](https://img.shields.io/badge/Demo-Live-green)
![Node.js](https://img.shields.io/badge/Node.js-18+-brightgreen)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7-blue)

## ✨ 기능

- 🎄 **트리 장식** - 9가지 이모지 장식을 트리에 클릭/터치로 추가
- 💬 **눈송이 메시지** - 메시지가 눈처럼 떨어지는 애니메이션
- ⚡ **실시간 동기화** - 모든 사용자에게 즉시 반영 (Socket.IO)
- 🎵 **배경 음악** - 크리스마스 캐롤 자동 재생
- 📱 **모바일 최적화** - 터치 친화적 UI

## 🚀 시작하기

### 설치

```bash
git clone https://github.com/your-username/christmas-tree.git
cd christmas-tree
npm install
```

### 음악 파일 추가

`public/` 폴더에 `classic-vintage-christmas-jazz.mp3` 파일을 추가하세요.

### 실행

```bash
npm start
```

브라우저에서 `http://localhost:3000` 접속

## 📁 프로젝트 구조

```
christmas-tree/
├── server.js           # Express + Socket.IO 서버
├── package.json        # 의존성
└── public/
    ├── index.html      # 메인 HTML
    ├── styles.css      # 크리스마스 테마 CSS
    ├── app.js          # 클라이언트 로직
    └── *.mp3           # 배경 음악 (직접 추가 필요)
```

## 🛠️ 기술 스택

- **Backend**: Node.js, Express, Socket.IO
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Real-time**: WebSocket

## 🌐 배포

Railway, Render, Fly.io 등 Node.js를 지원하는 플랫폼에 배포 가능합니다.

### Railway 배포

1. [railway.app](https://railway.app) 가입
2. GitHub 레포 연결
3. 자동 배포 완료!

## 📝 라이선스

MIT License

---

Made with ❤️ for Christmas 2025 🎅
