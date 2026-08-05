/* ========================================================
   邹市明工作室 B端官网 · 交互脚本
   ======================================================== */

(function () {
  'use strict';

  // ---------- 导航栏滚动效果 ----------
  const nav = document.getElementById('nav');
  let lastScroll = 0;

  function handleNavScroll() {
    const scrollY = window.scrollY;
    if (scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    lastScroll = scrollY;
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });

  // ---------- 移动端汉堡菜单 ----------
  const burgerBtn = document.getElementById('burgerBtn');
  const navDrawer = document.getElementById('navDrawer');
  let overlay = null;

  function createOverlay() {
    overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', closeDrawer);
  }

  function openDrawer() {
    if (!overlay) createOverlay();
    navDrawer.classList.add('open');
    overlay.classList.add('active');
    burgerBtn.classList.add('active');
    burgerBtn.setAttribute('aria-expanded', 'true');
    navDrawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    navDrawer.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    burgerBtn.classList.remove('active');
    burgerBtn.setAttribute('aria-expanded', 'false');
    navDrawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  burgerBtn.addEventListener('click', function () {
    if (navDrawer.classList.contains('open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  // 点击菜单项后关闭抽屉
  navDrawer.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeDrawer);
  });

  // ESC 关闭
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navDrawer.classList.contains('open')) {
      closeDrawer();
    }
  });

  // 窗口变大时自动关闭
  window.addEventListener('resize', function () {
    if (window.innerWidth > 768 && navDrawer.classList.contains('open')) {
      closeDrawer();
    }
  });

  // ---------- FAQ 手风琴 ----------
  const accordionItems = document.querySelectorAll('.accordion__item');

  accordionItems.forEach(function (item) {
    const header = item.querySelector('.accordion__header');
    const panel = item.querySelector('.accordion__panel');
    const content = item.querySelector('.accordion__content');

    header.addEventListener('click', function () {
      const isActive = item.classList.contains('active');

      // 关闭所有
      accordionItems.forEach(function (otherItem) {
        otherItem.classList.remove('active');
        const otherPanel = otherItem.querySelector('.accordion__panel');
        const otherHeader = otherItem.querySelector('.accordion__header');
        otherPanel.style.maxHeight = null;
        otherHeader.setAttribute('aria-expanded', 'false');
      });

      // 切换当前
      if (!isActive) {
        item.classList.add('active');
        panel.style.maxHeight = content.offsetHeight + 'px';
        header.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // 默认展开第一个
  if (accordionItems.length > 0) {
    const firstItem = accordionItems[0];
    const firstHeader = firstItem.querySelector('.accordion__header');
    const firstPanel = firstItem.querySelector('.accordion__panel');
    const firstContent = firstItem.querySelector('.accordion__content');
    firstItem.classList.add('active');
    firstPanel.style.maxHeight = firstContent.offsetHeight + 'px';
    firstHeader.setAttribute('aria-expanded', 'true');
  }

  // 窗口 resize 时重新计算手风琴高度
  let resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      accordionItems.forEach(function (item) {
        if (item.classList.contains('active')) {
          const panel = item.querySelector('.accordion__panel');
          const content = item.querySelector('.accordion__content');
          panel.style.maxHeight = content.offsetHeight + 'px';
        }
      });
    }, 200);
  });

  // ---------- 数字计数动画 ----------
  function animateNumber(el, target, suffix) {
    const duration = 2000;
    const startTime = performance.now();
    const startValue = 0;
    const easing = function (t) {
      // easeOutExpo
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    };

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easing(progress);
      const current = Math.floor(startValue + (target - startValue) * eased);

      // 千分位格式化
      const formatted = current.toLocaleString('zh-CN');
      el.textContent = formatted + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target.toLocaleString('zh-CN') + suffix;
      }
    }

    requestAnimationFrame(update);
  }

  // ---------- 滚动显现动画 + 数字计数 ----------
  const revealElements = document.querySelectorAll('.stat-card, .feature, .service, .step, .hero__content, .hero__visual, .price-card, .audience-card, .cases .section__head, .gallery__item, .timeline__item, .honor-card, .brand-item');
  revealElements.forEach(function (el) {
    el.classList.add('reveal');
  });

  const statNumbers = document.querySelectorAll('.stat-card__num');
  let statsAnimated = false;

  function checkReveal() {
    const triggerBottom = window.innerHeight * 0.88;

    // 通用 reveal
    revealElements.forEach(function (el) {
      const top = el.getBoundingClientRect().top;
      if (top < triggerBottom) {
        el.classList.add('in-view');
      }
    });

    // 数据区数字动画
    if (!statsAnimated && statNumbers.length > 0) {
      const firstStat = statNumbers[0];
      const top = firstStat.getBoundingClientRect().top;
      if (top < triggerBottom) {
        statsAnimated = true;
        statNumbers.forEach(function (el) {
          const target = parseInt(el.getAttribute('data-target'), 10);
          const suffix = el.getAttribute('data-suffix') || '';
          animateNumber(el, target, suffix);
        });
      }
    }
  }

  window.addEventListener('scroll', checkReveal, { passive: true });
  window.addEventListener('load', checkReveal);
  checkReveal(); // 初始检查

  // ---------- 平滑滚动偏移（考虑固定导航栏） ----------
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const navHeight = nav.offsetHeight;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight + 1;

      window.scrollTo({
        top: targetTop,
        behavior: 'smooth'
      });
    });
  });

  // ---------- 视差效果（Hero 藤蔓与叶子） ----------
  const heroVines = document.querySelectorAll('.hero__vine, .hero__leaf');
  let ticking = false;

  function updateParallax() {
    const scrollY = window.scrollY;
    if (scrollY > window.innerHeight) {
      ticking = false;
      return;
    }

    heroVines.forEach(function (el, index) {
      const speed = 0.05 + (index * 0.02);
      const yPos = scrollY * speed;
      el.style.transform = el.style.transform.replace(/translateY\([^)]*\)/, '') + ' translateY(' + yPos + 'px)';
    });

    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });

  // ---------- ECharts 粉丝画像图表 ----------
  function initCharts() {
    if (typeof echarts === 'undefined') return;

    // 色板：沿用品牌调色板
    var C = {
      forest: '#2D3A31',
      sage: '#8C9A84',
      sageLight: '#B8C2B1',
      sageFaint: '#D9DFD5',
      terracotta: '#C27B66',
      terracottaLight: '#D9A38D',
      terracottaFaint: '#F1DDD3',
      inkSoft: '#5A5A55',
      inkMuted: '#8A8A82',
      ivory: '#F9F8F4'
    };

    // ===== 性别分布：环形图 + 中心数字 =====
    var genderEl = document.getElementById('chart-gender');
    if (genderEl) {
      var chartGender = echarts.init(genderEl);
      chartGender.setOption({
        color: [C.terracotta, C.sageLight],
        tooltip: { trigger: 'item', confine: true, formatter: '{b}<br/>{c}%' },
        legend: {
          bottom: 4,
          icon: 'circle',
          itemWidth: 8,
          itemHeight: 8,
          itemGap: 16,
          textStyle: { color: C.inkSoft, fontSize: 12 }
        },
        graphic: [
          {
            type: 'text',
            left: 'center',
            top: '40%',
            style: {
              text: '69.7%',
              fontSize: 28,
              fontWeight: 600,
              fill: C.forest,
              fontFamily: 'Playfair Display, serif'
            }
          },
          {
            type: 'text',
            left: 'center',
            top: '54%',
            style: {
              text: '女性粉丝',
              fontSize: 11,
              fill: C.inkMuted,
              letterSpacing: '2px'
            }
          }
        ],
        series: [{
          type: 'pie',
          radius: ['62%', '80%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: false,
          itemStyle: { borderColor: C.ivory, borderWidth: 3 },
          label: { show: false },
          labelLine: { show: false },
          data: [
            { value: 69.74, name: '女性' },
            { value: 30.26, name: '男性' }
          ]
        }]
      });
      new ResizeObserver(function () { chartGender.resize(); }).observe(genderEl);
    }

    // ===== 年龄分布：横向柱状图 =====
    var ageEl = document.getElementById('chart-age');
    if (ageEl) {
      var chartAge = echarts.init(ageEl);
      chartAge.setOption({
        grid: { left: '2%', right: '8%', top: '4%', bottom: '4%', containLabel: true },
        tooltip: { trigger: 'axis', confine: true, axisPointer: { type: 'shadow' } },
        xAxis: {
          type: 'value',
          max: 60,
          axisLabel: { formatter: '{value}%', color: C.inkMuted, fontSize: 11 },
          splitLine: { lineStyle: { color: C.sageFaint } },
          axisLine: { show: false },
          axisTick: { show: false }
        },
        yAxis: {
          type: 'category',
          data: ['18-23岁', '24-30岁', '31-40岁', '41-50岁'],
          axisLabel: { color: C.inkSoft, fontSize: 12 },
          axisLine: { show: false },
          axisTick: { show: false },
          inverse: true
        },
        series: [{
          type: 'bar',
          data: [
            { value: 8.33, itemStyle: { color: C.sageLight } },
            { value: 16.67, itemStyle: { color: C.sage } },
            { value: 58.33, itemStyle: { color: C.terracotta } },
            { value: 16.67, itemStyle: { color: C.sageLight } }
          ],
          barWidth: '50%',
          itemStyle: { borderRadius: [0, 6, 6, 0] },
          label: {
            show: true,
            position: 'right',
            formatter: '{c}%',
            color: C.forest,
            fontSize: 12,
            fontWeight: 600
          }
        }]
      });
      new ResizeObserver(function () { chartAge.resize(); }).observe(ageEl);
    }

    // ===== 地域分布 TOP10：横向柱状图 =====
    var regionEl = document.getElementById('chart-region');
    if (regionEl) {
      var chartRegion = echarts.init(regionEl);
      var regions = ['福建', '湖北', '浙江', '广西', '安徽', '江苏', '河北', '山东', '河南', '广东'];
      var values = [3.7, 3.7, 4.2, 5.0, 5.2, 5.7, 6.1, 6.7, 10.1, 19.6];
      var regionColors = values.map(function (v, i) {
        // TOP3 用陶土色强调，其余鼠尾草渐变
        if (i >= 7) return C.terracotta;
        if (i >= 4) return C.terracottaLight;
        return C.sage;
      });
      chartRegion.setOption({
        grid: { left: '2%', right: '10%', top: '4%', bottom: '4%', containLabel: true },
        tooltip: { trigger: 'axis', confine: true, axisPointer: { type: 'shadow' } },
        xAxis: {
          type: 'value',
          max: 22,
          axisLabel: { formatter: '{value}%', color: C.inkMuted, fontSize: 11 },
          splitLine: { lineStyle: { color: C.sageFaint } },
          axisLine: { show: false },
          axisTick: { show: false }
        },
        yAxis: {
          type: 'category',
          data: regions,
          axisLabel: { color: C.inkSoft, fontSize: 12 },
          axisLine: { show: false },
          axisTick: { show: false },
          inverse: true
        },
        series: [{
          type: 'bar',
          data: values.map(function (v, i) {
            return { value: v, itemStyle: { color: regionColors[i] } };
          }),
          barWidth: '55%',
          itemStyle: { borderRadius: [0, 6, 6, 0] },
          label: {
            show: true,
            position: 'right',
            formatter: '{c}%',
            color: C.forest,
            fontSize: 12,
            fontWeight: 600
          }
        }]
      });
      new ResizeObserver(function () { chartRegion.resize(); }).observe(regionEl);
    }
  }

  // 图表懒加载：粉丝画像区进入视口时初始化
  var chartsInitialized = false;
  var audienceSection = document.getElementById('audience');

  function checkCharts() {
    if (chartsInitialized || !audienceSection) return;
    var triggerBottom = window.innerHeight * 0.9;
    var top = audienceSection.getBoundingClientRect().top;
    if (top < triggerBottom) {
      chartsInitialized = true;
      // 延迟一帧确保容器已有尺寸
      requestAnimationFrame(initCharts);
    }
  }

  window.addEventListener('scroll', checkCharts, { passive: true });
  window.addEventListener('load', function () {
    checkCharts();
    checkReveal();
  });
  checkCharts();

})();
