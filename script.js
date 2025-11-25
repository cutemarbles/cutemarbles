// 導航欄功能
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    // 手機版導航切換
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // 點擊導航連結時關閉手機版選單
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
    
    // 平滑滾動到錨點
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // 導航欄滾動效果
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(102, 126, 234, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            navbar.style.backdropFilter = 'none';
        }
    });
});

// 商品篩選＋搜尋＋積分範圍 Filter
document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');

    // 若頁面上沒有商品區塊，直接略過
    if (!productCards.length) return;

    // 搜尋與排序相關元素
    const searchInput = document.getElementById('product-search');
    const sortSelect = document.getElementById('product-sort');

    // 積分範圍相關元素
    const rangeMin = document.getElementById('range-min');
    const rangeMax = document.getElementById('range-max');
    const minValueInput = document.getElementById('min-value-input');
    const maxValueInput = document.getElementById('max-value-input');
    const rangeProgress = document.getElementById('range-progress');
    const filteredCountEl = document.getElementById('filtered-count');

    // 取得所有商品的積分數值，動態決定最小/最大範圍
    const allPoints = Array.from(productCards).map(card => {
        const priceEl = card.querySelector('.current-price');
        if (!priceEl) return 0;
        // 例如：「積分 18,888」→ 18888
        const num = parseFloat(priceEl.textContent.replace(/[^\d]/g, '')) || 0;
        return num;
    });

    const globalMin = allPoints.length ? Math.min(...allPoints) : 0;
    const globalMax = allPoints.length ? Math.max(...allPoints) : 0;

    // Filter 狀態
    let activeCategory = 'all';
    let searchTerm = '';
    let currentMin = globalMin;
    let currentMax = globalMax;

    // 初始化積分拉條與輸入框
    function initRangeControls() {
        if (!rangeMin || !rangeMax || !minValueInput || !maxValueInput || !rangeProgress) return;

        // 設定 input 的 min / max 邊界（可保留原來 HTML 的值，但用資料實際範圍覆蓋比較直覺）
        rangeMin.min = globalMin;
        rangeMin.max = globalMax;
        rangeMax.min = globalMin;
        rangeMax.max = globalMax;

        currentMin = globalMin;
        currentMax = globalMax;

        rangeMin.value = String(currentMin);
        rangeMax.value = String(currentMax);
        minValueInput.value = String(currentMin);
        maxValueInput.value = String(currentMax);

        updateRangeUI();
    }

    function updateRangeUI() {
        if (!rangeMin || !rangeMax || !minValueInput || !maxValueInput || !rangeProgress) return;

        const minVal = Math.min(Number(rangeMin.value), Number(rangeMax.value));
        const maxVal = Math.max(Number(rangeMin.value), Number(rangeMax.value));

        currentMin = minVal;
        currentMax = maxVal;

        minValueInput.value = String(currentMin);
        maxValueInput.value = String(currentMax);

        // 進度條百分比
        const totalRange = globalMax - globalMin || 1;
        const minPercent = ((currentMin - globalMin) / totalRange) * 100;
        const maxPercent = ((currentMax - globalMin) / totalRange) * 100;

        rangeProgress.style.left = `${minPercent}%`;
        rangeProgress.style.right = `${100 - maxPercent}%`;
    }

    // 統一套用所有條件的 Filter
    function applyFilters() {
        let matchCount = 0;

        const term = searchTerm.trim().toLowerCase();

        productCards.forEach(card => {
            const category = card.getAttribute('data-category') || '';
            const nameEl = card.querySelector('h3');
            const descEl = card.querySelector('.product-description');
            const priceEl = card.querySelector('.current-price');

            const nameText = nameEl ? nameEl.textContent.toLowerCase() : '';
            const descText = descEl ? descEl.textContent.toLowerCase() : '';
            const searchMatch = !term || nameText.includes(term) || descText.includes(term);

            const categoryMatch = (activeCategory === 'all') || category === activeCategory;

            let points = 0;
            if (priceEl) {
                points = parseFloat(priceEl.textContent.replace(/[^\d]/g, '')) || 0;
            }
            const pointsMatch = points >= currentMin && points <= currentMax;

            const visible = searchMatch && categoryMatch && pointsMatch;

            if (visible) {
                card.style.display = 'block';
                card.style.animation = 'fadeInUp 0.5s ease';
                matchCount++;
            } else {
                card.style.display = 'none';
            }
        });

        if (filteredCountEl) {
            filteredCountEl.textContent = String(matchCount);
        }
    }

    // 綁定分類按鈕
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除所有按鈕的 active
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            activeCategory = this.getAttribute('data-filter') || 'all';
            applyFilters();
        });
    });

    // 綁定搜尋
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            searchTerm = this.value || '';
            applyFilters();
        });
    }

    // 綁定積分拉條
    if (rangeMin && rangeMax) {
        const minGap = 0; // 最小間距，如需避免重疊可改成 10 之類

        rangeMin.addEventListener('input', function() {
            let minVal = Number(rangeMin.value);
            let maxVal = Number(rangeMax.value);
            if (minVal > maxVal - minGap) {
                minVal = maxVal - minGap;
                rangeMin.value = String(minVal);
            }
            updateRangeUI();
            applyFilters();
        });

        rangeMax.addEventListener('input', function() {
            let minVal = Number(rangeMin.value);
            let maxVal = Number(rangeMax.value);
            if (maxVal < minVal + minGap) {
                maxVal = minVal + minGap;
                rangeMax.value = String(maxVal);
            }
            updateRangeUI();
            applyFilters();
        });
        }

    // 綁定數字輸入框
    if (minValueInput && maxValueInput) {
        minValueInput.addEventListener('change', function() {
            let val = Number(minValueInput.value) || globalMin;
            val = Math.max(globalMin, Math.min(val, globalMax));
            if (val > currentMax) val = currentMax;
            rangeMin.value = String(val);
            updateRangeUI();
            applyFilters();
        });

        maxValueInput.addEventListener('change', function() {
            let val = Number(maxValueInput.value) || globalMax;
            val = Math.max(globalMin, Math.min(val, globalMax));
            if (val < currentMin) val = currentMin;
            rangeMax.value = String(val);
            updateRangeUI();
            applyFilters();
        });
    }

    // 重置按鈕
    const resetBtn = document.getElementById('range-reset');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            initRangeControls();
            applyFilters();
        });
    }

    // 初始化
    initRangeControls();
    applyFilters();
});

