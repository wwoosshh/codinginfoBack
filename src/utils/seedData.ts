import Article, { Category } from '../models/Article';
import User from '../models/User';

export const seedData = async () => {
  try {
    const articleCount = await Article.countDocuments();
    const userCount = await User.countDocuments();

    if (articleCount === 0) {
      console.log('Seeding articles...');

      const articles = [
        {
          title: '오버플로우는 왜 일어날까?',
          description: '프로그래밍에서 가장 흔히 발생하는 오버플로우 현상에 대해 알아보고, 이를 방지하는 방법들을 살펴봅니다.',
          content: `# 오버플로우는 왜 일어날까?

## 오버플로우란?

오버플로우(Overflow)는 컴퓨터 프로그래밍에서 데이터 타입이 저장할 수 있는 최대값을 초과할 때 발생하는 현상입니다.

## 정수 오버플로우

가장 흔한 예는 정수 오버플로우입니다:

\`\`\`c
#include <stdio.h>
#include <limits.h>

int main() {
    int max_int = INT_MAX;
    printf("최대값: %d\\n", max_int);
    printf("최대값 + 1: %d\\n", max_int + 1); // 오버플로우 발생!
    return 0;
}
\`\`\`

## 왜 발생할까?

1. **고정된 비트 수**: 각 데이터 타입은 고정된 비트 수를 가짐
2. **2의 보수 표현**: 음수 표현을 위한 방식
3. **순환적 특성**: 최대값을 넘으면 최소값으로 되돌아감

## 방지 방법

- 입력 값 검증
- 더 큰 데이터 타입 사용
- 라이브러리 활용 (예: BigInteger)
- 연산 전 범위 체크

오버플로우는 보안 취약점의 원인이 될 수 있으므로 항상 주의해야 합니다.`,
          category: Category.OVERFLOW,
          categoryDisplayName: '오버플로우',
          slug: 'why-does-overflow-happen',
          imageUrl: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=800&h=400&fit=crop',
        },
        {
          title: '버니합이 게임에 나타나는 이유',
          description: 'FPS 게임에서 자주 볼 수 있는 버니합(Bunny Hopping) 현상의 물리학적 원리와 프로그래밍적 구현을 살펴봅니다.',
          content: `# 버니합이 게임에 나타나는 이유

## 버니합이란?

버니합(Bunny Hopping)은 FPS 게임에서 플레이어가 연속적으로 점프하면서 이동 속도를 증가시키는 기법입니다.

## 물리학적 원리

### 벡터 합성
\`\`\`
총 속도 = 수평 속도 + 수직 속도
\`\`\`

### 에어 스트레이핑
공중에서 마우스 움직임과 키 입력의 조합으로 가속도를 얻습니다.

## 프로그래밍 구현

\`\`\`javascript
// 게임 엔진에서의 이동 계산
function calculateMovement(input, currentVelocity) {
    if (isOnGround) {
        // 지상에서의 마찰력 적용
        velocity *= groundFriction;
    } else {
        // 공중에서의 에어 컨트롤
        velocity += airAcceleration * input;
    }

    // 최대 속도 제한 (버그로 인해 누락되는 경우가 있음)
    if (velocity.magnitude > maxSpeed) {
        velocity = velocity.normalized * maxSpeed;
    }
}
\`\`\`

## 왜 발생하는가?

1. **물리 엔진의 근사치**: 실제 물리학과 게임 물리학의 차이
2. **프레임 레이트 의존성**: 높은 FPS에서 더 효과적
3. **의도치 않은 버그**: 개발자가 예상하지 못한 플레이어 행동

## 게임별 대응

- **Quake**: 의도적으로 유지
- **Counter-Strike**: 제한적 허용
- **현대 FPS**: 대부분 패치로 제거

버니합은 게임 물리학의 복잡성을 보여주는 흥미로운 예시입니다.`,
          category: Category.GAME_DEVELOPMENT,
          categoryDisplayName: '게임 개발',
          slug: 'why-bunny-hopping-appears-in-games',
          imageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&h=400&fit=crop',
        },
        {
          title: '안티앨리어싱의 작동 원리',
          description: '컴퓨터 그래픽스에서 계단 현상을 방지하는 안티앨리어싱 기술의 원리와 다양한 구현 방법들을 살펴봅니다.',
          content: `# 안티앨리어싱의 작동 원리

## 앨리어싱이란?

앨리어싱(Aliasing)은 디지털 신호에서 원본을 정확히 표현하지 못해 발생하는 왜곡 현상입니다. 컴퓨터 그래픽스에서는 계단 현상(Jaggies)으로 나타납니다.

## 원인

### 나이퀴스트 정리
\`\`\`
샘플링 주파수 ≥ 2 × 최대 주파수
\`\`\`

픽셀 해상도가 이미지의 세밀함을 표현하기에 충분하지 않을 때 발생합니다.

## 안티앨리어싱 기법

### 1. SSAA (Super Sampling)
\`\`\`glsl
// 4x SSAA 예시
vec3 color = vec3(0.0);
for(int i = 0; i < 4; i++) {
    for(int j = 0; j < 4; j++) {
        vec2 offset = vec2(i, j) / 4.0 / resolution;
        color += texture(sampler, uv + offset).rgb;
    }
}
color /= 16.0;
\`\`\`

### 2. MSAA (Multi-Sample Anti-Aliasing)
- 기하학적 가장자리만 슈퍼샘플링
- 성능과 품질의 균형

### 3. FXAA (Fast Approximate Anti-Aliasing)
\`\`\`glsl
// 가장자리 검출
float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114));
float lumaUp = dot(colorUp.rgb, vec3(0.299, 0.587, 0.114));
float lumaDown = dot(colorDown.rgb, vec3(0.299, 0.587, 0.114));

// 그라디언트 계산
float gradientHorz = abs(lumaUp - lumaDown);
float gradientVert = abs(lumaLeft - lumaRight);
\`\`\`

### 4. TAA (Temporal Anti-Aliasing)
- 이전 프레임 정보 활용
- 시간적 해상도 증가

## 성능 비교

| 기법 | 품질 | 성능 비용 | 용도 |
|------|------|-----------|------|
| SSAA | 최고 | 매우 높음 | 오프라인 렌더링 |
| MSAA | 높음 | 높음 | 고사양 게임 |
| FXAA | 보통 | 낮음 | 실시간 렌더링 |
| TAA | 높음 | 보통 | 현대 게임 |

안티앨리어싱은 시각적 품질과 성능 사이의 균형을 찾는 것이 핵심입니다.`,
          category: Category.GRAPHICS,
          categoryDisplayName: '그래픽스',
          slug: 'how-anti-aliasing-works',
          imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop',
        },
      ];

      await Article.insertMany(articles);
      console.log('✅ Articles seeded successfully');
    } else {
      console.log('📄 Articles already exist, skipping seed');
    }

    if (userCount === 0) {
      console.log('Seeding admin user...');

      const adminUser = new User({
        username: 'admin',
        email: 'admin@codinginfo.com',
        password: 'admin123',
        role: 'admin',
      });

      await adminUser.save();
      console.log('✅ Admin user created successfully');
      console.log('📧 Admin credentials: admin@codinginfo.com / admin123');
    } else {
      console.log('👤 Users already exist, skipping seed');
    }

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
};