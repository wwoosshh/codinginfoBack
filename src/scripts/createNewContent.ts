import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Article from '../models/Article';
import Category from '../models/Category';
import User from '../models/User';

// Load environment variables
dotenv.config();

// 실제 MongoDB Atlas URI 사용 (Railway 배포 환경과 동일)
const MONGODB_URI = 'mongodb+srv://wwoosshh:30Dltmdwls!@cluster0.kc9oj.mongodb.net/codinginfo?retryWrites=true&w=majority';

const createNewContent = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // 기존 아티클과 카테고리 모두 삭제
    const articlesDeleted = await Article.deleteMany({});
    console.log(`Deleted ${articlesDeleted.deletedCount} existing articles`);

    const categoriesDeleted = await Category.deleteMany({});
    console.log(`Deleted ${categoriesDeleted.deletedCount} existing categories`);

    // 관리자 사용자 찾기 (없으면 생성)
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      adminUser = new User({
        username: 'admin',
        email: 'admin@codinginfo.com',
        password: 'hashedPassword', // 실제로는 해시된 비밀번호
        role: 'admin'
      });
      await adminUser.save();
      console.log('Created admin user');
    }

    // 새 카테고리 생성
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

    const createdCategories = await Category.insertMany(categories);
    console.log(`Created ${createdCategories.length} categories`);

    // 카테고리 매핑
    const categoryMap = createdCategories.reduce((map, cat) => {
      map[cat.key] = cat;
      return map;
    }, {} as any);

    // 새 아티클 생성
    const articles = [
      // 마크다운 테스트 아티클
      {
        title: '마크다운 문법 완벽 가이드',
        slug: 'markdown-syntax-guide',
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

### C++ 예제
\`\`\`cpp
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> nums = {64, 34, 25, 12, 22, 11, 90};
    std::sort(nums.begin(), nums.end());

    for (int num : nums) {
        std::cout << num << " ";
    }
    return 0;
}
\`\`\`

## 표 (Table)

| 언어 | 타입 | 성능 | 난이도 |
|------|------|------|--------|
| JavaScript | 동적 | 중간 | 쉬움 |
| Python | 동적 | 중간 | 쉬움 |
| C++ | 정적 | 높음 | 어려움 |
| Rust | 정적 | 높음 | 어려움 |
| Go | 정적 | 높음 | 중간 |

## 인용문

> "프로그래밍은 생각을 코드로 옮기는 예술이다."
>
> — 익명의 개발자

### 중첩 인용문
> 첫 번째 레벨 인용문
> > 두 번째 레벨 인용문
> > > 세 번째 레벨 인용문

## 링크와 이미지

### 링크
- [GitHub](https://github.com)
- [Stack Overflow](https://stackoverflow.com)
- [MDN Web Docs](https://developer.mozilla.org)

### 이미지 (예시)
![코딩 이미지](https://via.placeholder.com/400x200?text=Coding+Image)

## 수평선

---

위와 아래를 구분하는 수평선입니다.

## 이스케이프 문자

특수 문자를 표시하려면 백슬래시(\\)를 사용합니다:
- \\* 별표
- \\# 해시태그
- \\[\\] 대괄호
- \\(\\) 소괄호

## 체크리스트

- [x] 마크다운 기본 문법 학습
- [x] 코드 블록 사용법 익히기
- [ ] 고급 마크다운 기능 탐구
- [ ] 마크다운 에디터 만들기

## 수식 (LaTeX)

인라인 수식: $E = mc^2$

블록 수식:
$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

## 결론

이 문서는 마크다운의 주요 문법들을 포괄적으로 다룹니다. 각 요소가 올바르게 렌더링되는지 확인하여 마크다운 렌더러의 기능을 검증할 수 있습니다.`,
        category: 'TESTING',
        categoryDisplayName: categoryMap.TESTING.displayName,
        categoryColor: categoryMap.TESTING.color,
        status: 'published' as any,
        author: adminUser._id,
        viewCount: 0,
        imageUrl: ''
      },

      // 안티에일리어싱 논문 수준 아티클
      {
        title: '디지털 신호 처리에서의 안티에일리어싱 기법: 이론과 실제 구현',
        slug: 'antialiasing-theory-implementation',
        description: '나이퀴스트 정리부터 현대적 안티에일리어싱 기법까지, 디지털 신호 처리의 핵심 개념을 심층 분석합니다.',
        content: `# 디지털 신호 처리에서의 안티에일리어싱 기법: 이론과 실제 구현

## 초록 (Abstract)

본 논문에서는 디지털 신호 처리에서 발생하는 에일리어싱(Aliasing) 현상의 이론적 배경과 이를 방지하기 위한 안티에일리어싱(Anti-aliasing) 기법들을 종합적으로 분석한다. 나이퀴스트 정리(Nyquist Theorem)의 수학적 기초부터 현대적인 오버샘플링 기법까지, 신호 처리 파이프라인에서의 실제적 구현 방안을 제시한다.

## 1. 서론 (Introduction)

### 1.1 연구 배경

디지털 신호 처리에서 아날로그 신호를 디지털로 변환하는 과정에서 발생하는 **에일리어싱(Aliasing)**은 신호의 왜곡을 초래하는 근본적인 문제이다. 1949년 클로드 섀넌(Claude Shannon)이 제시한 샘플링 정리는 이 문제에 대한 이론적 해답을 제공했으나, 실제 구현에서는 다양한 기술적 도전이 존재한다.

### 1.2 나이퀴스트 정리의 수학적 기초

연속 시간 신호 $x(t)$가 최대 주파수 $f_{max}$를 가질 때, 완벽한 복원을 위해서는 샘플링 주파수 $f_s$가 다음 조건을 만족해야 한다:

$$f_s \\geq 2f_{max}$$

이때 $f_N = f_s/2$를 나이퀴스트 주파수라 하며, 이보다 높은 주파수 성분은 에일리어싱을 발생시킨다.

## 2. 에일리어싱의 수학적 모델링

### 2.1 주파수 도메인 분석

연속 신호 $x(t)$의 푸리에 변환을 $X(f)$라 할 때, 샘플링된 신호의 스펙트럼은 다음과 같이 표현된다:

$$X_s(f) = \\sum_{n=-\\infty}^{\\infty} X(f - nf_s)$$

### 2.2 에일리어싱 함수

에일리어싱된 주파수 $f_{alias}$는 원래 주파수 $f_{original}$과 다음 관계를 가진다:

$$f_{alias} = |f_{original} - k \\cdot f_s|$$

여기서 $k$는 $f_{alias} \\leq f_s/2$를 만족하는 정수이다.

## 3. 안티에일리어싱 필터 설계

### 3.1 아날로그 저역통과 필터

#### 3.1.1 버터워스 필터

n차 버터워스 필터의 전달함수는 다음과 같다:

$$H(s) = \\frac{1}{1 + \\left(\\frac{s}{\\omega_c}\\right)^{2n}}$$

여기서 $\\omega_c$는 차단 주파수이다.

#### 3.1.2 체비셰프 필터

체비셰프 필터는 통과대역에서 리플을 허용하여 더 급격한 롤오프를 제공한다:

$$|H(j\\omega)|^2 = \\frac{1}{1 + \\epsilon^2 T_n^2(\\omega/\\omega_c)}$$

### 3.2 실제 구현에서의 고려사항

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

        // 초기화
        memset(x, 0, sizeof(x));
        memset(y, 0, sizeof(y));
    }

    double process(double input) {
        // 입력 시프트
        x[2] = x[1];
        x[1] = x[0];
        x[0] = input;

        // 출력 계산
        double output = b[0] * x[0] + b[1] * x[1] + b[2] * x[2]
                       - a[1] * y[1] - a[2] * y[2];

        // 출력 시프트
        y[2] = y[1];
        y[1] = y[0];
        y[0] = output;

        return output;
    }
};
\`\`\`

## 4. 고급 안티에일리어싱 기법

### 4.1 오버샘플링 기법

오버샘플링은 원하는 샘플레이트보다 높은 주파수로 샘플링한 후 디지털 필터링과 데시메이션을 통해 최종 결과를 얻는 기법이다.

#### 4.1.1 시그마-델타 변조

시그마-델타 ADC의 노이즈 쉐이핑 함수는 다음과 같다:

$$STF(z) = \\frac{1}{1 + H(z)}$$
$$NTF(z) = \\frac{H(z)}{1 + H(z)}$$

### 4.2 다단계 데시메이션

\`\`\`python
import numpy as np
from scipy import signal

def multistage_decimation(input_signal, decimation_factor, num_stages=3):
    """
    다단계 데시메이션을 통한 안티에일리어싱

    Args:
        input_signal: 입력 신호
        decimation_factor: 전체 데시메이션 인수
        num_stages: 데시메이션 단계 수

    Returns:
        decimated_signal: 데시메이션된 신호
    """

    # 각 단계별 데시메이션 인수 계산
    stage_factors = []
    remaining_factor = decimation_factor

    for i in range(num_stages):
        if i == num_stages - 1:
            stage_factors.append(remaining_factor)
        else:
            factor = int(remaining_factor ** (1.0 / (num_stages - i)))
            stage_factors.append(factor)
            remaining_factor //= factor

    result = input_signal.copy()

    for i, factor in enumerate(stage_factors):
        # 각 단계별 저역통과 필터 설계
        cutoff = 0.4 / factor  # 정규화된 차단 주파수
        b, a = signal.butter(6, cutoff, btype='low')

        # 필터링
        result = signal.filtfilt(b, a, result)

        # 데시메이션
        result = result[::factor]

        print(f"Stage {i+1}: Decimation by {factor}, Length: {len(result)}")

    return result

# 사용 예제
fs_original = 48000  # 48 kHz
t = np.linspace(0, 1, fs_original, endpoint=False)
signal_test = np.sin(2 * np.pi * 1000 * t) + 0.5 * np.sin(2 * np.pi * 15000 * t)

# 8배 데시메이션 (48kHz -> 6kHz)
decimated = multistage_decimation(signal_test, 8, 3)
\`\`\`

## 5. 실시간 시스템에서의 구현

### 5.1 지연 최소화 전략

실시간 오디오 처리에서는 지연(latency)이 중요한 요소이다. 선형 위상 FIR 필터의 그룹 지연은 다음과 같다:

$$\\tau_g = \\frac{N-1}{2f_s}$$

여기서 N은 필터 탭 수이다.

### 5.2 적응형 안티에일리어싱

\`\`\`javascript
class AdaptiveAntiAliasing {
    constructor(sampleRate) {
        this.sampleRate = sampleRate;
        this.analysisWindowSize = 1024;
        this.overlapFactor = 4;
        this.hopSize = this.analysisWindowSize / this.overlapFactor;

        // FFT 준비
        this.fftSize = this.analysisWindowSize;
        this.window = this.generateHannWindow(this.fftSize);
    }

    generateHannWindow(size) {
        const window = new Float32Array(size);
        for (let i = 0; i < size; i++) {
            window[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (size - 1)));
        }
        return window;
    }

    analyzeSpectrum(inputBuffer) {
        // 스펙트럼 분석을 통한 에일리어싱 위험 감지
        const fft = new FFT(this.fftSize);
        const spectrum = fft.forward(inputBuffer);

        let energyAboveNyquist = 0;
        let totalEnergy = 0;

        const nyquistBin = this.fftSize / 2;
        const criticalBin = nyquistBin * 0.8; // 나이퀴스트 주파수의 80%

        for (let i = 0; i < nyquistBin; i++) {
            const magnitude = Math.sqrt(spectrum[i].real**2 + spectrum[i].imag**2);
            totalEnergy += magnitude;

            if (i > criticalBin) {
                energyAboveNyquist += magnitude;
            }
        }

        return energyAboveNyquist / totalEnergy;
    }

    adaptFilterParameters(aliasingRisk) {
        // 에일리어싱 위험도에 따른 필터 파라미터 조정
        if (aliasingRisk > 0.1) {
            return {
                cutoffFrequency: 0.35 * this.sampleRate / 2,
                filterOrder: 8,
                oversampling: 2
            };
        } else if (aliasingRisk > 0.05) {
            return {
                cutoffFrequency: 0.4 * this.sampleRate / 2,
                filterOrder: 6,
                oversampling: 1
            };
        } else {
            return {
                cutoffFrequency: 0.45 * this.sampleRate / 2,
                filterOrder: 4,
                oversampling: 1
            };
        }
    }
}
\`\`\`

## 6. 성능 평가 및 메트릭

### 6.1 THD+N (Total Harmonic Distortion + Noise)

안티에일리어싱 필터의 성능을 평가하는 주요 지표:

$$THD+N = \\frac{\\sqrt{P_{harmonics} + P_{noise}}}{P_{fundamental}} \\times 100\\%$$

### 6.2 SINAD (Signal-to-Noise and Distortion Ratio)

$$SINAD = 10 \\log_{10} \\left(\\frac{P_{signal}}{P_{noise} + P_{distortion}}\\right) \\text{ dB}$$

## 7. 최신 연구 동향

### 7.1 머신러닝 기반 안티에일리어싱

최근 연구에서는 심층 신경망을 이용한 적응형 안티에일리어싱 기법이 제안되고 있다. 합성곱 신경망(CNN)을 사용하여 실시간으로 최적의 필터 계수를 예측하는 방법이 유망하다.

### 7.2 비선형 시스템에서의 안티에일리어싱

비선형 오디오 처리에서는 고조파 왜곡으로 인한 에일리어싱이 복잡한 양상을 보인다. 볼테라 급수(Volterra series)를 이용한 분석이 활발히 연구되고 있다.

## 8. 결론

본 연구에서는 디지털 신호 처리에서의 안티에일리어싱 기법을 종합적으로 분석하였다. 나이퀴스트 정리의 이론적 기초부터 현대적인 적응형 기법까지, 다양한 접근 방법의 장단점을 제시하였다.

주요 기여사항은 다음과 같다:

1. **이론적 기초 정립**: 에일리어싱 현상의 수학적 모델링
2. **실용적 구현 방안**: 실시간 시스템에서의 최적화 전략
3. **성능 평가 체계**: 정량적 평가 메트릭 제시
4. **미래 연구 방향**: 머신러닝 기반 접근법의 가능성

향후 연구에서는 저전력 임베디드 시스템에서의 효율적인 구현과 AI 기반 적응형 안티에일리어싱 기법의 발전이 기대된다.

## 참고문헌

1. Shannon, C. E. (1949). "Communication in the presence of noise". *Proceedings of the IRE*, 37(1), 10-21.
2. Oppenheim, A. V., & Schafer, R. W. (2009). *Discrete-time signal processing*. Pearson.
3. Vaidyanathan, P. P. (1993). *Multirate systems and filter banks*. Prentice Hall.
4. Crochiere, R. E., & Rabiner, L. R. (1983). *Multirate digital signal processing*. Prentice Hall.

---

*본 논문은 디지털 신호 처리의 핵심 개념인 안티에일리어싱에 대한 종합적인 연구 결과를 담고 있습니다.*`,
        category: 'GRAPHICS',
        categoryDisplayName: categoryMap.GRAPHICS.displayName,
        categoryColor: categoryMap.GRAPHICS.color,
        status: 'published' as any,
        author: adminUser._id,
        viewCount: 0,
        imageUrl: ''
      },

      // 버니합 아티클
      {
        title: '번스타인 다항식과 베지어 곡선: 컴퓨터 그래픽스에서의 수학적 모델링',
        slug: 'bernstein-polynomials-bezier-curves',
        description: '번스타인 다항식의 수학적 기초부터 베지어 곡선의 실제 구현까지, 컴퓨터 그래픽스의 핵심 수학 이론을 탐구합니다.',
        content: `# 번스타인 다항식과 베지어 곡선: 컴퓨터 그래픽스에서의 수학적 모델링

## 초록 (Abstract)

본 논문에서는 컴퓨터 그래픽스와 기하학적 모델링의 핵심 이론인 번스타인 다항식(Bernstein Polynomials)과 베지어 곡선(Bézier Curves)에 대한 수학적 기초와 실제 구현 방법을 종합적으로 다룬다. 1912년 세르게이 번스타인이 제시한 다항식 근사 이론부터 1960년대 피에르 베지어가 개발한 자동차 설계 도구까지, 이론적 배경과 현대적 응용을 통합적으로 분석한다.

## 1. 서론 (Introduction)

### 1.1 역사적 배경

**번스타인 다항식**은 1912년 러시아 수학자 세르게이 나타노비치 번스타인(Sergei Natanovich Bernstein)이 바이어슈트라스 근사 정리의 구성적 증명을 위해 도입한 다항식 기저이다. 50년 후, 프랑스의 자동차 엔지니어 피에르 베지어(Pierre Bézier)가 르노 자동차의 차체 설계를 위해 이 수학적 도구를 활용하면서 컴퓨터 그래픽스의 핵심 기술로 발전하게 되었다.

### 1.2 연구 목적

본 연구의 목적은 다음과 같다:

1. 번스타인 다항식의 수학적 성질 분석
2. 베지어 곡선의 기하학적 특성 탐구
3. 실제 컴퓨터 그래픽스 구현에서의 최적화 기법
4. 고차원 확장과 현대적 응용 분야 제시

## 2. 번스타인 다항식의 수학적 기초

### 2.1 정의와 기본 성질

n차 번스타인 다항식은 다음과 같이 정의된다:

$$B_{i,n}(t) = \\binom{n}{i} t^i (1-t)^{n-i}, \\quad i = 0, 1, \\ldots, n$$

여기서 $\\binom{n}{i}$는 이항계수이며, $t \\in [0,1]$이다.

### 2.2 주요 성질들

#### 2.2.1 분할 단위성 (Partition of Unity)

모든 $t \\in [0,1]$에 대해:

$$\\sum_{i=0}^{n} B_{i,n}(t) = 1$$

**증명**: 이항정리에 의해 $(t + (1-t))^n = 1$이므로:

$$\\sum_{i=0}^{n} \\binom{n}{i} t^i (1-t)^{n-i} = (t + (1-t))^n = 1^n = 1$$

#### 2.2.2 비음성 (Non-negativity)

모든 $t \\in [0,1]$과 모든 $i$에 대해:

$$B_{i,n}(t) \\geq 0$$

#### 2.2.3 대칭성 (Symmetry)

$$B_{i,n}(t) = B_{n-i,n}(1-t)$$

#### 2.2.4 재귀 관계 (Recurrence Relation)

$$B_{i,n}(t) = (1-t)B_{i,n-1}(t) + tB_{i-1,n-1}(t)$$

### 2.3 미분과 적분 성질

#### 2.3.1 미분 공식

$$\\frac{d}{dt}B_{i,n}(t) = n[B_{i-1,n-1}(t) - B_{i,n-1}(t)]$$

#### 2.3.2 적분 공식

$$\\int_0^1 B_{i,n}(t) dt = \\frac{1}{n+1}$$

## 3. 베지어 곡선의 수학적 모델링

### 3.1 정의와 표현

n차 베지어 곡선은 n+1개의 제어점 $\\mathbf{P}_0, \\mathbf{P}_1, \\ldots, \\mathbf{P}_n$을 사용하여 다음과 같이 정의된다:

$$\\mathbf{C}(t) = \\sum_{i=0}^{n} \\mathbf{P}_i B_{i,n}(t), \\quad t \\in [0,1]$$

### 3.2 기하학적 성질

#### 3.2.1 끝점 보간 (Endpoint Interpolation)

- $\\mathbf{C}(0) = \\mathbf{P}_0$
- $\\mathbf{C}(1) = \\mathbf{P}_n$

#### 3.2.2 접선 벡터 (Tangent Vectors)

시작점에서의 접선 벡터:
$$\\mathbf{C}'(0) = n(\\mathbf{P}_1 - \\mathbf{P}_0)$$

끝점에서의 접선 벡터:
$$\\mathbf{C}'(1) = n(\\mathbf{P}_n - \\mathbf{P}_{n-1})$$

#### 3.2.3 볼록 포(Convex Hull) 성질

베지어 곡선은 항상 제어점들의 볼록 포 내부에 위치한다. 이는 번스타인 다항식의 비음성과 분할 단위성에서 직접 유도된다.

### 3.3 드 카스텔자우 알고리즘 (De Casteljau's Algorithm)

베지어 곡선의 수치적으로 안정한 계산을 위한 재귀 알고리즘:

$$\\mathbf{P}_i^{(k)}(t) = (1-t)\\mathbf{P}_i^{(k-1)}(t) + t\\mathbf{P}_{i+1}^{(k-1)}(t)$$

여기서 $\\mathbf{P}_i^{(0)}(t) = \\mathbf{P}_i$이고, $\\mathbf{C}(t) = \\mathbf{P}_0^{(n)}(t)$이다.

\`\`\`cpp
// 드 카스텔자우 알고리즘 구현
#include <vector>
#include <cmath>

struct Point3D {
    double x, y, z;

    Point3D(double x = 0, double y = 0, double z = 0) : x(x), y(y), z(z) {}

    Point3D operator+(const Point3D& other) const {
        return Point3D(x + other.x, y + other.y, z + other.z);
    }

    Point3D operator*(double scalar) const {
        return Point3D(x * scalar, y * scalar, z * scalar);
    }
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

    Point3D tangent(double t) const {
        if (controlPoints.size() < 2) return Point3D();

        // 1차 미분을 위한 차분 제어점 계산
        std::vector<Point3D> diffPoints;
        int n = controlPoints.size() - 1;

        for (int i = 0; i < n; i++) {
            Point3D diff = (controlPoints[i + 1] + controlPoints[i] * (-1.0)) * n;
            diffPoints.push_back(diff);
        }

        // 차분 곡선을 평가
        BezierCurve diffCurve(diffPoints);
        return diffCurve.evaluate(t);
    }

    double curvature(double t) const {
        Point3D first = tangent(t);
        Point3D second = secondDerivative(t);

        // κ = |C'(t) × C''(t)| / |C'(t)|³
        double firstMag = sqrt(first.x*first.x + first.y*first.y + first.z*first.z);

        if (firstMag < 1e-10) return 0.0;

        // 2D 케이스에서의 외적 크기
        double cross = first.x * second.y - first.y * second.x;
        return abs(cross) / (firstMag * firstMag * firstMag);
    }

private:
    Point3D secondDerivative(double t) const {
        if (controlPoints.size() < 3) return Point3D();

        // 2차 차분 제어점 계산
        std::vector<Point3D> diffPoints;
        int n = controlPoints.size() - 1;

        for (int i = 0; i < n - 1; i++) {
            Point3D diff = (controlPoints[i + 2] + controlPoints[i + 1] * (-2.0) + controlPoints[i]) * (n * (n - 1));
            diffPoints.push_back(diff);
        }

        BezierCurve diffCurve(diffPoints);
        return diffCurve.evaluate(t);
    }
};
\`\`\`

## 4. 고급 베지어 곡선 기법

### 4.1 베지어 곡선의 분할 (Subdivision)

베지어 곡선을 두 개의 베지어 곡선으로 분할하는 것은 드 카스텔자우 알고리즘의 부산물로 얻을 수 있다.

\`\`\`python
import numpy as np
import matplotlib.pyplot as plt

def de_casteljau_subdivision(control_points, t):
    """
    드 카스텔자우 알고리즘을 사용한 베지어 곡선 분할

    Args:
        control_points: 제어점 배열 (n x 2)
        t: 분할 지점 (0 <= t <= 1)

    Returns:
        left_curve, right_curve: 분할된 두 곡선의 제어점들
    """
    n = len(control_points)
    points = np.array(control_points)

    # 드 카스텔자우 피라미드 구성
    pyramid = [points.copy()]

    for level in range(1, n):
        new_level = np.zeros((n - level, 2))
        for i in range(n - level):
            new_level[i] = (1 - t) * pyramid[level-1][i] + t * pyramid[level-1][i+1]
        pyramid.append(new_level)

    # 왼쪽 곡선의 제어점들
    left_curve = []
    for level in range(n):
        left_curve.append(pyramid[level][0])

    # 오른쪽 곡선의 제어점들
    right_curve = []
    for level in range(n):
        right_curve.append(pyramid[n-1-level][level])

    return np.array(left_curve), np.array(right_curve)

def adaptive_bezier_rendering(control_points, tolerance=0.01, max_depth=10):
    """
    적응적 베지어 곡선 렌더링

    Args:
        control_points: 제어점 배열
        tolerance: 평탄도 허용오차
        max_depth: 최대 재귀 깊이

    Returns:
        points: 렌더링된 점들의 배열
    """

    def flatness_measure(points):
        """곡선의 평탄도 측정"""
        if len(points) <= 2:
            return 0

        # 첫 번째와 마지막 제어점을 잇는 직선과의 최대 거리
        start, end = points[0], points[-1]
        line_vec = end - start
        line_length = np.linalg.norm(line_vec)

        if line_length < 1e-10:
            return 0

        max_distance = 0
        for i in range(1, len(points) - 1):
            # 점에서 직선까지의 거리
            point_vec = points[i] - start
            projection = np.dot(point_vec, line_vec) / line_length
            closest_point = start + (projection / line_length) * line_vec
            distance = np.linalg.norm(points[i] - closest_point)
            max_distance = max(max_distance, distance)

        return max_distance

    def recursive_render(points, depth=0):
        """재귀적 곡선 렌더링"""
        if depth >= max_depth or flatness_measure(points) < tolerance:
            return [points[0], points[-1]]

        # 곡선을 반으로 분할
        left, right = de_casteljau_subdivision(points, 0.5)

        # 재귀적으로 각 부분을 렌더링
        left_points = recursive_render(left, depth + 1)
        right_points = recursive_render(right, depth + 1)

        # 중복 제거하고 결합
        return left_points + right_points[1:]

    return np.array(recursive_render(control_points))

# 사용 예제
control_points = np.array([
    [0, 0],
    [1, 2],
    [3, 2],
    [4, 0]
])

# 적응적 렌더링
rendered_points = adaptive_bezier_rendering(control_points, tolerance=0.01)

# 시각화
t_values = np.linspace(0, 1, 100)
curve_points = []

for t in t_values:
    point = np.zeros(2)
    n = len(control_points) - 1
    for i, cp in enumerate(control_points):
        bernstein = np.math.comb(n, i) * (t**i) * ((1-t)**(n-i))
        point += bernstein * cp
    curve_points.append(point)

curve_points = np.array(curve_points)

plt.figure(figsize=(12, 6))

plt.subplot(1, 2, 1)
plt.plot(curve_points[:, 0], curve_points[:, 1], 'b-', linewidth=2, label='베지어 곡선')
plt.plot(control_points[:, 0], control_points[:, 1], 'ro-', label='제어점')
plt.title('베지어 곡선과 제어점')
plt.legend()
plt.grid(True)

plt.subplot(1, 2, 2)
plt.plot(rendered_points[:, 0], rendered_points[:, 1], 'g.-', label='적응적 렌더링')
plt.plot(control_points[:, 0], control_points[:, 1], 'ro-', label='제어점')
plt.title('적응적 렌더링 결과')
plt.legend()
plt.grid(True)

plt.tight_layout()
plt.show()
\`\`\`

### 4.2 베지어 곡면 (Bézier Surfaces)

베지어 곡선을 2차원으로 확장한 베지어 곡면은 다음과 같이 정의된다:

$$\\mathbf{S}(u,v) = \\sum_{i=0}^{m} \\sum_{j=0}^{n} \\mathbf{P}_{i,j} B_{i,m}(u) B_{j,n}(v)$$

여기서 $(u,v) \\in [0,1] \\times [0,1]$이고, $\\mathbf{P}_{i,j}$는 $(m+1) \\times (n+1)$ 제어점 격자이다.

### 4.3 유리 베지어 곡선 (Rational Bézier Curves)

동차 좌표계를 사용하여 원뿔 곡선을 정확히 표현할 수 있는 유리 베지어 곡선:

$$\\mathbf{C}(t) = \\frac{\\sum_{i=0}^{n} w_i \\mathbf{P}_i B_{i,n}(t)}{\\sum_{i=0}^{n} w_i B_{i,n}(t)}$$

여기서 $w_i$는 가중치이다.

## 5. 컴퓨터 그래픽스에서의 응용

### 5.1 폰트 렌더링

TrueType과 PostScript 폰트는 베지어 곡선을 기반으로 한다. 각 글자의 윤곽선은 2차 또는 3차 베지어 곡선의 조합으로 표현된다.

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

        // 첫 번째 점으로 이동
        const startPoint = this.evaluateBezier(controlPoints, 0);
        this.ctx.moveTo(startPoint.x, startPoint.y);

        // 곡선 그리기
        for (let i = 1; i <= resolution; i++) {
            const t = i / resolution;
            const point = this.evaluateBezier(controlPoints, t);
            this.ctx.lineTo(point.x, point.y);
        }

        this.ctx.stroke();
    }

    evaluateBezier(points, t) {
        const n = points.length - 1;
        let result = { x: 0, y: 0 };

        for (let i = 0; i <= n; i++) {
            const bernstein = this.bernsteinPolynomial(i, n, t);
            result.x += bernstein * points[i].x;
            result.y += bernstein * points[i].y;
        }

        return result;
    }

    bernsteinPolynomial(i, n, t) {
        const binomial = this.binomialCoefficient(n, i);
        return binomial * Math.pow(t, i) * Math.pow(1 - t, n - i);
    }

    binomialCoefficient(n, k) {
        if (k > n) return 0;
        if (k === 0 || k === n) return 1;

        let result = 1;
        for (let i = 0; i < k; i++) {
            result = result * (n - i) / (i + 1);
        }
        return result;
    }

    // 대화형 곡선 편집
    enableInteractiveEditing(controlPoints) {
        let dragIndex = -1;

        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // 가장 가까운 제어점 찾기
            let minDistance = Infinity;
            for (let i = 0; i < controlPoints.length; i++) {
                const distance = Math.sqrt(
                    Math.pow(x - controlPoints[i].x, 2) +
                    Math.pow(y - controlPoints[i].y, 2)
                );
                if (distance < minDistance && distance < 20) {
                    minDistance = distance;
                    dragIndex = i;
                }
            }
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (dragIndex >= 0) {
                const rect = this.canvas.getBoundingClientRect();
                controlPoints[dragIndex].x = e.clientX - rect.left;
                controlPoints[dragIndex].y = e.clientY - rect.top;

                this.redraw(controlPoints);
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            dragIndex = -1;
        });
    }

    redraw(controlPoints) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 베지어 곡선 그리기
        this.ctx.strokeStyle = 'blue';
        this.ctx.lineWidth = 2;
        this.drawBezierCurve(controlPoints);

        // 제어점 그리기
        this.ctx.fillStyle = 'red';
        controlPoints.forEach(point => {
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
            this.ctx.fill();
        });

        // 제어 폴리곤 그리기
        this.ctx.strokeStyle = 'gray';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(controlPoints[0].x, controlPoints[0].y);
        for (let i = 1; i < controlPoints.length; i++) {
            this.ctx.lineTo(controlPoints[i].x, controlPoints[i].y);
        }
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
}

// 사용 예제
const canvas = document.getElementById('bezierCanvas');
const renderer = new WebBezierRenderer(canvas);

const controlPoints = [
    { x: 50, y: 200 },
    { x: 100, y: 50 },
    { x: 300, y: 50 },
    { x: 350, y: 200 }
];

renderer.redraw(controlPoints);
renderer.enableInteractiveEditing(controlPoints);
\`\`\`

### 5.2 애니메이션과 모션 그래픽스

베지어 곡선은 애니메이션에서 자연스러운 이징(easing) 함수를 제공한다. CSS의 \`cubic-bezier()\` 함수가 대표적인 예이다.

### 5.3 CAD/CAM 시스템

Computer-Aided Design에서 베지어 곡선과 곡면은 복잡한 3D 형상을 모델링하는 데 필수적이다.

## 6. 수치적 안정성과 최적화

### 6.1 부동소수점 오차 분석

베지어 곡선 계산에서 발생할 수 있는 수치적 오차를 분석하면:

$$\\epsilon_{total} \\leq \\sum_{i=0}^{n} |B_{i,n}(t)| \\cdot \\epsilon_{control} + n \\cdot \\epsilon_{arithmetic}$$

여기서 $\\epsilon_{control}$은 제어점의 오차, $\\epsilon_{arithmetic}$은 산술 연산 오차이다.

### 6.2 병렬 처리 최적화

GPU를 활용한 베지어 곡선 렌더링 최적화:

\`\`\`glsl
// GLSL 버텍스 셰이더
#version 330 core

layout (location = 0) in vec3 aPos;
layout (location = 1) in float aT; // 매개변수 t

uniform vec3 controlPoints[4]; // 3차 베지어 곡선
uniform mat4 viewProjection;

vec3 evaluateBezier(float t) {
    float u = 1.0 - t;
    float tt = t * t;
    float uu = u * u;
    float uuu = uu * u;
    float ttt = tt * t;

    return uuu * controlPoints[0] +
           3.0 * uu * t * controlPoints[1] +
           3.0 * u * tt * controlPoints[2] +
           ttt * controlPoints[3];
}

void main() {
    vec3 position = evaluateBezier(aT);
    gl_Position = viewProjection * vec4(position, 1.0);
}
\`\`\`

## 7. 현대적 확장과 응용

### 7.1 B-스플라인과의 관계

베지어 곡선은 B-스플라인의 특수한 경우로 볼 수 있다. B-스플라인 기저 함수와 번스타인 다항식 사이의 변환:

$$B_{i,n}(t) = \\sum_{j=i}^{n} N_{j,n+1}(t) \\binom{j}{i} \\binom{n-j}{n-i} (-1)^{n-i}$$

### 7.2 분할곡면 모델링 (Subdivision Surface Modeling)

베지어 패치를 기반으로 한 Catmull-Clark 분할 알고리즘은 현대 3D 모델링의 표준이다.

### 7.3 벡터 그래픽스 표준

SVG(Scalable Vector Graphics)와 PDF에서 베지어 곡선은 해상도 독립적인 그래픽 표현의 핵심이다.

## 8. 성능 분석 및 벤치마크

### 8.1 계산 복잡도

- 직접 계산: $O(n^2)$
- 드 카스텔자우 알고리즘: $O(n^2)$ (하지만 수치적으로 더 안정)
- 호너의 방법 변형: $O(n)$

### 8.2 메모리 사용량

n차 베지어 곡선의 메모리 사용량:
- 제어점 저장: $(n+1) \\times d$ (d는 차원)
- 드 카스텔자우 임시 저장소: $\\frac{n(n+1)}{2} \\times d$

## 9. 미래 연구 방향

### 9.1 머신러닝과의 융합

신경망을 사용한 베지어 곡선 근사와 최적화가 활발히 연구되고 있다.

### 9.2 실시간 변형 모델링

물리 시뮬레이션과 결합된 동적 베지어 곡면 모델링.

### 9.3 양자 컴퓨팅 응용

양자 알고리즘을 사용한 고차원 베지어 곡선 처리의 가능성.

## 10. 결론

본 연구에서는 번스타인 다항식과 베지어 곡선의 수학적 기초부터 현대적 응용까지 종합적으로 분석하였다. 주요 기여사항은 다음과 같다:

1. **이론적 체계화**: 번스타인 다항식의 수학적 성질을 체계적으로 정리
2. **실용적 구현**: 다양한 프로그래밍 언어와 플랫폼에서의 최적화된 구현 제시
3. **성능 분석**: 수치적 안정성과 계산 효율성에 대한 정량적 분석
4. **응용 분야 확장**: 전통적 그래픽스를 넘어선 현대적 응용 사례 제시

베지어 곡선은 단순한 수학적 도구를 넘어 현대 디지털 시대의 시각적 표현을 가능하게 하는 핵심 기술이다. 향후 AI, 가상현실, 양자컴퓨팅과의 융합을 통해 더욱 발전할 것으로 기대된다.

## 참고문헌

1. Bernstein, S. N. (1912). "Démonstration du théorème de Weierstrass fondée sur le calcul des probabilités". *Communications de la Société mathématique de Kharkow*, 13, 1-2.

2. Bézier, P. (1972). "Numerical control: mathematics and applications". John Wiley & Sons.

3. Farin, G. (2002). *Curves and surfaces for CAGD: a practical guide*. Morgan Kaufmann.

4. de Casteljau, P. (1963). "Courbes et surfaces à pôles". André Citroën Automobiles SA.

5. Piegl, L., & Tiller, W. (1997). *The NURBS book*. Springer Science & Business Media.

---

*본 논문은 컴퓨터 그래픽스의 수학적 기초인 베지어 곡선에 대한 종합적인 연구를 제시합니다.*`,
        category: 'GRAPHICS',
        categoryDisplayName: categoryMap.GRAPHICS.displayName,
        categoryColor: categoryMap.GRAPHICS.color,
        status: 'published' as any,
        author: adminUser._id,
        viewCount: 0,
        imageUrl: ''
      },

      // 오버플로우 아티클
      {
        title: '정수 오버플로우: 컴퓨터 시스템에서의 수치 한계와 보안 취약점',
        slug: 'integer-overflow-analysis',
        description: '정수 오버플로우의 수학적 원리부터 실제 보안 취약점까지, 컴퓨터 시스템의 근본적 한계를 탐구합니다.',
        content: `# 정수 오버플로우: 컴퓨터 시스템에서의 수치 한계와 보안 취약점

## 초록 (Abstract)

정수 오버플로우(Integer Overflow)는 컴퓨터 시스템의 유한한 메모리 제약으로 인해 발생하는 근본적인 현상이다. 본 논문에서는 정수 오버플로우의 수학적 원리, 다양한 데이터 타입에서의 발생 메커니즘, 그리고 이로 인한 보안 취약점과 시스템 안정성 문제를 종합적으로 분석한다. 또한 현대 프로그래밍 언어와 컴파일러에서 제공하는 오버플로우 탐지 및 방지 기법들을 비교 분석하고, 실제 사례를 통해 그 영향을 고찰한다.

## 1. 서론 (Introduction)

### 1.1 문제 정의

컴퓨터에서 정수는 유한한 비트 수로 표현되며, 이는 표현 가능한 수의 범위에 제한을 가한다. n비트 부호 없는 정수의 경우 $[0, 2^n-1]$ 범위의 값만 표현 가능하며, 이 범위를 벗어나는 연산 결과는 **오버플로우(Overflow)** 또는 **언더플로우(Underflow)**를 발생시킨다.

### 1.2 역사적 배경

정수 오버플로우 문제는 컴퓨터의 초기 개발 단계부터 존재했으나, 1996년 아리안 5 로켓 폭발 사고를 통해 그 심각성이 널리 알려졌다. 이 사고는 64비트 부동소수점 수를 16비트 정수로 변환하는 과정에서 발생한 오버플로우가 원인이었다.

### 1.3 연구 목적

본 연구의 목적은 다음과 같다:

1. 정수 오버플로우의 수학적 모델링
2. 다양한 컴퓨터 아키텍처에서의 동작 분석
3. 보안 취약점과 악용 사례 연구
4. 탐지 및 방지 기법의 효율성 평가

## 2. 수학적 기초 (Mathematical Foundations)

### 2.1 모듈러 산술 (Modular Arithmetic)

n비트 정수 시스템에서의 연산은 모듈러 산술로 모델링할 수 있다. 부호 없는 정수의 경우:

$$a \\oplus b = (a + b) \\bmod 2^n$$

여기서 $\\oplus$는 오버플로우가 고려된 덧셈을 의미한다.

### 2.2 2의 보수 표현 (Two's Complement)

n비트 2의 보수 체계에서 정수 x의 표현:

$$x = \\begin{cases}
x & \\text{if } 0 \\leq x \\leq 2^{n-1}-1 \\\\
x + 2^n & \\text{if } -2^{n-1} \\leq x < 0
\\end{cases}$$

### 2.3 오버플로우 조건

#### 2.3.1 부호 없는 정수 덧셈

두 n비트 부호 없는 정수 a, b의 덧셈에서 오버플로우 조건:

$$\\text{overflow} \\iff a + b \\geq 2^n$$

#### 2.3.2 부호 있는 정수 덧셈

2의 보수 체계에서 덧셈 오버플로우:

$$\\text{positive overflow} \\iff a > 0 \\land b > 0 \\land a + b < 0$$
$$\\text{negative overflow} \\iff a < 0 \\land b < 0 \\land a + b > 0$$

#### 2.3.3 곱셈 오버플로우

두 n비트 정수의 곱셈 결과는 최대 2n비트가 필요하므로:

$$\\text{overflow} \\iff |a \\times b| \\geq 2^{n-1} \\text{ (signed)}$$
$$\\text{overflow} \\iff a \\times b \\geq 2^n \\text{ (unsigned)}$$

## 3. 컴퓨터 아키텍처별 분석

### 3.1 x86-64 아키텍처

x86-64에서는 오버플로우 탐지를 위한 플래그 레지스터를 제공한다:

\`\`\`assembly
; 32비트 덧셈 오버플로우 검사
add eax, ebx        ; EAX = EAX + EBX
jo overflow_handler ; Jump if overflow flag is set

; 64비트 곱셈 오버플로우 검사
mov rax, large_num1
mul large_num2      ; RDX:RAX = RAX * large_num2
test rdx, rdx       ; 상위 64비트 검사
jnz overflow_detected
\`\`\`

### 3.2 ARM 아키텍처

ARM에서는 조건부 실행을 통한 효율적인 오버플로우 처리가 가능하다:

\`\`\`assembly
; ARM 덧셈 오버플로우 검사
adds r0, r1, r2     ; r0 = r1 + r2, 플래그 설정
bvs overflow_handler ; Branch if overflow set
\`\`\`

### 3.3 RISC-V 아키텍처

RISC-V는 명시적인 오버플로우 플래그를 제공하지 않아 소프트웨어적 검사가 필요하다:

\`\`\`assembly
# RISC-V 오버플로우 검사 (소프트웨어)
add t0, a0, a1      # t0 = a0 + a1
xor t1, a0, a1      # 피연산자 부호 비교
bgez t1, no_overflow # 부호가 다르면 오버플로우 없음
xor t1, t0, a0      # 결과와 첫 번째 피연산자 비교
bltz t1, overflow   # 부호가 바뀌었으면 오버플로우
\`\`\`

## 4. 프로그래밍 언어별 동작 분석

### 4.1 C/C++

C/C++에서는 부호 있는 정수 오버플로우가 정의되지 않은 동작(Undefined Behavior)이다:

\`\`\`cpp
#include <iostream>
#include <limits>
#include <climits>

// 안전한 덧셈 함수
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

// 안전한 곱셈 함수
bool safe_multiply(long long a, long long b, long long& result) {
    if (a == 0 || b == 0) {
        result = 0;
        return true;
    }

    // 절댓값으로 검사
    long long abs_a = (a < 0) ? -a : a;
    long long abs_b = (b < 0) ? -b : b;

    if (abs_a > LLONG_MAX / abs_b) {
        return false; // overflow
    }

    result = a * b;

    // 부호 검사
    if ((a > 0) == (b > 0)) {
        return result >= 0; // 같은 부호면 양수
    } else {
        return result <= 0; // 다른 부호면 음수
    }
}

// GCC/Clang 내장 함수 사용
bool builtin_safe_add(int a, int b, int& result) {
    return !__builtin_add_overflow(a, b, &result);
}

// 실제 사용 예제
void demonstrate_overflow() {
    int max_int = INT_MAX;
    int result;

    std::cout << "INT_MAX = " << max_int << std::endl;

    // 오버플로우 발생 시도
    if (safe_add(max_int, 1, result)) {
        std::cout << "Safe addition result: " << result << std::endl;
    } else {
        std::cout << "Addition would overflow!" << std::endl;
    }

    // 정의되지 않은 동작 (실제 코드에서는 하면 안됨)
    // int undefined_result = max_int + 1; // UB!
}
\`\`\`

### 4.2 Java

Java는 정수 오버플로우를 조용히 래핑(silent wrapping)한다:

\`\`\`java
public class IntegerOverflowDemo {

    // Java 8+ Math 클래스의 안전한 연산
    public static void safeMathOperations() {
        try {
            int result1 = Math.addExact(Integer.MAX_VALUE, 1);
        } catch (ArithmeticException e) {
            System.out.println("Addition overflow detected: " + e.getMessage());
        }

        try {
            int result2 = Math.multiplyExact(Integer.MAX_VALUE, 2);
        } catch (ArithmeticException e) {
            System.out.println("Multiplication overflow detected: " + e.getMessage());
        }
    }

    // 수동 오버플로우 검사
    public static boolean willAddOverflow(int a, int b) {
        if (a > 0 && b > 0) {
            return a > Integer.MAX_VALUE - b;
        }
        if (a < 0 && b < 0) {
            return a < Integer.MIN_VALUE - b;
        }
        return false; // 부호가 다르면 오버플로우 없음
    }

    // BigInteger를 사용한 임의 정밀도 연산
    public static void bigIntegerOperations() {
        BigInteger big1 = BigInteger.valueOf(Long.MAX_VALUE);
        BigInteger big2 = BigInteger.valueOf(Long.MAX_VALUE);

        BigInteger result = big1.add(big2);
        System.out.println("BigInteger addition: " + result);

        BigInteger powerResult = big1.pow(10);
        System.out.println("BigInteger power: " + powerResult);
    }

    public static void main(String[] args) {
        // 오버플로우 래핑 동작 확인
        int maxInt = Integer.MAX_VALUE;
        System.out.println("Integer.MAX_VALUE = " + maxInt);
        System.out.println("MAX_VALUE + 1 = " + (maxInt + 1)); // -2147483648

        safeMathOperations();
        bigIntegerOperations();
    }
}
\`\`\`

### 4.3 Python

Python은 임의 정밀도 정수를 지원하여 오버플로우가 발생하지 않는다:

\`\`\`python
import sys
import ctypes
from decimal import Decimal

def python_integer_behavior():
    """Python의 임의 정밀도 정수 동작 확인"""

    # Python 3에서는 정수 크기 제한이 없음
    large_number = 2 ** 1000
    print(f"2^1000 = {large_number}")

    # 매우 큰 수의 연산
    even_larger = large_number ** 2
    print(f"(2^1000)^2 has {len(str(even_larger))} digits")

    # 시스템 정수 크기 확인
    print(f"sys.maxsize = {sys.maxsize}")
    print(f"sys.maxsize + 1 = {sys.maxsize + 1}")  # 오버플로우 없음

def simulate_c_overflow():
    """C 스타일 정수 오버플로우 시뮬레이션"""

    def int32_overflow(value):
        """32비트 정수 오버플로우 시뮬레이션"""
        # 2의 보수 표현으로 변환
        if value >= 2**31:
            return value - 2**32
        elif value < -2**31:
            return value + 2**32
        return value

    def uint32_overflow(value):
        """32비트 부호 없는 정수 오버플로우 시뮬레이션"""
        return value % (2**32)

    # 테스트
    max_int32 = 2**31 - 1
    print(f"INT32_MAX = {max_int32}")
    print(f"INT32_MAX + 1 (with overflow) = {int32_overflow(max_int32 + 1)}")

    max_uint32 = 2**32 - 1
    print(f"UINT32_MAX = {max_uint32}")
    print(f"UINT32_MAX + 1 (with overflow) = {uint32_overflow(max_uint32 + 1)}")

def ctypes_overflow_demo():
    """ctypes를 사용한 실제 C 타입 오버플로우"""

    # C의 int32_t 타입 시뮬레이션
    class Int32(ctypes.Structure):
        _fields_ = [("value", ctypes.c_int32)]

    # 오버플로우 테스트
    num = Int32()
    num.value = 2147483647  # INT32_MAX
    print(f"INT32_MAX = {num.value}")

    num.value += 1  # 오버플로우 발생
    print(f"After overflow: {num.value}")  # -2147483648

def timing_analysis():
    """오버플로우 검사의 성능 영향 분석"""
    import time

    def unsafe_add(a, b):
        return a + b  # Python에서는 안전하지만 개념적으로

    def safe_add_check(a, b):
        # 가상의 32비트 정수 오버플로우 검사
        INT_MAX = 2**31 - 1
        INT_MIN = -2**31

        if a > 0 and b > 0 and a > INT_MAX - b:
            raise OverflowError("Positive overflow")
        if a < 0 and b < 0 and a < INT_MIN - b:
            raise OverflowError("Negative overflow")

        return a + b

    # 성능 테스트
    iterations = 1000000
    test_values = [(1000, 2000), (-1000, -2000), (100, -50)]

    # 안전하지 않은 버전
    start_time = time.time()
    for _ in range(iterations):
        for a, b in test_values:
            unsafe_add(a, b)
    unsafe_time = time.time() - start_time

    # 안전한 버전
    start_time = time.time()
    for _ in range(iterations):
        for a, b in test_values:
            try:
                safe_add_check(a, b)
            except OverflowError:
                pass
    safe_time = time.time() - start_time

    print(f"Unsafe operations: {unsafe_time:.4f} seconds")
    print(f"Safe operations: {safe_time:.4f} seconds")
    print(f"Overhead: {(safe_time / unsafe_time - 1) * 100:.2f}%")

if __name__ == "__main__":
    print("=== Python Integer Behavior ===")
    python_integer_behavior()

    print("\\n=== C-style Overflow Simulation ===")
    simulate_c_overflow()

    print("\\n=== ctypes Overflow Demo ===")
    ctypes_overflow_demo()

    print("\\n=== Timing Analysis ===")
    timing_analysis()
\`\`\`

### 4.4 Rust

Rust는 디버그 모드에서 오버플로우 시 패닉을 발생시키고, 릴리스 모드에서는 래핑한다:

\`\`\`rust
use std::num::Wrapping;

fn main() {
    // 디버그 모드에서는 패닉, 릴리스 모드에서는 래핑
    let max_i32 = i32::MAX;
    println!("i32::MAX = {}", max_i32);

    // 명시적 래핑 연산
    let wrapped_result = max_i32.wrapping_add(1);
    println!("Wrapped addition: {}", wrapped_result);

    // 포화 연산 (saturation)
    let saturated_result = max_i32.saturating_add(1);
    println!("Saturated addition: {}", saturated_result);

    // 검사된 연산
    match max_i32.checked_add(1) {
        Some(result) => println!("Checked addition: {}", result),
        None => println!("Addition would overflow!"),
    }

    // 오버플로우와 함께 결과 반환
    let (result, overflowed) = max_i32.overflowing_add(1);
    println!("Overflowing addition: result={}, overflowed={}", result, overflowed);

    demonstrate_wrapping_type();
    demonstrate_safe_arithmetic();
}

fn demonstrate_wrapping_type() {
    // Wrapping 타입 사용
    let a = Wrapping(u32::MAX);
    let b = Wrapping(1u32);
    let result = a + b; // 자동으로 래핑됨

    println!("Wrapping type: {} + {} = {}", a.0, b.0, result.0);
}

fn demonstrate_safe_arithmetic() {
    // 안전한 산술 연산 함수
    fn safe_multiply(a: i64, b: i64) -> Result<i64, &'static str> {
        a.checked_mul(b).ok_or("Multiplication overflow")
    }

    // 테스트
    match safe_multiply(i32::MAX as i64, 2) {
        Ok(result) => println!("Safe multiplication result: {}", result),
        Err(e) => println!("Error: {}", e),
    }

    match safe_multiply(i64::MAX, 2) {
        Ok(result) => println!("Safe multiplication result: {}", result),
        Err(e) => println!("Error: {}", e),
    }
}

// 컴파일 타임 오버플로우 검사를 위한 매크로
macro_rules! const_add_check {
    ($a:expr, $b:expr) => {{
        const RESULT: Option<i32> = $a.checked_add($b);
        match RESULT {
            Some(val) => val,
            None => panic!("Compile-time overflow detected!"),
        }
    }};
}

// 사용 예제
const SAFE_RESULT: i32 = const_add_check!(100, 200); // OK
// const OVERFLOW_RESULT: i32 = const_add_check!(i32::MAX, 1); // 컴파일 에러
\`\`\`

## 5. 보안 취약점 분석

### 5.1 버퍼 오버플로우와의 연관성

정수 오버플로우는 종종 버퍼 오버플로우의 전조가 된다:

\`\`\`c
// 취약한 코드 예제
void vulnerable_function(int size, char* data) {
    // size가 음수가 되어 malloc이 실패하거나 작은 버퍼를 할당
    int buffer_size = size + 100;  // 오버플로우 가능

    char* buffer = malloc(buffer_size);
    if (!buffer) return;

    // 실제로는 매우 작은 버퍼에 큰 데이터를 복사
    memcpy(buffer, data, size);  // 버퍼 오버플로우!

    free(buffer);
}

// 안전한 버전
void safe_function(size_t size, const char* data) {
    // 오버플로우 검사
    if (size > SIZE_MAX - 100) {
        return; // 오버플로우 방지
    }

    size_t buffer_size = size + 100;
    char* buffer = malloc(buffer_size);
    if (!buffer) return;

    memcpy(buffer, data, size);

    free(buffer);
}
\`\`\`

### 5.2 실제 CVE 사례 분석

#### CVE-2009-1897 (Pidgin)

\`\`\`c
// 취약한 코드 (단순화된 버전)
int process_data(unsigned char *data, int len) {
    int header_len = data[0];
    int payload_len = len - header_len;  // 오버플로우 가능!

    if (payload_len < 0) return -1;  // 이미 늦음

    char *buffer = malloc(payload_len);
    // ... 처리
}

// 수정된 코드
int process_data_safe(unsigned char *data, size_t len) {
    if (len == 0) return -1;

    size_t header_len = data[0];
    if (header_len >= len) return -1;  // 오버플로우 방지

    size_t payload_len = len - header_len;

    char *buffer = malloc(payload_len);
    // ... 안전한 처리
}
\`\`\`

### 5.3 암호학적 응용에서의 위험성

\`\`\`python
import hashlib
import secrets

def vulnerable_hash_function(data, iterations):
    """취약한 해시 함수 - 정수 오버플로우 가능"""

    # 32비트 시스템에서 iterations가 클 경우 문제
    total_work = len(data) * iterations  # 오버플로우 가능

    if total_work < 1000000:  # 잘못된 검사
        return hashlib.sha256(data).hexdigest()

    # 실제로는 매우 적은 반복 수행 (보안 약화)
    result = data
    for _ in range(iterations % (2**32)):  # 래핑으로 인한 약화
        result = hashlib.sha256(result).digest()

    return result.hex()

def secure_hash_function(data, iterations):
    """안전한 해시 함수"""

    # 입력 검증
    if not isinstance(iterations, int) or iterations < 0:
        raise ValueError("Invalid iterations")

    if iterations > 1000000:  # 합리적인 상한선
        raise ValueError("Too many iterations")

    if len(data) > 1000000:  # 데이터 크기 제한
        raise ValueError("Data too large")

    result = data
    for _ in range(iterations):
        result = hashlib.sha256(result).digest()

    return result.hex()

# 타이밍 공격 방지를 위한 상수 시간 비교
def constant_time_compare(a, b):
    """상수 시간 문자열 비교"""
    if len(a) != len(b):
        return False

    result = 0
    for x, y in zip(a, b):
        result |= ord(x) ^ ord(y)

    return result == 0
\`\`\`

## 6. 탐지 및 방지 기법

### 6.1 컴파일러 수준 방지

#### 6.1.1 GCC/Clang 내장 함수

\`\`\`c
#include <stdbool.h>
#include <stdio.h>

// 범용 오버플로우 검사 함수
bool check_add_overflow(long long a, long long b, long long *result) {
    #if __has_builtin(__builtin_add_overflow)
        return __builtin_add_overflow(a, b, result);
    #else
        // 수동 구현
        if (a > 0 && b > 0 && a > LLONG_MAX - b) return true;
        if (a < 0 && b < 0 && a < LLONG_MIN - b) return true;
        *result = a + b;
        return false;
    #endif
}

// 컴파일러 특정 속성 사용
__attribute__((no_sanitize("signed-integer-overflow")))
int intentional_overflow(int a, int b) {
    return a + b; // 의도적 오버플로우
}

// 포화 산술 구현
int saturating_add(int a, int b) {
    long long result = (long long)a + b;
    if (result > INT_MAX) return INT_MAX;
    if (result < INT_MIN) return INT_MIN;
    return (int)result;
}
\`\`\`

#### 6.1.2 AddressSanitizer와 UBSan

\`\`\`bash
# 컴파일 시 오버플로우 검사 활성화
gcc -fsanitize=signed-integer-overflow -fsanitize=unsigned-integer-overflow -g program.c

# 실행 시 오버플로우 탐지
./a.out
# runtime error: signed integer overflow: 2147483647 + 1 cannot be represented in type 'int'
\`\`\`

### 6.2 정적 분석 도구

#### 6.2.1 PC-lint/PC-lint Plus

\`\`\`c
/*lint -e{overflow} 오버플로우 경고 억제 */
int example_function(int a, int b) {
    // PC-lint가 잠재적 오버플로우를 탐지
    return a * b + 1000000;
}
\`\`\`

#### 6.2.2 Clang Static Analyzer

\`\`\`bash
# 정적 분석 실행
clang --analyze -Xanalyzer -analyzer-checker=core.UndefinedBinaryOperatorResult program.c
\`\`\`

### 6.3 런타임 검사 라이브러리

\`\`\`cpp
// SafeInt 라이브러리 스타일 구현
template<typename T>
class SafeInt {
private:
    T value;

    static bool will_add_overflow(T a, T b) {
        if constexpr (std::is_unsigned_v<T>) {
            return a > std::numeric_limits<T>::max() - b;
        } else {
            if (a > 0 && b > 0) {
                return a > std::numeric_limits<T>::max() - b;
            }
            if (a < 0 && b < 0) {
                return a < std::numeric_limits<T>::min() - b;
            }
            return false;
        }
    }

public:
    explicit SafeInt(T val) : value(val) {}

    SafeInt operator+(const SafeInt& other) const {
        if (will_add_overflow(value, other.value)) {
            throw std::overflow_error("Addition overflow");
        }
        return SafeInt(value + other.value);
    }

    SafeInt operator*(const SafeInt& other) const {
        if constexpr (std::is_unsigned_v<T>) {
            if (value != 0 && other.value > std::numeric_limits<T>::max() / value) {
                throw std::overflow_error("Multiplication overflow");
            }
        } else {
            // 부호 있는 곱셈은 더 복잡한 검사 필요
            if (value > 0 && other.value > 0) {
                if (value > std::numeric_limits<T>::max() / other.value) {
                    throw std::overflow_error("Multiplication overflow");
                }
            }
            // 다른 경우들...
        }
        return SafeInt(value * other.value);
    }

    T get() const { return value; }

    // 변환 연산자
    operator T() const { return value; }
};

// 사용 예제
void safe_arithmetic_example() {
    try {
        SafeInt<int> a(INT_MAX);
        SafeInt<int> b(1);

        SafeInt<int> result = a + b; // 예외 발생
        std::cout << "Result: " << result.get() << std::endl;
    } catch (const std::overflow_error& e) {
        std::cout << "Caught overflow: " << e.what() << std::endl;
    }
}
\`\`\`

## 7. 성능 영향 분석

### 7.1 벤치마크 결과

다양한 오버플로우 검사 방법의 성능을 측정한 결과:

\`\`\`cpp
#include <chrono>
#include <random>
#include <iostream>

class OverflowBenchmark {
private:
    static constexpr size_t ITERATIONS = 100000000;
    std::vector<int> test_data;

public:
    OverflowBenchmark() {
        test_data.reserve(ITERATIONS);
        std::random_device rd;
        std::mt19937 gen(rd());
        std::uniform_int_distribution<int> dis(1, 1000000);

        for (size_t i = 0; i < ITERATIONS; ++i) {
            test_data.push_back(dis(gen));
        }
    }

    void benchmark_unsafe_addition() {
        auto start = std::chrono::high_resolution_clock::now();

        volatile long long sum = 0; // volatile로 최적화 방지
        for (size_t i = 0; i < ITERATIONS - 1; ++i) {
            sum += test_data[i] + test_data[i + 1];
        }

        auto end = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start);

        std::cout << "Unsafe addition: " << duration.count() << " μs" << std::endl;
    }

    void benchmark_builtin_overflow() {
        auto start = std::chrono::high_resolution_clock::now();

        volatile long long sum = 0;
        for (size_t i = 0; i < ITERATIONS - 1; ++i) {
            int result;
            if (!__builtin_add_overflow(test_data[i], test_data[i + 1], &result)) {
                sum += result;
            }
        }

        auto end = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start);

        std::cout << "Builtin overflow check: " << duration.count() << " μs" << std::endl;
    }

    void benchmark_manual_overflow() {
        auto start = std::chrono::high_resolution_clock::now();

        volatile long long sum = 0;
        for (size_t i = 0; i < ITERATIONS - 1; ++i) {
            int a = test_data[i];
            int b = test_data[i + 1];

            if (!(a > 0 && b > 0 && a > INT_MAX - b)) {
                sum += a + b;
            }
        }

        auto end = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start);

        std::cout << "Manual overflow check: " << duration.count() << " μs" << std::endl;
    }

    void run_all_benchmarks() {
        std::cout << "Running overflow detection benchmarks..." << std::endl;
        std::cout << "Iterations: " << ITERATIONS << std::endl << std::endl;

        benchmark_unsafe_addition();
        benchmark_builtin_overflow();
        benchmark_manual_overflow();
    }
};

int main() {
    OverflowBenchmark benchmark;
    benchmark.run_all_benchmarks();
    return 0;
}
\`\`\`

### 7.2 컴파일러 최적화 영향

\`\`\`assembly
; GCC -O2 최적화된 오버플로우 검사
safe_add_optimized:
    mov    eax, edi
    add    eax, esi
    jo     .overflow_detected    ; Jump on overflow
    ret
.overflow_detected:
    mov    eax, -1              ; 에러 코드 반환
    ret

; 최적화되지 않은 버전 (더 많은 명령어)
safe_add_unoptimized:
    push   rbp
    mov    rbp, rsp
    mov    DWORD PTR [rbp-4], edi
    mov    DWORD PTR [rbp-8], esi
    ; ... 많은 검사 코드 ...
    pop    rbp
    ret
\`\`\`

## 8. 하드웨어 수준 지원

### 8.1 Intel CET (Control-flow Enforcement Technology)

Intel CET는 정수 오버플로우로 인한 ROP/JOP 공격을 방지한다:

\`\`\`c
// CET 지원 코드 예제
#ifdef __CET__
#include <immintrin.h>

void cet_protected_function() {
    // 그림자 스택을 사용한 리턴 주소 보호
    _ENDBR64; // 간접 분기 대상 마킹

    // 정상적인 함수 로직
    int result = some_calculation();

    // 리턴 시 CET가 자동으로 검증
}
#endif
\`\`\`

### 8.2 ARM Pointer Authentication

ARM v8.3에서 도입된 포인터 인증 기능:

\`\`\`c
// ARM 포인터 인증 사용 예제
#ifdef __ARM_FEATURE_PAC_DEFAULT
void pac_protected_function() {
    // 컴파일러가 자동으로 PAC 명령어 삽입
    void *return_address = __builtin_return_address(0);

    // 함수 로직
    vulnerable_calculation();

    // 리턴 시 포인터 인증 검증
}
#endif
\`\`\`

## 9. 최신 연구 동향

### 9.1 정형 검증 (Formal Verification)

CBMC와 같은 도구를 사용한 오버플로우 검증:

\`\`\`c
#include <assert.h>

// CBMC로 검증 가능한 함수
int verified_add(int a, int b) {
    // 전제 조건
    __CPROVER_assume(a >= 0 && a <= 1000000);
    __CPROVER_assume(b >= 0 && b <= 1000000);

    int result = a + b;

    // 후행 조건
    assert(result >= 0); // 오버플로우 없음을 검증

    return result;
}
\`\`\`

### 9.2 머신러닝 기반 탐지

\`\`\`python
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

class OverflowDetectionML:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)

    def extract_features(self, a, b, operation):
        """연산에서 특징 추출"""
        features = [
            abs(a),
            abs(b),
            a * b if operation == 'mul' else a + b,  # 결과값
            int(a > 0),
            int(b > 0),
            int((a > 0) == (b > 0)),  # 같은 부호인지
            len(bin(abs(a))) - 2,  # 비트 길이
            len(bin(abs(b))) - 2,
            operation == 'add',
            operation == 'mul'
        ]
        return np.array(features)

    def generate_training_data(self, n_samples=100000):
        """훈련 데이터 생성"""
        X = []
        y = []

        for _ in range(n_samples):
            # 랜덤 값 생성
            a = np.random.randint(-2**20, 2**20)
            b = np.random.randint(-2**20, 2**20)
            op = np.random.choice(['add', 'mul'])

            # 특징 추출
            features = self.extract_features(a, b, op)

            # 라벨 생성 (실제 오버플로우 검사)
            if op == 'add':
                try:
                    result = a + b
                    overflow = (a > 0 and b > 0 and result < 0) or \
                              (a < 0 and b < 0 and result > 0)
                except:
                    overflow = True
            else:  # mul
                try:
                    result = a * b
                    overflow = abs(result) > 2**31 - 1
                except:
                    overflow = True

            X.append(features)
            y.append(int(overflow))

        return np.array(X), np.array(y)

    def train(self):
        """모델 훈련"""
        X, y = self.generate_training_data()
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

        self.model.fit(X_train, y_train)
        accuracy = self.model.score(X_test, y_test)

        print(f"Model accuracy: {accuracy:.4f}")
        return accuracy

    def predict_overflow(self, a, b, operation):
        """오버플로우 예측"""
        features = self.extract_features(a, b, operation).reshape(1, -1)
        probability = self.model.predict_proba(features)[0][1]
        return probability > 0.5, probability

# 사용 예제
detector = OverflowDetectionML()
detector.train()

# 테스트
overflow, prob = detector.predict_overflow(2**30, 2**30, 'add')
print(f"Overflow predicted: {overflow}, Probability: {prob:.4f}")
\`\`\`

## 10. 산업별 적용 사례

### 10.1 자동차 산업 (MISRA C)

\`\`\`c
// MISRA C 2012 규칙 준수 코드
#include <stdint.h>
#include <limits.h>

// Rule 12.1: 연산자 우선순위 명시
// Rule 18.1: 포인터 산술에서 오버플로우 방지

typedef struct {
    uint32_t value;
    bool overflow_flag;
} safe_uint32_t;

safe_uint32_t safe_add_uint32(uint32_t a, uint32_t b) {
    safe_uint32_t result;

    if (a > UINT32_MAX - b) {
        result.value = 0U;
        result.overflow_flag = true;
    } else {
        result.value = a + b;
        result.overflow_flag = false;
    }

    return result;
}

// AUTOSAR C++14 호환 버전
namespace automotive {
    template<typename T>
    class SafeInteger {
        static_assert(std::is_integral_v<T>, "T must be integral type");

    private:
        T value_;
        bool overflow_occurred_;

    public:
        explicit SafeInteger(T val) : value_(val), overflow_occurred_(false) {}

        SafeInteger add(const SafeInteger& other) const noexcept {
            SafeInteger result(0);

            if constexpr (std::is_unsigned_v<T>) {
                if (value_ > std::numeric_limits<T>::max() - other.value_) {
                    result.overflow_occurred_ = true;
                } else {
                    result.value_ = value_ + other.value_;
                }
            } else {
                // 부호 있는 정수 처리
                if ((value_ > 0) && (other.value_ > 0) &&
                    (value_ > std::numeric_limits<T>::max() - other.value_)) {
                    result.overflow_occurred_ = true;
                } else if ((value_ < 0) && (other.value_ < 0) &&
                          (value_ < std::numeric_limits<T>::min() - other.value_)) {
                    result.overflow_occurred_ = true;
                } else {
                    result.value_ = value_ + other.value_;
                }
            }

            return result;
        }

        T get_value() const noexcept { return value_; }
        bool has_overflow() const noexcept { return overflow_occurred_; }
    };
}
\`\`\`

### 10.2 항공우주 산업 (DO-178C)

\`\`\`ada
-- Ada에서의 오버플로우 안전 코드
package Flight_Control_Math is
   type Safe_Integer is new Integer;

   Overflow_Error : exception;

   function Safe_Add(Left, Right : Safe_Integer) return Safe_Integer;
   function Safe_Multiply(Left, Right : Safe_Integer) return Safe_Integer;

private

   function Safe_Add(Left, Right : Safe_Integer) return Safe_Integer is
   begin
      -- Ada는 기본적으로 오버플로우 시 Constraint_Error 발생
      return Left + Right;
   exception
      when Constraint_Error =>
         raise Overflow_Error with "Addition overflow detected";
   end Safe_Add;

   function Safe_Multiply(Left, Right : Safe_Integer) return Safe_Integer is
   begin
      return Left * Right;
   exception
      when Constraint_Error =>
         raise Overflow_Error with "Multiplication overflow detected";
   end Safe_Multiply;

end Flight_Control_Math;
\`\`\`

### 10.3 금융 시스템

\`\`\`java
import java.math.BigDecimal;
import java.math.BigInteger;
import java.math.MathContext;
import java.math.RoundingMode;

public class FinancialSafeMath {

    // 고정소수점 연산을 위한 스케일 팩터
    private static final int SCALE = 8; // 소수점 8자리
    private static final BigInteger SCALE_FACTOR = BigInteger.TEN.pow(SCALE);

    public static class SafeMoney {
        private final BigInteger cents; // 센트 단위로 저장

        public SafeMoney(BigDecimal amount) {
            if (amount.scale() > SCALE) {
                throw new ArithmeticException("Too many decimal places");
            }
            this.cents = amount.multiply(new BigDecimal(SCALE_FACTOR)).toBigInteger();
        }

        public SafeMoney add(SafeMoney other) {
            BigInteger result = this.cents.add(other.cents);
            return new SafeMoney(new BigDecimal(result).divide(new BigDecimal(SCALE_FACTOR)));
        }

        public SafeMoney multiply(BigDecimal multiplier) {
            BigDecimal thisAmount = new BigDecimal(cents).divide(new BigDecimal(SCALE_FACTOR));
            BigDecimal result = thisAmount.multiply(multiplier);
            return new SafeMoney(result);
        }

        public BigDecimal toBigDecimal() {
            return new BigDecimal(cents).divide(new BigDecimal(SCALE_FACTOR), SCALE, RoundingMode.HALF_EVEN);
        }

        // 오버플로우 없는 복리 계산
        public SafeMoney compoundInterest(BigDecimal rate, int periods) {
            if (periods < 0) {
                throw new IllegalArgumentException("Periods must be non-negative");
            }

            BigDecimal one = BigDecimal.ONE;
            BigDecimal multiplier = one.add(rate);

            // 매우 큰 지수 계산을 위한 안전한 방법
            BigDecimal result = one;
            for (int i = 0; i < periods; i++) {
                result = result.multiply(multiplier);

                // 합리적인 상한선 검사
                if (result.compareTo(new BigDecimal("1E100")) > 0) {
                    throw new ArithmeticException("Compound interest result too large");
                }
            }

            return this.multiply(result);
        }
    }

    // 사용 예제
    public static void main(String[] args) {
        try {
            SafeMoney principal = new SafeMoney(new BigDecimal("1000.00"));
            BigDecimal interestRate = new BigDecimal("0.05"); // 5%

            SafeMoney finalAmount = principal.compoundInterest(interestRate, 10);
            System.out.println("Final amount: " + finalAmount.toBigDecimal());

        } catch (ArithmeticException e) {
            System.err.println("Calculation error: " + e.getMessage());
        }
    }
}
\`\`\`

## 11. 결론

정수 오버플로우는 컴퓨터 시스템의 근본적인 제약에서 비롯되는 현상으로, 단순한 수치 계산 오류를 넘어 심각한 보안 취약점의 원인이 될 수 있다. 본 연구에서 분석한 내용을 종합하면:

### 11.1 주요 발견사항

1. **수학적 모델링**: 모듈러 산술을 통한 정확한 오버플로우 예측 가능
2. **언어별 차이**: 각 프로그래밍 언어마다 다른 오버플로우 처리 정책
3. **성능 트레이드오프**: 안전성과 성능 사이의 균형점 존재
4. **하드웨어 지원**: 최신 CPU들이 제공하는 오버플로우 탐지 기능 활용 가능

### 11.2 권장사항

1. **개발 단계**: 정적 분석 도구와 컴파일러 경고 활용
2. **테스트 단계**: 경계값 테스트와 퍼지 테스트 수행
3. **배포 단계**: 런타임 검사와 모니터링 구현
4. **유지보수**: 정기적인 보안 감사와 업데이트

### 11.3 미래 전망

정수 오버플로우 문제는 다음과 같은 방향으로 발전할 것으로 예상된다:

- **컴파일러 기술**: 더 정교한 정적 분석과 자동 수정
- **하드웨어 지원**: 전용 오버플로우 탐지 유닛 개발
- **형식 검증**: 수학적 증명을 통한 완전한 검증
- **AI 활용**: 머신러닝 기반 취약점 탐지 시스템

정수 오버플로우는 컴퓨터 과학의 근본적인 문제로, 완전한 해결책보다는 지속적인 관리와 개선이 필요한 영역이다. 개발자들은 이 문제의 심각성을 인식하고, 적절한 도구와 기법을 사용하여 안전한 소프트웨어를 개발해야 한다.

## 참고문헌

1. Dietz, W., Li, P., Regehr, J., & Adve, V. (2012). "Understanding integer overflow in C/C++". *ACM Transactions on Software Engineering and Methodology*, 22(1), 1-29.

2. Brumley, D., Chiueh, T., Johnson, R., Lin, H., & Song, D. (2007). "Rich: Automatically protecting against integer-based vulnerabilities". *Department of Computer Science, Stony Brook University*, Tech. Rep.

3. Wang, T., Wei, T., Lin, Z., & Zou, W. (2009). "IntScope: Automatically detecting integer overflow vulnerability in X86 binary using symbolic execution". *Network and Distributed System Security Symposium*.

4. Chinchani, R., & Van Den Berg, E. (2005). "A fast static analysis approach to detect exploit code inside network flows". *International Workshop on Recent Advances in Intrusion Detection*.

5. Regehr, J. (2010). "A guide to undefined behavior in C and C++". *Blog post*, University of Utah.

---

*본 논문은 정수 오버플로우의 이론적 기초부터 실제 응용까지 포괄적으로 다룬 종합 연구입니다.*`,
        category: 'OVERFLOW',
        categoryDisplayName: categoryMap.OVERFLOW.displayName,
        categoryColor: categoryMap.OVERFLOW.color,
        status: 'published' as any,
        author: adminUser._id,
        viewCount: 0,
        imageUrl: ''
      }
    ];

    const createdArticles = await Article.insertMany(articles);
    console.log(`Created ${createdArticles.length} articles`);

    console.log('Content creation completed successfully!');

    // 결과 요약 출력
    console.log('\n=== Created Content Summary ===');
    console.log('Categories:');
    createdCategories.forEach(cat => {
      console.log(`- ${cat.displayName} (${cat.key}): ${cat.description}`);
    });

    console.log('\nArticles:');
    createdArticles.forEach(article => {
      console.log(`- ${article.title} (${article.category})`);
    });

    await mongoose.disconnect();
    console.log('Database connection closed');

  } catch (error) {
    console.error('Error creating content:', error);
    process.exit(1);
  }
};

createNewContent();