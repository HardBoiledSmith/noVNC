# DEV-22770 Session Cleanup Server

## 개요
Session Cleanup Server는 Windows 환경에서 원격 데스크톱 세션(VNC 기반)이 시작되거나 종료될 때 실행 중인 애플리케이션을 자동으로 정리하는 도구입니다. 이 서버는 HTTP 엔드포인트를 통해 원격 명령을 받아 Microsoft Teams, Excel, PowerPoint, Word, Chrome, Explorer와 같은 프로세스를 종료하고 필요한 경우 Explorer를 다시 시작합니다.

## 주요 파일

### 1. run_server.js
Node.js 기반의 HTTP 서버로, 원격 명령을 수신하여 Windows 애플리케이션을 정리합니다.

주요 기능:
- `/cleanup-session` 엔드포인트를 통해 프로세스 정리 명령 수신
- taskkill 명령을 사용하여 지정된 애플리케이션 프로세스 종료
- Explorer를 다시 시작하여 Windows 환경 복구

### 2. ecosystem.config.js
PM2(프로세스 매니저) 설정 파일로, 서버 실행 환경을 정의합니다.

주요 설정:
- 서버 이름: "session cleanup server"
- 스크립트 경로: "./run_server.js"
- 환경 변수 (개발/프로덕션)
- 로그 파일 경로
- 자동 재시작 설정

### 3. ui.js
noVNC 클라이언트 코드로, 이 파일의 일부에는 VNC 세션이 연결되거나 종료될 때 cleanup 서버를 호출하는 로직이 포함되어 있습니다.

## 작동 방식
1. noVNC 클라이언트(웹 기반 VNC 뷰어)가 원격 데스크톱에 연결하거나 연결을 종료할 때
2. HTTP POST 요청을 cleanup 서버의 `/cleanup-session` 엔드포인트로 전송
3. 서버는 지정된 애플리케이션 프로세스를 종료하고 필요한 경우 Explorer를 다시 시작
4. 이 과정을 통해 새로운 사용자 세션이 시작될 때 깨끗한 환경을 제공

## 설치 및 실행 방법

### 필수 요구사항
- Node.js
- PM2 (글로벌 설치 권장)
- Windows 환경 (taskkill 명령 사용)

### 설치
1. 저장소 클론 또는 파일 다운로드
```bash
git clone <repository-url>
cd <repository-directory>
npm install
```

2. PM2 글로벌 설치 (아직 설치하지 않은 경우)
```bash
npm install -g pm2
```

### 서버 실행
PM2를 사용하여 서버 실행:
```bash
pm2 start ecosystem.config.js
```

개발 환경에서 직접 실행:
```bash
node run_server.js
```

### 서버 관리
PM2 명령으로 서버 관리:
```bash
# 서버 상태 확인
pm2 status

# 로그 확인
pm2 logs "session cleanup server"

# 서버 중지
pm2 stop "session cleanup server"

# 서버 재시작
pm2 restart "session cleanup server"
```

## 포트 설정
기본적으로 서버는 3000번 포트에서 실행됩니다. 이는 다음 방법으로 변경할 수 있습니다:

1. `ecosystem.config.js` 파일에서 환경 변수 수정
2. 직접 실행 시 환경 변수 설정: `PORT=3001 node run_server.js`

## 보안 고려사항
- 이 서버는 기본적으로 인증 없이 실행되므로 내부 네트워크에서만 접근 가능하도록 설정하는 것이 좋습니다.
- 프로덕션 환경에서는 인증 메커니즘 추가를 고려하세요.
- 방화벽 설정으로 해당 포트에 대한 접근을 제한하는 것이 권장됩니다.

## noVNC와의 통합
`ui.js` 파일을 보면, VNC 클라이언트는 연결 시점과 연결 종료 시점에 자동으로 cleanup 서버를 호출합니다. 이 호출은 VNC 서버가 실행 중인 포트 번호에 1000을 더한 포트에서 cleanup 서버가 실행 중이라고 가정합니다.

예: VNC 서버가 80번 포트에서 실행 중이라면, cleanup 서버는 1080번 포트에서 실행되어야 합니다.

## 문제 해결
- 로그 파일은 `logs/err.log`와 `logs/out.log`에서 확인할 수 있습니다.
- "Process not found" 메시지는 종료하려는 프로세스가 이미 실행 중이지 않은 경우 정상적으로 표시됩니다.
- Explorer 재시작이 실패하는 경우 수동으로 `explorer.exe`를 실행해야 할 수 있습니다.
