// Admin Panel JavaScript
// Authentication and Lead Management

// Configuration
const SESSION_KEY = 'admin_session';

// State
let currentFilter = {
    status: '',
    city: '',
    search: ''
};

// Authentication
function checkAuth() {
    return true;
}

function login() {
    sessionStorage.setItem(SESSION_KEY, 'authenticated');
    return true;
}

function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.href = 'index.html';
}

function showLoginScreen() {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('admin-dashboard').style.display = 'none';
}

function showDashboard() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'block';
    loadDashboard();
    initializeTabs();
}

// Tab Management
function initializeTabs() {
    console.log('🔧 Initializing tabs...');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    console.log(`Found ${tabButtons.length} tab buttons and ${tabContents.length} tab contents`);

    let contentEditorInitialized = false;

    tabButtons.forEach(button => {
        button.addEventListener('click', function () {
            const tabName = this.getAttribute('data-tab');
            console.log(`📑 Tab clicked: ${tabName}`);

            // Remove active class from all tabs and hide them
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => {
                content.classList.remove('active');
                content.style.display = 'none';
            });

            // Add active class to clicked tab and show it
            this.classList.add('active');
            const targetTab = document.getElementById(`${tabName}-tab`);
            if (targetTab) {
                targetTab.classList.add('active');
                targetTab.style.display = 'block';
                console.log(`✅ Activated tab: ${tabName}`);
            } else {
                console.error(`❌ Tab not found: ${tabName}-tab`);
            }

            // Initialize content editor when content tab is clicked for the first time
            if (tabName === 'content' && !contentEditorInitialized) {
                console.log('🎨 Initializing simple content editor...');

                if (typeof SimpleContentEditor === 'undefined') {
                    console.error('❌ SimpleContentEditor not loaded!');
                    alert('Ошибка: Редактор контента не загружен. Проверьте консоль браузера (F12).');
                    return;
                }

                try {
                    const container = document.getElementById('content-editor-container');
                    if (!container) {
                        console.error('❌ content-editor-container not found!');
                        alert('Ошибка: Контейнер редактора не найден.');
                        return;
                    }

                    console.log('📦 Container found, calling SimpleContentEditor.init()...');
                    SimpleContentEditor.init();
                    contentEditorInitialized = true;
                    console.log('✅ Simple content editor initialized successfully!');
                } catch (error) {
                    console.error('❌ Error initializing content editor:', error);
                    alert('Ошибка инициализации редактора: ' + error.message);
                }
            }
        });
    });

    console.log('✅ Tabs initialized');
}

// Dashboard Functions
function loadDashboard() {
    updateStatistics();
    renderLeadsTable();
}

function updateStatistics() {
    const stats = LeadStorage.getStatistics();

    document.getElementById('stat-total').textContent = stats.total;
    document.getElementById('stat-new').textContent = stats.new;
    document.getElementById('stat-contacted').textContent = stats.contacted;
    document.getElementById('stat-closed').textContent = stats.closed;
}

function renderLeadsTable() {
    const tbody = document.getElementById('leads-table-body');
    let leads = LeadStorage.getAllLeads();

    // Apply filters
    if (currentFilter.status) {
        leads = leads.filter(lead => lead.status === currentFilter.status);
    }

    if (currentFilter.city) {
        leads = leads.filter(lead => lead.city === currentFilter.city);
    }

    if (currentFilter.search) {
        const searchLower = currentFilter.search.toLowerCase();
        leads = leads.filter(lead =>
            lead.name.toLowerCase().includes(searchLower) ||
            lead.phone.toLowerCase().includes(searchLower)
        );
    }

    // Clear table
    tbody.innerHTML = '';

    if (leads.length === 0) {
        tbody.innerHTML = '<tr class="no-data"><td colspan="8">Заявок не найдено</td></tr>';
        return;
    }

    // Render leads
    leads.forEach(lead => {
        const row = createLeadRow(lead);
        tbody.appendChild(row);
    });
}

function createLeadRow(lead) {
    const tr = document.createElement('tr');

    // Format date
    const date = new Date(lead.timestamp);
    const dateStr = date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Format city
    const cityMap = {
        'donetsk': 'Донецк',
        'makeevka': 'Макеевка',
        'both': 'Оба города'
    };
    const cityName = cityMap[lead.city] || lead.city;

    // Format format
    const formatName = lead.format ? lead.format.toUpperCase() + 'min' : 'Консультация';

    // Status badge
    const statusMap = {
        'new': 'Новая',
        'contacted': 'Обработана',
        'closed': 'Закрыта'
    };
    const statusName = statusMap[lead.status] || lead.status;

    tr.innerHTML = `
        <td>${dateStr}</td>
        <td><strong>${lead.name}</strong></td>
        <td>${lead.phone}</td>
        <td>${cityName}</td>
        <td>${_formatPrograms(lead)}</td>
        <td>${formatName}</td>
        <td>
            <select class="status-select" data-lead-id="${lead.id}">
                <option value="new" ${lead.status === 'new' ? 'selected' : ''}>Новая</option>
                <option value="contacted" ${lead.status === 'contacted' ? 'selected' : ''}>Обработана</option>
                <option value="closed" ${lead.status === 'closed' ? 'selected' : ''}>Закрыта</option>
            </select>
        </td>
        <td>
            <div class="action-buttons">
                <button class="btn-action btn-view" data-lead-id="${lead.id}">👁️ Просмотр</button>
                <button class="btn-action btn-delete" data-lead-id="${lead.id}">🗑️ Удалить</button>
            </div>
        </td>
    `;

    // Add event listeners
    const statusSelect = tr.querySelector('.status-select');
    statusSelect.addEventListener('change', function () {
        handleStatusChange(lead.id, this.value);
    });

    const viewBtn = tr.querySelector('.btn-view');
    viewBtn.addEventListener('click', function () {
        showLeadModal(lead.id);
    });

    const deleteBtn = tr.querySelector('.btn-delete');
    deleteBtn.addEventListener('click', function () {
        handleDeleteLead(lead.id);
    });

    return tr;
}

