/**
 * 微光工坊 - 后台管理系统
 * Admin Panel JavaScript
 */

// ============================================
// 数据存储 (使用 localStorage 模拟)
// ============================================
const Storage = {
    get(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },
    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },
    remove(key) {
        localStorage.removeItem(key);
    }
};

// 初始化默认数据
function initData() {
    if (!Storage.get('images')) {
        Storage.set('images', []);
    }
    if (!Storage.get('videos')) {
        Storage.set('videos', []);
    }
    if (!Storage.get('products')) {
        Storage.set('products', [
            { id: 1, name: '梦幻发光水母', category: 'fish-tank', price: 128, image: '', status: 'active', desc: '仿生设计，柔和蓝光' },
            { id: 2, name: '发光海星摆件', category: 'fish-tank', price: 89, image: '', status: 'active', desc: '五色可选，防水设计' },
            { id: 3, name: '夜光珊瑚礁', category: 'fish-tank', price: 168, image: '', status: 'active', desc: '仿真珊瑚，多彩发光' },
            { id: 4, name: '发光蘑菇装饰', category: 'plant', price: 68, image: '', status: 'active', desc: '温暖暖光，自动感应' },
            { id: 5, name: '夜光水晶石', category: 'plant', price: 45, image: '', status: 'active', desc: '天然石材，吸收光能' },
            { id: 6, name: '深海氛围灯', category: 'lamp', price: 299, image: '', status: 'active', desc: '遥控变色，定时功能' }
        ]);
    }
    if (!Storage.get('settings')) {
        Storage.set('settings', {
            title: '微光工坊 | GlowDecor',
            description: '沉浸式深海夜光装饰体验，为你的空间带来梦幻般的光芒',
            heroVideo: '',
            primaryColor: '#00d9ff'
        });
    }
}

// ============================================
// 工具函数
// ============================================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    toastMessage.textContent = message;
    toast.className = `toast ${type} active`;
    
    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ============================================
// 导航功能
// ============================================
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            showSection(section);
            
            // 更新活动状态
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

function showSection(sectionName) {
    // 隐藏所有区块
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // 显示目标区块
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // 更新页面标题
    const titles = {
        dashboard: '概览',
        images: '图片管理',
        videos: '视频管理',
        products: '产品管理',
        settings: '设置'
    };
    document.getElementById('page-title').textContent = titles[sectionName] || '概览';
    
    // 刷新数据
    if (sectionName === 'dashboard') refreshDashboard();
    if (sectionName === 'images') refreshImages();
    if (sectionName === 'videos') refreshVideos();
    if (sectionName === 'products') refreshProducts();
    if (sectionName === 'settings') refreshSettings();
}

// ============================================
// 概览页面
// ============================================
function refreshDashboard() {
    const images = Storage.get('images') || [];
    const videos = Storage.get('videos') || [];
    
    // 计算存储使用量
    let totalSize = 0;
    images.forEach(img => totalSize += img.size || 0);
    videos.forEach(vid => totalSize += vid.size || 0);
    
    document.getElementById('image-count').textContent = images.length;
    document.getElementById('video-count').textContent = videos.length;
    document.getElementById('storage-used').textContent = formatFileSize(totalSize);
}

// ============================================
// 图片管理
// ============================================
function initImageUpload() {
    const uploadArea = document.getElementById('image-upload-area');
    const imageInput = document.getElementById('image-input');
    
    uploadArea.addEventListener('click', () => imageInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        handleImageFiles(e.dataTransfer.files);
    });
    
    imageInput.addEventListener('change', (e) => {
        handleImageFiles(e.target.files);
    });
}

function handleImageFiles(files) {
    const images = Storage.get('images') || [];
    
    Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/')) {
            showToast(`${file.name} 不是图片文件`, 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const image = {
                id: generateId(),
                name: file.name,
                src: e.target.result,
                size: file.size,
                type: file.type,
                uploadTime: new Date().toISOString()
            };
            images.push(image);
            Storage.set('images', images);
            refreshImages();
            showToast(`图片 ${file.name} 上传成功`);
        };
        reader.readAsDataURL(file);
    });
}

function refreshImages() {
    const images = Storage.get('images') || [];
    const grid = document.getElementById('image-grid');
    const filter = document.getElementById('image-filter')?.value || 'all';
    const search = document.getElementById('image-search')?.value.toLowerCase() || '';
    
    let filteredImages = images;
    if (search) {
        filteredImages = images.filter(img => img.name.toLowerCase().includes(search));
    }
    
    if (filteredImages.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 48px;">暂无图片，请上传</p>';
        return;
    }
    
    grid.innerHTML = filteredImages.map(img => `
        <div class="media-item" onclick="previewImage('${img.id}')">
            <img src="${img.src}" alt="${img.name}">
            <div class="media-item-info">
                <div class="media-item-name">${img.name}</div>
                <div class="media-item-size">${formatFileSize(img.size)}</div>
            </div>
            <div class="media-item-actions" onclick="event.stopPropagation()">
                <button class="media-btn" onclick="copyImageSrc('${img.src}')">复制链接</button>
                <button class="media-btn delete" onclick="deleteImage('${img.id}')">删除</button>
            </div>
        </div>
    `).join('');
}

