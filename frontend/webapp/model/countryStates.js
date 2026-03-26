sap.ui.define([], function () {
    "use strict";

    var COUNTRIES = [
        { code: "AU", name: "Australia" },
        { code: "AT", name: "Austria" },
        { code: "CA", name: "Canada" },
        { code: "FR", name: "France" },
        { code: "DE", name: "Germany" },
        { code: "IN", name: "India" },
        { code: "NL", name: "Netherlands" },
        { code: "NZ", name: "New Zealand" },
        { code: "PK", name: "Pakistan" },
        { code: "ZA", name: "South Africa" },
        { code: "CH", name: "Switzerland" },
        { code: "AE", name: "United Arab Emirates" },
        { code: "GB", name: "United Kingdom" },
        { code: "US", name: "United States" }
    ];

    var STATES = {
        AU: ["Australian Capital Territory","New South Wales","Northern Territory","Queensland","South Australia","Tasmania","Victoria","Western Australia"],
        AT: ["Burgenland","Carinthia","Lower Austria","Salzburg","Styria","Tyrol","Upper Austria","Vienna","Vorarlberg"],
        CA: ["Alberta","British Columbia","Manitoba","New Brunswick","Newfoundland and Labrador","Northwest Territories","Nova Scotia","Nunavut","Ontario","Prince Edward Island","Quebec","Saskatchewan","Yukon"],
        FR: ["Auvergne-Rhône-Alpes","Bourgogne-Franche-Comté","Bretagne","Centre-Val de Loire","Corse","Grand Est","Hauts-de-France","Île-de-France","Normandie","Nouvelle-Aquitaine","Occitanie","Pays de la Loire","Provence-Alpes-Côte d'Azur"],
        DE: ["Baden-Württemberg","Bavaria","Berlin","Brandenburg","Bremen","Hamburg","Hesse","Lower Saxony","Mecklenburg-Vorpommern","North Rhine-Westphalia","Rhineland-Palatinate","Saarland","Saxony","Saxony-Anhalt","Schleswig-Holstein","Thuringia"],
        IN: ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu and Kashmir","Ladakh","Puducherry"],
        NL: ["Drenthe","Flevoland","Friesland","Gelderland","Groningen","Limburg","North Brabant","North Holland","Overijssel","South Holland","Utrecht","Zeeland"],
        NZ: ["Auckland","Bay of Plenty","Canterbury","Gisborne","Hawke's Bay","Manawatu-Whanganui","Marlborough","Nelson","Northland","Otago","Southland","Taranaki","Tasman","Waikato","Wellington","West Coast"],
        PK: ["Azad Kashmir","Balochistan","Gilgit-Baltistan","Islamabad Capital Territory","Khyber Pakhtunkhwa","Punjab","Sindh"],
        ZA: ["Eastern Cape","Free State","Gauteng","KwaZulu-Natal","Limpopo","Mpumalanga","North West","Northern Cape","Western Cape"],
        CH: ["Aargau","Appenzell Ausserrhoden","Appenzell Innerrhoden","Basel-Landschaft","Basel-Stadt","Berne","Fribourg","Geneva","Glarus","Graubünden","Jura","Lucerne","Neuchâtel","Nidwalden","Obwalden","Schaffhausen","Schwyz","Solothurn","St. Gallen","Thurgau","Ticino","Uri","Valais","Vaud","Zug","Zürich"],
        AE: ["Abu Dhabi","Ajman","Dubai","Fujairah","Ras Al Khaimah","Sharjah","Umm Al Quwain"],
        GB: ["England","Northern Ireland","Scotland","Wales"],
        US: ["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming","District of Columbia"]
    };

    // Map browser locale to country code
    function detectCountryCode() {
        var lang = navigator.language || navigator.languages && navigator.languages[0] || "en-DE";
        var parts = lang.split("-");
        var code = parts.length > 1 ? parts[1].toUpperCase() : null;
        // Validate that code exists in our list
        if (code && STATES[code]) return code;
        // Fallback by language prefix
        var langMap = { de: "DE", fr: "FR", en: "GB", nl: "NL", it: "CH", ar: "AE" };
        return langMap[parts[0].toLowerCase()] || "DE";
    }

    return {
        getCountries: function () { return COUNTRIES; },
        getStates: function (countryCode) { return (STATES[countryCode] || []).map(function(s){ return { name: s }; }); },
        detectCountryCode: detectCountryCode
    };
});
