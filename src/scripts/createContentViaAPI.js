const axios = require('axios');

const API_BASE = 'https://codinginfoback-production.up.railway.app/api';

// 관리자 계정 정보
const ADMIN_CREDENTIALS = {
  email: 'admin@codinginfo.com',
  password: 'admin123456'
};

let authToken = '';

// 로그인해서 토큰 받기
async function login() {
  try {
    console.log('관리자 계정으로 로그인 중...');
    const response = await axios.post(`${API_BASE}/auth/login`, ADMIN_CREDENTIALS);
    authToken = response.data.token;
    console.log('로그인 성공!');
    return true;
  } catch (error) {
    console.error('로그인 실패:', error.response?.data || error.message);
    return false;
  }
}

// 기존 아티클 모두 삭제
async function deleteAllArticles() {
  try {
    console.log('기존 아티클 삭제 중...');
    const response = await axios.get(`${API_BASE}/admin/articles`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    const articles = response.data.articles;
    console.log(`삭제할 아티클 수: ${articles.length}`);

    for (const article of articles) {
      await axios.delete(`${API_BASE}/admin/articles/${article._id}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log(`아티클 삭제됨: ${article.title}`);
    }

    console.log('모든 아티클 삭제 완료');
  } catch (error) {
    console.error('아티클 삭제 실패:', error.response?.data || error.message);
  }
}

// 기존 카테고리 모두 삭제
async function deleteAllCategories() {
  try {
    console.log('기존 카테고리 삭제 중...');
    const response = await axios.get(`${API_BASE}/categories`);

    const categories = response.data;
    console.log(`삭제할 카테고리 수: ${categories.length}`);

    for (const category of categories) {
      await axios.delete(`${API_BASE}/admin/categories/${category._id}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log(`카테고리 삭제됨: ${category.displayName}`);
    }

    console.log('모든 카테고리 삭제 완료');
  } catch (error) {
    console.error('카테고리 삭제 실패:', error.response?.data || error.message);
  }
}

// 새 카테고리 생성
async function createCategories() {
  const categories = [
    {
      key: 'GRAPHICS',
      displayName: '그래픽스',
      description: '컴퓨터 그래픽스, 렌더링, 이미지 처리 기술',
      color: '#E53E3E',
      isActive: true
    },
    {
      key: 'GAME_DEVELOPMENT',
      displayName: '게임 개발',
      description: '게임 엔진, 물리 시뮬레이션, 게임 최적화',
      color: '#38A169',
      isActive: true
    },
    {
      key: 'ALGORITHM',
      displayName: '알고리즘',
      description: '자료구조, 알고리즘, 최적화 기법',
      color: '#3182CE',
      isActive: true
    },
    {
      key: 'OVERFLOW',
      displayName: '오버플로우',
      description: '수치 오버플로우, 메모리 관리, 시스템 한계',
      color: '#D69E2E',
      isActive: true
    },
    {
      key: 'TESTING',
      displayName: '테스트',
      description: '마크다운 문법 및 기능 테스트',
      color: '#805AD5',
      isActive: true
    }
  ];

  console.log('새 카테고리 생성 중...');
  const createdCategories = [];

  for (const category of categories) {
    try {
      const response = await axios.post(`${API_BASE}/admin/categories`, category, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      createdCategories.push(response.data);
      console.log(`카테고리 생성됨: ${category.displayName}`);
    } catch (error) {
      console.error(`카테고리 생성 실패 (${category.displayName}):`, error.response?.data || error.message);
    }
  }

  console.log(`총 ${createdCategories.length}개 카테고리 생성 완료`);
  return createdCategories;
}

// 새 아티클 생성
async function createArticles() {
  const articles = [
    // 마크다운 테스트 아티클
    {
      title: '마크다운 문법 완벽 가이드',
      description: '마크다운의 모든 문법을 테스트하고 검증하는 종합 가이드입니다.',
      content: `# 마크다운 문법 완벽 가이드

## 텍스트 서식

### 강조 표현
- **굵은 글씨** (Bold)
- *기울임 글씨* (Italic)
- ***굵은 기울임*** (Bold + Italic)
- ~~취소선~~ (Strikethrough)
- \`인라인 코드\` (Inline Code)

### 제목 계층
# H1 제목
## H2 제목
### H3 제목
#### H4 제목
##### H5 제목
###### H6 제목

## 목록

### 순서 없는 목록
- 첫 번째 항목
- 두 번째 항목
  - 중첩된 항목
  - 또 다른 중첩 항목
- 세 번째 항목

### 순서 있는 목록
1. 첫 번째 단계
2. 두 번째 단계
   1. 세부 단계 A
   2. 세부 단계 B
3. 세 번째 단계

## 코드 블록

### JavaScript 예제
\`\`\`javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10)); // 55
\`\`\`

### Python 예제
\`\`\`python
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)

print(quicksort([3,6,8,10,1,2,1]))
\`\`\`

## 표 (Table)

| 언어 | 타입 | 성능 | 난이도 |
|------|------|------|--------|
| JavaScript | 동적 | 중간 | 쉬움 |
| Python | 동적 | 중간 | 쉬움 |
| C++ | 정적 | 높음 | 어려움 |

## 인용문

> "프로그래밍은 생각을 코드로 옮기는 예술이다."
>
> — 익명의 개발자

## 링크와 이미지

### 링크
- [GitHub](https://github.com)
- [Stack Overflow](https://stackoverflow.com)

## 체크리스트

- [x] 마크다운 기본 문법 학습
- [x] 코드 블록 사용법 익히기
- [ ] 고급 마크다운 기능 탐구
- [ ] 마크다운 에디터 만들기

## 결론

이 문서는 마크다운의 주요 문법들을 포괄적으로 다룹니다.`,
      category: 'TESTING',
      status: 'published'
    },

    // 안티에일리어싱 논문 수준 아티클
    {
      title: '디지털 신호 처리에서의 안티에일리어싱 기법: 이론과 실제 구현',
      description: '나이퀴스트 정리부터 현대적 안티에일리어싱 기법까지, 디지털 신호 처리의 핵심 개념을 심층 분석합니다.',
      content: `# 디지털 신호 처리에서의 안티에일리어싱 기법

## 초록 (Abstract)

본 논문에서는 디지털 신호 처리에서 발생하는 에일리어싱(Aliasing) 현상의 이론적 배경과 이를 방지하기 위한 안티에일리어싱(Anti-aliasing) 기법들을 종합적으로 분석한다.

## 1. 서론 (Introduction)

### 1.1 연구 배경

디지털 신호 처리에서 아날로그 신호를 디지털로 변환하는 과정에서 발생하는 **에일리어싱(Aliasing)**은 신호의 왜곡을 초래하는 근본적인 문제이다.

### 1.2 나이퀴스트 정리의 수학적 기초

연속 시간 신호 x(t)가 최대 주파수 f_max를 가질 때, 완벽한 복원을 위해서는 샘플링 주파수 f_s가 다음 조건을 만족해야 한다:

f_s ≥ 2f_max

## 2. 에일리어싱의 수학적 모델링

### 2.1 주파수 도메인 분석

연속 신호 x(t)의 푸리에 변환을 X(f)라 할 때, 샘플링된 신호의 스펙트럼은 다음과 같이 표현된다.

### 2.2 에일리어싱 함수

에일리어싱된 주파수는 원래 주파수와 특정 관계를 가진다.

## 3. 안티에일리어싱 필터 설계

### 3.1 아날로그 저역통과 필터

#### 3.1.1 버터워스 필터

n차 버터워스 필터의 전달함수는 다음과 같다.

\`\`\`cpp
// 버터워스 저역통과 필터 구현 예제
class ButterworthFilter {
private:
    double a[3], b[3];  // 필터 계수
    double x[3], y[3];  // 지연 샘플들

public:
    ButterworthFilter(double cutoff, double sampleRate) {
        double c = tan(M_PI * cutoff / sampleRate);
        double c2 = c * c;
        double sqrt2 = sqrt(2.0);

        double norm = 1.0 / (1.0 + sqrt2 * c + c2);

        // 계수 계산
        b[0] = c2 * norm;
        b[1] = 2.0 * b[0];
        b[2] = b[0];

        a[0] = 1.0;
        a[1] = 2.0 * (c2 - 1.0) * norm;
        a[2] = (1.0 - sqrt2 * c + c2) * norm;
    }

    double process(double input) {
        // 필터 처리 로직
        return output;
    }
};
\`\`\`

## 4. 고급 안티에일리어싱 기법

### 4.1 오버샘플링 기법

오버샘플링은 원하는 샘플레이트보다 높은 주파수로 샘플링한 후 디지털 필터링과 데시메이션을 통해 최종 결과를 얻는 기법이다.

### 4.2 다단계 데시메이션

\`\`\`python
import numpy as np
from scipy import signal

def multistage_decimation(input_signal, decimation_factor, num_stages=3):
    # 다단계 데시메이션 구현
    result = input_signal.copy()

    for i, factor in enumerate(stage_factors):
        # 각 단계별 저역통과 필터 설계
        cutoff = 0.4 / factor
        b, a = signal.butter(6, cutoff, btype='low')

        # 필터링 및 데시메이션
        result = signal.filtfilt(b, a, result)
        result = result[::factor]

    return result
\`\`\`

## 5. 실시간 시스템에서의 구현

### 5.1 지연 최소화 전략

실시간 오디오 처리에서는 지연(latency)이 중요한 요소이다.

## 6. 성능 평가 및 메트릭

### 6.1 THD+N (Total Harmonic Distortion + Noise)

안티에일리어싱 필터의 성능을 평가하는 주요 지표

## 7. 최신 연구 동향

### 7.1 머신러닝 기반 안티에일리어싱

최근 연구에서는 심층 신경망을 이용한 적응형 안티에일리어싱 기법이 제안되고 있다.

## 8. 결론

본 연구에서는 디지털 신호 처리에서의 안티에일리어싱 기법을 종합적으로 분석하였다.

---

*본 논문은 디지털 신호 처리의 핵심 개념인 안티에일리어싱에 대한 종합적인 연구 결과를 담고 있습니다.*`,
      category: 'GRAPHICS',
      status: 'published'
    },

    // 베지어 곡선 아티클
    {
      title: '번스타인 다항식과 베지어 곡선: 컴퓨터 그래픽스에서의 수학적 모델링',
      description: '번스타인 다항식의 수학적 기초부터 베지어 곡선의 실제 구현까지, 컴퓨터 그래픽스의 핵심 수학 이론을 탐구합니다.',
      content: `# 번스타인 다항식과 베지어 곡선

## 초록 (Abstract)

본 논문에서는 컴퓨터 그래픽스와 기하학적 모델링의 핵심 이론인 번스타인 다항식(Bernstein Polynomials)과 베지어 곡선(Bézier Curves)에 대한 수학적 기초와 실제 구현 방법을 종합적으로 다룬다.

## 1. 서론 (Introduction)

### 1.1 역사적 배경

**번스타인 다항식**은 1912년 러시아 수학자 세르게이 나타노비치 번스타인이 도입한 다항식 기저이다.

## 2. 번스타인 다항식의 수학적 기초

### 2.1 정의와 기본 성질

n차 번스타인 다항식은 다음과 같이 정의된다:

B_{i,n}(t) = C(n,i) * t^i * (1-t)^(n-i)

### 2.2 주요 성질들

#### 2.2.1 분할 단위성 (Partition of Unity)

모든 t ∈ [0,1]에 대해 합이 1이다.

## 3. 베지어 곡선의 수학적 모델링

### 3.1 정의와 표현

n차 베지어 곡선은 n+1개의 제어점을 사용하여 정의된다.

### 3.2 드 카스텔자우 알고리즘

\`\`\`cpp
// 드 카스텔자우 알고리즘 구현
#include <vector>
#include <cmath>

struct Point3D {
    double x, y, z;
    Point3D(double x = 0, double y = 0, double z = 0) : x(x), y(y), z(z) {}
};

class BezierCurve {
private:
    std::vector<Point3D> controlPoints;

public:
    BezierCurve(const std::vector<Point3D>& points) : controlPoints(points) {}

    Point3D evaluate(double t) const {
        if (controlPoints.empty()) return Point3D();

        std::vector<Point3D> temp = controlPoints;
        int n = temp.size();

        // 드 카스텔자우 알고리즘
        for (int level = 1; level < n; level++) {
            for (int i = 0; i < n - level; i++) {
                temp[i] = temp[i] * (1.0 - t) + temp[i + 1] * t;
            }
        }

        return temp[0];
    }
};
\`\`\`

## 4. 고급 베지어 곡선 기법

### 4.1 베지어 곡선의 분할

\`\`\`python
import numpy as np

def de_casteljau_subdivision(control_points, t):
    # 드 카스텔자우 알고리즘을 사용한 베지어 곡선 분할
    n = len(control_points)
    points = np.array(control_points)

    pyramid = [points.copy()]

    for level in range(1, n):
        new_level = np.zeros((n - level, 2))
        for i in range(n - level):
            new_level[i] = (1 - t) * pyramid[level-1][i] + t * pyramid[level-1][i+1]
        pyramid.append(new_level)

    return pyramid
\`\`\`

### 4.2 베지어 곡면

베지어 곡선을 2차원으로 확장한 베지어 곡면

## 5. 컴퓨터 그래픽스에서의 응용

### 5.1 폰트 렌더링

TrueType과 PostScript 폰트는 베지어 곡선을 기반으로 한다.

### 5.2 애니메이션과 모션 그래픽스

\`\`\`javascript
// 웹에서의 베지어 곡선 렌더링
class WebBezierRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }

    drawBezierCurve(controlPoints, resolution = 100) {
        if (controlPoints.length < 2) return;

        this.ctx.beginPath();
        const startPoint = this.evaluateBezier(controlPoints, 0);
        this.ctx.moveTo(startPoint.x, startPoint.y);

        for (let i = 1; i <= resolution; i++) {
            const t = i / resolution;
            const point = this.evaluateBezier(controlPoints, t);
            this.ctx.lineTo(point.x, point.y);
        }

        this.ctx.stroke();
    }
}
\`\`\`

## 6. 수치적 안정성과 최적화

### 6.1 부동소수점 오차 분석

베지어 곡선 계산에서 발생할 수 있는 수치적 오차를 분석한다.

## 7. 현대적 확장과 응용

### 7.1 B-스플라인과의 관계

베지어 곡선은 B-스플라인의 특수한 경우로 볼 수 있다.

## 8. 결론

베지어 곡선은 단순한 수학적 도구를 넘어 현대 디지털 시대의 시각적 표현을 가능하게 하는 핵심 기술이다.`,
      category: 'GRAPHICS',
      status: 'published'
    },

    // 정수 오버플로우 아티클
    {
      title: '정수 오버플로우: 컴퓨터 시스템에서의 수치 한계와 보안 취약점',
      description: '정수 오버플로우의 수학적 원리부터 실제 보안 취약점까지, 컴퓨터 시스템의 근본적 한계를 탐구합니다.',
      content: `# 정수 오버플로우: 컴퓨터 시스템에서의 수치 한계와 보안 취약점

## 초록 (Abstract)

정수 오버플로우(Integer Overflow)는 컴퓨터 시스템의 유한한 메모리 제약으로 인해 발생하는 근본적인 현상이다.

## 1. 서론 (Introduction)

### 1.1 문제 정의

컴퓨터에서 정수는 유한한 비트 수로 표현되며, 이는 표현 가능한 수의 범위에 제한을 가한다.

### 1.2 역사적 배경

정수 오버플로우 문제는 1996년 아리안 5 로켓 폭발 사고를 통해 그 심각성이 널리 알려졌다.

## 2. 수학적 기초 (Mathematical Foundations)

### 2.1 모듈러 산술 (Modular Arithmetic)

n비트 정수 시스템에서의 연산은 모듈러 산술로 모델링할 수 있다.

### 2.2 2의 보수 표현 (Two's Complement)

n비트 2의 보수 체계에서 정수 x의 표현을 분석한다.

## 3. 컴퓨터 아키텍처별 분석

### 3.1 x86-64 아키텍처

\`\`\`assembly
; 32비트 덧셈 오버플로우 검사
add eax, ebx        ; EAX = EAX + EBX
jo overflow_handler ; Jump if overflow flag is set
\`\`\`

### 3.2 ARM 아키텍처

\`\`\`assembly
; ARM 덧셈 오버플로우 검사
adds r0, r1, r2     ; r0 = r1 + r2, 플래그 설정
bvs overflow_handler ; Branch if overflow set
\`\`\`

## 4. 프로그래밍 언어별 동작 분석

### 4.1 C/C++

C/C++에서는 부호 있는 정수 오버플로우가 정의되지 않은 동작이다.

\`\`\`cpp
#include <iostream>
#include <limits>

bool safe_add(int a, int b, int& result) {
    // 오버플로우 검사
    if (a > 0 && b > 0 && a > INT_MAX - b) {
        return false; // positive overflow
    }
    if (a < 0 && b < 0 && a < INT_MIN - b) {
        return false; // negative overflow
    }

    result = a + b;
    return true;
}
\`\`\`

### 4.2 Java

Java는 정수 오버플로우를 조용히 래핑(silent wrapping)한다.

\`\`\`java
public class IntegerOverflowDemo {
    public static boolean willAddOverflow(int a, int b) {
        if (a > 0 && b > 0) {
            return a > Integer.MAX_VALUE - b;
        }
        if (a < 0 && b < 0) {
            return a < Integer.MIN_VALUE - b;
        }
        return false;
    }
}
\`\`\`

### 4.3 Python

Python은 임의 정밀도 정수를 지원하여 오버플로우가 발생하지 않는다.

### 4.4 Rust

Rust는 디버그 모드에서 오버플로우 시 패닉을 발생시킨다.

\`\`\`rust
fn main() {
    let max_i32 = i32::MAX;

    // 명시적 래핑 연산
    let wrapped_result = max_i32.wrapping_add(1);

    // 포화 연산
    let saturated_result = max_i32.saturating_add(1);

    // 검사된 연산
    match max_i32.checked_add(1) {
        Some(result) => println!("Result: {}", result),
        None => println!("Addition would overflow!"),
    }
}
\`\`\`

## 5. 보안 취약점 분석

### 5.1 버퍼 오버플로우와의 연관성

정수 오버플로우는 종종 버퍼 오버플로우의 전조가 된다.

\`\`\`c
// 취약한 코드 예제
void vulnerable_function(int size, char* data) {
    int buffer_size = size + 100;  // 오버플로우 가능
    char* buffer = malloc(buffer_size);
    memcpy(buffer, data, size);  // 버퍼 오버플로우!
    free(buffer);
}

// 안전한 버전
void safe_function(size_t size, const char* data) {
    if (size > SIZE_MAX - 100) {
        return; // 오버플로우 방지
    }
    size_t buffer_size = size + 100;
    char* buffer = malloc(buffer_size);
    memcpy(buffer, data, size);
    free(buffer);
}
\`\`\`

## 6. 탐지 및 방지 기법

### 6.1 컴파일러 수준 방지

\`\`\`c
bool check_add_overflow(long long a, long long b, long long *result) {
    #if __has_builtin(__builtin_add_overflow)
        return __builtin_add_overflow(a, b, result);
    #else
        // 수동 구현
        if (a > 0 && b > 0 && a > LLONG_MAX - b) return true;
        *result = a + b;
        return false;
    #endif
}
\`\`\`

### 6.2 런타임 검사 라이브러리

안전한 정수 연산을 위한 라이브러리 구현

## 7. 성능 영향 분석

다양한 오버플로우 검사 방법의 성능을 측정하고 분석한다.

## 8. 하드웨어 수준 지원

### 8.1 Intel CET

Intel CET는 정수 오버플로우로 인한 공격을 방지한다.

### 8.2 ARM Pointer Authentication

ARM v8.3에서 도입된 포인터 인증 기능

## 9. 최신 연구 동향

### 9.1 정형 검증

### 9.2 머신러닝 기반 탐지

## 10. 산업별 적용 사례

### 10.1 자동차 산업 (MISRA C)

### 10.2 항공우주 산업 (DO-178C)

### 10.3 금융 시스템

## 11. 결론

정수 오버플로우는 컴퓨터 시스템의 근본적인 제약에서 비롯되는 현상으로, 지속적인 관리와 개선이 필요한 영역이다.`,
      category: 'OVERFLOW',
      status: 'published'
    }
  ];

  console.log('새 아티클 생성 중...');
  const createdArticles = [];

  for (const article of articles) {
    try {
      const response = await axios.post(`${API_BASE}/admin/articles`, article, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      createdArticles.push(response.data);
      console.log(`아티클 생성됨: ${article.title}`);
    } catch (error) {
      console.error(`아티클 생성 실패 (${article.title}):`, error.response?.data || error.message);
    }
  }

  console.log(`총 ${createdArticles.length}개 아티클 생성 완료`);
  return createdArticles;
}

// 메인 실행 함수
async function main() {
  console.log('=== 컨텐츠 생성 스크립트 시작 ===\n');

  // 1. 로그인
  if (!(await login())) {
    console.error('로그인에 실패했습니다. 스크립트를 종료합니다.');
    return;
  }

  // 2. 기존 데이터 삭제
  await deleteAllArticles();
  await deleteAllCategories();

  // 3. 새 컨텐츠 생성
  const categories = await createCategories();
  const articles = await createArticles();

  // 4. 결과 요약
  console.log('\n=== 컨텐츠 생성 완료 ===');
  console.log(`생성된 카테고리: ${categories.length}개`);
  console.log(`생성된 아티클: ${articles.length}개`);

  categories.forEach(cat => {
    console.log(`- 카테고리: ${cat.displayName} (${cat.key})`);
  });

  articles.forEach(article => {
    console.log(`- 아티클: ${article.title} (${article.category})`);
  });

  console.log('\n모든 작업이 완료되었습니다!');
}

// 스크립트 실행
main().catch(console.error);