<template>
  <div id="landingPage">
    <main class="landing-shell">
      <header class="shell-top">
        <div class="brand-mark">
          <img class="brand-logo" src="@/assets/logo.svg" alt="灵感之源 Logo" />
          <span class="brand-name">灵感之源</span>
        </div>
        <div class="shell-nav" aria-label="产品能力速览">
          <span>Search</span>
          <span>Upload</span>
          <span>Collaboration</span>
        </div>
      </header>

      <section class="hero-grid">
        <section class="hero-main">
          <p class="hero-kicker">Image Workspace</p>
          <h1 class="hero-title">
            让图片资产管理不止可用，而是
            <span class="title-accent">有秩序</span>
            且
            <span class="title-accent-soft">有美感</span>
          </h1>
          <p class="hero-subtitle">
            面向团队与个人的图片工作台。统一搜索、上传与空间协作流程，减少重复劳动，提升图片复用效率。
          </p>

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

          <div class="stats-grid" aria-label="关键数据">
            <article class="stat-chip">
              <span class="stat-chip-label">Public Images</span>
              <strong class="stat-chip-value">{{ displayStats.total }}</strong>
            </article>
            <article class="stat-chip">
              <span class="stat-chip-label">Categories</span>
              <strong class="stat-chip-value">{{ displayStats.categories }}</strong>
            </article>
            <article class="stat-chip">
              <span class="stat-chip-label">Tags</span>
              <strong class="stat-chip-value">{{ displayStats.tags }}</strong>
            </article>
          </div>

          <div class="signal-row" aria-label="价值概览">
            <article class="signal-card">
              <PictureOutlined />
              <div>
                <p class="signal-label">图库检索</p>
                <p class="signal-value">多维筛选与快速定位</p>
              </div>
            </article>
            <article class="signal-card">
              <CloudUploadOutlined />
              <div>
                <p class="signal-label">上传工作流</p>
                <p class="signal-value">单图与批量处理并行</p>
              </div>
            </article>
            <article class="signal-card">
              <TeamOutlined />
              <div>
                <p class="signal-label">空间协作</p>
                <p class="signal-value">个人与团队统一体验</p>
              </div>
            </article>
          </div>
        </section>

        <aside class="hero-side" aria-label="产品视觉预览">
          <article class="showcase-card">
            <p class="showcase-kicker">Workflow</p>
            <h2 class="showcase-title">从分散管理，到统一中枢</h2>
            <p class="showcase-subtitle">01 / 搜索 02 / 上传 03 / 协作</p>

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
                  sizes="(max-width: 768px) 100vw, (max-width: 1140px) 46vw, 520px"
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
              <span class="preview-glare" :style="previewGlareStyle" aria-hidden="true" />
            </figure>

            <div class="preview-badges">
              <span class="badge-item">Unified Gallery</span>
              <span class="badge-item">Batch Upload</span>
              <span class="badge-item">Team Space</span>
            </div>
          </article>

          <blockquote class="pull-quote">
            “更少的界面切换，意味着更多的创作时间。”
          </blockquote>
        </aside>
      </section>

      <section class="story-strip" aria-label="产品使用三步流程">
        <div class="story-head">
          <h2 class="story-title">三步完成图片工作流</h2>
          <div class="story-progress" aria-hidden="true">
            <span class="progress-dot is-active" />
            <span class="progress-dot" />
            <span class="progress-dot" />
          </div>
        </div>
        <article class="story-step">
          <span class="step-index">Chapter 01</span>
          <h3 class="step-title">发现</h3>
          <p class="step-text">通过关键词、分类与标签，在海量图库中快速定位候选图片。</p>
          <a-button type="link" class="step-link" @click="goWithPreset('discover')">探索图片</a-button>
        </article>
        <article class="story-step">
          <span class="step-index">Chapter 02</span>
          <h3 class="step-title">整理</h3>
          <p class="step-text">将单图或批量内容纳入统一资产流，补充信息并保持结构化。</p>
          <a-button type="link" class="step-link" @click="goWithPreset('upload')">上传素材</a-button>
        </article>
        <article class="story-step">
          <span class="step-index">Chapter 03</span>
          <h3 class="step-title">协作</h3>
          <p class="step-text">在个人和团队空间中共享图片，减少重复沟通和版本分散。</p>
          <a-button type="link" class="step-link" @click="goWithPreset('space')">进入空间</a-button>
        </article>
      </section>

      <footer class="shell-foot">
        <span>Public Gallery</span>
        <span class="dot" />
        <span>Batch Upload</span>
        <span class="dot" />
        <span>Team Spaces</span>
        <span class="dot" />
        <span>Open Source</span>
      </footer>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  ArrowRightOutlined,
  CloudUploadOutlined,
  GithubOutlined,
  PictureOutlined,
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
    return '公开图库数据加载中...'
  }
  if (statsError.value) {
    return '暂时无法获取实时数据，点击进入站点查看完整内容'
  }
  return `公开图库 ${new Intl.NumberFormat('zh-CN').format(publicStats.value.total)} 张 · ${publicStats.value.categories} 个分类 · ${publicStats.value.tags} 个标签`
})