let currentPreviewImage = null;

function previewImage(id) {
    const images = Storage.get('images') || [];
    const image = images.find(img => img.id === id);
    if (!image) return;
    
    currentPreviewImage = image;
    document.getElementById('preview-image').src = image.src;
    document.getElementById('preview-modal').classList.add('active');
}

function closeModal() {
    document.getElementById('preview-modal').classList.remove('active');
    currentPreviewImage = null;
}

function deleteImage(id) {
    if (!confirm('确定要删除这张图片吗？')) return;
    
    let images = Storage.get('images') || [];
    images = images.filter(img => img.id !== id);
    Storage.set('images', images);
    refreshImages();
    showToast('图片已删除');
}

function deleteCurrentImage() {
    if (currentPreviewImage) {
        deleteImage(currentPreviewImage.id);
        closeModal();
    }
}

function copyImageSrc(src) {
    navigator.clipboard.writeText(src).then(() => {
        showToast('图片链接已复制');
    });
}

function copyImagePath() {
    if (currentPreviewImage) {
        copyImageSrc(currentPreviewImage.src);
    }
}

// ============================================
// 视频管理
// ============================================
function initVideoUpload() {
    const uploadArea = document.getElementById('video-upload-area');
    const videoInput = document.getElementById('video-input');
    
    uploadArea.addEventListener('click', () => videoInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        handleVideoFiles(e.dataTransfer.files);
    });
    
    videoInput.addEventListener('change', (e) => {
        handleVideoFiles(e.target.files);
    });
}

