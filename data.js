// Categories, the two shop views and curated home pages.
// Products come from products.js (generated from the Hutbazar catalogue).

const CATEGORIES = [
  { id: "essentials", en: "Everyday Essentials", bn: "নিত্যপ্রয়োজনীয়", icon: "🥛", color: "#e8f1f8",
    au: "Milk, bread, eggs and the basics — open till midnight.", bdText: "দুধ, রুটি, ডিম আর দৈনন্দিন জিনিস।" },
  { id: "hot", en: "Hot Food", bn: "গরম খাবার", icon: "🍟", color: "#fbe1c6",
    au: "Hot chips, hot dogs and biryani boxes — order ahead and collect.", bdText: "গরম গরম চিপস, হট ডগ আর বিরিয়ানি।" },
  { id: "drinks", en: "Drinks & Tea", bn: "চা ও পানীয়", icon: "🥤", color: "#e5dccf",
    au: "Cold soft drinks, mango juice and strong Bangladeshi tea.", bdText: "মিরজাপুর চা, প্রাণ জুস আর কোল্ড ড্রিংক।" },
  { id: "snacks", en: "Snacks & Biscuits", bn: "চানাচুর ও বিস্কুট", icon: "🍪", color: "#f5e6cf",
    au: "Crunchy chanachur (spicy snack mix), toast biscuits and crackers.", bdText: "চানাচুর, মুড়ি, টোস্ট আর বিস্কুট।" },
  { id: "frozen", en: "Frozen Snacks & Paratha", bn: "ফ্রোজেন নাস্তা ও পরোটা", icon: "🥟", color: "#e9e2f3",
    au: "Ready-to-heat samosas, spring rolls and flaky paratha flatbread.", bdText: "সমুচা, সিঙ্গারা, ডাল পুরি আর পরোটা।" },
  { id: "curry", en: "Curry & BBQ Mixes", bn: "রেডি মিক্স মসলা", icon: "🍛", color: "#f8dcd2",
    au: "One packet, one great curry — butter chicken, korma, biryani and BBQ.", bdText: "রাঁধুনী, প্রাণ ও শান — সব রেডি মিক্স মসলা।" },
  { id: "meat", en: "Halal Meat", bn: "হালাল মাংস", icon: "🍗", color: "#f6dbd6",
    au: "Halal chicken, beef, goat and duck, cut for curries.", bdText: "হাতে জবাই করা মুরগি, গরু, খাসি ও হাঁস।" },
  { id: "sweets", en: "Sweets & Desserts", bn: "মিষ্টি ও দই", icon: "🍮", color: "#f6dbe4",
    au: "Gulab jamun, rosh malai and sweet yoghurt (misti doi).", bdText: "বগুড়ার দই, চমচম, রসমালাই, গুড়।" },
  { id: "rice", en: "Rice, Dal & Flour", bn: "চাল, ডাল ও আটা", icon: "🍚", color: "#f3ead3",
    au: "Basmati and fragrant rice, lentils and flours.", bdText: "কালিজিরা, চিনিগুড়া, মসুর ডাল, চিড়া, সুজি।" },
  { id: "spices", en: "Spices", bn: "মসলা", icon: "🌶️", color: "#fbe3d4",
    au: "Ground and whole spices — cumin, turmeric, chilli and more.", bdText: "গুঁড়া ও আস্ত মসলা।" },
  { id: "pickles", en: "Sauces & Pickles", bn: "আচার ও সস", icon: "🥭", color: "#efe0c9",
    au: "Mango pickle, chilli sauces and kasundi mustard dip.", bdText: "আমের আচার, বরই, জলপাই, কাসুন্দি।" },
  { id: "oil", en: "Oil & Ghee", bn: "তেল ও ঘি", icon: "🫒", color: "#f1ecc8",
    au: "Mustard oil and ghee (clarified butter).", bdText: "খাঁটি সরিষার তেল ও ঘি।" },
  { id: "pantry", en: "Cooking Essentials", bn: "রান্নার উপকরণ", icon: "🧂", color: "#e8e6df",
    au: "Rose water, tamarind, fried onions and other pantry helpers.", bdText: "গোলাপজল, কেওড়া, বেরেস্তা, তেঁতুল।" },
  { id: "fish", en: "Bangladeshi Fish", bn: "মাছ বাজার", icon: "🐟", color: "#d7e8f0",
    au: "Frozen river fish from Bangladesh — try pabda or rui in a light curry.", bdText: "রুই, পাবদা, শিং, বোয়াল, ইলিশের ডিম।" },
  { id: "veg", en: "Deshi Vegetables", bn: "দেশি সবজি", icon: "🥬", color: "#dcebd3",
    au: "Bangladeshi greens and vegetables, fresh and frozen.", bdText: "লাল শাক, কচু শাক, পটল, কাকরোল, করলা।" },
  { id: "shutki", en: "Dried Fish & Bhorta", bn: "শুঁটকি ও ভর্তা", icon: "🦐", color: "#ece2d6",
    au: "Traditional dried fish and ready-made mashes (bhorta).", bdText: "চেপা, চিংড়ি, লইট্টা শুঁটকি আর ভর্তা।" },
  { id: "pitha", en: "Pitha & Festive", bn: "পিঠা পার্বণ", icon: "🎉", color: "#fde8cf",
    au: "Rice cakes (pitha), date-palm jaggery and festival essentials.", bdText: "চিতই, পুলি পিঠা, খেজুরের গুড়, পিঠার খোলা।" },
];

