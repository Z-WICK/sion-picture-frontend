<template>
  <div id="landingPage">
    <main class="landing-shell">
      <header class="shell-top">
        <div class="brand-mark">
          <img class="brand-logo" src="@/assets/logo.svg" alt="灵感之源 Logo" />
          <span class="brand-name">灵感之源</span>
        </div>
        <div class="shell-tags" aria-label="产品关键词">
          <span>Search</span>
          <span>Upload</span>
          <span>Space</span>
        </div>
      </header>

      <section class="hero-grid">
        <section class="hero-main">
          <p class="hero-kicker">Image Workspace</p>
          <h1 class="hero-title">把图片资产，变成可复用的创作系统</h1>
          <p class="hero-subtitle">
            用统一的检索、上传和空间协作流程，减少重复整理，把更多时间留给内容创作本身。
          </p>

          <div class="hero-highlight-strip" aria-label="核心能力摘要">
            <article class="hero-highlight-item">
              <SearchOutlined />
              <div>
                <p class="hero-highlight-title">检索路径清晰</p>
                <p class="hero-highlight-text">关键词、分类、标签联动过滤</p>
              </div>
            </article>
            <article class="hero-highlight-item">
              <CloudUploadOutlined />
              <div>
                <p class="hero-highlight-title">上传流程统一</p>
                <p class="hero-highlight-text">单图和批量入口保持一致</p>
              </div>
            </article>
            <article class="hero-highlight-item">
              <TeamOutlined />
              <div>
                <p class="hero-highlight-title">空间协作高效</p>
                <p class="hero-highlight-text">个人与团队空间同一体验</p>
              </div>
            </article>
          </div>

          <div class="hero-actions">
            <a-button type="primary" size="large" @click="enterSite">
              <template #icon>
                <ArrowRightOutlined />
              </template>
              进入站点
            </a-button>
            <a-button size="large" :href="githubRepo" target="_blank" rel="noopener noreferrer">
              <template #icon>
                <GithubOutlined />
              </template>
              GitHub 仓库
            </a-button>
          </div>

          <p class="live-stats" aria-live="polite">
            <span class="live-dot" aria-hidden="true" />
            {{ statsText }}
          </p>
        </section>

        <aside class="hero-side" aria-label="产品界面预览">
          <article class="preview-card">
            <div class="preview-head">
              <p class="preview-kicker">Realtime Snapshot</p>
              <h2 class="preview-title">公开图库概览</h2>
            </div>

            <figure
              class="preview-frame"
              tabindex="0"
              @mousemove="onPreviewMove"
              @mouseleave="resetPreviewMotion"
              @blur="resetPreviewMotion"
            >
              <picture>
                <source
                  type="image/webp"
                  srcset="
                    /landing-preview-640.webp 640w,
                    /landing-preview-960.webp 960w,
                    /landing-preview.webp 1280w
                  "
                  sizes="(max-width: 860px) 100vw, 520px"
                />
                <img
                  src="/landing-preview.png"
                  alt="灵感之源产品界面预览截图"
                  class="preview-image"
                  :style="previewImageStyle"
                  loading="eager"
                  decoding="async"
                  fetchpriority="high"
                />
              </picture>
              <span class="preview-grid" aria-hidden="true" />
              <span class="preview-glare" :style="previewGlareStyle" aria-hidden="true" />
            </figure>

            <div class="stats-grid" aria-label="关键数据">
              <article class="stat-chip">
                <span class="stat-label">Public Images</span>
                <strong class="stat-value">{{ displayStats.total }}</strong>
              </article>
              <article class="stat-chip">
                <span class="stat-label">Categories</span>
                <strong class="stat-value">{{ displayStats.categories }}</strong>
              </article>
              <article class="stat-chip">
                <span class="stat-label">Tags</span>
                <strong class="stat-value">{{ displayStats.tags }}</strong>
              </article>
            </div>

            <div class="preview-links">
              <a-button size="small" @click="enterSite">进入公开图库</a-button>
              <a-button size="small" href="/add_picture" target="_blank">上传入口</a-button>
            </div>
          </article>
        </aside>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  ArrowRightOutlined,
  CloudUploadOutlined,
  GithubOutlined,
  SearchOutlined,
  TeamOutlined,
} from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import { getPictureTagCategory, postPictureListPageVo } from '@/api/picture'

const router = useRouter()
const githubRepo = 'https://github.com/Z-WICK/sion-picture-frontend'

const publicStats = ref({
  total: 0,
  categories: 0,
  tags: 0,
})
const displayStats = ref({
  total: 0,
  categories: 0,
  tags: 0,
})
const statsLoaded = ref(false)
const statsError = ref(false)

const reduceMotion = ref(false)
const tiltX = ref(0)
const tiltY = ref(0)
const glareX = ref(50)
const glareY = ref(50)
const pointerX = ref(50)
const pointerY = ref(50)
const previewRafId = ref<number>()
const statsRafId = ref<number>()

const statsText = computed(() => {
  if (!statsLoaded.value) {
    return '正在同步公开图库数据...'
  }
  if (statsError.value) {
    return '暂时无法获取实时数据，进入站点可查看完整内容'
  }
  return `已收录 ${new Intl.NumberFormat('zh-CN').format(publicStats.value.total)} 张公开图片 · ${publicStats.value.categories} 个分类 · ${publicStats.value.tags} 个标签`
})

const previewImageStyle = computed(() => {
  if (reduceMotion.value) {
    return {}
  }
  return {
    transform: `scale(1.04) rotateX(${tiltY.value}deg) rotateY(${tiltX.value}deg)`,
  }
})

const previewGlareStyle = computed(() => {
  if (reduceMotion.value) {
    return {}
  }
  return {
    background: `radial-gradient(circle at ${glareX.value}% ${glareY.value}%, rgb(255 255 255 / 50%) 0%, rgb(255 255 255 / 0%) 58%)`,
  }
})

const enterSite = () => {
  router.push('/gallery')
}

const onPreviewMove = (event: MouseEvent) => {
  if (reduceMotion.value) {
    return
  }
  const target = event.currentTarget as HTMLElement | null
  if (!target) {
    return
  }
  const rect = target.getBoundingClientRect()
  const x = (event.clientX - rect.left) / rect.width
  const y = (event.clientY - rect.top) / rect.height
  pointerX.value = x * 100
  pointerY.value = y * 100
  if (previewRafId.value !== undefined) {
    return
  }
  previewRafId.value = window.requestAnimationFrame(() => {
    previewRafId.value = undefined
    const normalizedX = pointerX.value / 100
    const normalizedY = pointerY.value / 100
    tiltX.value = (normalizedX - 0.5) * 7.5
    tiltY.value = (0.5 - normalizedY) * 7.5
    glareX.value = pointerX.value
    glareY.value = pointerY.value
  })
}

const resetPreviewMotion = () => {
  if (previewRafId.value !== undefined) {
    window.cancelAnimationFrame(previewRafId.value)
    previewRafId.value = undefined
  }
  tiltX.value = 0
  tiltY.value = 0
  pointerX.value = 50
  pointerY.value = 50
  glareX.value = 50
  glareY.value = 50
}

const animateDisplayStats = () => {
  if (reduceMotion.value) {
    displayStats.value = { ...publicStats.value }
    return
  }
  if (statsRafId.value !== undefined) {
    window.cancelAnimationFrame(statsRafId.value)
  }
  const start = performance.now()
  const duration = 680
  const target = { ...publicStats.value }

  const step = (now: number) => {
    const progress = Math.min((now - start) / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    displayStats.value = {
      total: Math.round(target.total * eased),
      categories: Math.round(target.categories * eased),
      tags: Math.round(target.tags * eased),
    }
    if (progress < 1) {
      statsRafId.value = window.requestAnimationFrame(step)
    } else {
      statsRafId.value = undefined
      displayStats.value = target
    }
  }

  statsRafId.value = window.requestAnimationFrame(step)
}

const fetchPublicStats = async () => {
  try {
    const [listRes, optionsRes] = await Promise.all([
      postPictureListPageVo({
        current: 1,
        pageSize: 1,
        sortField: 'createTime',
        sortOrder: 'descend',
        nullSpaceId: true,
      } as API.PictureQueryRequest & { nullSpaceId: boolean }),
      getPictureTagCategory(),
    ])

    if (listRes.data.code === 0 && listRes.data.data) {
      publicStats.value.total = listRes.data.data.total ?? 0
    } else {
      statsError.value = true
    }

    if (optionsRes.data.code === 0 && optionsRes.data.data) {
      publicStats.value.categories = optionsRes.data.data.categoryList?.length ?? 0
      publicStats.value.tags = optionsRes.data.data.tagList?.length ?? 0
    } else {
      statsError.value = true
    }

    animateDisplayStats()
  } catch {
    statsError.value = true
    displayStats.value = { total: 0, categories: 0, tags: 0 }
  } finally {
    statsLoaded.value = true
  }
}

onMounted(() => {
  reduceMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  fetchPublicStats()
})

onBeforeUnmount(() => {
  if (previewRafId.value !== undefined) {
    window.cancelAnimationFrame(previewRafId.value)
  }
  if (statsRafId.value !== undefined) {
    window.cancelAnimationFrame(statsRafId.value)
  }
})
</script>

<style scoped>
#landingPage {
  --page-top: #f8fbff;
  --page-bottom: #e9f1f8;
  --surface: #ffffff;
  --line: #cfdbea;
  --line-strong: #b9cde1;
  --text-main: #1c2f45;
  --text-subtle: #5f748d;
  --brand: #355273;
  --brand-hover: #274562;
  --brand-soft: #e4edf8;

  min-height: 100vh;
  padding: clamp(16px, 2.8vw, 32px);
  display: grid;
  place-items: center;
  background:
    radial-gradient(120% 110% at 0% 0%, rgb(255 255 255 / 92%) 0%, transparent 62%),
    radial-gradient(120% 120% at 100% 100%, rgb(224 236 248 / 84%) 0%, transparent 58%),
    linear-gradient(180deg, var(--page-top) 0%, var(--page-bottom) 100%);
}

