// Content Editor for Admin Panel
// Manages content editing interface and image uploads

const ContentEditor = {
    currentContent: null,

    // Initialize editor
    init() {
        this.currentContent = ContentStorage.getContent();
        this.renderEditor();
        this.attachEventListeners();
    },

    // Render editor interface
    renderEditor() {
        const container = document.getElementById('content-editor-container');
        if (!container) return;

        container.innerHTML = `
            <div class="editor-header">
                <h2>Редактор контента</h2>
                <div class="editor-actions">
                    <button id="save-all-content" class="btn-primary">💾 Сохранить все изменения</button>
                    <button id="reset-content" class="btn-secondary">🔄 Сбросить к умолчанию</button>
                </div>
            </div>
            
            <div class="storage-info" id="storage-info"></div>
            
            <div class="editor-sections">
                ${this.renderHeaderEditor()}
                ${this.renderHeroEditor()}
                ${this.renderWhyWorksEditor()}
                ${this.renderAdvantagesEditor()}
                ${this.renderIncludedEditor()}
                ${this.renderFooterEditor()}
            </div>
        `;

        this.updateStorageInfo();
    },

    // Header section editor
    renderHeaderEditor() {
        const header = this.currentContent.header;
        return `
            <div class="editor-section">
                <h3 class="section-title" onclick="this.parentElement.classList.toggle('collapsed')">
                    <span>📋 Шапка сайта</span>
                    <span class="toggle-icon">▼</span>
                </h3>
                <div class="section-content">
                    <div class="form-group">
                        <label>Текст логотипа</label>
                        <input type="text" data-path="header.logoText" value="${header.logoText}">
                    </div>
                    <div class="form-group">
                        <label>Изображение логотипа</label>
                        ${this.renderImageUpload('header.logoImage', header.logoImage)}
                    </div>
                    <div class="form-group">
                        <label>Телефон</label>
                        <input type="tel" data-path="header.phone" value="${header.phone}">
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" data-path="header.email" value="${header.email}">
                    </div>
                </div>
            </div>
        `;
    },

    // Hero section editor
    renderHeroEditor() {
        const hero = this.currentContent.hero;
        return `
            <div class="editor-section">
                <h3 class="section-title" onclick="this.parentElement.classList.toggle('collapsed')">
                    <span>🎯 Главный экран (Hero)</span>
                    <span class="toggle-icon">▼</span>
                </h3>
                <div class="section-content">
                    <div class="form-group">
                        <label>Заголовок</label>
                        <input type="text" data-path="hero.title" value="${hero.title}">
                    </div>
                    <div class="form-group">
                        <label>Выделенный текст</label>
                        <input type="text" data-path="hero.highlight" value="${hero.highlight}">
                    </div>
                    <div class="form-group">
                        <label>Подзаголовок</label>
                        <textarea data-path="hero.subtitle" rows="2">${hero.subtitle}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Описание</label>
                        <textarea data-path="hero.description" rows="2">${hero.description}</textarea>
                    </div>
                    ${hero.stats.map((stat, i) => `
                        <div class="stat-group">
                            <h4>Статистика ${i + 1}</h4>
                            <input type="text" data-path="hero.stats.${i}.number" value="${stat.number}" placeholder="Число">
                            <input type="text" data-path="hero.stats.${i}.label" value="${stat.label}" placeholder="Подпись">
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    // Why Works section editor
    renderWhyWorksEditor() {
        const section = this.currentContent.whyWorks;
        return `
            <div class="editor-section">
                <h3 class="section-title" onclick="this.parentElement.classList.toggle('collapsed')">
                    <span>💡 Почему это работает</span>
                    <span class="toggle-icon">▼</span>
                </h3>
                <div class="section-content">
                    <div class="form-group">
                        <label>Заголовок секции</label>
                        <input type="text" data-path="whyWorks.title" value="${section.title}">
                    </div>
                    <div class="form-group">
                        <label>Подзаголовок</label>
                        <textarea data-path="whyWorks.subtitle" rows="2">${section.subtitle}</textarea>
                    </div>
                    ${section.benefits.map((benefit, i) => `
                        <div class="benefit-card-editor">
                            <h4>Карточка ${i + 1}</h4>
                            <div class="form-group">
                                <label>Иконка (эмодзи)</label>
                                <input type="text" data-path="whyWorks.benefits.${i}.icon" value="${benefit.icon}" maxlength="2">
                            </div>
                            <div class="form-group">
                                <label>Изображение (вместо иконки)</label>
                                ${this.renderImageUpload(`whyWorks.benefits.${i}.image`, benefit.image)}
                            </div>
                            <div class="form-group">
                                <label>Заголовок</label>
                                <input type="text" data-path="whyWorks.benefits.${i}.title" value="${benefit.title}">
                            </div>
                            <div class="form-group">
                                <label>Описание</label>
                                <textarea data-path="whyWorks.benefits.${i}.description" rows="3">${benefit.description}</textarea>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    // Advantages section editor
    renderAdvantagesEditor() {
        const section = this.currentContent.advantages;
        return `
            <div class="editor-section collapsed">
                <h3 class="section-title" onclick="this.parentElement.classList.toggle('collapsed')">
                    <span>⭐ Преимущества</span>
                    <span class="toggle-icon">▼</span>
                </h3>
                <div class="section-content">
                    <div class="form-group">
                        <label>Заголовок секции</label>
                        <input type="text" data-path="advantages.title" value="${section.title}">
                    </div>
                    ${section.items.map((item, i) => `
                        <div class="advantage-item-editor">
                            <h4>Преимущество ${i + 1}</h4>
                            <div class="form-group">
                                <label>Заголовок</label>
                                <input type="text" data-path="advantages.items.${i}.title" value="${item.title}">
                            </div>
                            <div class="form-group">
                                <label>Описание</label>
                                <textarea data-path="advantages.items.${i}.description" rows="3">${item.description}</textarea>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    // Included services editor
    renderIncludedEditor() {
        const section = this.currentContent.included;
        return `
            <div class="editor-section collapsed">
                <h3 class="section-title" onclick="this.parentElement.classList.toggle('collapsed')">
                    <span>📦 Что входит в стоимость</span>
                    <span class="toggle-icon">▼</span>
                </h3>
                <div class="section-content">
                    <div class="form-group">
                        <label>Заголовок секции</label>
                        <input type="text" data-path="included.title" value="${section.title}">
                    </div>
                    <div class="form-group">
                        <label>Подзаголовок</label>
                        <textarea data-path="included.subtitle" rows="2">${section.subtitle}</textarea>
                    </div>
                    ${section.services.map((service, i) => `
                        <div class="service-card-editor">
                            <h4>Услуга ${i + 1}</h4>
                            <div class="form-group">
                                <label>Иконка (эмодзи)</label>
                                <input type="text" data-path="included.services.${i}.icon" value="${service.icon}" maxlength="2">
                            </div>
                            <div class="form-group">
                                <label>Изображение (вместо иконки)</label>
                                ${this.renderImageUpload(`included.services.${i}.image`, service.image)}
                            </div>
                            <div class="form-group">
                                <label>Заголовок</label>
                                <input type="text" data-path="included.services.${i}.title" value="${service.title}">
                            </div>
                            <div class="form-group">
                                <label>Описание</label>
                                <textarea data-path="included.services.${i}.description" rows="3">${service.description}</textarea>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    // Footer editor
    renderFooterEditor() {
        const footer = this.currentContent.footer;
        return `
            <div class="editor-section collapsed">
                <h3 class="section-title" onclick="this.parentElement.classList.toggle('collapsed')">
                    <span>📄 Подвал сайта</span>
                    <span class="toggle-icon">▼</span>
                </h3>
                <div class="section-content">
                    <div class="form-group">
                        <label>Название компании</label>
                        <input type="text" data-path="footer.companyName" value="${footer.companyName}">
                    </div>
                    <div class="form-group">
                        <label>Описание</label>
                        <input type="text" data-path="footer.description" value="${footer.description}">
                    </div>
                    <div class="form-group">
                        <label>Телефон</label>
                        <input type="tel" data-path="footer.phone" value="${footer.phone}">
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" data-path="footer.email" value="${footer.email}">
                    </div>
                    <div class="form-group">
                        <label>Адрес</label>
                        <input type="text" data-path="footer.address" value="${footer.address}">
                    </div>
                    <div class="form-group">
                        <label>Copyright</label>
                        <input type="text" data-path="footer.copyright" value="${footer.copyright}">
                    </div>
                </div>
            </div>
        `;
    },

    // Render image upload control
    renderImageUpload(path, currentImage) {
        const id = path.replace(/\./g, '_');
        return `
            <div class="image-upload-control">
                <input type="file" id="file_${id}" accept="image/*" data-image-path="${path}" style="display: none;">
                <button type="button" class="btn-upload" onclick="document.getElementById('file_${id}').click()">
                    📁 Выбрать изображение
                </button>
                ${currentImage ? `
                    <button type="button" class="btn-delete-image" data-image-path="${path}">🗑️ Удалить</button>
                    <div class="image-preview">
                        <img src="${currentImage}" alt="Preview">
                    </div>
                ` : '<p class="no-image">Изображение не загружено</p>'}
            </div>
        `;
    },

    // Attach event listeners
    attachEventListeners() {
        // Text inputs
        document.querySelectorAll('[data-path]').forEach(input => {
            input.addEventListener('change', (e) => {
                this.updateContentValue(e.target.getAttribute('data-path'), e.target.value);
            });
        });

        // Image uploads
        document.querySelectorAll('[data-image-path]').forEach(input => {
            input.addEventListener('change', (e) => {
                this.handleImageUpload(e.target);
            });
        });

        // Delete image buttons
        document.querySelectorAll('.btn-delete-image').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const path = e.target.getAttribute('data-image-path');
                this.deleteImage(path);
            });
        });

        // Save all
        document.getElementById('save-all-content')?.addEventListener('click', () => {
            this.saveAll();
        });

        // Reset
        document.getElementById('reset-content')?.addEventListener('click', () => {
            this.resetContent();
        });
    },

    // Update content value
    updateContentValue(path, value) {
        const keys = path.split('.');
        let obj = this.currentContent;

        for (let i = 0; i < keys.length - 1; i++) {
            obj = obj[keys[i]];
        }

        obj[keys[keys.length - 1]] = value;
    },

    // Handle image upload
    handleImageUpload(input) {
        const file = input.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Пожалуйста, выберите изображение');
            return;
        }

        if (file.size > 500000) {
            alert('Файл слишком большой. Максимум 500KB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.resizeImage(e.target.result, 800, (resized) => {
                const path = input.getAttribute('data-image-path');
                this.updateContentValue(path, resized);
                this.renderEditor(); // Re-render to show preview
                this.attachEventListeners(); // Re-attach listeners
            });
        };
        reader.readAsDataURL(file);
    },

    // Resize image
    resizeImage(dataUrl, maxWidth, callback) {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            callback(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = dataUrl;
    },

    // Delete image
    deleteImage(path) {
        if (confirm('Удалить изображение?')) {
            this.updateContentValue(path, null);
            this.renderEditor();
            this.attachEventListeners();
        }
    },

    // Save all content
    saveAll() {
        if (ContentStorage.saveContent(this.currentContent)) {
            alert('✅ Контент успешно сохранен!');
            this.updateStorageInfo();

            // Reload main page if open
            if (window.opener && !window.opener.closed) {
                window.opener.location.reload();
            }
        } else {
            alert('❌ Ошибка сохранения. Возможно, превышен лимит хранилища.');
        }
    },

    // Reset content
    resetContent() {
        if (confirm('Вы уверены? Все изменения будут потеряны и контент вернется к значениям по умолчанию.')) {
            ContentStorage.resetToDefault();
            this.currentContent = ContentStorage.getContent();
            this.renderEditor();
            this.attachEventListeners();
            alert('✅ Контент сброшен к умолчанию');
        }
    },

    // Update storage info
    updateStorageInfo() {
        const info = ContentStorage.getStorageInfo();
        const container = document.getElementById('storage-info');
        if (info && container) {
            container.innerHTML = `
                <strong>Использование хранилища:</strong> 
                ${info.kb} KB / ~5000 KB (${info.percentage}%)
                <div class="storage-bar">
                    <div class="storage-fill" style="width: ${info.percentage}%"></div>
                </div>
            `;
        }
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.ContentEditor = ContentEditor;
}