// Items not on Hutbazar yet: in-store hot food and whole hilsa sold by weight (placeholder prices).
// One JSON object per line — tools/make_seed.py reads these into supabase/seed.sql.
const EXTRA_PRODUCTS = [
  {"id": 9001, "cat": "hot", "name": "Hot Chips (Large)", "size": "large", "price": 8.99, "icon": "🍟", "note": "Freshly fried, with your choice of sauce."},
  {"id": 9002, "cat": "hot", "name": "Hot Dog", "size": "each", "price": 5.5, "icon": "🌭", "note": "Grilled sausage in a soft roll."},
  {"id": 9003, "cat": "hot", "name": "Chicken Biryani Box", "bn": "চিকেন বিরিয়ানি", "size": "regular", "price": 13.99, "icon": "🍛", "note": "Fragrant biryani with egg and salad."},
  {"id": 9004, "cat": "hot", "name": "Fuchka Plate (8 pcs)", "bn": "ফুচকা", "size": "8 pcs", "price": 9.99, "icon": "🥙", "note": "Crisp shells with spiced chickpeas and tamarind water."},
  {"id": 9010, "cat": "fish", "name": "Hilsa Fish (Ilish) Whole", "bn": "ইলিশ মাছ", "size": "whole fish, 0.8–1.5 kg", "price": 25, "max": 40, "unit": "kg", "icon": "🐟", "note": "Priced per kg — larger hilsa cost more per kg. We weigh your fish and confirm the final price before charging."},
];

// Replaced by the live catalogue when Supabase is configured (see app.js).
let PRODUCTS = [...HB_PRODUCTS, ...EXTRA_PRODUCTS];

