"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.connectDb = connectDb;
exports.disconnectDb = disconnectDb;
const client_1 = require("@prisma/client");
exports.prisma = new client_1.PrismaClient();
async function connectDb() {
    let retries = 5;
    while (retries > 0) {
        try {
            await exports.prisma.$connect();
            console.log('Successfully connected to PostgreSQL');
            return;
        }
        catch (err) {
            console.error(`Failed to connect to PostgreSQL. Retries left: ${retries - 1}`);
            retries -= 1;
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
    throw new Error('Could not connect to PostgreSQL after multiple attempts');
}
async function disconnectDb() {
    await exports.prisma.$disconnect();
}
//# sourceMappingURL=client.js.map