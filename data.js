// Sample catalogue for the Brismart prototype. Prices are illustrative only.
const CATEGORIES = [
  { id: "rice", name: "Rice & Grains", bn: "চাল ও শস্য", icon: "🍚", color: "#f3ead3" },
  { id: "spices", name: "Spices & Masala", bn: "মশলা", icon: "🌶️", color: "#f8dcd2" },
  { id: "lentils", name: "Lentils & Flour", bn: "ডাল ও আটা", icon: "🫘", color: "#f1e2c4" },
  { id: "fish", name: "Frozen Fish & Meat", bn: "মাছ ও মাংস", icon: "🐟", color: "#d7e8f0" },
  { id: "veg", name: "Fresh & Frozen Veg", bn: "সবজি", icon: "🥬", color: "#dcebd3" },
  { id: "snacks", name: "Snacks & Biscuits", bn: "নাস্তা", icon: "🍪", color: "#f5e6cf" },
  { id: "sweets", name: "Sweets & Desserts", bn: "মিষ্টি", icon: "🍮", color: "#f6dbe4" },
  { id: "pickles", name: "Pickles & Sauces", bn: "আচার", icon: "🫙", color: "#efe0c9" },
  { id: "drinks", name: "Tea & Drinks", bn: "চা ও পানীয়", icon: "🫖", color: "#e5dccf" },
  { id: "hot", name: "Hot Food & Takeaway", bn: "গরম খাবার", icon: "🍟", color: "#fbe1c6" },
  { id: "home", name: "Household & Personal", bn: "গৃহস্থালি", icon: "🧴", color: "#e1e4ec" },
];