const VIEWS = {
  au: {
    nav: ["essentials", "hot", "drinks", "snacks", "frozen", "curry", "meat", "sweets", "rice", "spices", "pickles", "oil", "pantry", "fish", "veg", "shutki", "pitha"],
    tiles: ["essentials", "hot", "drinks", "snacks", "frozen", "curry", "meat", "sweets", "rice", "spices", "pickles", "oil"],
    discover: ["fish", "veg", "shutki", "pitha"],
    hero: {
      kicker: "Woolloongabba · open 7 days till midnight",
      title: "Your local grocer on Ipswich Rd",
      text: "Milk, bread and cold drinks when you need them — plus halal meat, ready-to-heat samosas and easy curry kits.",
      cta: ["Shop essentials", "#/category/essentials"],
    },
    promos: [
      { cls: "gold", title: "🌙 Open late, every night", text: "Mon–Fri 6am to midnight, weekends from 7–8am.", href: "#/category/essentials" },
      { cls: "pink", title: "🍛 Curry night made easy", text: "Spice mix, basmati rice and paratha — all in one shop.", href: "#/category/curry" },
    ],
    sections: [
      { title: "Quick essentials", ids: [3200, 3214, 3086, 3219, 3142, 3201, 3202, 2896] },
      { title: "Curry night made easy", sub: "Everything for a home-cooked curry", ids: [3115, 3117, 3190, 3147, 2961, 3144, 3113, 3197] },
      { title: "Party & BBQ", ids: [3120, 3206, 3081, 3088, 3091, 3030, 2917, 2987] },
      { title: "Try something new", sub: "Customer favourites from Bangladesh", ids: [2978, 3185, 2868, 3051, 2983, 3016, 3028, 3134] },
    ],
    specials: [3200, 3214, 3081, 3030, 2961, 3115, 2868, 3051],
    services: [
      ["🌙", "Open till midnight", "7 days a week"],
      ["🚚", "Local delivery", "Free over $60 · inner Brisbane"],
      ["💸", "Western Union", "Send & collect money in store"],
      ["📦", "Amazon returns", "Drop off parcels · free parking"],
    ],
  },
  bd: {
    nav: ["fish", "meat", "rice", "spices", "curry", "veg", "shutki", "sweets", "pitha", "snacks", "pickles", "oil", "frozen", "pantry", "drinks", "essentials", "hot"],
    tiles: ["fish", "meat", "rice", "spices", "curry", "veg", "shutki", "sweets", "pitha", "snacks", "pickles", "oil", "frozen", "pantry", "drinks", "essentials"],
    discover: [],
    hero: {
      kicker: "স্বাগতম — Welcome",
      title: "দেশের স্বাদ, ব্রিসবেনে",
      text: "Deshi fish, shutki, pitha, misti doi and all your Radhuni & Pran favourites — delivered or ready for pick-up at Brismart.",
      cta: ["মাছ বাজার দেখুন", "#/category/fish"],
    },
    promos: [
      { cls: "gold", title: "⭐ এই সপ্তাহের অফার", text: "Special of the week — misti doi, rosh malai and more.", href: "#/specials" },
      { cls: "pink", title: "🎉 পিঠা পার্বণ", text: "Chitoi & puli pitha, khejur gur and pitha pans.", href: "#/category/pitha" },
    ],
    sections: [
      { title: "এই সপ্তাহের অফার", sub: "Special of the week", ids: [3200, 3151, 3108, 2868, 3213, 3107, 3052, 3051] },
      { title: "মাছ বাজার", sub: "Frozen deshi fish", ids: [9010, 2990, 2989, 3092, 2999, 3216, 2993, 3078] },
      { title: "পিঠা পার্বণ", sub: "Pitha season", ids: [3050, 3049, 3027, 3163, 3162, 3134, 3124, 2971] },
      { title: "শুঁটকি ও ভর্তা", sub: "Shutki & bhorta", ids: [3004, 3006, 3007, 3005, 3003, 3211, 3098, 3176] },
      { title: "রমজান ও ঈদ", sub: "Ramadan & Eid", ids: [2940, 3173, 2942, 3188, 3172, 2882, 3072, 2959] },
    ],
    specials: [3200, 3151, 3108, 2868, 3213, 3107, 3052, 3051],
    services: [
      ["🐟", "দেশি মাছ", "New frozen stock every week"],
      ["🕌", "হালাল মাংস", "Hand-slaughtered chicken & duck"],
      ["💸", "Western Union", "টাকা পাঠান ও তুলুন"],
      ["🏪", "Pick-up", "80 Ipswich Rd, Woolloongabba"],
    ],
  },
};

// UI text that differs between views
const TEXT = {
  au: {
    add: "Add to cart", cart: "Cart", search: "Search milk, samosa, butter chicken…",
    specials: "Specials", shopBy: "Shop by category", discover: "Discover Bangladeshi food",
    discoverText: "Brismart is Brisbane's Bangladeshi grocer. Curious? Start here.",
    switchHint: "Shopping for deshi groceries? Switch to the দেশি view.",
    seeAll: "See all", items: n => `${n} product${n === 1 ? "" : "s"}`,
  },
  bd: {
    add: "কার্টে যোগ করুন", cart: "কার্ট", search: "খুঁজুন: ইলিশ, শুঁটকি, দই, মসলা…",
    specials: "অফার", shopBy: "ক্যাটাগরি", discover: "",
    discoverText: "",
    switchHint: "Looking for everyday items? Switch to the Everyday view.",
    seeAll: "সব দেখুন", items: n => `${n}টি পণ্য`,
  },
};
