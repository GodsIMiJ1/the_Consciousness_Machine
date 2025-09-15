import { isIP } from 'net';

export interface IPRange {
  network: string;
  prefix: number;
}

/**
 * Parse CIDR notation into network and prefix
 */
export function parseCIDR(cidr: string): IPRange | null {
  const parts = cidr.split('/');
  if (parts.length !== 2) {
    return null;
  }
  
  const network = parts[0];
  const prefix = parseInt(parts[1], 10);
  
  // Validate IP address
  const ipVersion = isIP(network);
  if (ipVersion === 0) {
    return null;
  }
  
  // Validate prefix length
  const maxPrefix = ipVersion === 4 ? 32 : 128;
  if (isNaN(prefix) || prefix < 0 || prefix > maxPrefix) {
    return null;
  }
  
  return { network, prefix };
}

/**
 * Convert IPv4 address to 32-bit integer
 */
function ipv4ToInt(ip: string): number {
  const parts = ip.split('.').map(part => parseInt(part, 10));
  return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
}

/**
 * Convert IPv6 address to BigInt
 */
function ipv6ToBigInt(ip: string): bigint {
  // Expand IPv6 address to full form
  const expanded = expandIPv6(ip);
  const parts = expanded.split(':');
  
  let result = 0n;
  for (let i = 0; i < 8; i++) {
    result = (result << 16n) + BigInt(parseInt(parts[i], 16));
  }
  
  return result;
}

/**
 * Expand IPv6 address to full form
 */
function expandIPv6(ip: string): string {
  // Handle :: notation
  if (ip.includes('::')) {
    const parts = ip.split('::');
    const left = parts[0] ? parts[0].split(':') : [];
    const right = parts[1] ? parts[1].split(':') : [];
    const missing = 8 - left.length - right.length;
    
    const expanded = [
      ...left,
      ...Array(missing).fill('0000'),
      ...right
    ];
    
    return expanded.map(part => part.padStart(4, '0')).join(':');
  }
  
  // Pad each part to 4 characters
  return ip.split(':').map(part => part.padStart(4, '0')).join(':');
}

/**
 * Check if an IP address is within a CIDR range
 */
export function isIPInCIDR(ip: string, cidr: string): boolean {
  const range = parseCIDR(cidr);
  if (!range) {
    return false;
  }
  
  const ipVersion = isIP(ip);
  const networkVersion = isIP(range.network);
  
  // IP versions must match
  if (ipVersion !== networkVersion) {
    return false;
  }
  
  if (ipVersion === 4) {
    return isIPv4InCIDR(ip, range);
  } else if (ipVersion === 6) {
    return isIPv6InCIDR(ip, range);
  }
  
  return false;
}

/**
 * Check if IPv4 address is within CIDR range
 */
function isIPv4InCIDR(ip: string, range: IPRange): boolean {
  const ipInt = ipv4ToInt(ip);
  const networkInt = ipv4ToInt(range.network);
  const mask = (0xFFFFFFFF << (32 - range.prefix)) >>> 0;
  
  return (ipInt & mask) === (networkInt & mask);
}

/**
 * Check if IPv6 address is within CIDR range
 */
function isIPv6InCIDR(ip: string, range: IPRange): boolean {
  const ipBigInt = ipv6ToBigInt(ip);
  const networkBigInt = ipv6ToBigInt(range.network);
  const mask = (0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFn << BigInt(128 - range.prefix));
  
  return (ipBigInt & mask) === (networkBigInt & mask);
}

/**
 * Parse allowlist from environment variable
 */
export function parseAllowlist(allowlistStr: string): string[] {
  if (!allowlistStr || allowlistStr.trim() === '') {
    return [];
  }
  
  return allowlistStr
    .split(',')
    .map(cidr => cidr.trim())
    .filter(cidr => cidr.length > 0);
}

/**
 * Check if IP address is allowed by allowlist
 */
export function isIPAllowed(ip: string, allowlist: string[]): boolean {
  if (allowlist.length === 0) {
    return false; // Deny all if no allowlist configured
  }
  
  // Check if IP matches any CIDR in allowlist
  return allowlist.some(cidr => isIPInCIDR(ip, cidr));
}

/**
 * Middleware factory for IP allowlist checking
 */
export function createAllowlistMiddleware(allowlistEnvVar: string) {
  const allowlist = parseAllowlist(allowlistEnvVar);
  
  return (req: any, res: any, next: any) => {
    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    
    if (!clientIP) {
      return res.status(403).json({
        code: 'omari.forbidden',
        message: 'Unable to determine client IP address',
        request_id: req.headers['x-request-id']
      });
    }
    
    if (!isIPAllowed(clientIP, allowlist)) {
      return res.status(403).json({
        code: 'omari.forbidden',
        message: 'IP address not in allowlist',
        request_id: req.headers['x-request-id']
      });
    }
    
    next();
  };
}
