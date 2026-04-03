// Yandex Map and Calculator functionality
let map;
let placemarksCollection;
let selectedAddresses = [];
let currentCity = 'donetsk';
let currentMode = 'program'; // 'program' or 'custom'
let isMapAvailable = false;

function getDefaultMarkerColor(location) {
    return location && location.manualReview ? '#f59e0b' : '#2563eb';
}

function handleMapUnavailable(reason) {
    isMapAvailable = false;

    const mapEl = document.getElementById('map');
    if (mapEl) {
        mapEl.innerHTML = `
            <div style="
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
                padding: 20px;
                background: #f9fafb;
                border: 1px dashed #d1d5db;
                border-radius: 12px;
                color: #374151;
                font-family: Manrope, sans-serif;
            ">
                <div>
                    <div style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">Карта временно недоступна</div>
                    <div style="font-size: 14px; color: #6b7280;">
                        Вы можете рассчитать стоимость через «Адресную программу».<br>
                        ${reason ? `<span style="font-size:12px;opacity:.8">Причина: ${String(reason).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }
}

// Initialize Yandex Map
function initMap() {
    if (typeof ymaps === 'undefined' || !ymaps?.ready) {
        handleMapUnavailable('скрипт Яндекс.Карт не загрузился');
        return;
    }

    ymaps.ready(function () {
        try {
            // Create map centered on Donetsk
            map = new ymaps.Map('map', {
                center: [48.0159, 37.8029],
                zoom: 12,
                controls: ['zoomControl', 'fullscreenControl']
            });

            // Create collection for placemarks
            placemarksCollection = new ymaps.GeoObjectCollection();
            map.geoObjects.add(placemarksCollection);

            isMapAvailable = true;

            // Load initial markers
            loadMarkers(currentCity);
        } catch (e) {
            console.error('Map init error:', e);
            handleMapUnavailable(e?.message || e);
        }
    });
}

// Load markers for selected city
function loadMarkers(city) {
    if (!map || !placemarksCollection) return;

    // Clear existing markers
    placemarksCollection.removeAll();

    const addresses = addressData[city];
    if (!addresses) return;

    // Center map on city
    const centerCoords = city === 'donetsk' ? [48.0159, 37.8029] : [48.0459, 37.9629];
    map.setCenter(centerCoords, 12);

    // Add markers for each address
    addresses.forEach(function (location) {
        const placemark = new ymaps.Placemark(
            location.coords,
            {
                balloonContent: `
                    <div style="padding: 15px; font-family: Manrope, sans-serif;">
                        <strong style="color: #1f2937; font-size: 14px;">${location.address}</strong><br>
                        ${location.resolvedAddress ? `<span style="color:#6b7280;font-size:12px;display:block;margin-top:4px;">Геокодер: ${location.resolvedAddress}</span>` : ''}
                        ${location.manualReview ? `<span style="color:#b45309;font-size:12px;display:block;margin-top:4px;">⚠ Нужна ручная проверка адреса</span>` : ''}
                        <span style="color: #6b7280; font-size: 13px;">Лифтов: ${location.lifts}</span><br>
                        <span style="color: #2563eb; font-size: 12px; margin-top: 5px; display: inline-block;">💡 Кликните для выбора</span>
                    </div>
                `,
                hintContent: location.address,
                id: location.id
            },
            {
                preset: 'islands#blueCircleDotIcon',
                iconColor: getDefaultMarkerColor(location)
            }
        );

        // Add click handler for custom mode
        placemark.events.add('click', function () {
            if (currentMode === 'custom') {
                toggleAddressSelection(location, placemark);
            }
        });

        // Store placemark reference for later updates
        placemark.properties.set('location', location);

        placemarksCollection.add(placemark);
    });

    // Update cursor style based on mode
    updateMarkersCursorStyle();
}

// Update markers cursor style based on current mode
function updateMarkersCursorStyle() {
    if (!placemarksCollection) return;

    placemarksCollection.each(function (placemark) {
        if (currentMode === 'custom') {
            placemark.options.set('cursor', 'pointer');
        } else {
            placemark.options.set('cursor', 'default');
        }
    });
}

// Toggle address selection in custom mode
function toggleAddressSelection(location, placemark) {
    const index = selectedAddresses.findIndex(addr => addr.id === location.id);

    if (index > -1) {
        // Deselect
        selectedAddresses.splice(index, 1);
        placemark.options.set('iconColor', getDefaultMarkerColor(location));
    } else {
        // Select
        selectedAddresses.push(location);
        placemark.options.set('iconColor', '#dc2626');
    }

    updateSelectedAddressesList();
    updateCalculation();
}

// Update selected addresses list in UI
function updateSelectedAddressesList() {
    const container = document.getElementById('selected-addresses');

    if (selectedAddresses.length === 0) {
        container.innerHTML = '<p class="no-selection">Адреса не выбраны</p>';
        return;
    }

    let html = '';
    selectedAddresses.forEach(function (location) {
        html += `
            <div class="address-item">
                <span class="address-text">${location.address} (${location.lifts} лифт.)</span>
                <button class="remove-address" data-id="${location.id}">×</button>
            </div>
        `;
    });

    container.innerHTML = html;

    // Add event listeners to remove buttons
    container.querySelectorAll('.remove-address').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const id = parseInt(this.getAttribute('data-id'));
            const location = selectedAddresses.find(addr => addr.id === id);
            if (location) {
                // Find placemark and reset color
                placemarksCollection.each(function (placemark) {
                    if (placemark.properties.get('id') === id) {
                        placemark.options.set('iconColor', getDefaultMarkerColor(location));
                    }
                });
                // Remove from array
                selectedAddresses = selectedAddresses.filter(addr => addr.id !== id);
                updateSelectedAddressesList();
                updateCalculation();
            }
        });
    });
}