const PRODUCTS = [
  // Rice & Grains
  { id: 1, cat: "rice", name: "Chinigura Aromatic Rice", size: "5 kg", price: 24.99, was: 28.99, icon: "🍚", desc: "Small-grain fragrant rice from Bangladesh, ideal for polao and payesh." },
  { id: 2, cat: "rice", name: "Miniket Rice", size: "10 kg", price: 32.0, icon: "🍚", desc: "Everyday Bangladeshi white rice that cooks soft and separate." },
  { id: 3, cat: "rice", name: "Basmati Rice Extra Long", size: "5 kg", price: 21.5, icon: "🍚", desc: "Aged long-grain basmati for biryani and pulao." },
  { id: 4, cat: "rice", name: "Flattened Rice (Chira)", size: "500 g", price: 3.49, icon: "🥣", desc: "Thick poha/chira for breakfast and snacks." },
  { id: 5, cat: "rice", name: "Puffed Rice (Muri)", size: "500 g", price: 3.99, icon: "🥣", desc: "Crunchy muri — the base for jhal muri." },

  // Spices
  { id: 10, cat: "spices", name: "Turmeric Powder", size: "400 g", price: 5.49, icon: "🟡", desc: "Pure ground turmeric (holud)." },
  { id: 11, cat: "spices", name: "Chilli Powder Hot", size: "400 g", price: 5.99, icon: "🌶️", desc: "Bright red ground chilli (morich)." },
  { id: 12, cat: "spices", name: "Panch Phoron", size: "100 g", price: 2.99, icon: "🫙", desc: "Bengali five-spice blend for tarka." },
  { id: 13, cat: "spices", name: "Beef Curry Masala", size: "200 g", price: 3.79, was: 4.49, icon: "🥘", desc: "Ready blend for rich Bangladeshi-style beef curry." },
  { id: 14, cat: "spices", name: "Biryani Masala", size: "100 g", price: 2.99, icon: "🥘", desc: "Aromatic blend for kacchi and chicken biryani." },
  { id: 15, cat: "spices", name: "Cumin Seeds (Jeera)", size: "200 g", price: 4.29, icon: "🌿", desc: "Whole cumin seeds." },

  // Lentils & Flour
  { id: 20, cat: "lentils", name: "Red Lentils (Masoor Dal)", size: "2 kg", price: 7.99, icon: "🫘", desc: "Split red lentils for everyday dal." },
  { id: 21, cat: "lentils", name: "Moong Dal", size: "1 kg", price: 6.49, icon: "🫘", desc: "Split yellow mung beans." },
  { id: 22, cat: "lentils", name: "Chickpeas (Chola)", size: "1 kg", price: 4.99, icon: "🫘", desc: "Dried chickpeas for chola bhuna — an iftar favourite." },
  { id: 23, cat: "lentils", name: "Atta Wholemeal Flour", size: "10 kg", price: 18.99, was: 21.99, icon: "🌾", desc: "Chakki atta for roti and paratha." },
  { id: 24, cat: "lentils", name: "Besan (Gram Flour)", size: "1 kg", price: 5.49, icon: "🌾", desc: "For piyaju, beguni and pakora." },

  // Fish & Meat
  { id: 30, cat: "fish", name: "Hilsa Fish (Ilish) Whole", size: "approx. 1 kg", price: 34.99, icon: "🐟", desc: "Frozen Padma ilish — the national fish of Bangladesh." },
  { id: 31, cat: "fish", name: "Rui Fish Steaks", size: "1 kg", price: 16.99, icon: "🐟", desc: "Cleaned, cut rohu steaks, frozen." },
  { id: 32, cat: "fish", name: "Pabda Fish", size: "500 g", price: 12.49, icon: "🐟", desc: "Small catfish, frozen, great for jhol." },
  { id: 33, cat: "fish", name: "Dried Shrimp (Shutki)", size: "200 g", price: 8.99, icon: "🦐", desc: "Sun-dried shrimp for bhorta." },
  { id: 34, cat: "fish", name: "Halal Goat Curry Cut", size: "1 kg", price: 22.99, icon: "🍖", desc: "Bone-in goat, frozen, halal certified." },

  // Veg
  { id: 40, cat: "veg", name: "Frozen Kochu Shak", size: "400 g", price: 4.99, icon: "🥬", desc: "Taro leaves, cleaned and chopped." },
  { id: 41, cat: "veg", name: "Frozen Lau (Bottle Gourd)", size: "500 g", price: 4.49, icon: "🥒", desc: "Diced bottle gourd." },
  { id: 42, cat: "veg", name: "Green Chillies", size: "200 g", price: 2.99, icon: "🌶️", desc: "Fresh hot green chillies." },
  { id: 43, cat: "veg", name: "Coriander Bunch", size: "each", price: 1.99, icon: "🌿", desc: "Fresh dhonia pata." },

  // Snacks
  { id: 50, cat: "snacks", name: "Chanachur Hot Mix", size: "350 g", price: 4.49, icon: "🥜", desc: "Classic spicy Bangladeshi snack mix." },
  { id: 51, cat: "snacks", name: "Dry Cake Biscuits", size: "300 g", price: 3.99, icon: "🍪", desc: "Crisp toast biscuits, perfect with cha." },
  { id: 52, cat: "snacks", name: "Pran Potato Crackers", size: "100 g", price: 1.99, was: 2.49, icon: "🥔", desc: "Crunchy potato crackers." },
  { id: 53, cat: "snacks", name: "Nimki", size: "200 g", price: 3.49, icon: "🥨", desc: "Flaky, salty fried pastry bites." },

  // Sweets
  { id: 60, cat: "sweets", name: "Rasgulla Tin", size: "1 kg", price: 7.99, icon: "⚪", desc: "Soft cheese balls in light syrup." },
  { id: 61, cat: "sweets", name: "Gulab Jamun Tin", size: "1 kg", price: 7.99, icon: "🟤", desc: "Fried milk dumplings in rose syrup." },
  { id: 62, cat: "sweets", name: "Chomchom (Frozen)", size: "500 g", price: 11.99, icon: "🍬", desc: "Traditional Bangladeshi sweet from Tangail." },
  { id: 63, cat: "sweets", name: "Shemai Vermicelli", size: "200 g", price: 2.49, icon: "🍜", desc: "Roasted vermicelli for Eid shemai." },
  { id: 64, cat: "sweets", name: "Laccha Shemai", size: "400 g", price: 4.99, icon: "🍜", desc: "Fried fine vermicelli, ready to cook." },

  // Pickles
  { id: 70, cat: "pickles", name: "Mango Achar", size: "400 g", price: 4.99, icon: "🥭", desc: "Sweet and spicy mango pickle." },
  { id: 71, cat: "pickles", name: "Olive (Jolpai) Achar", size: "400 g", price: 5.49, icon: "🫒", desc: "Tangy Bangladeshi olive pickle." },
  { id: 72, cat: "pickles", name: "Mustard Oil", size: "1 L", price: 6.99, icon: "🛢️", desc: "Pungent kacchi ghani mustard oil (external use label)." },
  { id: 73, cat: "pickles", name: "Kasundi Mustard Sauce", size: "300 g", price: 3.99, icon: "🫙", desc: "Bengali fermented mustard dip." },

  // Drinks
  { id: 80, cat: "drinks", name: "Ispahani Mirzapore Tea", size: "400 g", price: 7.49, icon: "🫖", desc: "Strong Bangladeshi black tea." },
  { id: 81, cat: "drinks", name: "Mango Juice", size: "1 L", price: 2.99, icon: "🧃", desc: "Sweet mango fruit drink." },
  { id: 82, cat: "drinks", name: "Rooh Afza", size: "750 ml", price: 6.49, icon: "🍹", desc: "Rose syrup — a Ramadan staple." },
  { id: 83, cat: "drinks", name: "Mango Lassi", size: "500 ml", price: 3.49, icon: "🥛", desc: "Chilled yoghurt drink." },

  // Hot food
  { id: 90, cat: "hot", name: "Hot Chips", size: "large", price: 8.99, icon: "🍟", desc: "Freshly fried chips with your choice of sauce." },
  { id: 91, cat: "hot", name: "Hot Dog", size: "each", price: 5.5, icon: "🌭", desc: "Grilled sausage in a soft roll." },
  { id: 92, cat: "hot", name: "Chicken Biryani Box", size: "regular", price: 13.99, icon: "🍛", desc: "Fragrant biryani with egg and salad. Pick-up only." },
  { id: 93, cat: "hot", name: "Vegetable Singara (3 pcs)", size: "3 pcs", price: 4.5, icon: "🥟", desc: "Bengali-style samosa with spiced potato." },

  // Household
  { id: 100, cat: "home", name: "Coconut Hair Oil", size: "500 ml", price: 6.99, icon: "🥥", desc: "Pure coconut oil for hair." },
  { id: 101, cat: "home", name: "Wheel Washing Powder", size: "1 kg", price: 4.99, icon: "🧺", desc: "Laundry detergent powder." },
  { id: 102, cat: "home", name: "Meswak Toothpaste", size: "200 g", price: 3.99, icon: "🪥", desc: "Herbal toothpaste." },
];

// Products shown on the home page as weekly specials and staples
const FEATURED_IDS = [1, 30, 50, 70, 80, 63, 13, 92];
