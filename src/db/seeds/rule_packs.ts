import { db } from '@/db';
import { rulePacks } from '@/db/schema';

async function main() {
    const sampleRulePacks = [
        {
            name: 'default',
            active: true,
            version: '1.0.0',
            description: 'Default Unicode security detection rules',
            yaml: `# Default Unicode Security Detection Rules
# Policy enforcement levels: Observe, Soft, Hard
# Observe: Log only, no blocking
# Soft: Warn user, allow with confirmation
# Hard: Block completely

detection_rules:
  homograph_attacks:
    policy: Hard
    description: "Detects characters that visually resemble Latin characters"
    priority: high
    
  invisible_characters:
    policy: Soft
    description: "Detects zero-width and other invisible Unicode characters"
    priority: medium
    
  mixed_scripts:
    policy: Observe
    description: "Detects mixing of different Unicode script families"
    priority: low
    
  zero_width_characters:
    policy: Soft
    description: "Detects zero-width joiners, non-joiners, and spaces"
    priority: medium
    
  bidirectional_overrides:
    policy: Hard
    description: "Detects right-to-left and left-to-right override characters"
    priority: high
    
  suspicious_combining_characters:
    policy: Observe
    description: "Detects unusual combining character sequences"
    priority: low
    
  control_characters:
    policy: Soft
    description: "Detects ASCII and Unicode control characters"
    priority: medium
    
  lookalike_domains:
    policy: Hard
    description: "Detects domain names with visually similar characters"
    priority: high
    
  format_characters:
    policy: Observe
    description: "Detects Unicode format control characters"
    priority: low
    
  private_use_characters:
    policy: Soft
    description: "Detects private use area characters"
    priority: medium

risk_thresholds:
  low: 1-3
  medium: 4-6
  high: 7-10

enforcement_settings:
  max_mixed_scripts: 3
  allow_common_combining: true
  strict_domain_validation: true
  log_all_detections: true`,
            createdAt: new Date('2024-01-01').toISOString(),
        }
    ];

    await db.insert(rulePacks).values(sampleRulePacks);
    
    console.log('✅ Rule packs seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});