function handleStatusChange(leadId, newStatus) {
    if (LeadStorage.updateLeadStatus(leadId, newStatus)) {
        updateStatistics();
        // Show success feedback
        showNotification('Статус обновлен', 'success');
    }
}

function handleDeleteLead(leadId) {
    if (confirm('Вы уверены, что хотите удалить эту заявку?')) {
        if (LeadStorage.deleteLead(leadId)) {
            updateStatistics();
            renderLeadsTable();
            showNotification('Заявка удалена', 'success');
        }
    }
}

function showLeadModal(leadId) {
    const lead = LeadStorage.getLeadById(leadId);
    if (!lead) return;

    const modal = document.getElementById('lead-modal');
    const modalBody = document.getElementById('modal-body');

    // Format date
    const date = new Date(lead.timestamp);
    const dateStr = date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Format city
    const cityMap = {
        'donetsk': 'Донецк',
        'makeevka': 'Макеевка',
        'both': 'Оба города'
    };
    const cityName = cityMap[lead.city] || lead.city;

    // Format format
    const formatName = lead.format ? lead.format.toUpperCase() + 'min' : 'Консультация';

    // Status
    const statusMap = {
        'new': 'Новая',
        'contacted': 'Обработана',
        'closed': 'Закрыта'
    };
    const statusName = statusMap[lead.status] || lead.status;

    modalBody.innerHTML = `
        <div class="detail-row">
            <div class="detail-label">ID заявки</div>
            <div class="detail-value">${lead.id}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Дата и время</div>
            <div class="detail-value">${dateStr}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Имя клиента</div>
            <div class="detail-value"><strong>${lead.name}</strong></div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Телефон</div>
            <div class="detail-value"><a href="tel:${lead.phone}">${lead.phone}</a></div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Город</div>
            <div class="detail-value">${cityName}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Адресные программы</div>
            <div class="detail-value">${_formatPrograms(lead)}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Формат</div>
            <div class="detail-value">${formatName}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Статус</div>
            <div class="detail-value"><span class="status-badge ${lead.status}">${statusName}</span></div>
        </div>
        ${lead.comment ? `
        <div class="detail-row">
            <div class="detail-label">Комментарий</div>
            <div class="detail-comment">${lead.comment}</div>
        </div>
        ` : ''}
    `;

    modal.style.display = 'flex';
}

function hideLeadModal() {
    const modal = document.getElementById('lead-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Make globally accessible
window.hideLeadModal = hideLeadModal;

function showNotification(message, type = 'success') {
    console.log(`[${type}] ${message}`);
}

// Helper: format address programs for display
function _formatPrograms(lead) {
    const dp = parseInt(lead.donetsk_programs) || 0;
    const mp = parseInt(lead.makeevka_programs) || 0;
    if (dp === 0 && mp === 0) return '—';
    let parts = [];
    if (dp > 0) parts.push(`Дн: ${dp}`);
    if (mp > 0) parts.push(`Мк: ${mp}`);
    return parts.join(', ') + ` (${(dp + mp) * 100} лифт.)`;
}

// Export to CSV
function handleExportCSV() {
    const result = LeadStorage.exportToCSV();
    if (result) {
        showNotification('Данные экспортированы в CSV', 'success');
    } else {
        alert('Нет данных для экспорта');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    // Authentication disabled: open dashboard directly
    showDashboard();

    // Login form (may not exist if login is disabled)
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            login();
            showDashboard();
        });
    }

    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            logout();
        });
    }

    // Search input
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', function () {
        currentFilter.search = this.value;
        renderLeadsTable();
    });

    // Status filter
    const statusFilter = document.getElementById('filter-status');
    statusFilter.addEventListener('change', function () {
        currentFilter.status = this.value;
        renderLeadsTable();
    });

    // City filter
    const cityFilter = document.getElementById('filter-city');
    cityFilter.addEventListener('change', function () {
        currentFilter.city = this.value;
        renderLeadsTable();
    });

    // Export CSV button
    const exportBtn = document.getElementById('export-csv-btn');
    exportBtn.addEventListener('click', handleExportCSV);

    // Modal close button
    const modalCloseBtn = document.getElementById('modal-close-btn');
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', hideLeadModal);
    }

    // Close modal on background click
    const modal = document.getElementById('lead-modal');
    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                hideLeadModal();
            }
        });
    }
});
