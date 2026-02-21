export const mockBids = [
    {
        id: 1,
        auctionId: 1,
        bidderName: "John Doe",
        amount: 8500,
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
    {
        id: 2,
        auctionId: 1,
        bidderName: "Sarah Smith",
        amount: 8400,
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
    {
        id: 3,
        auctionId: 1,
        bidderName: "Michael Brown",
        amount: 8250,
        timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    },
    {
        id: 4,
        auctionId: 2,
        bidderName: "Alice Cooper",
        amount: 1200,
        timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    }
];
