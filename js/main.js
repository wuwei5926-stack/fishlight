/**
 * 微光工坊 - 主 JavaScript 文件
 */

// ============================================
// 数据存储 (与后台共用 localStorage)
// ============================================
const Storage = {
    get(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },
    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }
};

// 初始化默认数据
function initData() {
    // 如果没有产品数据，初始化默认产品
    if (!Storage.get('products')) {
        Storage.set('products', [
            { id: 1, name: '梦幻发光水母', category: 'fish-tank', price: 128, image: '', status: 'active', desc: '仿生设计，柔和蓝光', badge: '新品' },
            { id: 2, name: '夜光精灵伴侣', category: 'plant', price: 68, image: '', status: 'active', desc: '守护你的绿植时光', badge: '热销' },
            { id: 3, name: '七彩珊瑚礁', category: 'fish-tank', price: 198, image: '', status: 'active', desc: '渐变色彩，梦幻光影', badge: '' },
            { id: 4, name: '月光贝壳灯', category: 'lamp', price: 158, image: '', status: 'active', desc: 'USB充电，触摸开关', badge: '限量' },
            { id: 5, name: '发光海星摆件', category: 'fish-tank', price: 89, image: '', status: 'active', desc: '五色可选，防水设计', badge: '' },
            { id: 6, name: '深海氛围灯', category: 'lamp', price: 299, image: '', status: 'active', desc: '遥控变色，定时功能', badge: '' }
        ]);
    }
    // 初始化设置
    if (!Storage.get('settings')) {
        Storage.set('settings', {
            title: '微光工坊 | GlowDecor',
            description: '沉浸式深海夜光装饰体验，为你的空间带来梦幻般的光芒',
            heroVideo: '',
            primaryColor: '#00d9ff'
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initData();
    initHeroVideo();
    loadProducts();
    initCarousel();
    initMobileMenu();
    initScrollEffects();
    initAddToCart();
    initWishlist();
    initNewsletterForm();
});

// ============================================
// 首页视频背景
// ============================================
function initHeroVideo() {
    const settings = Storage.get('settings') || {};
    const heroVideo = document.querySelector('.hero-video');
    
    if (heroVideo && settings.heroVideo) {
        // 更新视频源
        const source = heroVideo.querySelector('source');
        if (source) {
            source.src = settings.heroVideo;
            heroVideo.load();
        }
    }
}

// ============================================
// 加载产品数据
// ============================================
function loadProducts() {
    const products = Storage.get('products') || [];
    const productsGrid = document.querySelector('.products-grid');
    
    if (!productsGrid) return;
    
    // 只显示上架的产品
    const activeProducts = products.filter(p => p.status === 'active');
    
    if (activeProducts.length === 0) {
        productsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">暂无产品</p>';
        return;
    }
    
    // 产品图标映射
    const productIcons = {
        '梦幻发光水母': '🪼',
        '夜光精灵伴侣': '🧚',
        '七彩珊瑚礁': '🪸',
        '月光贝壳灯': '🐚',
        '发光海星摆件': '⭐',
        '深海氛围灯': '💡',
        '发光蘑菇装饰': '🍄',
        '夜光水晶石': '💎'
    };
    
    productsGrid.innerHTML = activeProducts.map(product => {
        const icon = productIcons[product.name] || '✨';
        const badgeHtml = product.badge ? `<span class="product-badge">${product.badge}</span>` : '';
        const imageHtml = product.image ? 
            `<img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">` :
            `<div class="product-icon">${icon}</div>`;
        
        return `
            <div class="product-card scroll-reveal" data-id="${product.id}">
                <div class="product-image">
                    ${imageHtml}
                    ${badgeHtml}
                    <button class="product-wishlist">♡</button>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-desc">${product.desc}</p>
                    <div class="product-footer">
                        <div class="product-price">
                            <span class="price-current">¥${product.price}</span>
                        </div>
                        <button class="btn-add" onclick="addToCart(${product.id})">+</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// 添加到购物车
function addToCart(productId) {
    const products = Storage.get('products') || [];
    const product = products.find(p => p.id === productId);
    
    if (product) {
        // 获取当前购物车
        let cart = Storage.get('cart') || [];
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }
        
        Storage.set('cart', cart);
        updateCartCount();
        showToast(`已将 ${product.name} 加入购物车`);
    }
}

// 更新购物车数量
function updateCartCount() {
    const cart = Storage.get('cart') || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCount = document.querySelector('.cart-count');
    
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
}

/**
 * 轮播图功能
 */
function initCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dots .dot');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    if (slides.length === 0) return;
    
    let currentSlide = 0;
    let slideInterval;
    const slideDuration = 5000;
    
    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        slides[index].classList.add('active');
        dots[index].classList.add('active');
        
        currentSlide = index;
    }
    
    function nextSlide() {
        const next = (currentSlide + 1) % slides.length;
        showSlide(next);
    }
    
    function prevSlide() {
        const prev = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(prev);
    }
    
    function startAutoPlay() {
        slideInterval = setInterval(nextSlide, slideDuration);
    }
    
    function stopAutoPlay() {
        clearInterval(slideInterval);
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            stopAutoPlay();
            prevSlide();
            startAutoPlay();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            stopAutoPlay();
            nextSlide();
            startAutoPlay();
        });
    }
    
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            stopAutoPlay();
            showSlide(index);
            startAutoPlay();
        });
    });
    
    const carousel = document.querySelector('.hero-carousel');
    if (carousel) {
        carousel.addEventListener('mouseenter', stopAutoPlay);
        carousel.addEventListener('mouseleave', startAutoPlay);
    }
    
    startAutoPlay();
    
    let touchStartX = 0;
    let touchEndX = 0;
    
    if (carousel) {
        carousel.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        carousel.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            stopAutoPlay();
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
            startAutoPlay();
        }
    }
}

/**
 * 移动端菜单
 */
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.desktop-nav');
    
    if (menuBtn && nav) {
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('active');
            nav.classList.toggle('mobile-open');
            document.body.classList.toggle('menu-open');
        });
    }
}

/**
 * 滚动效果
 */
function initScrollEffects() {
    const header = document.querySelector('.main-header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 10) {
            header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
        } else {
            header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
        }
        
        lastScroll = currentScroll;
    });
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.category-card, .product-card, .scene-card, .review-card').forEach(el => {
        el.classList.add('scroll-reveal');
        observer.observe(el);
    });
}

/**
 * 加入购物车功能
 */
function initAddToCart() {
    // 更新购物车数量显示
    updateCartCount();
    
    // 为所有添加按钮绑定事件
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-add')) {
            const card = e.target.closest('.product-card');
            if (card) {
                const productId = parseInt(card.dataset.id);
                if (productId) {
                    addToCart(productId);
                }
            }
        }
    });
}

/**
 * 收藏功能
 */
function initWishlist() {
    const wishlistBtns = document.querySelectorAll('.product-wishlist');
    
    wishlistBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            this.classList.toggle('active');
            
            if (this.classList.contains('active')) {
                this.textContent = '♥';
                this.style.color = '#ff6b6b';
                showToast('已添加到收藏！');
            } else {
                this.textContent = '♡';
                this.style.color = '';
                showToast('已取消收藏');
            }
        });
    });
}

/**
 * 邮件订阅表单
 */
function initNewsletterForm() {
    const form = document.querySelector('.newsletter-form');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = this.querySelector('input[type="email"]').value;
            
            if (email) {
                showToast('订阅成功！优惠券已发送到您的邮箱');
                this.reset();
            }
        });
    }
}

/**
 * 显示提示消息
 */
function showToast(message) {
    const existingToast = document.querySelector('.toast-message');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: var(--ocean-mid);
        color: var(--text-primary);
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 9999;
        opacity: 0;
        transition: all 0.3s ease;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        border: 1px solid var(--glow-cyan);
    `;
    
    document.body.appendChild(toast);
    
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    });
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * 平滑滚动到锚点
 */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

/**
 * 图片懒加载
 */
function initLazyLoad() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
}

// 添加 CSS 动画关键帧
const style = document.createElement('style');
style.textContent = `
    @keyframes bounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
    }
    
    .mobile-open {
        display: block !important;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--ocean-mid);
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        padding: 20px;
    }
    
    .mobile-open .nav-list {
        flex-direction: column;
        gap: 16px;
    }
    
    .mobile-open .dropdown-menu {
        position: static;
        transform: none;
        opacity: 1;
        visibility: visible;
        box-shadow: none;
        padding-left: 20px;
    }
    
    body.menu-open {
        overflow: hidden;
    }
`;
document.head.appendChild(style);

// 页面加载完成后初始化懒加载
window.addEventListener('load', initLazyLoad);