function handleVideoFiles(files) {
    const videos = Storage.get('videos') || [];
    
    Array.from(files).forEach(file => {
        if (!file.type.startsWith('video/')) {
            showToast(`${file.name} 不是视频文件`, 'error');
            return;
        }
        
        if (file.size > 50 * 1024 * 1024) {
            showToast(`${file.name} 超过50MB限制`, 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const video = {
                id: generateId(),
                name: file.name,
                src: e.target.result,
                size: file.size,
                type: file.type,
                uploadTime: new Date().toISOString()
            };
            videos.push(video);
            Storage.set('videos', videos);
            refreshVideos();
            showToast(`视频 ${file.name} 上传成功`);
        };
        reader.readAsDataURL(file);
    });
}

function refreshVideos() {
    const videos = Storage.get('videos') || [];
    const list = document.getElementById('video-list');
    
    if (videos.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 48px;">暂无视频，请上传</p>';
        return;
    }
    
    list.innerHTML = videos.map(video => `
        <div class="video-item">
            <div class="video-preview">
                <video src="${video.src}" muted></video>
            </div>
            <div class="video-info">
                <h4>${video.name}</h4>
                <p>${formatFileSize(video.size)} · ${new Date(video.uploadTime).toLocaleDateString()}</p>
            </div>
            <div class="video-actions">
                <button class="btn-secondary" onclick="setHeroVideo('${video.src}')">设为首页背景</button>
                <button class="btn-secondary" onclick="copyVideoSrc('${video.src}')">复制链接</button>
                <button class="btn-secondary delete" onclick="deleteVideo('${video.id}')" style="border-color: var(--danger); color: var(--danger);">删除</button>
            </div>
        </div>
    `).join('');
}

function deleteVideo(id) {
    if (!confirm('确定要删除这个视频吗？')) return;
    
    let videos = Storage.get('videos') || [];
    videos = videos.filter(vid => vid.id !== id);
    Storage.set('videos', videos);
    refreshVideos();
    showToast('视频已删除');
}

function copyVideoSrc(src) {
    navigator.clipboard.writeText(src).then(() => {
        showToast('视频链接已复制');
    });
}

function setHeroVideo(src) {
    const settings = Storage.get('settings') || {};
    settings.heroVideo = src;
    Storage.set('settings', settings);
    showToast('已设为首页背景视频');
    refreshSettings();
}

// ============================================
// 产品管理
// ============================================
let editingProductId = null;

function refreshProducts() {
    const products = Storage.get('products') || [];
    const tbody = document.getElementById('products-tbody');
    
    tbody.innerHTML = products.map(product => `
        <tr>
            <td>
                <img src="${product.image || 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22><rect width=%2260%22 height=%2260%22 fill=%22%231b263b%22/><text x=%2230%22 y=%2235%22 text-anchor=%22middle%22 fill=%22%236c757d%22 font-size=%2224%22>📦</text></svg>'}" 
                     alt="${product.name}" class="product-thumb">
            </td>
            <td>${product.name}</td>
            <td>${getCategoryName(product.category)}</td>
            <td>¥${product.price}</td>
            <td>
                <span class="status-badge ${product.status}">${product.status === 'active' ? '上架中' : '已下架'}</span>
            </td>
            <td>
                <div class="table-actions">
                    <button class="icon-btn" onclick="editProduct(${product.id})" title="编辑">✏️</button>
                    <button class="icon-btn" onclick="toggleProductStatus(${product.id})" title="${product.status === 'active' ? '下架' : '上架'}">
                        ${product.status === 'active' ? '📤' : '📥'}
                    </button>
                    <button class="icon-btn" onclick="deleteProduct(${product.id})" title="删除" style="color: var(--danger);">🗑️</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function getCategoryName(category) {
    const names = {
        'fish-tank': '鱼缸夜光',
        'plant': '盆栽伴侣',
        'lamp': '充电灯具'
    };
    return names[category] || category;
}

function addNewProduct() {
    editingProductId = null;
    document.getElementById('product-modal-title').textContent = '添加产品';
    document.getElementById('product-form').reset();
    document.getElementById('product-preview').src = '';
    document.getElementById('product-modal').classList.add('active');
}

function editProduct(id) {
    const products = Storage.get('products') || [];
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    editingProductId = id;
    document.getElementById('product-modal-title').textContent = '编辑产品';
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-desc').value = product.desc || '';
    document.getElementById('product-preview').src = product.image || '';
    document.getElementById('product-modal').classList.add('active');
}

function closeProductModal() {
    document.getElementById('product-modal').classList.remove('active');
    editingProductId = null;
}

function selectProductImage() {
    const images = Storage.get('images') || [];
    if (images.length === 0) {
        showToast('请先上传图片', 'error');
        return;
    }
    
    // 简单起见，使用第一张图片
    // 实际应用中可以打开图片选择器
    const img = images[0];
    document.getElementById('product-preview').src = img.src;
}

function saveProduct(e) {
    e.preventDefault();
    
    const products = Storage.get('products') || [];
    const productData = {
        name: document.getElementById('product-name').value,
        category: document.getElementById('product-category').value,
        price: parseFloat(document.getElementById('product-price').value),
        desc: document.getElementById('product-desc').value,
        image: document.getElementById('product-preview').src,
        status: 'active'
    };
    
    if (editingProductId) {
        const index = products.findIndex(p => p.id === editingProductId);
        if (index !== -1) {
            products[index] = { ...products[index], ...productData };
        }
    } else {
        products.push({
            id: Date.now(),
            ...productData
        });
    }
    
    Storage.set('products', products);
    refreshProducts();
    closeProductModal();
    showToast(editingProductId ? '产品已更新' : '产品已添加');
}

function toggleProductStatus(id) {
    const products = Storage.get('products') || [];
    const product = products.find(p => p.id === id);
    if (product) {
        product.status = product.status === 'active' ? 'inactive' : 'active';
        Storage.set('products', products);
        refreshProducts();
        showToast(product.status === 'active' ? '产品已上架' : '产品已下架');
    }
}

function deleteProduct(id) {
    if (!confirm('确定要删除这个产品吗？')) return;
    
    let products = Storage.get('products') || [];
    products = products.filter(p => p.id !== id);
    Storage.set('products', products);
    refreshProducts();
    showToast('产品已删除');
}

// ============================================
// 设置
// ============================================
function refreshSettings() {
    const settings = Storage.get('settings') || {};
    document.getElementById('site-title').value = settings.title || '';
    document.getElementById('site-description').value = settings.description || '';
    document.getElementById('primary-color').value = settings.primaryColor || '#00d9ff';
    
    // 更新视频选择器
    const videos = Storage.get('videos') || [];
    const select = document.getElementById('hero-video-select');
    select.innerHTML = '<option value="">不使用视频</option>' +
        videos.map(v => `<option value="${v.src}" ${v.src === settings.heroVideo ? 'selected' : ''}>${v.name}</option>`).join('');
}

function saveSettings() {
    const settings = {
        title: document.getElementById('site-title').value,
        description: document.getElementById('site-description').value,
        heroVideo: document.getElementById('hero-video-select').value,
        primaryColor: document.getElementById('primary-color').value
    };
    Storage.set('settings', settings);
    showToast('设置已保存');
}

function resetSettings() {
    if (!confirm('确定要重置所有设置吗？')) return;
    
    Storage.set('settings', {
        title: '微光工坊 | GlowDecor',
        description: '沉浸式深海夜光装饰体验，为你的空间带来梦幻般的光芒',
        heroVideo: '',
        primaryColor: '#00d9ff'
    });
    refreshSettings();
    showToast('设置已重置');
}

// ============================================
// 搜索和筛选
// ============================================
function initSearchAndFilter() {
    const imageSearch = document.getElementById('image-search');
    const imageFilter = document.getElementById('image-filter');
    
    if (imageSearch) {
        imageSearch.addEventListener('input', refreshImages);
    }
    
    if (imageFilter) {
        imageFilter.addEventListener('change', refreshImages);
    }
}

// ============================================
// 初始化
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initData();
    initNavigation();
    initImageUpload();
    initVideoUpload();
    initSearchAndFilter();
    
    // 产品表单提交
    document.getElementById('product-form')?.addEventListener('submit', saveProduct);
    
    // 初始加载
    refreshDashboard();
});

// 点击模态框外部关闭
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});
