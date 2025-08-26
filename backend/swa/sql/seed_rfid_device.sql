BEGIN;
-- the backend will generate the apiKey later, so im leaving it NULL
INSERT INTO rfid_devices (
  serialNumber,
  apiKey,
  deviceName,
  status,
  scanInterval,
  powerSavingMode,
  createdAt,
  updatedAt
)
SELECT
  '00000000',  --Raspberry pi serial ill check it later
  NULL,
  'Demo Pi Zero W2',
  'unregistered',
  60,
  false,
  now(),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM rfid_devices WHERE serialNumber = '00000000'
);
COMMIT;