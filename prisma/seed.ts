import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Adatbázis feltöltése kezdődik...');

  // ============================================
  // NATTURE RENDSZER
  // ============================================
  
  console.log('📦 Natture termékek feltöltése...');

  // Natture - Alapozók
  await prisma.product.create({
    data: {
      system: 'natture',
      category: 'alapozo',
      type: 'abs',
      name: 'Primacem ABS',
      info: 'Univerzális alapozó minden felületre',
      options: {
        create: [
          { kg: 1, price: 0, m2: 10 },
          { kg: 5, price: 4178, m2: 50 }
        ]
      }
    }
  });

  await prisma.product.create({
    data: {
      system: 'natture',
      category: 'alapozo',
      type: 'plusz',
      name: 'Primacem Plusz',
      info: 'Erősebb tapadás, problémás felületekre',
      options: {
        create: [
          { kg: 1, price: 7199, m2: 10 },
          { kg: 5, price: 5608, m2: 50 }
        ]
      }
    }
  });

  await prisma.product.create({
    data: {
      system: 'natture',
      category: 'alapozo',
      type: 'barrier',
      name: 'Primapox 100 Barrier',
      info: '2 komponensű, vízálló alapozó',
      options: {
        create: [
          { kg: 5, price: 14304, m2: 10 },
          { kg: 20, price: 9520, m2: 40 }
        ]
      }
    }
  });

  await prisma.product.create({
    data: {
      system: 'natture',
      category: 'alapozo',
      type: 'grip',
      name: 'Primacem Grip',
      info: 'Tapadásfokozó adalék',
      options: {
        create: [
          { kg: 5, price: 4338, m2: 20 }
        ]
      }
    }
  });

  // Natture - Mikrocementek
  await prisma.product.create({
    data: {
      system: 'natture',
      category: 'mikrocement',
      type: 'xl',
      name: 'Natture XL',
      info: 'Legnagyobb szemcse, 3 réteg',
      options: {
        create: [
          { kg: 20, price: 2347 }
        ]
      }
    }
  });

  await prisma.product.create({
    data: {
      system: 'natture',
      category: 'mikrocement',
      type: 'l',
      name: 'Natture L',
      info: 'Nagy szemcse, 3 réteg',
      options: {
        create: [
          { kg: 20, price: 2347 }
        ]
      }
    }
  });

  await prisma.product.create({
    data: {
      system: 'natture',
      category: 'mikrocement',
      type: 'm',
      name: 'Natture M',
      info: 'Közepes szemcse, 3 réteg',
      options: {
        create: [
          { kg: 18, price: 2388 }
        ]
      }
    }
  });

  await prisma.product.create({
    data: {
      system: 'natture',
      category: 'mikrocement',
      type: 's',
      name: 'Natture S',
      info: 'Finom szemcse, 3 réteg',
      options: {
        create: [
          { kg: 15, price: 3129 }
        ]
      }
    }
  });

  // Natture - Lakkok
  await prisma.product.create({
    data: {
      system: 'natture',
      category: 'lakk',
      type: 'onecoat',
      name: 'ONE Coat',
      info: 'Egyrétegű lakk, PreSealer-rel együtt használandó',
      options: {
        create: [
          { liters: 1, price: 24190, m2: 16 },
          { liters: 5, price: 23734, m2: 80 }
        ]
      }
    }
  });

  await prisma.product.create({
    data: {
      system: 'natture',
      category: 'lakk',
      type: 'dragon',
      name: 'Dragon',
      info: 'Prémium minőség, PreSealer-rel együtt használandó',
      options: {
        create: [
          { liters: 4, price: 105930, m2: 53 }
        ]
      }
    }
  });

  await prisma.product.create({
    data: {
      system: 'natture',
      category: 'lakk',
      type: 'top100',
      name: 'TOP 100',
      info: 'Kétrétegű lakk, PreSealer nélkül',
      options: {
        create: [
          { liters: 1, price: 39360, m2: 14 },
          { liters: 5, price: 36930, m2: 71 }
        ]
      }
    }
  });

  console.log('✅ Natture termékek feltöltve!');

  // ============================================
  // EFFECTO QUARTZ RENDSZER
  // ============================================
  
  console.log('📦 Effecto Quartz termékek feltöltése...');

  // Effecto Quartz - Alapozók
  await prisma.product.create({
    data: {
      system: 'effectoQuartz',
      category: 'alapozo',
      type: 'abs',
      name: 'Primacem ABS',
      info: 'Univerzális alapozó',
      options: {
        create: [
          { kg: 5, price: 4178, m2: 50 }
        ]
      }
    }
  });

  await prisma.product.create({
    data: {
      system: 'effectoQuartz',
      category: 'alapozo',
      type: 'plusz',
      name: 'Primacem Plusz',
      info: 'Erősebb tapadás',
      options: {
        create: [
          { kg: 5, price: 5608, m2: 50 }
        ]
      }
    }
  });

  // Effecto Quartz - Padló Mikrocementek
  await prisma.product.create({
    data: {
      system: 'effectoQuartz',
      category: 'mikrocement',
      type: 'super',
      name: 'Super grain',
      info: 'Padló - 2 réteg',
      options: {
        create: [
          { kg: 20, price: 2620 }
        ]
      }
    }
  });

  await prisma.product.create({
    data: {
      system: 'effectoQuartz',
      category: 'mikrocement',
      type: 'medium',
      name: 'Medium grain',
      info: 'Padló - 1 réteg',
      options: {
        create: [
          { kg: 20, price: 2620 }
        ]
      }
    }
  });

  // Effecto Quartz - Fal Mikrocementek
  await prisma.product.create({
    data: {
      system: 'effectoQuartz',
      category: 'mikrocement',
      type: 'big',
      name: 'Big grain',
      info: 'Fal - durva szemcse',
      options: {
        create: [
          { kg: 20, price: 2620 }
        ]
      }
    }
  });

  await prisma.product.create({
    data: {
      system: 'effectoQuartz',
      category: 'mikrocement',
      type: 'small',
      name: 'Small grain',
      info: 'Fal - finom szemcse',
      options: {
        create: [
          { kg: 20, price: 2620 }
        ]
      }
    }
  });

  // Effecto Quartz - Lakkok
  await prisma.product.create({
    data: {
      system: 'effectoQuartz',
      category: 'lakk',
      type: 'presealer',
      name: 'PreSealer',
      info: 'Alapozó lakk',
      options: {
        create: [
          { liters: 5, price: 10916, m2: 50 }
        ]
      }
    }
  });

  await prisma.product.create({
    data: {
      system: 'effectoQuartz',
      category: 'lakk',
      type: 'topsealer',
      name: 'TopSealer',
      info: 'Végső lakk',
      options: {
        create: [
          { liters: 5, price: 23734, m2: 80 }
        ]
      }
    }
  });

  console.log('✅ Effecto Quartz termékek feltöltve!');

  // ============================================
  // EFFECTO PU RENDSZER
  // ============================================
  
  console.log('📦 Effecto PU termékek feltöltése...');

  // Effecto PU - Alapozók
  await prisma.product.create({
    data: {
      system: 'effectoPU',
      category: 'alapozo',
      type: 'abs',
      name: 'Primacem ABS',
      info: 'Univerzális alapozó',
      options: {
        create: [
          { kg: 5, price: 4178, m2: 50 }
        ]
      }
    }
  });

  await prisma.product.create({
    data: {
      system: 'effectoPU',
      category: 'alapozo',
      type: 'barrier',
      name: 'Primapox 100 Barrier',
      info: '2 komponensű, vízálló',
      options: {
        create: [
          { kg: 20, price: 9520, m2: 40 }
        ]
      }
    }
  });

  // Effecto PU - Mikrocementek
  await prisma.product.create({
    data: {
      system: 'effectoPU',
      category: 'mikrocement',
      type: 'big',
      name: 'PU Big',
      info: 'Nagy szemcse, 3 réteg',
      options: {
        create: [
          { kg: 20, price: 3870 }
        ]
      }
    }
  });

  await prisma.product.create({
    data: {
      system: 'effectoPU',
      category: 'mikrocement',
      type: 'medium',
      name: 'PU Medium',
      info: 'Közepes szemcse, 3 réteg',
      options: {
        create: [
          { kg: 20, price: 3870 }
        ]
      }
    }
  });

  await prisma.product.create({
    data: {
      system: 'effectoPU',
      category: 'mikrocement',
      type: 'small',
      name: 'PU Small',
      info: 'Finom szemcse, 3 réteg',
      options: {
        create: [
          { kg: 20, price: 3870 }
        ]
      }
    }
  });

  // Effecto PU - Lakkok
  await prisma.product.create({
    data: {
      system: 'effectoPU',
      category: 'lakk',
      type: 'pu',
      name: 'PU Lakk',
      info: '2 komponensű PU lakk',
      options: {
        create: [
          { liters: 6, price: 53700, m2: 72 }
        ]
      }
    }
  });

  console.log('✅ Effecto PU termékek feltöltve!');

  // ============================================
  // POOL RENDSZER
  // ============================================
  
  console.log('📦 Pool termékek feltöltése...');

  // Pool - Alapozó
  await prisma.product.create({
    data: {
      system: 'pool',
      category: 'alapozo',
      type: 'arcicem',
      name: 'Arcicem Alapozó',
      info: 'Medencékhez',
      options: {
        create: [
          { kg: 20, price: 6370, m2: 50 }
        ]
      }
    }
  });

  // Pool - Mikrocementek
  await prisma.product.create({
    data: {
      system: 'pool',
      category: 'mikrocement',
      type: 'xxl',
      name: 'Aquaciment XXL',
      info: '2 réteg',
      options: {
        create: [
          { kg: 18, price: 5920 }
        ]
      }
    }
  });

  await prisma.product.create({
    data: {
      system: 'pool',
      category: 'mikrocement',
      type: 'xl',
      name: 'Aquaciment XL',
      info: '1 réteg',
      options: {
        create: [
          { kg: 18, price: 5920 }
        ]
      }
    }
  });

  // Pool - B komponens (gyanta)
  await prisma.product.create({
    data: {
      system: 'pool',
      category: 'gyanta',
      type: 'bkomp',
      name: 'B komponens',
      info: 'Kötőanyag',
      options: {
        create: [
          { liters: 10, price: 11680 },
          { liters: 25, price: 11200 }
        ]
      }
    }
  });

  // Pool - Lakkok
  await prisma.product.create({
    data: {
      system: 'pool',
      category: 'lakk',
      type: 'wt',
      name: 'Water Top',
      info: 'Medence lakk',
      options: {
        create: [
          { liters: 5, price: 31260, m2: 30 }
        ]
      }
    }
  });

  console.log('✅ Pool termékek feltöltve!');

  console.log('🎉 Minden rendszer adatbázisba töltve!');
}

main()
  .catch((e) => {
    console.error('❌ Hiba történt:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });