# CLAUDE.md — elin-portfolio 운영 가이드 (Claude용)

이 폴더는 사용자(엘린)의 포트폴리오 사이트 소스입니다. 사용자는 **Git/GitHub의 존재나
동작 방식을 전혀 몰라도 되는 것을 목표**로 이 프로젝트를 다룹니다. Claude가 배포까지
전부 대신 처리합니다.

- GitHub 저장소: https://github.com/yejincho-e/elin-portfolio (public)
- 실제 서비스 주소(GitHub Pages): **https://yejincho-e.github.io/elin-portfolio/**
- 배포 방식: `main` 브랜치에 반영되면 GitHub Pages가 자동으로 다시 빌드/배포됨
  (별도 Actions 워크플로 불필요, 저장소 Pages 설정이 `source: main / root`로 이미 되어 있음)
- 인증: `gh` CLI가 `~/bin/gh`에 설치되어 있고 `yejincho-e` 계정으로 이미 로그인되어 있음
  (`GITHUB_TOKEN` 환경변수 기반). 다시 로그인할 필요 없음.

## 사용자와의 소통 원칙 (중요)

사용자는 "커밋", "푸시", "브랜치", "레포" 같은 용어를 몰라도 되고, 알고 싶어하지도
않습니다. **Git/GitHub 용어를 사용자에게 노출하지 마세요.**

- ❌ "커밋하고 main에 푸시했어요"
- ✅ "반영했어요, 사이트에 바로 올라갔어요"

사용자가 코드/애셋을 수정해달라고 하거나, 수정 후 "반영해줘", "올려줘", "적용해줘",
"업데이트 해줘", "보여줘" 같은 말을 하면 — 별도 확인 없이 바로 아래 배포 워크플로를
실행하세요. 이 저장소에 한해 사용자가 이미 "수정 → 자동 반영 → 자동으로 열어서 보여주기"
전체 흐름을 명시적으로 승인했습니다.

## 배포 워크플로 (파일 수정 후 매번 실행)

1. **변경사항 반영**
   - `git`이 동작하면(`git --version` 확인) 이 폴더에서 표준적으로
     `git add -A && git commit -m "..." && git push origin main` 사용.
     (최초 1회 `git init` 및 `git remote add origin https://github.com/yejincho-e/elin-portfolio.git` 필요할 수 있음.
     인증은 `gh`가 이미 되어 있으므로 `gh auth setup-git`으로 git 인증도 연결 가능.)
   - `git`이 아직 안 되면(Xcode Command Line Tools 미설치 — `xcode-select --install`로
     설치 트리거는 걸어뒀으나 사용자가 설치를 안 끝냈을 수 있음) **GitHub Contents API로 대체**:
     ```bash
     OWNER=yejincho-e; REPO=elin-portfolio
     for f in <바뀐 파일들>; do
       SHA=$(~/bin/gh api "repos/$OWNER/$REPO/contents/$f" --jq .sha 2>/dev/null)
       CONTENT=$(base64 -i "$f" | tr -d '\n')
       ~/bin/gh api -X PUT "repos/$OWNER/$REPO/contents/$f" \
         -f message="update $f" -f content="$CONTENT" -f branch=main \
         ${SHA:+-f sha="$SHA"}
     done
     ```
     (파일이 이미 존재하면 반드시 기존 `sha`를 같이 보내야 덮어쓰기가 됨. 새 파일이면 sha 생략.)
   - 참고: 다음에 세션을 열 때 `git --version`을 한번 확인해서, Xcode 도구 설치가
     끝났으면 그때부터는 git 방식(더 안정적, 바이너리/다중 파일에 유리)으로 전환할 것.

2. **배포 확인 후 열어서 보여주기**
   ```bash
   for i in 1 2 3 4 5 6; do
     STATUS=$(~/bin/gh api repos/yejincho-e/elin-portfolio/pages/builds/latest --jq '.status')
     [ "$STATUS" = "built" ] && break
     sleep 10
   done
   open -a Safari "https://yejincho-e.github.io/elin-portfolio/"
   ```
   (사용자 요청으로 항상 **Safari**로 열 것 — Chrome 등 기본 브라우저로 열지 말 것.
   `open -a Safari <url>` 형태 사용.)
   빌드가 끝나는 걸 확인한 뒤에 브라우저를 열어야 최신 버전이 보임 (캐시로 안 보이면
   사용자에게 새로고침 안내).

3. 사용자에게는 결과만 짧게 알리기: "반영했어요, 사이트 열어드릴게요" 정도.

## 이 프로젝트 구조