const previewImageStyle = computed(() => {
  if (reduceMotion.value) {
    return {}
  }
  return {
    transform: `scale(1.03) rotateX(${tiltY.value}deg) rotateY(${tiltX.value}deg)`,
  }
})

const previewGlareStyle = computed(() => {
  if (reduceMotion.value) {
    return {}
  }
  return {
    background: `radial-gradient(circle at ${glareX.value}% ${glareY.value}%, rgb(255 255 255 / 44%) 0%, rgb(255 255 255 / 0%) 58%)`,
  }
})

const enterSite = () => {
  router.push('/gallery')
}

const goWithPreset = (scene: 'discover' | 'upload' | 'space') => {
  router.push({
    path: '/gallery',
    query: {
      scene,
    },
  })
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
    tiltX.value = (normalizedX - 0.5) * 8
    tiltY.value = (0.5 - normalizedY) * 8
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
  const duration = 720
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
  --page-bg-top: #f8fbff;
  --page-bg-bottom: #eaf1f8;
  --surface: #ffffff;
  --line: #d4deea;
  --line-strong: #b8c9db;
  --text-main: #1f3147;
  --text-subtle: #60748d;
  --brand: #355273;
  --brand-hover: #274562;
  --brand-soft: #e8f0f9;
  --brand-highlight: #6f8dad;

  min-height: 100vh;
  padding: 26px;
  display: grid;
  place-items: center;
  background:
    radial-gradient(110% 120% at 0% 0%, rgb(255 255 255 / 90%) 0%, transparent 66%),
    radial-gradient(120% 130% at 100% 100%, rgb(227 236 247 / 80%) 0%, transparent 62%),
    linear-gradient(180deg, var(--page-bg-top) 0%, var(--page-bg-bottom) 100%);
  font-family:
    'Inter',
    'Avenir Next',
    'PingFang SC',
    'Hiragino Sans GB',
    'Microsoft YaHei',
    sans-serif;
}

.landing-shell {
  width: min(1140px, 100%);
  border-radius: 30px;
  border: 1px solid var(--line);
  background:
    linear-gradient(180deg, rgb(255 255 255 / 96%) 0%, rgb(246 250 255 / 96%) 100%),
    var(--surface);
  box-shadow:
    0 22px 44px rgb(32 49 71 / 12%),
    inset 0 1px 0 rgb(255 255 255 / 88%);
  padding: 34px;
  position: relative;
  overflow: hidden;
}

.landing-shell::before {
  content: '';
  position: absolute;
  right: -120px;
  top: -120px;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgb(80 122 167 / 18%) 0%, rgb(80 122 167 / 0%) 74%);
  pointer-events: none;
}

.landing-shell::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(120deg, rgb(255 255 255 / 0%) 45%, rgb(255 255 255 / 36%) 50%, rgb(255 255 255 / 0%) 55%),
    repeating-linear-gradient(0deg, rgb(54 82 115 / 0.018) 0, rgb(54 82 115 / 0.018) 1px, transparent 1px, transparent 22px);
  mix-blend-mode: soft-light;
  pointer-events: none;
}

.shell-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-inline: 2px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--line);
}

.brand-mark {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.brand-logo {
  width: 28px;
  height: 28px;
}

.brand-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-main);
}

.shell-nav {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.shell-nav span {
  min-height: 32px;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: linear-gradient(180deg, rgb(255 255 255 / 84%) 0%, rgb(241 248 255 / 84%) 100%);
  color: var(--text-subtle);
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 90%);
}

.hero-grid {
  margin-top: 28px;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  gap: 30px;
}

.hero-main {
  min-width: 0;
  position: relative;
  z-index: 1;
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
  max-width: 13em;
  font-family:
    'Playfair Display',
    'Noto Serif SC',
    'Songti SC',
    serif;
  font-size: clamp(2.25rem, 5.9vw, 4.1rem);
  line-height: 1.12;
  letter-spacing: -0.015em;
  color: var(--text-main);
}

