// Lead Storage Management System
// Uses localStorage for client-side data persistence

const LeadStorage = {
    STORAGE_KEY: 'moigorod_leads',

    // Generate unique ID
    generateId() {
        return 'lead_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    // Get all leads
    getAllLeads() {
        try {
            const leads = localStorage.getItem(this.STORAGE_KEY);
            return leads ? JSON.parse(leads) : [];
        } catch (error) {
            console.error('Error reading leads:', error);
            return [];
        }
    },

    // Save new lead
    saveLead(leadData) {
        try {
            const leads = this.getAllLeads();
            const newLead = {
                id: this.generateId(),
                timestamp: new Date().toISOString(),
                name: leadData.name || '',
                phone: leadData.phone || '',
                city: leadData.city || '',
                format: leadData.format || '',
                comment: leadData.comment || '',
                donetsk_programs: leadData.donetsk_programs || 0,
                makeevka_programs: leadData.makeevka_programs || 0,
                status: 'new',
                source: leadData.source || 'form'
            };

            leads.unshift(newLead);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(leads));
            return newLead;
        } catch (error) {
            console.error('Error saving lead:', error);
            return null;
        }
    },

    // Get lead by ID
    getLeadById(leadId) {
        const leads = this.getAllLeads();
        return leads.find(lead => lead.id === leadId);
    },

    // Update lead status
    updateLeadStatus(leadId, newStatus) {
        try {
            const leads = this.getAllLeads();
            const leadIndex = leads.findIndex(lead => lead.id === leadId);

            if (leadIndex !== -1) {
                leads[leadIndex].status = newStatus;
                leads[leadIndex].updatedAt = new Date().toISOString();
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(leads));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating lead status:', error);
            return false;
        }
    },

    // Delete lead
    deleteLead(leadId) {
        try {
            const leads = this.getAllLeads();
            const filteredLeads = leads.filter(lead => lead.id !== leadId);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredLeads));
            return true;
        } catch (error) {
            console.error('Error deleting lead:', error);
            return false;
        }
    },

    // Get leads by status
    getLeadsByStatus(status) {
        const leads = this.getAllLeads();
        return leads.filter(lead => lead.status === status);
    },

    // Get leads by city
    getLeadsByCity(city) {
        const leads = this.getAllLeads();
        return leads.filter(lead => lead.city === city);
    },

    // Search leads
    searchLeads(query) {
        const leads = this.getAllLeads();
        const lowerQuery = query.toLowerCase();
        return leads.filter(lead =>
            lead.name.toLowerCase().includes(lowerQuery) ||
            lead.phone.toLowerCase().includes(lowerQuery) ||
            lead.comment.toLowerCase().includes(lowerQuery)
        );
    },

    // Get statistics
    getStatistics() {
        const leads = this.getAllLeads();
        return {
            total: leads.length,
            new: leads.filter(l => l.status === 'new').length,
            contacted: leads.filter(l => l.status === 'contacted').length,
            closed: leads.filter(l => l.status === 'closed').length,
            byCity: {
                donetsk: leads.filter(l => l.city === 'donetsk').length,
                makeevka: leads.filter(l => l.city === 'makeevka').length,
                both: leads.filter(l => l.city === 'both').length
            },
            byFormat: {
                a5: leads.filter(l => l.format === 'a5').length,
                a4: leads.filter(l => l.format === 'a4').length,
                a3: leads.filter(l => l.format === 'a3').length,
                consultation: leads.filter(l => !l.format || l.format === '').length
            }
        };
    },

    // Export to CSV
    exportToCSV() {
        const leads = this.getAllLeads();
        if (leads.length === 0) {
            return null;
        }

        // CSV headers
        const headers = ['ID', 'Дата', 'Имя', 'Телефон', 'Город', 'Донецк пр.', 'Макеевка пр.', 'Формат', 'Статус', 'Комментарий'];

        // Convert leads to CSV rows
        const rows = leads.map(lead => {
            const date = new Date(lead.timestamp).toLocaleString('ru-RU');
            const city = lead.city === 'donetsk' ? 'Донецк' :
                lead.city === 'makeevka' ? 'Макеевка' :
                    lead.city === 'both' ? 'Оба города' : lead.city;
            const format = lead.format ? lead.format.toUpperCase() + 'min' : 'Консультация';
            const status = lead.status === 'new' ? 'Новая' :
                lead.status === 'contacted' ? 'Обработана' : 'Закрыта';
            const dp = lead.donetsk_programs || 0;
            const mp = lead.makeevka_programs || 0;

            return [
                lead.id,
                date,
                `"${lead.name}"`,
                lead.phone,
                city,
                dp,
                mp,
                format,
                status,
                `"${lead.comment.replace(/"/g, '""')}"`
            ].join(',');
        });

        // Combine headers and rows
        const csv = [headers.join(','), ...rows].join('\n');

        // Create download
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `leads_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        return true;
    },

    // Clear all leads (for testing)
    clearAllLeads() {
        localStorage.removeItem(this.STORAGE_KEY);
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.LeadStorage = LeadStorage;
}
