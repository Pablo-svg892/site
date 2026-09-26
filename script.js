/*
  Bonus Basket - demo price comparison logic.
  Prices and stores below are mock data standing in for a real
  store-price API / database, so the app has something real to
  compare and calculate with.
*/

const STORES = [
  { name: "Shoprite Benoni", distance: "1.2 km away" },
  { name: "Pick n Pay Northmead", distance: "2.4 km away" },
  { name: "Checkers Lakeside Mall", distance: "3.1 km away" },
];

// price per item, per store (rand)
const PRICE_TABLE = {
  milk:            { "Shoprite Benoni": 19.99, "Pick n Pay Northmead": 21.50, "Checkers Lakeside Mall": 20.99 },
  bread:           { "Shoprite Benoni": 16.99, "Pick n Pay Northmead": 15.99, "Checkers Lakeside Mall": 17.49 },
  eggs:            { "Shoprite Benoni": 34.99, "Pick n Pay Northmead": 36.99, "Checkers Lakeside Mall": 33.99 },
  rice:            { "Shoprite Benoni": 89.99, "Pick n Pay Northmead": 94.99, "Checkers Lakeside Mall": 91.99 },
  "chicken breast": { "Shoprite Benoni": 79.99, "Pick n Pay Northmead": 84.99, "Checkers Lakeside Mall": 82.99 },
  sugar:           { "Shoprite Benoni": 27.99, "Pick n Pay Northmead": 29.99, "Checkers Lakeside Mall": 28.49 },
  "cooking oil":   { "Shoprite Benoni": 44.99, "Pick n Pay Northmead": 46.99, "Checkers Lakeside Mall": 45.99 },
  potatoes:        { "Shoprite Benoni": 39.99, "Pick n Pay Northmead": 42.99, "Checkers Lakeside Mall": 41.49 },
  tomatoes:        { "Shoprite Benoni": 24.99, "Pick n Pay Northmead": 26.99, "Checkers Lakeside Mall": 23.99 },
  onions:          { "Shoprite Benoni": 22.99, "Pick n Pay Northmead": 21.99, "Checkers Lakeside Mall": 23.49 },
  cheese:          { "Shoprite Benoni": 64.99, "Pick n Pay Northmead": 68.99, "Checkers Lakeside Mall": 66.49 },
  butter:          { "Shoprite Benoni": 54.99, "Pick n Pay Northmead": 57.99, "Checkers Lakeside Mall": 56.49 },
  pasta:           { "Shoprite Benoni": 18.99, "Pick n Pay Northmead": 19.99, "Checkers Lakeside Mall": 17.99 },
  "tinned tomatoes": { "Shoprite Benoni": 14.99, "Pick n Pay Northmead": 15.49, "Checkers Lakeside Mall": 14.49 },
  cereal:          { "Shoprite Benoni": 49.99, "Pick n Pay Northmead": 52.99, "Checkers Lakeside Mall": 51.49 },
};

// small treats that can be bought with leftover change
const TREATS = [
  { name: "a chocolate bar", price: 15 },
  { name: "a packet of chips", price: 18 },
  { name: "a fizzy drink", price: 12 },
  { name: "a doughnut", price: 10 },
  { name: "a small ice cream", price: 25 },
];

// A price for any item typed that isn't in our table, so the demo
// still works for a grocery list we don't have exact data for.
function fallbackPrice(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) % 1000;
  return Math.round((20 + (hash % 60)) * 100) / 100;
}

function getPrices(itemName) {
  const key = itemName.trim().toLowerCase();
  if (PRICE_TABLE[key]) return PRICE_TABLE[key];
  const base = fallbackPrice(key);
  return {
    "Shoprite Benoni": base,
    "Pick n Pay Northmead": Math.round(base * 1.05 * 100) / 100,
    "Checkers Lakeside Mall": Math.round(base * 1.02 * 100) / 100,
  };
}

function formatRand(n) {
  return "R" + n.toFixed(2).replace(/\.00$/, "");
}

// ---- Home page: capture the form and hand off to results.html ----
const form = document.getElementById("basket-form");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const items = document.getElementById("items").value
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const budget = parseFloat(document.getElementById("budget").value) || 0;

    localStorage.setItem("bonusbasket_items", JSON.stringify(items));
    localStorage.setItem("bonusbasket_budget", String(budget));
    window.location.href = "results.html";
  });
}

// ---- Results page: run the comparison and render it ----
const itemList = document.getElementById("item-list");
if (itemList) {
  const items = JSON.parse(localStorage.getItem("bonusbasket_items") || "[]");
  const budget = parseFloat(localStorage.getItem("bonusbasket_budget") || "0");

  // total cost per store across the whole list
  const storeTotals = {};
  STORES.forEach((s) => (storeTotals[s.name] = 0));

  const perItemPrices = items.map((item) => {
    const prices = getPrices(item);
    STORES.forEach((s) => (storeTotals[s.name] += prices[s.name]));
    return { item, prices };
  });

  const cheapestStore = STORES.reduce((best, s) =>
    storeTotals[s.name] < storeTotals[best.name] ? s : best
  , STORES[0]);

  const total = storeTotals[cheapestStore.name];
  const savings = budget - total;

  document.getElementById("store-name").textContent = cheapestStore.name;
  document.getElementById("store-distance").textContent = cheapestStore.distance;

  itemList.innerHTML = perItemPrices.map(({ item, prices }) => `
    <li>
      <span class="item-name">${item}</span>
      <span class="item-price">${formatRand(prices[cheapestStore.name])}</span>
    </li>
  `).join("");

  document.getElementById("sum-budget").textContent = formatRand(budget);
  document.getElementById("sum-total").textContent = formatRand(total);
  document.getElementById("sum-savings").textContent =
    (savings >= 0 ? formatRand(savings) : "R0") + (savings < 0 ? " (over budget)" : "");

  // Suggest a treat if there's enough leftover change for one
  const treatCard = document.getElementById("treat-card");
  const treatText = document.getElementById("treat-text");
  if (savings > 0) {
    const affordable = TREATS.filter((t) => t.price <= savings)
      .sort((a, b) => b.price - a.price);
    if (affordable.length) {
      const treat = affordable[0];
      treatCard.hidden = false;
      treatText.textContent =
        `You've got ${formatRand(savings)} left over — enough for ${treat.name} (${formatRand(treat.price)}).`;
    }
  }
}
