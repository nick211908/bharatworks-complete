"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerFcmToken = exports.getAgentProfile = exports.createAgentProfile = exports.updateUserProfile = exports.updateWorkerLocation = exports.createWorkerProfile = exports.createEmployerProfile = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const createEmployerProfile = async (req, res) => {
    try {
        if (!req.user || !req.user.id)
            return res.status(401).json({ error: 'Unauthorized' });
        const { employerType, companyName, billingAddress } = req.body;
        // Use upsert to avoid crashes if employer already exists
        const employer = await prisma_1.default.employer.upsert({
            where: { id: (await prisma_1.default.employer.findFirst({ where: { userId: req.user.id } }))?.id || '00000000-0000-0000-0000-000000000000' },
            update: { employerType, companyName, billingAddress },
            create: {
                userId: req.user.id,
                employerType,
                companyName,
                billingAddress
            }
        });
        res.status(201).json({ employer });
    }
    catch (error) {
        console.error('Employer profile creation error:', error);
        res.status(500).json({ error: 'Failed to create employer profile' });
    }
};
exports.createEmployerProfile = createEmployerProfile;
const createWorkerProfile = async (req, res) => {
    try {
        if (!req.user || !req.user.id)
            return res.status(401).json({ error: 'Unauthorized' });
        const { expectedWage, latitude, longitude, geohash, availabilityStatus, documents } = req.body;
        // Check if worker already exists for this user
        const existingWorker = await prisma_1.default.worker.findFirst({ where: { userId: req.user.id } });
        let worker;
        if (existingWorker) {
            // Update existing worker instead of crashing
            worker = await prisma_1.default.worker.update({
                where: { id: existingWorker.id },
                data: {
                    ...(expectedWage !== undefined && { expectedWage }),
                    ...(latitude !== undefined && { latitude }),
                    ...(longitude !== undefined && { longitude }),
                    ...(geohash !== undefined && { geohash }),
                    ...(availabilityStatus !== undefined && { availabilityStatus }),
                    ...(documents !== undefined && { documents }),
                }
            });
        }
        else {
            // Create new worker
            const workerData = {
                userId: req.user.id,
                availabilityStatus: availabilityStatus || 'online',
                verificationStatus: 'pending'
            };
            if (typeof req.user.phone === 'string' && req.user.phone)
                workerData.phone = req.user.phone;
            if (expectedWage !== undefined)
                workerData.expectedWage = expectedWage;
            if (latitude !== undefined)
                workerData.latitude = latitude;
            if (longitude !== undefined)
                workerData.longitude = longitude;
            if (geohash !== undefined)
                workerData.geohash = geohash;
            if (documents !== undefined)
                workerData.documents = documents;
            worker = await prisma_1.default.worker.create({ data: workerData });
        }
        res.status(201).json({ worker });
    }
    catch (error) {
        console.error('Worker profile creation error:', error);
        res.status(500).json({ error: 'Failed to create worker profile' });
    }
};
exports.createWorkerProfile = createWorkerProfile;
const updateWorkerLocation = async (req, res) => {
    try {
        if (!req.user || !req.user.id)
            return res.status(401).json({ error: 'Unauthorized' });
        const worker = await prisma_1.default.worker.findFirst({ where: { userId: req.user.id } });
        if (!worker)
            return res.status(404).json({ error: 'Worker profile not found' });
        const { latitude, longitude, geohash } = req.body;
        const updatedWorker = await prisma_1.default.worker.update({
            where: { id: worker.id },
            data: { latitude, longitude, geohash }
        });
        res.json({ worker: updatedWorker });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update location' });
    }
};
exports.updateWorkerLocation = updateWorkerLocation;
const updateUserProfile = async (req, res) => {
    try {
        if (!req.user || !req.user.id)
            return res.status(401).json({ error: 'Unauthorized' });
        const { name, email, photoUrl } = req.body;
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (email !== undefined)
            updateData.email = email;
        await prisma_1.default.user.update({
            where: { id: req.user.id },
            data: updateData,
        });
        // Fetch updated user without password
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.user.id },
            omit: { password: true },
        });
        res.json({ user });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
};
exports.updateUserProfile = updateUserProfile;
const createAgentProfile = async (req, res) => {
    try {
        if (!req.user || !req.user.id)
            return res.status(401).json({ error: 'Unauthorized' });
        const { agencyName, region, experienceYears } = req.body;
        // Ensure user has agent role
        await prisma_1.default.user.update({
            where: { id: req.user.id },
            data: { roles: { push: 'agent' } }
        });
        // Create or update agent record
        const existingAgent = await prisma_1.default.agent.findFirst({ where: { userId: req.user.id } });
        let agent;
        if (existingAgent) {
            agent = await prisma_1.default.agent.update({
                where: { id: existingAgent.id },
                data: { operationalArea: region }
            });
        }
        else {
            agent = await prisma_1.default.agent.create({
                data: {
                    userId: req.user.id,
                    operationalArea: region
                }
            });
        }
        // Store extra details in user name for now
        await prisma_1.default.user.update({
            where: { id: req.user.id },
            data: { name: agencyName || req.user.phone }
        });
        res.status(201).json({ agent });
    }
    catch (error) {
        console.error('Agent registration error:', error);
        res.status(500).json({ error: 'Failed to register agent' });
    }
};
exports.createAgentProfile = createAgentProfile;
const getAgentProfile = async (req, res) => {
    try {
        if (!req.user || !req.user.id)
            return res.status(401).json({ error: 'Unauthorized' });
        const agent = await prisma_1.default.agent.findFirst({
            where: { userId: req.user.id },
            include: {
                user: {
                    select: {
                        id: true, name: true, phone: true, roles: true, email: true, balance: true
                    }
                },
                workersCreated: true
            }
        });
        if (!agent)
            return res.status(404).json({ error: 'Agent profile not found' });
        res.json({
            agent: {
                id: agent.id,
                name: agent.user.name,
                phone: agent.user.phone,
                operationalArea: agent.operationalArea,
                workersAdded: agent.workersCreated.length,
                earnings: 0, // MVP placeholder
                pending: 0, // MVP placeholder
                rank: 'Bronze Agent',
                displayId: agent.id.substring(0, 8).toUpperCase()
            }
        });
    }
    catch (error) {
        console.error('Get agent profile error:', error);
        res.status(500).json({ error: 'Failed to get agent profile' });
    }
};
exports.getAgentProfile = getAgentProfile;
const registerFcmToken = async (req, res) => {
    try {
        if (!req.user?.id)
            return res.status(401).json({ error: 'Unauthorized' });
        const { fcmToken } = req.body;
        if (!fcmToken)
            return res.status(400).json({ error: 'fcmToken is required' });
        await prisma_1.default.user.update({
            where: { id: req.user.id },
            data: { fcmToken },
        });
        res.json({ message: 'FCM token registered' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to register FCM token' });
    }
};
exports.registerFcmToken = registerFcmToken;
//# sourceMappingURL=users.js.map