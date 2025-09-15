export function generateDeviceId(): string {
  // Try to get existing device ID from localStorage
  const existing = localStorage.getItem('omari-device-id');
  if (existing) {
    return existing;
  }

  // Generate new device ID
  const prefix = 'OMARI';
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  const deviceId = `${prefix}-${timestamp}-${random}`;

  // Store in localStorage
  localStorage.setItem('omari-device-id', deviceId);
  
  return deviceId;
}

export function getDeviceId(): string {
  return localStorage.getItem('omari-device-id') || generateDeviceId();
}
