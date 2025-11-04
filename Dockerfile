# Node.js 이미지 사용
FROM node:18-alpine

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 모든 의존성 설치 (dev dependencies 포함)
RUN npm ci

# 소스 코드 복사
COPY . .

# TypeScript 빌드
RUN npx tsc

# production 의존성만 재설치
RUN npm ci --only=production && npm cache clean --force

# 포트 노출
EXPOSE $PORT

# 애플리케이션 시작
CMD ["npm", "start"]