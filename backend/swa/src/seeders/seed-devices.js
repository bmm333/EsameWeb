import { DataSource } from 'typeorm';
import { RfidDevice } from '../rfid/entities/rfid-device.entity.js';
import { dataSourceOptions } from '../../database.config.js';

export async function seedDummyDevices() {
  // Use the same database configuration as the main app
  const dataSource = new DataSource({
    ...dataSourceOptions,
    synchronize: false, // Don't synchronize, just connect
  });

  await dataSource.initialize();
  
  const deviceRepository = dataSource.getRepository(RfidDevice);
  
  const devices = [
    { 
      serialNumber: '0001', 
      deviceName: 'Smart Wardrobe Pi #1', 
      status: 'unregistered', 
      firmwareVersion: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    { 
      serialNumber: '0002', 
      deviceName: 'Smart Wardrobe Pi #2', 
      status: 'unregistered', 
      firmwareVersion: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    { 
      serialNumber: '0003', 
      deviceName: 'Smart Wardrobe Pi #3', 
      status: 'unregistered', 
      firmwareVersion: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  for (const deviceData of devices) {
    const existing = await deviceRepository.findOne({ where: { serialNumber: deviceData.serialNumber } });
    if (!existing) {
      await deviceRepository.save(deviceData);
      console.log(`Seeded device: ${deviceData.serialNumber}`);
    } else {
      console.log(`Device ${deviceData.serialNumber} already exists`);
    }
  }
  
  await dataSource.destroy();
  console.log('Seeding completed successfully!');
}

// If running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDummyDevices().catch(console.error);
}