.title-accent {
  color: #2d4f72;
  background: linear-gradient(110deg, #2a4868 0%, #6386a9 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.title-accent-soft {
  color: #4e7093;
  background: linear-gradient(105deg, #3f6387 0%, #7fa5c8 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-subtitle {
  margin: 18px 0 0;
  max-width: 40em;
  font-size: 17px;
  line-height: 1.75;
  color: var(--text-subtle);
}

.hero-actions {
  margin-top: 30px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.hero-actions :deep(.ant-btn) {
  min-height: 46px;
  border-radius: 999px;
  padding-inline: 24px;
  font-weight: 600;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hero-actions :deep(.ant-btn:hover) {
  transform: translateY(-1px);
}

.hero-actions :deep(.ant-btn-primary) {
  border-color: var(--brand);
  background: var(--brand);
  box-shadow: 0 8px 20px rgb(53 82 115 / 25%);
}

.hero-actions :deep(.ant-btn-primary:hover),
.hero-actions :deep(.ant-btn-primary:focus) {
  border-color: var(--brand-hover);
  background: var(--brand-hover);
}

.hero-actions :deep(.ant-btn:focus-visible) {
  outline: 2px solid #6c8fb3;
  outline-offset: 2px;
}

.live-stats {
  margin: 12px 0 0;
  color: var(--text-subtle);
  font-size: 13px;
  line-height: 1.6;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #3a5b7f;
  animation: pulseDot 1.8s ease-in-out infinite;
}

.stats-grid {
  margin-top: 14px;
  max-width: 540px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.stat-chip {
  border: 1px solid var(--line);
  border-radius: 14px;
  min-height: 86px;
  padding: 10px 12px;
  background:
    radial-gradient(120% 120% at 100% 0%, rgb(112 143 176 / 14%) 0%, transparent 58%),
    linear-gradient(180deg, rgb(255 255 255 / 84%) 0%, rgb(241 247 255 / 84%) 100%);
  box-shadow:
    0 8px 16px rgb(36 57 81 / 8%),
    inset 0 1px 0 rgb(255 255 255 / 95%);
  display: grid;
  align-content: center;
  gap: 8px;
  transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
}

.stat-chip:hover {
  transform: translateY(-2px);
  border-color: var(--line-strong);
  box-shadow:
    0 12px 20px rgb(36 57 81 / 12%),
    inset 0 1px 0 rgb(255 255 255 / 98%);
}

.stat-chip-label {
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-subtle);
}

.stat-chip-value {
  margin: 0;
  font-size: clamp(1.32rem, 1.2vw + 0.95rem, 1.7rem);
  line-height: 1;
  letter-spacing: -0.01em;
  color: var(--text-main);
  font-variant-numeric: tabular-nums;
}

.signal-row {
  margin-top: 18px;
  display: grid;
  gap: 10px;
}

.signal-card {
  border: 1px solid var(--line);
  border-radius: 14px;
  background:
    linear-gradient(180deg, rgb(255 255 255 / 82%) 0%, rgb(242 248 255 / 82%) 100%),
    rgb(255 255 255 / 74%);
  min-height: 58px;
  padding: 10px 12px;
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr);
  gap: 10px;
  align-items: center;
  box-shadow: 0 8px 16px rgb(36 57 81 / 8%);
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.signal-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 22px rgb(36 57 81 / 12%);
}

.signal-card :deep(.anticon) {
  color: #3a5b7f;
  font-size: 18px;
}

.signal-label {
  margin: 0;
  font-size: 12px;
  color: var(--text-subtle);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.signal-value {
  margin: 4px 0 0;
  color: var(--text-main);
  font-size: 14px;
}

.hero-side {
  min-width: 0;
  display: grid;
  gap: 12px;
  align-content: start;
}

.showcase-card {
  border: 1px solid var(--line);
  border-radius: 20px;
  background:
    linear-gradient(180deg, rgb(255 255 255 / 94%) 0%, rgb(240 247 255 / 94%) 100%),
    var(--surface);
  padding: 16px;
  box-shadow: 0 14px 26px rgb(32 49 71 / 10%);
  position: relative;
}

.showcase-card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  border: 1px solid rgb(255 255 255 / 45%);
  pointer-events: none;
}

.showcase-kicker {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-subtle);
}

.showcase-title {
  margin: 8px 0 0;
  font-size: 30px;
  line-height: 1.18;
  letter-spacing: -0.01em;
  color: var(--text-main);
}

.showcase-subtitle {
  margin: 10px 0 0;
  color: var(--text-subtle);
  font-size: 13px;
}

.preview-frame {
  margin: 14px 0 0;
  border: 1px solid var(--line);
  border-radius: 14px;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 10px 20px rgb(31 45 61 / 11%);
  position: relative;
  perspective: 900px;
  transform-style: preserve-3d;
}

.preview-frame:focus-visible {
  outline: 2px solid var(--brand-highlight);
  outline-offset: 3px;
}

.preview-image {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  object-position: top center;
  transition: transform 220ms ease;
  will-change: transform;
}

.preview-glare {
  position: absolute;
  inset: 0;
  pointer-events: none;
  transition: background 120ms ease;
  mix-blend-mode: screen;
}

.preview-badges {
  margin-top: 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.badge-item {
  min-height: 30px;
  padding: 5px 10px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: rgb(255 255 255 / 78%);
  font-size: 12px;
  color: var(--text-subtle);
  letter-spacing: 0.03em;
}

.story-strip {
  margin-top: 24px;
  padding-top: 18px;
  border-top: 1px solid var(--line);
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.story-head {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 2px;
  padding-inline: 2px;
}

.story-title {
  margin: 0;
  font-size: clamp(1.18rem, 1.3vw + 0.98rem, 1.5rem);
  line-height: 1.25;
  letter-spacing: -0.01em;
  color: var(--text-main);
}

.story-progress {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 6px 10px;
  background: linear-gradient(180deg, rgb(255 255 255 / 86%) 0%, rgb(241 247 255 / 86%) 100%);
}

.progress-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #9db2c9;
}

.progress-dot.is-active {
  width: 20px;
  border-radius: 999px;
  background: linear-gradient(90deg, #486b8f 0%, #7394b6 100%);
}

.story-step {
  border: 1px solid var(--line);
  border-radius: 16px;
  background:
    linear-gradient(180deg, rgb(255 255 255 / 82%) 0%, rgb(242 248 255 / 82%) 100%),
    rgb(255 255 255 / 74%);
  padding: 14px;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 18px rgb(36 57 81 / 8%);
  transition: transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease;
  animation: revealUp 0.45s ease-out both;
}

.story-step:hover {
  transform: translateY(-2px);
  border-color: var(--line-strong);
  box-shadow: 0 14px 24px rgb(36 57 81 / 11%);
}

.story-step::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #4e7397 0%, #7e9fbe 100%);
  opacity: 0.78;
}

.story-step:nth-of-type(1) {
  animation-delay: 0.05s;
}

.story-step:nth-of-type(2) {
  animation-delay: 0.12s;
}

.story-step:nth-of-type(3) {
  animation-delay: 0.2s;
}

.step-index {
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-subtle);
}

.step-title {
  margin: 8px 0 0;
  color: var(--text-main);
  font-size: 22px;
  line-height: 1.2;
}

.step-text {
  margin: 8px 0 0;
  color: var(--text-subtle);
  font-size: 14px;
  line-height: 1.72;
  flex: 1;
}

.step-link {
  margin-top: 8px;
  padding: 0;
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  color: #355a7f;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.step-link:hover {
  color: #274a6e;
}

.step-link:focus-visible {
  outline: 2px solid var(--brand-highlight);
  outline-offset: 2px;
  border-radius: 10px;
}

.pull-quote {
  margin: 0;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: rgb(255 255 255 / 78%);
  padding: 12px 14px;
  color: #2f4b69;
  font-size: 14px;
  line-height: 1.7;
}

.shell-foot {
  margin-top: 26px;
  padding-top: 16px;
  border-top: 1px solid var(--line);
  color: var(--text-subtle);
  font-size: 13px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--line-strong);
}

@keyframes revealUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulseDot {
  0% {
    opacity: 0.45;
    transform: scale(0.92);
  }

  50% {
    opacity: 1;
    transform: scale(1);
  }

  100% {
    opacity: 0.45;
    transform: scale(0.92);
  }
}

@media (max-width: 960px) {
  .landing-shell {
    padding: 24px;
    border-radius: 22px;
  }

  .hero-grid {
    grid-template-columns: 1fr;
    gap: 22px;
  }

  .showcase-title {
    font-size: 26px;
  }

  .stats-grid {
    max-width: none;
  }

  .story-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .story-strip {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  #landingPage {
    padding: 14px;
  }

  .landing-shell {
    padding: 20px 16px;
    border-radius: 18px;
  }

  .shell-top {
    align-items: flex-start;
    flex-direction: column;
  }

  .hero-subtitle {
    font-size: 15px;
    line-height: 1.68;
  }

  .hero-actions :deep(.ant-btn) {
    flex: 1;
    min-width: 0;
  }

  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .stat-chip:last-child {
    grid-column: 1 / -1;
  }

  .story-step {
    min-height: 0;
  }
}

@media (max-width: 520px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-chip:last-child {
    grid-column: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  #landingPage :deep(*) {
    transition: none !important;
    animation: none !important;
  }

  .story-step {
    animation: none !important;
  }

  .live-dot {
    animation: none !important;
  }
}
</style>
