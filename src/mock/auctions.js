export const mockAuctions = [
  {
    id: 1,
    title: "Vintage Rolex Submariner",
    description: "A classic 1970s Rolex Submariner in excellent condition. Certificate of authenticity included.",
    currentPrice: 8500,
    startTime: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours from now
    image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=800&auto=format&fit=crop",
    category: "Watches",
    bids: 12,
  },
  {
    id: 2,
    title: "Abstract Modern Sculpture",
    description: "Limited edition bronze sculpture by renowned artist. Perfect for modern living spaces.",
    currentPrice: 1200,
    startTime: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(), // 2 hours from now
    image: "https://images.unsplash.com/photo-1544531585-9847b68c8c86?q=80&w=800&auto=format&fit=crop",
    category: "Art",
    bids: 8,
  },
  {
    id: 3,
    title: "1967 Mustang Shelby GT500",
    description: "Fully restored 1967 Shelby GT500. Highland Green with white stripes.",
    currentPrice: 155000,
    startTime: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    image: "https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?q=80&w=800&auto=format&fit=crop",
    category: "Automobiles",
    bids: 45,
  },
  {
    id: 4,
    title: "MacBook Pro M3 Max (Custom)",
    description: "High-spec 16-inch MacBook Pro with 128GB RAM and 8TB SSD.",
    currentPrice: 4200,
    startTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 5).toISOString(),
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop",
    category: "Electronics",
    bids: 23,
  }
];
