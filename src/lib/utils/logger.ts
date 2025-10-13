/**
 * Hook para logging detallado en desarrollo
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export class Logger {
  private static formatTime(): string {
    const now = new Date();
    return now.toLocaleTimeString('es-CO', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  }

  static log(category: string, message: string, data?: unknown): void {
    if (!isDevelopment) return;
    
    const time = this.formatTime();
    console.log(`[${time}] 📝 ${category} - ${message}`, data || '');
  }

  static error(category: string, message: string, error?: unknown): void {
    if (!isDevelopment) return;
    
    const time = this.formatTime();
    console.error(`[${time}] ❌ ${category} - ${message}`, error || '');
  }

  static warn(category: string, message: string, data?: unknown): void {
    if (!isDevelopment) return;
    
    const time = this.formatTime();
    console.warn(`[${time}] ⚠️  ${category} - ${message}`, data || '');
  }

  static success(category: string, message: string, data?: unknown): void {
    if (!isDevelopment) return;
    
    const time = this.formatTime();
    console.log(`[${time}] ✅ ${category} - ${message}`, data || '');
  }

  static info(category: string, message: string, data?: unknown): void {
    if (!isDevelopment) return;
    
    const time = this.formatTime();
    console.info(`[${time}] ℹ️  ${category} - ${message}`, data || '');
  }

  static debug(category: string, message: string, data?: unknown): void {
    if (!isDevelopment) return;
    
    const time = this.formatTime();
    console.debug(`[${time}] 🐛 ${category} - ${message}`, data || '');
  }

  static api(method: string, url: string, status?: number, data?: unknown): void {
    if (!isDevelopment) return;
    
    const time = this.formatTime();
    const emoji = status && status < 400 ? '📡' : '❌';
    console.log(`[${time}] ${emoji} API ${method} ${url}${status ? ` - ${status}` : ''}`, data || '');
  }

  static group(label: string): void {
    if (!isDevelopment) return;
    console.group(`🔽 ${label}`);
  }

  static groupEnd(): void {
    if (!isDevelopment) return;
    console.groupEnd();
  }
}