// Calculate total price and update UI
function updateCalculation() {
    const citySelect = document.getElementById('calc-city');
    const formatSelect = document.getElementById('calc-format');
    const selectedOption = formatSelect.options[formatSelect.selectedIndex];

    const city = citySelect.value;
    const formatName = formatSelect.options[formatSelect.selectedIndex].text.split(' ')[0];

    // Get price based on city
    const priceAttr = 'data-price-' + city;
    const basePrice = parseInt(selectedOption.getAttribute(priceAttr));

    let totalLifts = 0;
    let totalPrice = 0;

    if (currentMode === 'program') {
        // Use address program
        totalLifts = addressPrograms[city].count;
        totalPrice = basePrice;
    } else {
        // Calculate from selected addresses
        totalLifts = selectedAddresses.reduce((sum, addr) => sum + addr.lifts, 0);

        if (totalLifts > 0) {
            // Calculate proportional price
            const programLifts = addressPrograms[city].count;
            totalPrice = Math.round((basePrice / programLifts) * totalLifts);
        }
    }

    // Update UI with animation
    const totalLiftsEl = document.getElementById('total-lifts');
    const totalPriceEl = document.getElementById('total-price');

    // Add pulse animation to show update
    totalLiftsEl.style.animation = 'none';
    totalPriceEl.style.animation = 'none';
    setTimeout(() => {
        totalLiftsEl.style.animation = 'pulse 0.5s ease';
        totalPriceEl.style.animation = 'pulse 0.5s ease';
    }, 10);

    totalLiftsEl.textContent = totalLifts;
    document.getElementById('selected-format').textContent = formatName;
    document.getElementById('selected-city').textContent = city === 'donetsk' ? 'Донецк' : 'Макеевка';
    totalPriceEl.textContent = totalPrice.toLocaleString('ru-RU') + ' ₽';
}

