# Node.js 이미지 사용
FROM node:18-alpine

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci --only=production

# TypeScript를 위한 dev dependencies 설치
RUN npm install typescript @types/node ts-node --save-dev

# 소스 코드 복사
COPY . .

# TypeScript 빌드
RUN npm run build

# 포트 노출
EXPOSE $PORT

# 애플리케이션 시작
CMD ["npm", "start"]