.landing-shell {
  width: min(1180px, 100%);
  border-radius: 30px;
  border: 1px solid var(--line);
  padding: clamp(20px, 2.8vw, 36px);
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgb(255 255 255 / 95%) 0%, rgb(245 250 255 / 95%) 100%),
    var(--surface);
  box-shadow:
    0 24px 48px rgb(28 47 69 / 13%),
    inset 0 1px 0 rgb(255 255 255 / 90%);
}

.landing-shell::before {
  content: '';
  position: absolute;
  width: 360px;
  height: 360px;
  right: -140px;
  top: -140px;
  border-radius: 50%;
  background: radial-gradient(circle, rgb(84 121 160 / 24%) 0%, rgb(84 121 160 / 0%) 72%);
  pointer-events: none;
}

.landing-shell::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(115deg, rgb(255 255 255 / 0%) 44%, rgb(255 255 255 / 34%) 50%, rgb(255 255 255 / 0%) 56%),
    repeating-linear-gradient(0deg, rgb(53 82 115 / 0.02) 0, rgb(53 82 115 / 0.02) 1px, transparent 1px, transparent 24px);
  mix-blend-mode: soft-light;
  pointer-events: none;
}

.shell-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--line);
  position: relative;
  z-index: 1;
}

.brand-mark {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.brand-logo {
  width: 30px;
  height: 30px;
}

.brand-name {
  font-size: 16px;
  line-height: 1;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: var(--text-main);
}

.shell-tags {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.shell-tags span {
  min-height: 32px;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: linear-gradient(180deg, rgb(255 255 255 / 86%) 0%, rgb(241 247 255 / 86%) 100%);
  color: var(--text-subtle);
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.hero-grid {
  margin-top: clamp(20px, 3vw, 34px);
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  gap: clamp(18px, 2.4vw, 30px);
  position: relative;
  z-index: 1;
}

.hero-main {
  align-self: center;
}

.hero-kicker {
  margin: 0;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--text-subtle);
}

.hero-title {
  margin: 14px 0 0;
  max-width: 11.5em;
  font-family:
    'SF Pro Display',
    'Avenir Next',
    'PingFang SC',
    'Hiragino Sans GB',
    sans-serif;
  font-size: clamp(2.2rem, 5.2vw, 4rem);
  line-height: 1.08;
  letter-spacing: -0.025em;
  color: var(--text-main);
}

.hero-subtitle {
  margin: 18px 0 0;
  max-width: 37em;
  font-size: clamp(1rem, 1.2vw, 1.1rem);
  line-height: 1.72;
  color: var(--text-subtle);
}

.hero-highlight-strip {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.hero-highlight-item {
  border-radius: 12px;
  border: 1px solid var(--line);
  padding: 10px;
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr);
  gap: 8px;
  align-items: flex-start;
  background:
    radial-gradient(140% 120% at 100% 0%, rgb(138 166 193 / 12%) 0%, transparent 60%),
    linear-gradient(180deg, rgb(255 255 255 / 90%) 0%, rgb(243 249 255 / 90%) 100%);
}

.hero-highlight-item :deep(.anticon) {
  margin-top: 2px;
  font-size: 15px;
  color: #355273;
}

.hero-highlight-title {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main);
}

.hero-highlight-text {
  margin: 3px 0 0;
  font-size: 11px;
  line-height: 1.55;
  color: var(--text-subtle);
}

.hero-actions {
  margin-top: 28px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.hero-actions :deep(.ant-btn) {
  min-height: 46px;
  border-radius: 999px;
  padding-inline: 24px;
  font-weight: 600;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.hero-actions :deep(.ant-btn:hover) {
  transform: translateY(-1px);
}

.hero-actions :deep(.ant-btn-primary) {
  border-color: var(--brand);
  background: var(--brand);
  box-shadow: 0 10px 20px rgb(53 82 115 / 24%);
}

.hero-actions :deep(.ant-btn-primary:hover),
.hero-actions :deep(.ant-btn-primary:focus) {
  border-color: var(--brand-hover);
  background: var(--brand-hover);
}

.hero-actions :deep(.ant-btn:focus-visible) {
  outline: 2px solid #6e8eb1;
  outline-offset: 2px;
}

.live-stats {
  margin: 14px 0 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-subtle);
}

.live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #3e607f;
  box-shadow: 0 0 0 0 rgb(62 96 127 / 36%);
  animation: pulseDot 1.9s ease-in-out infinite;
}

.hero-side {
  min-width: 0;
}

.preview-card {
  border: 1px solid var(--line);
  border-radius: 24px;
  padding: 16px;
  background:
    radial-gradient(130% 120% at 100% 0%, rgb(89 128 168 / 16%) 0%, transparent 60%),
    linear-gradient(180deg, rgb(255 255 255 / 90%) 0%, rgb(242 248 255 / 90%) 100%);
  box-shadow: 0 14px 32px rgb(30 49 70 / 10%);
}

.preview-head {
  margin-bottom: 10px;
}

.preview-kicker {
  margin: 0;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-subtle);
}

