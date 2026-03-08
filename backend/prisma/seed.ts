import { PrismaClient, NodeType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create a demo system
  const system = await prisma.system.create({
    data: {
      name: 'Smart Home System',
      description: 'A modular smart home automation system with various components',
    },
  });

  console.log(`Created system: ${system.name}`);

  // Create hierarchy nodes
  const rootNode = await prisma.systemNode.create({
    data: {
      systemId: system.id,
      name: 'Smart Home',
      type: NodeType.system,
      description: 'Root system node',
    },
  });

  // Subsystems
  const securitySubsystem = await prisma.systemNode.create({
    data: {
      systemId: system.id,
      parentId: rootNode.id,
      name: 'Security',
      type: NodeType.subsystem,
      description: 'Home security subsystem',
    },
  });

  const climateSubsystem = await prisma.systemNode.create({
    data: {
      systemId: system.id,
      parentId: rootNode.id,
      name: 'Climate Control',
      type: NodeType.subsystem,
      description: 'HVAC and temperature management',
    },
  });

  const lightingSubsystem = await prisma.systemNode.create({
    data: {
      systemId: system.id,
      parentId: rootNode.id,
      name: 'Lighting',
      type: NodeType.subsystem,
      description: 'Smart lighting system',
    },
  });

  // Components
  const cameraComponent = await prisma.systemNode.create({
    data: {
      systemId: system.id,
      parentId: securitySubsystem.id,
      name: 'Cameras',
      type: NodeType.component,
      description: 'Security camera system',
    },
  });

  const lockComponent = await prisma.systemNode.create({
    data: {
      systemId: system.id,
      parentId: securitySubsystem.id,
      name: 'Smart Locks',
      type: NodeType.component,
      description: 'Door and window locks',
    },
  });

  const thermostatComponent = await prisma.systemNode.create({
    data: {
      systemId: system.id,
      parentId: climateSubsystem.id,
      name: 'Thermostat',
      type: NodeType.component,
      description: 'Smart thermostat',
    },
  });

  const bulbsComponent = await prisma.systemNode.create({
    data: {
      systemId: system.id,
      parentId: lightingSubsystem.id,
      name: 'Smart Bulbs',
      type: NodeType.component,
      description: 'Connected light bulbs',
    },
  });

  console.log('Created hierarchy nodes');

  // Create design alternatives for each component
  const cameraDAs = await Promise.all([
    prisma.designAlternative.create({
      data: {
        componentId: cameraComponent.id,
        name: 'Ring Pro',
        description: 'High-end Ring doorbell camera',
        priority: 1,
      },
    }),
    prisma.designAlternative.create({
      data: {
        componentId: cameraComponent.id,
        name: 'Nest Cam',
        description: 'Google Nest indoor/outdoor camera',
        priority: 2,
      },
    }),
    prisma.designAlternative.create({
      data: {
        componentId: cameraComponent.id,
        name: 'Wyze Cam',
        description: 'Budget-friendly camera option',
        priority: 3,
      },
    }),
  ]);

  const lockDAs = await Promise.all([
    prisma.designAlternative.create({
      data: {
        componentId: lockComponent.id,
        name: 'August Smart Lock',
        description: 'Premium smart lock with auto-unlock',
        priority: 1,
      },
    }),
    prisma.designAlternative.create({
      data: {
        componentId: lockComponent.id,
        name: 'Yale Assure',
        description: 'Keypad smart lock',
        priority: 2,
      },
    }),
  ]);

  const thermostatDAs = await Promise.all([
    prisma.designAlternative.create({
      data: {
        componentId: thermostatComponent.id,
        name: 'Nest Learning',
        description: 'AI-powered learning thermostat',
        priority: 1,
      },
    }),
    prisma.designAlternative.create({
      data: {
        componentId: thermostatComponent.id,
        name: 'Ecobee SmartThermostat',
        description: 'With room sensors',
        priority: 2,
      },
    }),
    prisma.designAlternative.create({
      data: {
        componentId: thermostatComponent.id,
        name: 'Honeywell T6',
        description: 'Reliable basic smart thermostat',
        priority: 3,
      },
    }),
  ]);

  const bulbDAs = await Promise.all([
    prisma.designAlternative.create({
      data: {
        componentId: bulbsComponent.id,
        name: 'Philips Hue',
        description: 'Premium smart bulb ecosystem',
        priority: 1,
      },
    }),
    prisma.designAlternative.create({
      data: {
        componentId: bulbsComponent.id,
        name: 'LIFX',
        description: 'No hub required, bright colors',
        priority: 2,
      },
    }),
  ]);

  console.log('Created design alternatives');

  // Create an expert
  const expert = await prisma.expert.create({
    data: {
      systemId: system.id,
      name: 'System Architect',
      email: 'architect@example.com',
      expertise: ['IoT', 'Home Automation'],
      weight: 1.0,
    },
  });

  console.log(`Created expert: ${expert.name}`);

  // Create some ratings
  for (const da of [...cameraDAs, ...lockDAs, ...thermostatDAs, ...bulbDAs]) {
    await prisma.rating.create({
      data: {
        expertId: expert.id,
        targetId: da.id,
        targetType: 'DA',
        ordinalValue: Math.floor(Math.random() * 3) + 3, // 3-5 rating
        confidence: 0.8 + Math.random() * 0.2,
      },
    });
  }

  console.log('Created ratings');

  // Create some compatibility ratings
  // Camera <-> Lock compatibility
  for (const cam of cameraDAs) {
    for (const lock of lockDAs) {
      const [da1Id, da2Id] = cam.id < lock.id ? [cam.id, lock.id] : [lock.id, cam.id];
      await prisma.compatibilityRating.create({
        data: {
          da1Id,
          da2Id,
          value: 3, // Good compatibility
        },
      });
    }
  }

  // Thermostat <-> Bulb compatibility
  for (const thermo of thermostatDAs) {
    for (const bulb of bulbDAs) {
      const [da1Id, da2Id] = thermo.id < bulb.id ? [thermo.id, bulb.id] : [bulb.id, thermo.id];
      await prisma.compatibilityRating.create({
        data: {
          da1Id,
          da2Id,
          value: thermo.name.includes('Nest') && bulb.name.includes('Hue') ? 3 : 2,
        },
      });
    }
  }

  console.log('Created compatibility ratings');

  console.log('Seeding complete!');
  console.log(`System ID: ${system.id}`);
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
