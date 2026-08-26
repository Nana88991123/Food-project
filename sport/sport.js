/**
 * 台中市運動空間 - 輪播與 Google Maps 據點彈窗邏輯
 */

// ==============================
// 1. 台中各主題運動據點資料庫
// ==============================
const locationData = {
  'public': {
    title: '台中市公共運動空間（國民運動中心）',
    places: [
      { name: '北區國民運動中心', address: '台中市北區崇德路一段55號', tag: '溫水泳池 / 深水跳水池 / 體適能中心' },
      { name: '朝馬國民運動中心', address: '台中市西屯區朝貴路199號', tag: '專業羽球館 / 重訓健身房' },
      { name: '南屯國民運動中心', address: '台中市南屯區黎明路一段998號', tag: '室內綜合球場 / 飛輪教室' },
      { name: '長春國民暨兒童運動中心', address: '台中市南區合作街46號', tag: '兒童專屬運動區 / 綜合健身' },
      { name: '大里國民暨兒童運動中心', address: '台中市大里區國光路一段258號', tag: '室內排球場 / 溫水水療 SPA' }
    ]
  },
  'single-entry': {
    title: '台中市單次入場免綁約空間',
    places: [
      { name: '體育客 1st Fitness (台中自由店)', address: '台中市中區自由路二段8號B1', tag: '分鐘計費 1.1元/分・免綁年約' },
      { name: '植健身 Plant Fitness', address: '台中市西區公益路155巷9號B1', tag: '單次進場暢練・頂級重訓設備' },
      { name: '怪獸訓練 基地 (台中)', address: '台中市西區民權路229巷11號', tag: '肌力體能訓練・計次收費' },
      { name: 'FitBox 運動空間 (台中崇德店)', address: '台中市北屯區崇德路二段218號', tag: '無合約限制・單次票券自由進出' }
    ]
  },
  'chain': {
    title: '台中市大型連鎖健身房',
    places: [
      { name: 'World Gym 台中美村店 (Sport旗艦館)', address: '台中市西區美村路一段22號', tag: 'SPA水療池 / Les Mills有氧團課 / 免費毛巾' },
      { name: '健身工廠 Fitness Factory (台中精華廠)', address: '台中市南屯區大墩十一街386號', tag: '國際認證進口機台 / 完善體適能設施' },
      { name: 'World Gym 台中崇德店', address: '台中市北屯區崇德路二段16號', tag: '多功能草皮訓練區 / 恆溫室內泳池' }
    ]
  },
  'smart24h': {
    title: '台中市24小時智能健身房',
    places: [
      { name: 'Anytime Fitness (台中公益旗艦店)', address: '台中市西區公益路161號B1', tag: '24小時全天無休・APP藍牙通關・全球分店通用' },
      { name: 'Snap Fitness 24/7 (台中崇德店)', address: '台中市北屯區崇德路二段218號', tag: '24小時營業・無壓力智慧門禁' },
      { name: 'Anytime Fitness (台中逢甲店)', address: '台中市西屯區福星路328號', tag: '24H開放・深夜晨間自主訓練首選' }
    ]
  }
};

// ==============================
// 2. 彈窗 Modal 互動邏輯
// ==============================
const modal = document.getElementById('locationModal');
const modalBackdrop = document.getElementById('modalBackdrop');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalTitle = document.getElementById('modalTitle');
const modalList = document.getElementById('modalList');

function openLocationModal(categoryKey) {
  const data = locationData[categoryKey];
  if (!data || !modal) return;

  modalTitle.textContent = data.title;

  // 動態生成據點卡片與 Google Maps 連結
  modalList.innerHTML = data.places.map(place => {
    // 組合 Google Maps 搜尋 URL (手機自動開 App，電腦開網頁版)
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.address)}`;
    
    return `
      <div class="location-item">
        <div class="location-info">
          <h4>${place.name}</h4>
          <p>${place.address}</p>
          <span class="tag">${place.tag}</span>
        </div>
        <a href="${mapUrl}" target="_blank" rel="noopener noreferrer" class="btn-map" aria-label="前往 ${place.name} 的 Google 地圖">
          📍 地圖導航
        </a>
      </div>
    `;
  }).join('');

  modal.classList.add('active');
  document.body.style.overflow = 'hidden'; // 防止背景滾動
}

function closeLocationModal() {
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

// ==============================
// 3. 輪播 Slider 與事件綁定
// ==============================
document.addEventListener('DOMContentLoaded', () => {
  const track = document.getElementById('track');
  const slides = document.querySelectorAll('.card-slide');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const dotsContainer = document.getElementById('dotsContainer');

  let currentIndex = 0;
  const totalSlides = slides.length;

  // 取得不同螢幕寬度下可見的卡片數
  const getVisibleCount = () => {
    if (window.innerWidth <= 640) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  };

  // 計算最大可滾動索引
  const getMaxIndex = () => {
    return Math.max(0, totalSlides - getVisibleCount());
  };

  // 生成底部指示圓點
  const createDots = () => {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    const dotCount = getMaxIndex() + 1;
    for (let i = 0; i < dotCount; i++) {
      const dot = document.createElement('div');
      dot.classList.add('dot');
      if (i === currentIndex) dot.classList.add('active');
      dot.addEventListener('click', () => {
        currentIndex = i;
        updateSlider();
      });
      dotsContainer.appendChild(dot);
    }
  };

  // 更新輪播軌道位置與按鈕狀態
  const updateSlider = () => {
    if (!track || slides.length === 0) return;
    const slideWidth = slides[0].getBoundingClientRect().width;
    const gap = 24; // 對應 CSS 的 gap 寬度
    const offset = currentIndex * (slideWidth + gap);

    track.style.transform = `translateX(-${offset}px)`;

    // 更新圓點高亮
    document.querySelectorAll('.dot').forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentIndex);
    });

    // 邊界按鈕狀態
    if (prevBtn) prevBtn.disabled = (currentIndex === 0);
    if (nextBtn) nextBtn.disabled = (currentIndex >= getMaxIndex());
  };

  // 上一張 / 下一張事件
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateSlider();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentIndex < getMaxIndex()) {
        currentIndex++;
        updateSlider();
      }
    });
  }

  // 視窗大小改變時自動校正
  window.addEventListener('resize', () => {
    if (currentIndex > getMaxIndex()) {
      currentIndex = getMaxIndex();
    }
    createDots();
    updateSlider();
  });

  // 綁定「查看運動據點」按鈕點擊事件 (Event Delegation)
  document.querySelectorAll('[data-location-key]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const key = e.currentTarget.getAttribute('data-location-key');
      openLocationModal(key);
    });
  });

  // 彈窗關閉按鈕與點擊遮罩關閉
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeLocationModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeLocationModal);

  // 按下鍵盤 ESC 鍵自動關閉彈窗
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
      closeLocationModal();
    }
  });

  // 初始化輪播
  createDots();
  updateSlider();
});