// Fill order form with calculator data
function fillFormFromCalculator() {
    const citySelect = document.getElementById('calc-city');
    const formatSelect = document.getElementById('calc-format');
    const totalLiftsEl = document.getElementById('total-lifts');
    const totalPriceEl = document.getElementById('total-price');

    // Get current calculator values
    const selectedCity = citySelect.value;
    const selectedFormat = formatSelect.value;
    const totalLifts = totalLiftsEl.textContent;
    const totalPrice = totalPriceEl.textContent;
    const formatName = formatSelect.options[formatSelect.selectedIndex].text.split(' ')[0];

    // Fill form fields
    const formCitySelect = document.getElementById('city');
    const formFormatSelect = document.getElementById('format');
    const formComment = document.getElementById('comment');

    // Set city
    if (formCitySelect) {
        formCitySelect.value = selectedCity;
        // Add visual feedback
        formCitySelect.style.animation = 'pulse 0.5s ease';
        setTimeout(() => {
            formCitySelect.style.animation = '';
        }, 500);
    }

    // Set format
    if (formFormatSelect) {
        formFormatSelect.value = selectedFormat;
        // Add visual feedback
        formFormatSelect.style.animation = 'pulse 0.5s ease';
        setTimeout(() => {
            formFormatSelect.style.animation = '';
        }, 500);
    }

    // Create detailed comment
    if (formComment) {
        let comment = `Расчет из калькулятора:\n`;
        comment += `Город: ${selectedCity === 'donetsk' ? 'Донецк' : 'Макеевка'}\n`;
        comment += `Формат: ${formatName}\n`;
        comment += `Количество лифтов: ${totalLifts}\n`;
        comment += `Стоимость: ${totalPrice} за 1 месяц\n`;

        if (currentMode === 'program') {
            comment += `\nТип размещения: Адресная программа (полное покрытие города)`;
        } else if (currentMode === 'custom' && selectedAddresses.length > 0) {
            comment += `\nТип размещения: Выборочное размещение\n`;
            comment += `Выбранные адреса:\n`;
            selectedAddresses.forEach((addr, index) => {
                comment += `${index + 1}. ${addr.address} (${addr.lifts} лифт.)\n`;
            });
        }

        formComment.value = comment;
        // Add visual feedback
        formComment.style.animation = 'pulse 0.5s ease';
        setTimeout(() => {
            formComment.style.animation = '';
        }, 500);
    }

    // Scroll form into better view and highlight it
    const formContainer = document.querySelector('.form-container');
    if (formContainer) {
        formContainer.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.5)';
        setTimeout(() => {
            formContainer.style.boxShadow = '';
        }, 2000);
    }

    // Show success notification
    showNotification('✓ Данные из калькулятора добавлены в форму', 'success');
}

// Show notification banner
function showNotification(message, type = 'success') {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.calculator-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `calculator-notification ${type}`;
    notification.textContent = message;

    // Insert at top of form section
    const formSection = document.getElementById('form');
    if (formSection) {
        formSection.insertBefore(notification, formSection.firstChild);

        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Auto-dismiss after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
}

// Mobile menu toggle
function initMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', function () {
            this.classList.toggle('active');
            mainNav.classList.toggle('active');
        });

        // Close menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', function () {
                mobileMenuToggle.classList.remove('active');
                mainNav.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function (e) {
            if (!mobileMenuToggle.contains(e.target) && !mainNav.contains(e.target)) {
                mobileMenuToggle.classList.remove('active');
                mainNav.classList.remove('active');
            }
        });
    }
}

