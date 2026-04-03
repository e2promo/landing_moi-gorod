// Content Storage Management System
// Manages all editable content for the landing page

const ContentStorage = {
    STORAGE_KEY: 'moigorod_content',

    // Default content structure
    defaultContent: {
        header: {
            logoText: 'МОЙ ГОРОД',
            logoImage: null,
            phone: '+7 949 338 78 33',
            email: 'info@moigorod.ru'
        },

        siteBackground: {
            color: '#ffffff',
            image: null
        },

        hero: {
            title: 'Ваша реклама в каждом лифте города.',
            highlight: 'Минимум 2 контакта с клиентом ежедневно',
            subtitle: 'Размещение рекламы в лифтах Донецка и Макеевки от 11 370 ₽/мес.',
            description: 'Более 1000 рекламных плоскостей. Полный цикл: печать, монтаж, фотоотчет',
            heroImage: 'lift.png',
            stats: [
                { number: '1000+', label: 'рекламных плоскостей' },
                { number: '2×', label: 'контакта в день минимум' },
                { number: '100%', label: 'охват жильцов дома' }
            ]
        },

        whyWorks: {
            title: 'Почему реклама в лифтах работает',
            subtitle: 'Единственный рекламный канал с гарантированным вниманием аудитории',
            benefits: [
                {
                    icon: '👁️',
                    image: null,
                    title: 'Рекламу невозможно пропустить',
                    description: 'В отличие от интернет-рекламы, баннер в лифте нельзя закрыть, свернуть или пролистать. Человек находится в замкнутом пространстве 30-60 секунд и неизбежно видит ваше сообщение.'
                },
                {
                    icon: '🔄',
                    image: null,
                    title: 'Минимум 2 контакта ежедневно',
                    description: 'Каждый житель дома видит вашу рекламу минимум дважды в день: утром и вечером. За месяц — это 60+ контактов с одним человеком. Такая частота обеспечивает максимальное запоминание бренда.'
                },
                {
                    icon: '🎯',
                    image: null,
                    title: 'Большой охват по всему городу',
                    description: 'Более 1000 рекламных плоскостей в жилых домах Донецка и Макеевки. Ваше сообщение увидят тысячи потенциальных клиентов в разных районах города ежедневно.'
                },
                {
                    icon: '💰',
                    image: null,
                    title: 'Доступность для любого бизнеса',
                    description: 'Стоимость размещения от 11 370 ₽/мес — это в разы дешевле наружной рекламы и контекстной рекламы при сопоставимом охвате. Идеально для локального бизнеса с ограниченным бюджетом.'
                },
                {
                    icon: '📊',
                    image: null,
                    title: 'Высокая информативность',
                    description: 'У человека в лифте есть время внимательно изучить ваше предложение: прочитать текст, запомнить телефон, отсканировать QR-код. Это не мимолетный контакт — это полноценное знакомство с брендом.'
                },
                {
                    icon: '✨',
                    image: null,
                    title: 'Ненавязчивость формата',
                    description: 'Реклама в лифте не раздражает и не отвлекает от важных дел. Она органично вписывается в повседневную жизнь и воспринимается как полезная информация, а не агрессивный маркетинг.'
                }
            ]
        },

        advantages: {
            title: 'Преимущества работы с «МОЙ ГОРОД»',
            items: [
                {
                    number: '01',
                    title: 'Полный цикл под ключ',
                    description: 'Вы получаете готовое решение: мы печатаем макеты, монтируем их в лифтах и предоставляем фотоотчет. Вам не нужно ни о чем беспокоиться — просто предоставьте макет или мы поможем его создать.'
                },
                {
                    number: '02',
                    title: 'Страховка от вандализма',
                    description: 'В стоимость включена защита от повреждений. Если макет испортят — мы бесплатно заменим его в течение месяца размещения. Ваш бюджет защищен от непредвиденных расходов.'
                },
                {
                    number: '03',
                    title: 'Адресные программы',
                    description: 'Мы размещаем рекламу по готовым адресным программам: 100 лифтов в Донецке или 81 лифт в Макеевке. Это гарантирует равномерное покрытие города и максимальный охват вашей целевой аудитории.'
                },
                {
                    number: '04',
                    title: 'Фотоотчет по каждому адресу',
                    description: 'После монтажа вы получите фотографии размещенных макетов с указанием адресов. Полная прозрачность и контроль за выполнением работ — вы видите, где именно работает ваша реклама.'
                },
                {
                    number: '05',
                    title: 'Компактные форматы',
                    description: 'Размеры наших макетов меньше стандартных А5, А4 и А3, что делает их более удобными для размещения и восприятия в ограниченном пространстве лифта. При этом они остаются отлично читаемыми.'
                },
                {
                    number: '06',
                    title: 'Опыт и надежность',
                    description: 'ООО «МОЙ ГОРОД» — это более 1000 активных рекламных плоскостей и сотни довольных клиентов. Мы знаем, как сделать вашу рекламную кампанию эффективной и окупаемой.'
                }
            ]
        },

        included: {
            title: 'Что входит в стоимость',
            subtitle: 'Вы платите один раз и получаете полный комплекс услуг',
            services: [
                {
                    icon: '🖨️',
                    image: null,
                    title: 'Профессиональная печать',
                    description: 'Высококачественная печать ваших макетов на долговечных материалах. Яркие цвета, четкое изображение, устойчивость к выцветанию. Вам не нужно искать типографию — мы все делаем сами.'
                },
                {
                    icon: '🔧',
                    image: null,
                    title: 'Монтаж и демонтаж',
                    description: 'Наша команда разместит макеты во всех лифтах согласно адресной программе и демонтирует их после окончания периода размещения. Никаких дополнительных хлопот для вас — мы работаем быстро и аккуратно.'
                },
                {
                    icon: '📸',
                    image: null,
                    title: 'Детальный фотоотчет',
                    description: 'После размещения вы получите фотографии каждого размещенного макета с указанием точного адреса. Это ваша гарантия того, что реклама действительно работает в указанных локациях.'
                },
                {
                    icon: '🛡️',
                    image: null,
                    title: 'Страховка от вандализма',
                    description: 'Если макет будет поврежден или испорчен в течение месяца размещения, мы бесплатно заменим его. Ваш рекламный бюджет защищен от непредвиденных ситуаций — вы платите только за результат.'
                },
                {
                    icon: '📅',
                    image: null,
                    title: 'Размещение на 1 месяц',
                    description: 'Полный календарный месяц вашей рекламы в лифтах. Это минимум 60 контактов с каждым жильцом дома. Достаточно времени, чтобы ваш бренд запомнили и обратились за услугой.'
                },
                {
                    icon: '🎯',
                    image: null,
                    title: 'Адресная программа',
                    description: 'Мы размещаем рекламу по проверенным адресным программам, обеспечивающим равномерное покрытие города. Вы получаете максимальный охват целевой аудитории без «мертвых зон».'
                }
            ]
        },

        footer: {
            companyName: 'ООО «МОЙ ГОРОД»',
            description: 'Реклама в лифтах Донецка и Макеевки',
            phone: '+7 949 338 78 33',
            email: 'info@moigorod.ru',
            address: 'г. Донецк, ДНР',
            copyright: '© 2026 ООО «МОЙ ГОРОД». Все права защищены.'
        }
    },

    // Get content from storage or return default
    getContent() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
            return this.defaultContent;
        } catch (error) {
            console.error('Error loading content:', error);
            return this.defaultContent;
        }
    },

    // Save content to storage
    saveContent(content) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(content));
            return true;
        } catch (error) {
            console.error('Error saving content:', error);
            if (error.name === 'QuotaExceededError') {
                alert('Превышен лимит хранилища! Удалите некоторые изображения.');
            }
            return false;
        }
    },

    // Reset to default content
    resetToDefault() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.defaultContent));
            return true;
        } catch (error) {
            console.error('Error resetting content:', error);
            return false;
        }
    },

    // Get storage usage info
    getStorageInfo() {
        try {
            const content = JSON.stringify(this.getContent());
            const sizeInBytes = new Blob([content]).size;
            const sizeInKB = (sizeInBytes / 1024).toFixed(2);
            const sizeInMB = (sizeInBytes / 1024 / 1024).toFixed(2);

            return {
                bytes: sizeInBytes,
                kb: sizeInKB,
                mb: sizeInMB,
                percentage: ((sizeInBytes / (5 * 1024 * 1024)) * 100).toFixed(1)
            };
        } catch (error) {
            console.error('Error getting storage info:', error);
            return null;
        }
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.ContentStorage = ContentStorage;
}
