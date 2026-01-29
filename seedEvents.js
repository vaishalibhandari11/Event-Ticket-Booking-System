// seedEvents.js

module.exports = [
    { id: 1, title: 'Cricket Match: India vs Australia', venue: 'GEHU Football Ground', date: new Date('2025-11-10'), seats: 100, priceNormal: 50, priceVIP: 100, city: 'Dehradun', category: 'Sports', img: 'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1400&q=60', rating: 4.5, views: 234 },
    { id: 2, title: 'Grafest 2025', venue: 'GEHU Football Ground', date: new Date('2025-12-12'), seats: 150, priceNormal: 80, priceVIP: 150, city: 'Dehradun', category: 'Cultural', img: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1400&q=60', rating: 4.8, views: 512 },
    // ... include all other event objects here, ensure 'date' is a proper Date object or string ...
    { id: 3, title: 'Rock Concert: The Legends Live', venue: 'City Music Hall', date: new Date('2025-12-15'), seats: 200, priceNormal: 100, priceVIP: 200, city: 'Dehradun', category: 'Music', img: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1400&q=60', rating: 4.7, views: 389 },
    // ... (rest of your 8 events) ...
];