// Initialize calculator when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    // Initialize mobile menu
    initMobileMenu();

    // Initialize Yandex Map
    initMap();

    // City selector change
    const citySelect = document.getElementById('calc-city');
    citySelect.addEventListener('change', function () {
        currentCity = this.value;
        selectedAddresses = [];
        loadMarkers(currentCity);

        // Update program count
        const programCount = addressPrograms[currentCity].count;
        document.getElementById('program-count').textContent = programCount;

        updateCalculation();
    });

    // Format selector change
    const formatSelect = document.getElementById('calc-format');
    formatSelect.addEventListener('change', function () {
        updateCalculation();
    });

    // Mode buttons (Program vs Custom)
    const modeButtons = document.querySelectorAll('.mode-btn');
    modeButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            const mode = this.getAttribute('data-mode');

            if (mode === 'custom' && !isMapAvailable) {
                showNotification('Карта недоступна — выберите «Адресную программу» для расчета', 'error');
                return;
            }

            // Update active state
            modeButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Show/hide mode content
            document.getElementById('program-mode').style.display = mode === 'program' ? 'block' : 'none';
            document.getElementById('custom-mode').style.display = mode === 'custom' ? 'block' : 'none';

            // Update current mode
            currentMode = mode;

            // Reset selections when switching to custom mode
            if (mode === 'custom') {
                selectedAddresses = [];
                updateSelectedAddressesList();
                // Reset all marker colors
                if (placemarksCollection) {
                    placemarksCollection.each(function (placemark) {
                        const markerLocation = placemark.properties.get('location');
                        placemark.options.set('iconColor', getDefaultMarkerColor(markerLocation));
                    });
                }
            }

            // Update cursor style for markers
            updateMarkersCursorStyle();

            updateCalculation();
        });
    });

    // Calculator order button - transfer data to form
    const calculatorOrderBtn = document.getElementById('calculator-order-btn');
    if (calculatorOrderBtn) {
        calculatorOrderBtn.addEventListener('click', function (e) {
            // Small delay to ensure smooth scroll completes
            setTimeout(function () {
                fillFormFromCalculator();
            }, 500);
        });
    }

    // Pricing tabs functionality

    const tabButtons = document.querySelectorAll('.tab-button');
    const pricingCards = document.querySelectorAll('.pricing-cards');

    tabButtons.forEach(button => {
        button.addEventListener('click', function () {
            const city = this.getAttribute('data-city');

            // Remove active class from all buttons and cards
            tabButtons.forEach(btn => btn.classList.remove('active'));
            pricingCards.forEach(card => card.classList.remove('active'));

            // Add active class to clicked button and corresponding card
            this.classList.add('active');
            document.getElementById(city).classList.add('active');
        });
    });

    // Smooth scroll for anchor links
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

    // Form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get form data
            const formData = {
                name: document.getElementById('name').value,
                phone: document.getElementById('phone').value,
                city: document.getElementById('city').value,
                format: document.getElementById('format').value,
                comment: document.getElementById('comment').value,
                source: 'form'
            };

            // Save lead to localStorage
            if (typeof LeadStorage !== 'undefined') {
                const savedLead = LeadStorage.saveLead(formData);
                if (savedLead) {
                    console.log('Lead saved:', savedLead);
                }
            }

            // Show success message
            alert('Спасибо за заявку! Мы свяжемся с вами в ближайшее время.');

            // Reset form
            contactForm.reset();

            // TODO: Replace with actual form submission to your backend
            // Example:
            // fetch('/api/submit-form', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify(formData),
            // })
            // .then(response => response.json())
            // .then(data => {
            //     alert('Спасибо за заявку! Мы свяжемся с вами в ближайшее время.');
            //     contactForm.reset();
            // })
            // .catch((error) => {
            //     console.error('Error:', error);
            //     alert('Произошла ошибка. Пожалуйста, попробуйте позже.');
            // });
        });
    }

    // Phone mask
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');
            let formattedValue = '';

            if (value.length > 0) {
                formattedValue = '+7';
                if (value.length > 1) {
                    formattedValue += ' (' + value.substring(1, 4);
                }
                if (value.length >= 4) {
                    formattedValue += ') ' + value.substring(4, 7);
                }
                if (value.length >= 7) {
                    formattedValue += '-' + value.substring(7, 9);
                }
                if (value.length >= 9) {
                    formattedValue += '-' + value.substring(9, 11);
                }
            }

            e.target.value = formattedValue;
        });
    }

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for fade-in animation
    const animatedElements = document.querySelectorAll('.benefit-card, .advantage-item, .price-card, .included-card');
    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(24px)';
        el.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
        el.style.transitionDelay = `${(index % 6) * 80}ms`;
        observer.observe(el);
    });
});
