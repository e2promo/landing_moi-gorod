// Address data for Donetsk and Makeevka
// Donetsk addresses imported from AP_Kyev.xlsx
// manualReview/reviewReason mark rows for manual verification

const addressData = {
    donetsk: [
        { id: 1, address: 'ул. Артема, д. 102 б', coords: [48.019132, 37.799966], lifts: 2, resolvedAddress: 'Россия, Донецк, улица Артёма, 102Б' },
        { id: 2, address: 'ул. Артема, д. 102', coords: [48.019060, 37.800901], lifts: 2, resolvedAddress: 'Россия, Донецк, улица Артёма, 102' },
        { id: 3, address: 'ул. Артема, д. 116 а', coords: [48.028449, 37.790848], lifts: 4, resolvedAddress: 'Россия, Донецк, улица Артёма, 116А' },
        { id: 4, address: 'ул. Артема, д. 118 а', coords: [48.029569, 37.789456], lifts: 4, resolvedAddress: 'Россия, Донецк, улица Артёма, 118А' },
        { id: 5, address: 'ул. Артема, д. 132', coords: [48.031980, 37.787013], lifts: 4, resolvedAddress: 'Россия, Донецк, улица Артёма, 132' },
        { id: 6, address: 'ул. Артема, д. 134', coords: [48.032359, 37.786492], lifts: 2, resolvedAddress: 'Россия, Донецк, улица Артёма, 134' },
        { id: 7, address: 'ул. Артема, д. 144 а', coords: [48.035052, 37.782584], lifts: 2, resolvedAddress: 'Россия, Донецк, улица Артёма, 144А' },
        { id: 8, address: 'ул. Артема, д. 147 а', coords: [48.021784, 37.800451], lifts: 1, resolvedAddress: 'Россия, Донецк, улица Артёма, 147А' },
        { id: 9, address: 'ул. Артема, д. 147 б', coords: [48.022302, 37.800029], lifts: 2, resolvedAddress: 'Россия, Донецк, улица Артёма, 147Б' },
        { id: 10, address: 'ул. Артема, д. 147 в', coords: [48.022826, 37.799607], lifts: 1, resolvedAddress: 'Россия, Донецк, улица Артёма, 147В' },
        { id: 11, address: 'ул. Артема, д. 147 г', coords: [48.023218, 37.799284], lifts: 2, resolvedAddress: 'Россия, Донецк, улица Артёма, 147Г' },
        { id: 12, address: 'ул. Артема, д. 151а', coords: [48.024453, 37.798673], lifts: 4, resolvedAddress: 'Россия, Донецк, улица Артёма, 151А' },
        { id: 13, address: 'ул. Артема, д. 181 а', coords: [48.039468, 37.771130], lifts: 3, resolvedAddress: 'Россия, Донецк, улица Артёма, 181А' },
        { id: 14, address: 'ул. Артема, д. 181 б', coords: [48.038938, 37.771840], lifts: 5, resolvedAddress: 'Россия, Донецк, улица Артёма, 181Б' },
        { id: 15, address: 'ул. Артема, д. 185 а', coords: [48.039065, 37.770421], lifts: 5, resolvedAddress: 'Россия, Донецк, улица Артёма, 185А' },
        { id: 16, address: 'ул. Артема, д. 187', coords: [48.039926, 37.771705], lifts: 3, resolvedAddress: 'Россия, Донецк, улица Артёма, 187' },
        { id: 17, address: 'ул. Артема, д. 189', coords: [48.039426, 37.772406], lifts: 4, resolvedAddress: 'Россия, Донецк, улица Артёма, 189' },
        { id: 18, address: 'ул. Артема, д. 193 в', coords: [48.038739, 37.766827], lifts: 3, resolvedAddress: 'Россия, Донецк, улица Артёма, 193В' },
        { id: 19, address: 'ул. Челюскинцев, д. 212 а', coords: [48.026834, 37.799463], lifts: 1, resolvedAddress: 'Россия, Донецк, улица Челюскинцев, 212А' },
        { id: 20, address: 'ул. Челюскинцев, д. 212', coords: [48.026466, 37.799535], lifts: 1, resolvedAddress: 'Россия, Донецк, улица Челюскинцев, 212' },
        { id: 21, address: 'ул. Челюскинцев, д. 263', coords: [48.033167, 37.790588], lifts: 4, resolvedAddress: 'Россия, Донецк, улица Челюскинцев, 263' },
        { id: 22, address: 'ул. Челюскинцев, д. 265', coords: [48.033673, 37.790794], lifts: 2, resolvedAddress: 'Россия, Донецк, улица Челюскинцев, 265' },
        { id: 23, address: 'ул. Челюскинцев, д. 267/269', coords: [48.035034, 37.790561], lifts: 4, resolvedAddress: 'Россия, Донецк, улица Челюскинцев, 267' },
        { id: 24, address: 'ул. Челюскинцев, д. 271', coords: [48.034727, 37.790004], lifts: 2, resolvedAddress: 'Россия, Донецк, улица Челюскинцев, 271' },
        { id: 25, address: 'ул. Челюскинцев, д. 275', coords: [48.033389, 37.788585], lifts: 5, resolvedAddress: 'Россия, Донецк, улица Челюскинцев, 275' },
        { id: 26, address: 'ул. Артема, д. 197 а', coords: [48.039896, 37.768651], lifts: 2, resolvedAddress: 'Россия, Донецк, улица Артёма, 197А' },
        { id: 27, address: 'ул. Артема, д. 197 б', coords: [48.039583, 37.768453], lifts: 2, resolvedAddress: 'Россия, Донецк, улица Артёма, 197Б' },
        { id: 28, address: 'ул. Артема, д. 197 г', coords: [48.039523, 37.767600], lifts: 3, resolvedAddress: 'Россия, Донецк, улица Артёма, 197Г' },
        { id: 29, address: 'пр. Титова, д. 8 а', coords: [48.022814, 37.803721], lifts: 1, resolvedAddress: 'Россия, Донецк, проспект Павших Коммунаров, 8А' },
        { id: 30, address: 'ул. Университетская, д. 56 а', coords: [48.017324, 37.798313], lifts: 1, resolvedAddress: 'Россия, Донецк, Университетская улица, 56А' },
        { id: 31, address: 'ул. Университетская, д. 94 а', coords: [48.026303, 37.789384], lifts: 3, resolvedAddress: 'Россия, Донецк, Университетская улица, 94А' },
        { id: 32, address: 'ул. Университетская, д. 116', coords: [48.033468, 37.781380], lifts: 4, resolvedAddress: 'Россия, Донецк, Университетская улица, 116' },
        { id: 33, address: 'ул. Университетская, д. 118', coords: [48.034335, 37.781111], lifts: 4, resolvedAddress: 'Россия, Донецк, Университетская улица, 118' },
        { id: 34, address: 'ул. Розы Люксембург, д. 103а', coords: [48.024008, 37.787327], lifts: 3, resolvedAddress: 'Россия, Донецк, улица Розы Люксембург, 103А' },
        { id: 35, address: 'пр. Киевский, д. 2 а', coords: [48.038197, 37.778748], lifts: 2, resolvedAddress: 'Россия, Донецк, Киевский проспект, 2А' }
    ],
    makeevka: [
        { id: 101, address: 'ул. Ленина, 45', coords: [48.042776, 37.963828], lifts: 2, resolvedAddress: 'Россия, Макеевка, улица Ленина, 45/31' },
        { id: 102, address: 'пр. Ленинский, 78', coords: [48.100917, 37.948952], lifts: 3, resolvedAddress: 'Россия, Макеевка, переулок Макеевка-Пассажирская', manualReview: true, reviewReason: 'низкая уверенность геокодера' },
        { id: 103, address: 'ул. Свердлова, 12', coords: [48.029847, 37.968293], lifts: 2, resolvedAddress: 'Россия, Макеевка, улица Свердлова, 12' },
        { id: 104, address: 'бул. Маяковского, 156', coords: [48.040932, 37.924931], lifts: 4, resolvedAddress: 'Россия, Макеевка, Кировский район, улица Маяковского', manualReview: true, reviewReason: 'низкая уверенность геокодера' },
        { id: 105, address: 'ул. Горького, 23', coords: [48.063338, 37.985316], lifts: 2, resolvedAddress: 'Россия, Макеевка, Центрально-Городской район, улица Горького, 23' },
        { id: 106, address: 'пр. Мира, 67', coords: [48.031257, 37.990858], lifts: 3, resolvedAddress: 'Россия, Макеевка, Горняцкий район, улица Мира, 66', manualReview: true, reviewReason: 'подтверждена улица, номер дома требует проверки' },
        { id: 107, address: 'ул. Советская, 34', coords: [48.090710, 38.022165], lifts: 2, resolvedAddress: 'Россия, Макеевка, Советский район, Советская улица, 34' },
        { id: 108, address: 'ул. Кирова, 91', coords: [48.074007, 38.083025], lifts: 5, resolvedAddress: 'Россия, Макеевка, улица Кирова, 91' },
        { id: 109, address: 'пр. Победы, 12', coords: [48.042667, 37.875874], lifts: 2, resolvedAddress: 'Россия, Макеевка, Червоногвардейский район, улица Победы, 12' },
        { id: 110, address: 'ул. Комсомольская, 45', coords: [48.073730, 37.958708], lifts: 3, resolvedAddress: 'Россия, Макеевка, Кировский район, Комсомольская улица, 36', manualReview: true, reviewReason: 'подтверждена улица, номер дома требует проверки' },
        { id: 111, address: 'ул. Пушкина, 78', coords: [48.014497, 37.998458], lifts: 2, resolvedAddress: 'Россия, Макеевка, улица Пушкина', manualReview: true, reviewReason: 'низкая уверенность геокодера' },
        { id: 112, address: 'бул. Шевченко, 23', coords: [48.045745, 37.962256], lifts: 4, resolvedAddress: 'Россия, Макеевка, Центрально-Городской район, улица Шевченко, 23' },
        { id: 113, address: 'ул. Артёма, 156', coords: [48.056099, 37.970997], lifts: 2, resolvedAddress: 'Россия, Макеевка, Центрально-Городской район, улица Артёма, 166', manualReview: true, reviewReason: 'подтверждена улица, номер дома требует проверки' },
        { id: 114, address: 'пр. Гагарина, 67', coords: [48.081164, 37.896194], lifts: 3, resolvedAddress: 'Россия, Макеевка, улица Гагарина, 67' },
        { id: 115, address: 'ул. Октябрьская, 34', coords: [48.081050, 38.046769], lifts: 2, resolvedAddress: 'Россия, Макеевка, Советский район, Октябрьская улица, 35А', manualReview: true, reviewReason: 'подтверждена улица, номер дома требует проверки' },
        { id: 116, address: 'ул. Театральная, 91', coords: [48.047667, 37.974743], lifts: 3, resolvedAddress: 'Россия, Макеевка, Центрально-Городской район, Театральная улица, 89', manualReview: true, reviewReason: 'подтверждена улица, номер дома требует проверки' },
        { id: 117, address: 'пр. Космонавтов, 12', coords: [48.100917, 37.948952], lifts: 2, resolvedAddress: 'Россия, Макеевка, переулок Макеевка-Пассажирская', manualReview: true, reviewReason: 'низкая уверенность геокодера' },
        { id: 118, address: 'ул. Челюскинцев, 45', coords: [48.061748, 37.977725], lifts: 4, resolvedAddress: 'Россия, Макеевка, Центрально-Городской район, улица Челюскинцев', manualReview: true, reviewReason: 'низкая уверенность геокодера' },
        { id: 119, address: 'ул. Набережная, 78', coords: [48.069166, 37.978066], lifts: 2, resolvedAddress: 'Россия, Макеевка, Центрально-Городской район, Набережная улица', manualReview: true, reviewReason: 'низкая уверенность геокодера' },
        { id: 120, address: 'бул. Донецкий, 23', coords: [48.100917, 37.948952], lifts: 5, resolvedAddress: 'Россия, Макеевка, переулок Макеевка-Пассажирская', manualReview: true, reviewReason: 'низкая уверенность геокодера' },
        { id: 121, address: 'ул. Куйбышева, 156', coords: [48.052805, 37.967349], lifts: 2, resolvedAddress: 'Россия, Макеевка, Центрально-Городской район, улица Куйбышева', manualReview: true, reviewReason: 'низкая уверенность геокодера' },
        { id: 122, address: 'пр. Ильича, 67', coords: [48.100917, 37.948952], lifts: 3, resolvedAddress: 'Россия, Макеевка, переулок Макеевка-Пассажирская', manualReview: true, reviewReason: 'низкая уверенность геокодера' },
        { id: 123, address: 'ул. Постышева, 34', coords: [48.100917, 37.948952], lifts: 2, resolvedAddress: 'Россия, Макеевка, переулок Макеевка-Пассажирская', manualReview: true, reviewReason: 'низкая уверенность геокодера' },
        { id: 124, address: 'ул. Университетская, 91', coords: [48.027647, 37.985971], lifts: 4, resolvedAddress: 'Россия, Макеевка, Университетская улица', manualReview: true, reviewReason: 'низкая уверенность геокодера' },
        { id: 125, address: 'пр. Панфилова, 12', coords: [48.100917, 37.948952], lifts: 2, resolvedAddress: 'Россия, Макеевка, переулок Макеевка-Пассажирская', manualReview: true, reviewReason: 'низкая уверенность геокодера' },
        { id: 126, address: 'ул. Щорса, 45', coords: [48.081014, 38.028561], lifts: 3, resolvedAddress: 'Россия, Макеевка, посёлок имени Кирова, улица Щорса, 45' },
        { id: 127, address: 'бул. Привокзальный, 78', coords: [48.100917, 37.948952], lifts: 2, resolvedAddress: 'Россия, Макеевка, переулок Макеевка-Пассажирская', manualReview: true, reviewReason: 'низкая уверенность геокодера' }
    ]
};

// Address program configuration
const addressPrograms = {
    donetsk: {
        count: 100,
        // First 35 addresses from the list above represent the program
        addresses: addressData.donetsk.slice(0, 35)
    },
    makeevka: {
        count: 81,
        // First 27 addresses from the list above represent the program
        addresses: addressData.makeevka.slice(0, 27)
    }
};
