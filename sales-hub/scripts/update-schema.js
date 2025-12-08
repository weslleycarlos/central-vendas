const fs = require('fs');
const path = require('path');

// Manually parse .env to avoid dependency
const envPath = path.join(__dirname, '../.env');
let databaseUrl = '';
let explicitProvider = '';

if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('DATABASE_URL=')) {
            databaseUrl = trimmed.split('=', 2)[1].replace(/["']/g, '').trim();
        }
        if (trimmed.startsWith('DB_PROVIDER=')) {
            explicitProvider = trimmed.split('=', 2)[1].replace(/["']/g, '').trim();
        }
    }
} else {
    if (process.env.DATABASE_URL) databaseUrl = process.env.DATABASE_URL;
    if (process.env.DB_PROVIDER) explicitProvider = process.env.DB_PROVIDER;
}

// Determine provider
let provider = 'postgresql'; // Fallback default

if (explicitProvider) {
    provider = explicitProvider;
    console.log(`[Config] Using explicit DB_PROVIDER: ${provider}`);
} else if (databaseUrl) {
    if (databaseUrl.startsWith('file:')) {
        provider = 'sqlite';
        console.log('[Config] Detected "file:" protocol in DATABASE_URL. Auto-setting provider to: sqlite');
    } else if (databaseUrl.startsWith('postgres') || databaseUrl.startsWith('postgresql')) {
        provider = 'postgresql';
        console.log('[Config] Detected "postgres" protocol in DATABASE_URL. Auto-setting provider to: postgresql');
    }
}

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');

try {
    let schema = fs.readFileSync(schemaPath, 'utf8');

    const regex = /datasource\s+db\s+\{[\s\S]*?provider\s*=\s*"(.*?)"[\s\S]*?\}/;
    const match = schema.match(regex);

    if (match && match[1] === provider) {
        console.log('[Config] Provider is already set correctly. Skipping update.');
        process.exit(0);
    }

    const newSchema = schema.replace(/provider\s*=\s*".*?"/, `provider = "${provider}"`);
    fs.writeFileSync(schemaPath, newSchema);
    console.log(`[Config] schema.prisma updated to provider="${provider}"`);

} catch (error) {
    console.error('[Config] Error updating schema.prisma:', error);
}
