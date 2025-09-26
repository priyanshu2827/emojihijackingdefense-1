import { db } from '@/db';
import { batches } from '@/db/schema';

async function main() {
    const sampleBatches = [
        {
            itemCount: 50,
            alertCount: 5,
            notes: 'Email content analysis batch - processed marketing emails for potential phishing indicators and suspicious Unicode usage patterns',
            createdAt: new Date('2024-01-15T09:30:00Z').toISOString(),
        },
        {
            itemCount: 125,
            alertCount: 15,
            notes: 'Web form submissions batch - analyzed user registration forms and contact submissions for Unicode normalization attacks and homograph spoofing',
            createdAt: new Date('2024-01-18T14:45:00Z').toISOString(),
        },
        {
            itemCount: 200,
            alertCount: 30,
            notes: 'User-generated content moderation batch - processed social media posts and comments for mixed-script confusables and directional override attacks',
            createdAt: new Date('2024-01-22T11:15:00Z').toISOString(),
        }
    ];

    await db.insert(batches).values(sampleBatches);
    
    console.log('✅ Batches seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});