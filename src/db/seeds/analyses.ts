import { db } from '@/db';
import { analyses } from '@/db/schema';

async function main() {
    const sampleAnalyses = [
        {
            inputText: 'Hello, world! This is clean text.',
            sanitized: 'Hello, world! This is clean text.',
            normalized: 'hello, world! this is clean text.',
            overallRisk: 5,
            tokenDriftRatio: 0.0,
            rawTokens: [
                { text: 'Hello', type: 'word', risk: 0 },
                { text: ',', type: 'punctuation', risk: 0 },
                { text: ' ', type: 'whitespace', risk: 0 },
                { text: 'world', type: 'word', risk: 0 },
                { text: '!', type: 'punctuation', risk: 0 },
                { text: ' ', type: 'whitespace', risk: 0 },
                { text: 'This', type: 'word', risk: 0 },
                { text: ' ', type: 'whitespace', risk: 0 },
                { text: 'is', type: 'word', risk: 0 },
                { text: ' ', type: 'whitespace', risk: 0 },
                { text: 'clean', type: 'word', risk: 0 },
                { text: ' ', type: 'whitespace', risk: 0 },
                { text: 'text', type: 'word', risk: 0 },
                { text: '.', type: 'punctuation', risk: 0 }
            ],
            tokens: [
                { text: 'Hello', type: 'word', risk: 0 },
                { text: ',', type: 'punctuation', risk: 0 },
                { text: ' ', type: 'whitespace', risk: 0 },
                { text: 'world', type: 'word', risk: 0 },
                { text: '!', type: 'punctuation', risk: 0 },
                { text: ' ', type: 'whitespace', risk: 0 },
                { text: 'This', type: 'word', risk: 0 },
                { text: ' ', type: 'whitespace', risk: 0 },
                { text: 'is', type: 'word', risk: 0 },
                { text: ' ', type: 'whitespace', risk: 0 },
                { text: 'clean', type: 'word', risk: 0 },
                { text: ' ', type: 'whitespace', risk: 0 },
                { text: 'text', type: 'word', risk: 0 },
                { text: '.', type: 'punctuation', risk: 0 }
            ],
            alerts: [],
            summary: {
                homograph: { score: 0, reason: 'No homograph characters detected' },
                invisible: { score: 0, reason: 'No invisible characters found' },
                mixedScript: { score: 5, reason: 'Single script detected' },
                rtl: { score: 0, reason: 'No RTL override characters' },
                spoofing: { score: 0, reason: 'No spoofing patterns detected' }
            },
            matrix: {
                latin: { detected: true, suspicious: false, confidence: 1.0 },
                cyrillic: { detected: false, suspicious: false, confidence: 0.0 },
                greek: { detected: false, suspicious: false, confidence: 0.0 },
                arabic: { detected: false, suspicious: false, confidence: 0.0 }
            },
            removed: [],
            policyMode: 'Observe',
            commitSha: 'a1b2c3d4e5f6789012345678901234567890abcd',
            buildTime: new Date('2024-01-15T10:30:00Z').toISOString(),
            source: 'manual',
            createdAt: new Date('2024-01-15T10:35:22Z').toISOString()
        },
        {
            inputText: 'Pay раl account suspended - сlick here',
            sanitized: 'Pay pal account suspended - click here',
            normalized: 'pay pal account suspended - click here',
            overallRisk: 85,
            tokenDriftRatio: 0.67,
            rawTokens: [
                { text: 'Pay', type: 'word', risk: 0 },
                { text: ' ', type: 'whitespace', risk: 0 },
                { text: 'раl', type: 'word', risk: 90 },
                { text: ' ', type: 'whitespace', risk: 0 },
                { text: 'account', type: 'word', risk: 0 },
                { text: ' ', type: 'whitespace', risk: 0 },
                { text: 'suspended', type: 'word', risk: 0 },
                { text: ' ', type: 'whitespace', risk: 0 },
                { text: '-', type: 'punctuation', risk: 0 },
                { text: ' ', type: 'whitespace', risk: 0 },
                { text: 'сlick', type: 'word', risk: 75 },
                { text: ' ', type: 'whitespace', risk: 0 },
                { text: 'here', type: 'word', risk: 0 }
            ],
            tokens: [
                { text: 'Pay', type: 'word', risk: 0 },
                { text: ' ', type: 'whitespace', risk: 0 },
                { text: 'pal', type: 'word', risk: 0 },
                { text: ' ', type: 'whitespace', risk: 0 },
                { text: 'account', type: 'word', risk: 0 },
                { text: ' ', type: 'whitespace', risk: 0 },
                { text: 'suspended', type: 'word', risk: 0 },
                { text: ' ', type: 'whitespace', risk: 0 },
                { text: '-', type: 'punctuation', risk: 0 },
                { text: ' ', type: 'whitespace', risk: 0 },
                { text: 'click', type: 'word', risk: 0 },
                { text: ' ', type: 'whitespace', risk: 0 },
                { text: 'here', type: 'word', risk: 0 }
            ],
            alerts: [
                {
                    type: 'homograph',
                    severity: 'high',
                    message: 'Cyrillic characters detected in Latin text context',
                    position: 4
                },
                {
                    type: 'spoofing',
                    severity: 'critical',
                    message: 'Potential PayPal brand spoofing detected',
                    position: 0
                }
            ],
            summary: {
                homograph: { score: 90, reason: 'Mixed Cyrillic and Latin scripts detected' },
                invisible: { score: 0, reason: 'No invisible characters found' },
                mixedScript: { score: 85, reason: 'Suspicious script mixing pattern' },
                rtl: { score: 0, reason: 'No RTL override characters' },
                spoofing: { score: 95, reason: 'High confidence brand spoofing attempt' }
            },
            matrix: {
                latin: { detected: true, suspicious: false, confidence: 0.6 },
                cyrillic: { detected: true, suspicious: true, confidence: 0.4 },
                greek: { detected: false, suspicious: false, confidence: 0.0 },
                arabic: { detected: false, suspicious: false, confidence: 0.0 }
            },
            removed: [
                { codepoint: 1088, character: 'р', reason: 'Cyrillic in Latin context' },
                { codepoint: 1089, character: 'с', reason: 'Cyrillic in Latin context' }
            ],
            policyMode: 'Hard',
            commitSha: 'b2c3d4e5f6789012345678901234567890abcdef',
            buildTime: new Date('2024-01-16T14:22:00Z').toISOString(),
            source: 'api',
            createdAt: new Date('2024-01-16T14:25:44Z').toISOString()
        },
        {
            inputText: 'User​name: admin​password: secret',
            sanitized: 'Username: adminpassword: secret',
            normalized: 'username: adminpassword: secret',
            overallRisk: 72,
            tokenDriftRatio: 0.45,
            rawTokens: [
                { text: 'User', type: 'word', risk: 0 },
                { text: '​', type: 'invisible', risk: 95 },
                { text: 'name', type: 'word', risk: 0 },
                { text: ':', type: 'punctuation', risk: 0 },
                { text: ' ', type: 'whitespace', risk: 0 },
                { text: 'admin', type: 'word', risk: 0 },
                { text: '​', type: 'invisible', risk: 95 },
                { text: 'password', type: 'word', risk: 0 },
                { text: ':', type: 'punctuation', risk: 0 },
                { text: ' ', type: 'whitespace', risk: 0 },
                { text: 'secret', type: 'word', risk: 0 }
            ],
            tokens: [
                { text: 'User', type: 'word', risk: 0 },
                { text: 'name', type: 'word', risk: 0 },
                { text: ':', type: 'punctuation', risk: 0 },
                { text: ' ', type: 'whitespace', risk: 0 },
                { text: 'admin', type: 'word', risk: 0 },
                { text: 'password', type: 'word', risk: 0 },
                { text: ':', type: 'punctuation', risk: 0 },
                { text: ' ', type: 'whitespace', risk: 0 },
                { text: 'secret', type: 'word', risk: 0 }
            ],
            alerts: [
                {
                    type: 'invisible',
                    severity: 'high',
                    message: 'Zero-width space character detected',
                    position: 4
                },
                {
                    type: 'invisible',
                    severity: 'high',
                    message: 'Zero-width space character detected',
                    position: 15
                }
            ],
            summary: {
                homograph: { score: 0, reason: 'No homograph characters detected' },
                invisible: { score: 95, reason: 'Multiple zero-width spaces found' },
                mixedScript: { score: 0, reason: 'Single script detected' },
                rtl: { score: 0, reason: 'No RTL override characters' },
                spoofing: { score: 25, reason: 'Potential credential harvesting pattern' }
            },
            matrix: {
                latin: { detected: true, suspicious: false, confidence: 1.0 },
                cyrillic: { detected: false, suspicious: false, confidence: 0.0 },
                greek: { detected: false, suspicious: false, confidence: 0.0 },
                arabic: { detected: false, suspicious: false, confidence: 0.0 }
            },
            removed: [
                { codepoint: 8203, character: '​', reason: 'Zero-width space removed' },
                { codepoint: 8203, character: '​', reason: 'Zero-width space removed' }
            ],
            policyMode: 'Soft',
            commitSha: 'c3d4e5f6789012345678901234567890abcdef12',
            buildTime: new Date('2024-01-17T09:15:00Z').toISOString(),
            source: 'batch',
            createdAt: new Date('2024-01-17T09:18:33Z').toISOString()
        },
        {
            inputText: 'Welcome مرحبا Καλησπέρα Hello',
            sanitized: 'Welcome مرحبا Καλησπέρα Hello',
            normalized: 'welcome مرحبا καλησπέρα hello',
            overallRisk: 35,
            tokenDriftRatio: 0.25,
            rawTokens: [
                { text: 'Welcome', type: 'word', risk: 0 },
                { text: ' ', type: 'whitespace', risk: 0 },
                { text: 'مرحبا', type: 'word', risk: 30 },
                { text: ' ', type: 'whitespace', risk: 0 },
                { text: 'Καλησπέρα', type: 'word', risk: 25 },
                { text: ' ', type: 'whitespace', risk: 0 },
                { text: 'Hello', type: 'word', risk: 0 }
            ],
            tokens: [
                { text: 'Welcome', type: 'word', risk: 0 },
                { text: ' ', type: 'whitespace', risk: 0 },
                { text: 'مرحبا', type: 'word', risk: 30 },
                { text: ' ', type: 'whitespace', risk: 0 },
                { text: 'Καλησπέρα', type: 'word', risk: 25 },
                { text: ' ', type: 'whitespace', risk: 0 },
                { text: 'Hello', type: 'word', risk: 0 }
            ],
            alerts: [
                {
                    type: 'mixedScript',
                    severity: 'medium',
                    message: 'Multiple scripts detected in same text',
                    position: 8
                }
            ],
            summary: {
                homograph: { score: 0, reason: 'No homograph characters detected' },
                invisible: { score: 0, reason: 'No invisible characters found' },
                mixedScript: { score: 65, reason: 'Latin, Arabic, and Greek scripts mixed' },
                rtl: { score: 15, reason: 'RTL script present but no override' },
                spoofing: { score: 10, reason: 'Low risk multilingual content' }
            },
            matrix: {
                latin: { detected: true, suspicious: false, confidence: 0.5 },
                cyrillic: { detected: false, suspicious: false, confidence: 0.0 },
                greek: { detected: true, suspicious: false, confidence: 0.25 },
                arabic: { detected: true, suspicious: false, confidence: 0.25 }
            },
            removed: [],
            policyMode: 'Observe',
            commitSha: 'd4e5f6789012345678901234567890abcdef1234',
            buildTime: new Date('2024-01-18T16:45:00Z').toISOString(),
            source: 'manual',
            createdAt: new Date('2024-01-18T16:47:11Z').toISOString()
        },
        {
            inputText: 'аррӏе.com‮/login?redirect=evil.com',
            sanitized: 'apple.com/login?redirect=evil.com',
            normalized: 'apple.com/login?redirect=evil.com',
            overallRisk: 98,
            tokenDriftRatio: 0.88,
            rawTokens: [
                { text: 'аррӏе', type: 'word', risk: 95 },
                { text: '.', type: 'punctuation', risk: 0 },
                { text: 'com', type: 'word', risk: 0 },
                { text: '‮', type: 'rtl_override', risk: 100 },
                { text: '/', type: 'punctuation', risk: 0 },
                { text: 'login', type: 'word', risk: 0 },
                { text: '?', type: 'punctuation', risk: 0 },
                { text: 'redirect', type: 'word', risk: 20 },
                { text: '=', type: 'punctuation', risk: 0 },
                { text: 'evil', type: 'word', risk: 80 },
                { text: '.', type: 'punctuation', risk: 0 },
                { text: 'com', type: 'word', risk: 0 }
            ],
            tokens: [
                { text: 'apple', type: 'word', risk: 0 },
                { text: '.', type: 'punctuation', risk: 0 },
                { text: 'com', type: 'word', risk: 0 },
                { text: '/', type: 'punctuation', risk: 0 },
                { text: 'login', type: 'word', risk: 0 },
                { text: '?', type: 'punctuation', risk: 0 },
                { text: 'redirect', type: 'word', risk: 20 },
                { text: '=', type: 'punctuation', risk: 0 },
                { text: 'evil', type: 'word', risk: 80 },
                { text: '.', type: 'punctuation', risk: 0 },
                { text: 'com', type: 'word', risk: 0 }
            ],
            alerts: [
                {
                    type: 'homograph',
                    severity: 'critical',
                    message: 'Cyrillic homograph of Apple domain detected',
                    position: 0
                },
                {
                    type: 'rtl',
                    severity: 'critical',
                    message: 'RTL override character detected in URL',
                    position: 9
                },
                {
                    type: 'spoofing',
                    severity: 'critical',
                    message: 'Apple.com spoofing with redirect to suspicious domain',
                    position: 0
                }
            ],
            summary: {
                homograph: { score: 95, reason: 'Cyrillic characters mimicking Apple brand' },
                invisible: { score: 0, reason: 'No invisible characters found' },
                mixedScript: { score: 90, reason: 'Suspicious Cyrillic-Latin mixing' },
                rtl: { score: 100, reason: 'RTL override in URL context' },
                spoofing: { score: 98, reason: 'High confidence Apple.com spoofing attempt' }
            },
            matrix: {
                latin: { detected: true, suspicious: false, confidence: 0.3 },
                cyrillic: { detected: true, suspicious: true, confidence: 0.7 },
                greek: { detected: false, suspicious: false, confidence: 0.0 },
                arabic: { detected: false, suspicious: false, confidence: 0.0 }
            },
            removed: [
                { codepoint: 1072, character: 'а', reason: 'Cyrillic homograph' },
                { codepoint: 1088, character: 'р', reason: 'Cyrillic homograph' },
                { codepoint: 1088, character: 'р', reason: 'Cyrillic homograph' },
                { codepoint: 1231, character: 'ӏ', reason: 'Cyrillic homograph' },
                { codepoint: 1077, character: 'е', reason: 'Cyrillic homograph' },
                { codepoint: 8238, character: '‮', reason: 'RTL override character' }
            ],
            policyMode: 'Hard',
            commitSha: 'e5f6789012345678901234567890abcdef123456',
            buildTime: new Date('2024-01-19T11:30:00Z').toISOString(),
            source: 'api',
            createdAt: new Date('2024-01-19T11:32:55Z').toISOString()
        }
    ];

    await db.insert(analyses).values(sampleAnalyses);
    
    console.log('✅ Analyses seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});