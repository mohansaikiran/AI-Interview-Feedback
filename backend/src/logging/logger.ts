// ...new file...
export const logger = {
  info: (message: string, meta?: Record<string, any>) => {
    try { console.log(JSON.stringify({ ts: new Date().toISOString(), level: 'info', message, ...meta })); } catch (e) { console.log(message, meta); }
  },
  warn: (message: string, meta?: Record<string, any>) => {
    try { console.warn(JSON.stringify({ ts: new Date().toISOString(), level: 'warn', message, ...meta })); } catch (e) { console.warn(message, meta); }
  },
  error: (message: string, meta?: Record<string, any>) => {
    try { console.error(JSON.stringify({ ts: new Date().toISOString(), level: 'error', message, ...meta })); } catch (e) { console.error(message, meta); }
  },
  debug: (message: string, meta?: Record<string, any>) => {
    try { console.debug(JSON.stringify({ ts: new Date().toISOString(), level: 'debug', message, ...meta })); } catch (e) { console.debug(message, meta); }
  },
};