// 商品卡片互動效果
document.addEventListener('DOMContentLoaded', function() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        const addToCartBtn = card.querySelector('.add-to-cart-btn');
        const quickViewBtn = card.querySelector('.quick-view-btn');
        
        // 加入購物車按鈕效果
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                // 按鈕動畫效果
                this.style.transform = 'scale(0.95)';
                this.innerHTML = '<i class="fas fa-check"></i> 已加入';
                this.style.background = '#4CAF50';
                
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                    this.innerHTML = '加入購物車';
                    this.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                }, 1500);
                
                // 顯示通知
                showNotification('商品已加入購物車！', 'success');
            });
        }
        
        // 快速查看按鈕效果
        if (quickViewBtn) {
            quickViewBtn.addEventListener('click', function(e) {
                e.preventDefault();
                showNotification('快速查看功能開發中...', 'info');
            });
        }
    });
});

// 聯絡表單功能
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('.contact-form form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('.submit-btn');
            const originalText = submitBtn.innerHTML;
            
            // 按鈕載入狀態
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 送出中...';
            submitBtn.disabled = true;
            
            // 模擬表單提交
            setTimeout(() => {
                submitBtn.innerHTML = '<i class="fas fa-check"></i> 已送出';
                submitBtn.style.background = '#4CAF50';
                
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                    submitBtn.disabled = false;
                    this.reset();
                }, 2000);
                
                showNotification('訊息已成功送出！我們會盡快回覆您。', 'success');
            }, 1500);
        });
    }
});

// 滾動動畫效果
document.addEventListener('DOMContentLoaded', function() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, observerOptions);
    
    // 觀察需要動畫的元素
    const animatedElements = document.querySelectorAll('.feature-card, .product-card, .about-text, .contact-item');
    animatedElements.forEach(el => {
        el.classList.add('scroll-reveal');
        observer.observe(el);
    });
});

// 通知系統
function showNotification(message, type = 'info') {
    // 移除現有通知
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // 創建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // 添加樣式
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 300px;
    `;
    
    // 添加到頁面
    document.body.appendChild(notification);
    
    // 顯示動畫
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // 自動隱藏
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// 回到頂部按鈕
document.addEventListener('DOMContentLoaded', function() {
    // 創建回到頂部按鈕
    const backToTopBtn = document.createElement('button');
    backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        font-size: 18px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
    `;
    
    document.body.appendChild(backToTopBtn);
    
    // 滾動時顯示/隱藏按鈕
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTopBtn.style.opacity = '1';
            backToTopBtn.style.visibility = 'visible';
        } else {
            backToTopBtn.style.opacity = '0';
            backToTopBtn.style.visibility = 'hidden';
        }
    });
    
    // 點擊回到頂部
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // 按鈕懸停效果
    backToTopBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1)';
    });
    
    backToTopBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
});

// 載入動畫
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
    
    // 為主要元素添加載入動畫
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.opacity = '0';
        heroContent.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            heroContent.style.transition = 'all 0.8s ease';
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
        }, 300);
    }
});

// 價格排序功能（可選）
function sortProducts(sortType) {
    const productsContainer = document.querySelector('.products-grid');
    const productCards = Array.from(document.querySelectorAll('.product-card'));
    
    productCards.sort((a, b) => {
        if (sortType === 'name-asc' || sortType === 'name-desc') {
            const nameA = a.querySelector('h3').textContent.trim().toLowerCase();
            const nameB = b.querySelector('h3').textContent.trim().toLowerCase();
            if (nameA < nameB) return sortType === 'name-asc' ? -1 : 1;
            if (nameA > nameB) return sortType === 'name-asc' ? 1 : -1;
            return 0;
        }

        const priceA = parseFloat(a.querySelector('.current-price').textContent.replace(/[^\d]/g, ''));
        const priceB = parseFloat(b.querySelector('.current-price').textContent.replace(/[^\d]/g, ''));
        if (sortType === 'price-low') return priceA - priceB;
        if (sortType === 'price-high') return priceB - priceA;
        return 0;
    });
    
    // 重新排列商品
    productCards.forEach(card => {
        productsContainer.appendChild(card);
    });
}

// 綁定搜尋與排序控制
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('product-search');
    const sortSelect = document.getElementById('product-sort');

    if (searchInput) {
        searchInput.addEventListener('input', function() {
            searchProducts(this.value);
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            sortProducts(this.value);
        });
    }
});