.preview-title {
  margin: 6px 0 0;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--text-main);
}

.preview-frame {
  margin: 0;
  width: 100%;
  aspect-ratio: 16 / 10;
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid var(--line-strong);
  background: #dbe6f2;
  box-shadow:
    0 14px 30px rgb(29 46 67 / 18%),
    inset 0 1px 0 rgb(255 255 255 / 65%);
  perspective: 900px;
}

.preview-frame:focus-visible {
  outline: 2px solid #6e8eb1;
  outline-offset: 2px;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform-origin: center;
  transition: transform 0.22s ease;
  will-change: transform;
}

.preview-grid {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgb(255 255 255 / 14%) 0%, rgb(255 255 255 / 0%) 44%),
    repeating-linear-gradient(
      90deg,
      rgb(255 255 255 / 0.08) 0,
      rgb(255 255 255 / 0.08) 1px,
      transparent 1px,
      transparent 44px
    );
  pointer-events: none;
}

.preview-glare {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.stats-grid {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.stat-chip {
  min-height: 74px;
  border-radius: 12px;
  border: 1px solid var(--line);
  padding: 10px;
  display: grid;
  align-content: space-between;
  background: linear-gradient(180deg, rgb(255 255 255 / 92%) 0%, rgb(238 245 253 / 92%) 100%);
}

.stat-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-subtle);
}

.stat-value {
  margin-top: 6px;
  font-size: clamp(1.08rem, 2vw, 1.38rem);
  line-height: 1;
  color: var(--text-main);
}

.preview-links {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.preview-links :deep(.ant-btn) {
  min-height: 32px;
  border-radius: 999px;
  padding-inline: 12px;
  font-size: 12px;
}

.preview-links :deep(.ant-btn:hover) {
  transform: translateY(-1px);
}

@keyframes pulseDot {
  0% {
    box-shadow: 0 0 0 0 rgb(62 96 127 / 34%);
  }
  70% {
    box-shadow: 0 0 0 8px rgb(62 96 127 / 0%);
  }
  100% {
    box-shadow: 0 0 0 0 rgb(62 96 127 / 0%);
  }
}

@media (max-width: 1080px) {
  .hero-title {
    max-width: 100%;
  }

  .hero-highlight-strip {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 860px) {
  .hero-grid {
    grid-template-columns: 1fr;
  }

  .hero-subtitle {
    max-width: 100%;
  }

  .preview-card {
    margin-top: 2px;
  }
}

@media (max-width: 620px) {
  #landingPage {
    padding: 10px;
  }

  .landing-shell {
    border-radius: 22px;
    padding: 14px;
  }

  .shell-top {
    padding-bottom: 12px;
  }

  .brand-name {
    font-size: 15px;
  }

  .shell-tags {
    display: none;
  }

  .hero-title {
    font-size: clamp(1.9rem, 9vw, 2.35rem);
  }

  .hero-actions {
    gap: 8px;
  }

  .hero-actions :deep(.ant-btn) {
    min-height: 44px;
    padding-inline: 18px;
  }

  .preview-links {
    gap: 6px;
  }

  .preview-links :deep(.ant-btn) {
    min-height: 30px;
    padding-inline: 10px;
    font-size: 11px;
  }

  .stats-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 6px;
  }

  .stat-chip {
    min-height: 68px;
    padding: 8px;
  }

  .stat-value {
    font-size: 1.02rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-actions :deep(.ant-btn),
  .preview-image,
  .live-dot {
    transition: none !important;
    animation: none !important;
  }
}
</style>