```
elin-portfolio/
├─ index.html        # 마크업 (섹션: Hero / Work / About / Contact)
├─ css/styles.css    # 스타일 (테마 변수는 :root 상단)
├─ js/main.js        # 테마 토글, 모바일 메뉴, 스크롤 리빌
├─ assets/           # 이미지 (지금은 더미 SVG 플레이스홀더)
└─ CLAUDE.md         # ← 이 파일
```

로컬 미리보기: `index.html`을 브라우저로 바로 열어도 됨(순수 HTML/CSS/JS, 서버 불필요).
다만 실제로 "확인해줘"라고 하면 로컬 파일이 아니라 위 배포 워크플로를 거쳐
**실제 GitHub Pages 주소**를 열어서 보여줄 것 (사용자가 보고 싶은 건 항상 "진짜 사이트").

---

## 콘텐츠 채우기 가이드 (진행 방식)

아래 순서로 **한 번에 한 섹션씩** 사용자에게 질문하고, 답을 받은 뒤 해당 파일을
수정하세요. 아직 준비 안 된 항목은 더미 값을 유지하고 `(※ … 교체 필요)` 표시를
남겨 둡니다. 추측으로 채우지 마세요.

각 애셋 요청 시 항상 확인할 것:
- 파일 출처가 **본인 제작 / 라이선스 보유**인지
- 권장 규격(아래 명시)에 맞는지

### 1. 기본 / SEO → `index.html` `<head>`, `.nav__brand`, footer
- [ ] 이름(국문) / 영문 표기
- [ ] 직함 한 줄 (예: "Visual · Graphic Designer")
- [ ] 페이지 `<title>`, `<meta name="description">` 문구
- [ ] 저작권 표기 연도(자동이면 그대로 둠)

### 2. Hero → `.hero`
- [ ] 큰 타이틀 (2줄, `<em>`으로 강조할 단어 지정)
- [ ] 리드 문장 1~2줄 (한 줄 소개)
- [ ] 메타: 지역 / 상태 (예: "Seoul, KR", "Available for work")

### 3. Work — 프로젝트 카드 → `.grid` 안의 `.card`
프로젝트 **개수**부터 확인(현재 6개). 각 항목마다:
- [ ] 제목
- [ ] 태그/카테고리 (예: Print, Branding, Typography …)
- [ ] 링크 URL (상세페이지·Behance 등, 없으면 `#`)
- [ ] 대표 이미지 파일
  - 저장: `assets/work-01.svg` … 를 실제 파일로 교체 (`.jpg`/`.png`/`.webp` 가능,
    교체 시 `index.html`의 `src`와 확장자도 함께 수정)
  - 권장 규격: 세로형 4:5, 긴 카드는 4:6.4, 최소 폭 800px, **webp 권장**
  - `alt` 텍스트(대체 텍스트)도 함께 받기
- 레이아웃: `data-span="tall"`을 붙이면 세로로 2칸 차지(강조용)

### 4. About → `.about`
- [ ] 초상/작업 사진 → `assets/portrait.svg` 교체 (세로 4:5, 최소 600px)
- [ ] 자기소개 문단 1~2개
- [ ] Facts 3종: Focus / Tools / Since (라벨·값 자유 변경 가능)

### 5. Contact → `.contact`
- [ ] 대표 이메일 (`mailto:` 링크)
- [ ] 소셜 링크 (Instagram / Behance / LinkedIn … 실제 URL)

### 6. 톤앤매너 (선택) → `css/styles.css` `:root`
- [ ] 배경/글자/강조 색 (`--bg`, `--fg`, `--accent` 등)
- [ ] 서체 방향 (현재: 제목 Serif + 본문 Sans). 웹폰트 추가 원하면
      **라이선스 확인 후** `@font-face`로 로컬 임베드 권장(외부 CDN은 오프라인에서 끊김)
- [ ] 다크/라이트 기본값, 애니메이션 강도

## 애셋 교체 체크리스트

- [ ] `assets/` 의 `work-0X.svg`, `portrait.svg` 를 실제 이미지로 교체
- [ ] 교체한 파일 확장자에 맞춰 `index.html`의 `<img src>` 갱신
- [ ] 모든 `<img>`에 의미 있는 `alt` 채우기
- [ ] 이미지 용량 최적화(webp/압축), 큰 이미지는 `loading="lazy"` 유지
- [ ] 본문에 남은 `(※ … 교체 필요)` / `.dim` 안내 문구 전부 제거
- [ ] `hello@example.com`, 소셜 `href="#"` 등 더미 값 실제 값으로 교체

## 배포 전 최종 점검
- [ ] 브라우저에서 라이트/다크 모두 확인, 모바일 폭(≤620px)에서 메뉴·그리드 확인
- [ ] 사용한 **모든 이미지·폰트의 출처/라이선스**가 본인 것 또는 사용 허가된 것인지 재확인
- [ ] 콘솔 에러 없는지 확인
