// Ultra-Simple Content Editor - No dependencies, pure vanilla JS
(function () {
    'use strict';

    console.log('✅ Content editor script loaded');

    // Helper: read file as base64
    function readFileAsBase64(file, callback) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (e) { callback(e.target.result); };
        reader.readAsDataURL(file);
    }

    // Helper: create image upload control HTML
    function imgUploadControl(id, currentSrc, label) {
        const preview = currentSrc
            ? '<img id="prev-' + id + '" src="' + currentSrc + '" style="max-width:120px;max-height:80px;border-radius:8px;border:2px solid #e5e7eb;display:block;margin-top:6px">'
            : '<span id="prev-' + id + '" style="color:#9ca3af;font-size:12px;font-style:italic">Не загружено</span>';
        return '<div style="margin-bottom:16px">' +
            '<label style="display:block;margin-bottom:6px;font-weight:600;color:#374151;font-size:13px">' + label + '</label>' +
            preview +
            '<div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">' +
            '<label style="padding:7px 14px;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border-radius:7px;font-size:13px;font-weight:600;cursor:pointer">📁 Выбрать фото<input type="file" id="' + id + '" accept="image/*" style="display:none"></label>' +
            '<button type="button" data-clear="' + id + '" style="padding:7px 14px;background:#fee2e2;color:#991b1b;border:none;border-radius:7px;font-size:13px;font-weight:600;cursor:pointer">✕ Удалить</button>' +
            '</div></div>';
    }

    window.SimpleContentEditor = {
        _content: null,

        init: function () {
            console.log('🎨 SimpleContentEditor.init() called');
            const container = document.getElementById('content-editor-container');
            if (!container) { console.error('❌ Container not found'); return; }

            this._content = this.getContent();
            container.innerHTML = this.getHTML(this._content);
            this.attachListeners();
            console.log('✅ Editor initialized');
        },

        getContent: function () {
            try {
                const stored = localStorage.getItem('moigorod_content');
                if (stored) return JSON.parse(stored);
            } catch (e) { console.warn('Error loading from localStorage:', e); }

            return {
                siteBackground: { color: '#ffffff', image: null },
                header: { phone: '+7 949 338 78 33', email: 'info@moigorod.ru' },
                hero: {
                    title: 'Ваша реклама в каждом лифте города',
                    subtitle: 'Размещение рекламы в лифтах',
                    heroImage: 'lift.png'
                },
                footer: { companyName: 'ООО «МОЙ ГОРОД»', phone: '+7 949 338 78 33', email: 'info@moigorod.ru', address: 'г. Донецк, ДНР' },
                whyWorks: {
                    benefits: [
                        { icon: '👁️', image: null, title: 'Рекламу невозможно пропустить' },
                        { icon: '🔄', image: null, title: 'Минимум 2 контакта ежедневно' },
                        { icon: '🎯', image: null, title: 'Большой охват' },
                        { icon: '💰', image: null, title: 'Доступность для любого бизнеса' },
                        { icon: '📊', image: null, title: 'Высокая информативность' },
                        { icon: '✨', image: null, title: 'Ненавязчивость формата' }
                    ]
                },
                included: {
                    services: [
                        { icon: '🖨️', image: null, title: 'Профессиональная печать' },
                        { icon: '🔧', image: null, title: 'Монтаж и демонтаж' },
                        { icon: '📸', image: null, title: 'Детальный фотоотчет' },
                        { icon: '🛡️', image: null, title: 'Страховка от вандализма' },
                        { icon: '📅', image: null, title: 'Размещение на 1 месяц' },
                        { icon: '🎯', image: null, title: 'Адресная программа' }
                    ]
                }
            };
        },

        getHTML: function (c) {
            const bg = c.siteBackground || { color: '#ffffff', image: null };
            const hero = c.hero || {};
            const benefits = (c.whyWorks && c.whyWorks.benefits) ? c.whyWorks.benefits : [];
            const services = (c.included && c.included.services) ? c.included.services : [];

            // Build icons HTML
            let benefitsHTML = '';
            benefits.forEach(function (b, i) {
                benefitsHTML += imgUploadControl('benefit-img-' + i, b.image, (b.icon || '') + ' ' + (b.title || 'Карточка ' + (i + 1)));
            });

            let servicesHTML = '';
            services.forEach(function (s, i) {
                servicesHTML += imgUploadControl('service-img-' + i, s.image, (s.icon || '') + ' ' + (s.title || 'Карточка ' + (i + 1)));
            });

            const card = 'background:#fff;padding:24px;border-radius:12px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.1)';
            const h3s = 'margin:0 0 20px 0;color:#1f2937;border-bottom:2px solid #667eea;padding-bottom:10px';
            const inp = 'width:100%;padding:10px;border:2px solid #e5e7eb;border-radius:8px;font-size:14px;box-sizing:border-box';

            return '<div style="max-width:900px;margin:0 auto;padding:20px;font-family:Arial,sans-serif">' +

                // --- Top bar ---
                '<div style="' + card + '">' +
                '<h2 style="margin:0 0 16px 0;color:#1f2937">✏️ Редактор контента</h2>' +
                '<div style="display:flex;gap:10px;flex-wrap:wrap">' +
                '<button id="save-btn" style="padding:12px 24px;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer">💾 Сохранить все</button>' +
                '<button id="reset-btn" style="padding:12px 24px;background:#f3f4f6;color:#374151;border:1px solid #d1d5db;border-radius:8px;font-weight:600;cursor:pointer">🔄 Сбросить</button>' +
                '</div>' +
                '<div id="save-status" style="margin-top:10px;font-size:13px;color:#059669;display:none"></div>' +
                '</div>' +

                // --- 1. Контакты ---
                '<div style="' + card + '">' +
                '<h3 style="' + h3s + '">📋 Шапка сайта</h3>' +
                '<div style="margin-bottom:14px"><label style="display:block;margin-bottom:6px;font-weight:600;color:#374151;font-size:13px">Телефон</label>' +
                '<input type="tel" id="header-phone" value="' + (c.header && c.header.phone ? c.header.phone : '') + '" style="' + inp + '"></div>' +
                '<div><label style="display:block;margin-bottom:6px;font-weight:600;color:#374151;font-size:13px">Email</label>' +
                '<input type="email" id="header-email" value="' + (c.header && c.header.email ? c.header.email : '') + '" style="' + inp + '"></div>' +
                '</div>' +

                // --- 2. Фон сайта ---
                '<div style="' + card + '">' +
                '<h3 style="' + h3s + '">🖼️ Фон сайта</h3>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start">' +
                '<div>' +
                '<label style="display:block;margin-bottom:6px;font-weight:600;color:#374151;font-size:13px">Цвет фона (body)</label>' +
                '<div style="display:flex;gap:10px;align-items:center">' +
                '<input type="color" id="bg-color" value="' + (bg.color || '#ffffff') + '" style="width:50px;height:40px;border:2px solid #e5e7eb;border-radius:8px;cursor:pointer;padding:2px">' +
                '<input type="text" id="bg-color-text" value="' + (bg.color || '#ffffff') + '" style="flex:1;padding:10px;border:2px solid #e5e7eb;border-radius:8px;font-size:13px">' +
                '</div>' +
                '</div>' +
                '<div>' + imgUploadControl('bg-image', bg.image, 'Фоновое изображение body') + '</div>' +
                '</div>' +
                '</div>' +

                // --- 3. Hero секция ---
                '<div style="' + card + '">' +
                '<h3 style="' + h3s + '">🌟 Главный экран (Hero)</h3>' +
                '<div style="margin-bottom:14px"><label style="display:block;margin-bottom:6px;font-weight:600;color:#374151;font-size:13px">Заголовок</label>' +
                '<input type="text" id="hero-title" value="' + (hero.title || '') + '" style="' + inp + '"></div>' +
                '<div style="margin-bottom:14px"><label style="display:block;margin-bottom:6px;font-weight:600;color:#374151;font-size:13px">Подзаголовок</label>' +
                '<textarea id="hero-subtitle" rows="2" style="' + inp + 'resize:vertical">' + (hero.subtitle || '') + '</textarea></div>' +
                '<div style="margin-bottom:14px"><label style="display:block;margin-bottom:6px;font-weight:600;color:#374151;font-size:13px">Путь к файлу изображения</label>' +
                '<input type="text" id="hero-image-file" value="' + ((hero.heroImage && !hero.heroImage.startsWith('data:')) ? hero.heroImage : '') + '" placeholder="lift.png" style="' + inp + '">' +
                '<div style="margin-top:6px;color:#6b7280;font-size:12px">Пример: <code>lift.png</code> или <code>banner.jpg</code></div></div>' +
                imgUploadControl('hero-image', hero.heroImage, 'Баннер/фото под заголовком (отображается в hero-секции)') +
                '</div>' +
                benefitsHTML +
                '</div>' +

                // --- 5. Иконки "Что входит" ---
                '<div style="' + card + '">' +
                '<h3 style="' + h3s + '">🎨 Иконки — «Что входит в стоимость»</h3>' +
                '<p style="color:#6b7280;font-size:13px;margin-bottom:16px">Загруженное фото заменяет emoji-иконку на сайте</p>' +
                servicesHTML +
                '</div>' +

                // --- 6. Подвал ---
                '<div style="' + card + '">' +
                '<h3 style="' + h3s + '">📄 Подвал сайта</h3>' +
                '<div style="margin-bottom:14px"><label style="display:block;margin-bottom:6px;font-weight:600;color:#374151;font-size:13px">Название компании</label><input type="text" id="footer-company" value="' + ((c.footer && c.footer.companyName) || '') + '" style="' + inp + '"></div>' +
                '<div style="margin-bottom:14px"><label style="display:block;margin-bottom:6px;font-weight:600;color:#374151;font-size:13px">Телефон</label><input type="tel" id="footer-phone" value="' + ((c.footer && c.footer.phone) || '') + '" style="' + inp + '"></div>' +
                '<div style="margin-bottom:14px"><label style="display:block;margin-bottom:6px;font-weight:600;color:#374151;font-size:13px">Email</label><input type="email" id="footer-email" value="' + ((c.footer && c.footer.email) || '') + '" style="' + inp + '"></div>' +
                '<div><label style="display:block;margin-bottom:6px;font-weight:600;color:#374151;font-size:13px">Адрес</label><input type="text" id="footer-address" value="' + ((c.footer && c.footer.address) || '') + '" style="' + inp + '"></div>' +
                '</div>' +

                '<div style="background:#f0f9ff;padding:16px;border-radius:8px;border-left:4px solid #3b82f6">' +
                '<p style="margin:0;color:#1e40af;font-size:13px">💡 <strong>Совет:</strong> После сохранения обновите главную страницу (F5), чтобы увидеть изменения.</p>' +
                '</div>' +
                '</div>';
        },

        attachListeners: function () {
            const self = this;

            // ---- Color picker sync ----
            const bgColorInput = document.getElementById('bg-color');
            const bgColorText = document.getElementById('bg-color-text');
            if (bgColorInput && bgColorText) {
                bgColorInput.addEventListener('input', function () { bgColorText.value = this.value; });
                bgColorText.addEventListener('input', function () {
                    if (/^#[0-9a-fA-F]{3,6}$/.test(this.value)) bgColorInput.value = this.value;
                });
            }

            // ---- File inputs -> base64 preview ----
            function bindFileInput(inputId, onLoad) {
                const input = document.getElementById(inputId);
                if (!input) return;
                input.addEventListener('change', function () {
                    const file = this.files[0];
                    if (!file) return;
                    readFileAsBase64(file, function (dataUrl) {
                        // Update preview
                        const prev = document.getElementById('prev-' + inputId);
                        if (prev) {
                            prev.outerHTML = '<img id="prev-' + inputId + '" src="' + dataUrl + '" style="max-width:120px;max-height:80px;border-radius:8px;border:2px solid #e5e7eb;display:block;margin-top:6px">';
                        }
                        onLoad(dataUrl);
                    });
                });
            }

            // Background image
            bindFileInput('bg-image', function (dataUrl) {
                if (!self._content.siteBackground) self._content.siteBackground = {};
                self._content.siteBackground.image = dataUrl;
            });

            // Hero image
            bindFileInput('hero-image', function (dataUrl) {
                if (!self._content.hero) self._content.hero = {};
                self._content.hero.heroImage = dataUrl;
            });

            // Benefit icons
            const benefitsCount = (self._content.whyWorks && self._content.whyWorks.benefits) ? self._content.whyWorks.benefits.length : 6;
            for (let i = 0; i < benefitsCount; i++) {
                (function (idx) {
                    bindFileInput('benefit-img-' + idx, function (dataUrl) {
                        if (self._content.whyWorks && self._content.whyWorks.benefits && self._content.whyWorks.benefits[idx]) {
                            self._content.whyWorks.benefits[idx].image = dataUrl;
                        }
                    });
                })(i);
            }

            // Service icons
            const servicesCount = (self._content.included && self._content.included.services) ? self._content.included.services.length : 6;
            for (let i = 0; i < servicesCount; i++) {
                (function (idx) {
                    bindFileInput('service-img-' + idx, function (dataUrl) {
                        if (self._content.included && self._content.included.services && self._content.included.services[idx]) {
                            self._content.included.services[idx].image = dataUrl;
                        }
                    });
                })(i);
            }

            // ---- Clear buttons ----
            document.getElementById('content-editor-container').addEventListener('click', function (e) {
                const clearId = e.target.getAttribute('data-clear');
                if (!clearId) return;
                // Reset preview
                const prev = document.getElementById('prev-' + clearId);
                if (prev) {
                    prev.outerHTML = '<span id="prev-' + clearId + '" style="color:#9ca3af;font-size:12px;font-style:italic">Не загружено</span>';
                }
                // Reset input
                const inp = document.getElementById(clearId);
                if (inp) inp.value = '';
                // Clear from content
                if (clearId === 'bg-image') { if (self._content.siteBackground) self._content.siteBackground.image = null; }
                else if (clearId === 'hero-image') { if (self._content.hero) self._content.hero.heroImage = null; }
                else if (clearId.startsWith('benefit-img-')) {
                    const idx = parseInt(clearId.replace('benefit-img-', ''));
                    if (self._content.whyWorks && self._content.whyWorks.benefits && self._content.whyWorks.benefits[idx]) {
                        self._content.whyWorks.benefits[idx].image = null;
                    }
                } else if (clearId.startsWith('service-img-')) {
                    const idx = parseInt(clearId.replace('service-img-', ''));
                    if (self._content.included && self._content.included.services && self._content.included.services[idx]) {
                        self._content.included.services[idx].image = null;
                    }
                }
            });

            // ---- Save button ----
            const saveBtn = document.getElementById('save-btn');
            if (saveBtn) {
                saveBtn.addEventListener('click', function () {
                    // Collect text fields
                    self._content.header = self._content.header || {};
                    self._content.header.phone = (document.getElementById('header-phone') || {}).value || '';
                    self._content.header.email = (document.getElementById('header-email') || {}).value || '';

                    self._content.siteBackground = self._content.siteBackground || {};
                    self._content.siteBackground.color = (document.getElementById('bg-color') || {}).value || '#ffffff';

                    self._content.hero = self._content.hero || {};
                    self._content.hero.title = (document.getElementById('hero-title') || {}).value || '';
                    self._content.hero.subtitle = (document.getElementById('hero-subtitle') || {}).value || '';

                    const heroImageFileInput = document.getElementById('hero-image-file');
                    const heroImageFile = heroImageFileInput ? heroImageFileInput.value.trim() : '';
                    if (heroImageFile) {
                        self._content.hero.heroImage = heroImageFile;
                    }

                    self._content.footer = self._content.footer || {};
                    self._content.footer.companyName = (document.getElementById('footer-company') || {}).value || '';
                    self._content.footer.phone = (document.getElementById('footer-phone') || {}).value || '';
                    self._content.footer.email = (document.getElementById('footer-email') || {}).value || '';
                    self._content.footer.address = (document.getElementById('footer-address') || {}).value || '';

                    try {
                        localStorage.setItem('moigorod_content', JSON.stringify(self._content));
                        const status = document.getElementById('save-status');
                        if (status) {
                            status.textContent = '✅ Сохранено! Обновите главную страницу (F5).';
                            status.style.display = 'block';
                            setTimeout(function () { status.style.display = 'none'; }, 4000);
                        }
                    } catch (e) {
                        if (e.name === 'QuotaExceededError') {
                            alert('❌ Превышен лимит localStorage (~5 МБ). Удалите часть изображений.');
                        } else {
                            alert('❌ Ошибка сохранения: ' + e.message);
                        }
                    }
                });
            }

            // ---- Reset button ----
            const resetBtn = document.getElementById('reset-btn');
            if (resetBtn) {
                resetBtn.addEventListener('click', function () {
                    if (confirm('Сбросить все настройки и изображения к значениям по умолчанию?')) {
                        localStorage.removeItem('moigorod_content');
                        window.SimpleContentEditor.init();
                    }
                });
            }
        }
    };

    console.log('✅ SimpleContentEditor ready');
})();
