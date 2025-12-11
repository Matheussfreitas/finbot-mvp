export enum LogLevel {
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
    DEBUG = 'DEBUG'
}

class Logger {
    private getTimestamp(): string {
        return new Date().toISOString();
    }

    private formatMessage(level: LogLevel, context: string, message: string, meta?: any): string {
        const timestamp = this.getTimestamp();
        let formattedMeta = '';
        if (meta) {
            try {
                formattedMeta = typeof meta === 'object' ? `\n${JSON.stringify(meta, null, 2)}` : ` ${meta}`;
            } catch (e) {
                formattedMeta = ' [Circular/Unserializable]';
            }
        }
        return `[${timestamp}] [${level}] [${context}] ${message}${formattedMeta}`;
    }

    public info(context: string, message: string, meta?: any) {
        console.log(this.formatMessage(LogLevel.INFO, context, message, meta));
    }

    public warn(context: string, message: string, meta?: any) {
        console.warn(this.formatMessage(LogLevel.WARN, context, message, meta));
    }

    public error(context: string, message: string, meta?: any) {
        console.error(this.formatMessage(LogLevel.ERROR, context, message, meta));
    }

    public debug(context: string, message: string, meta?: any) {
        // You can toggle debug logs with an environment variable if needed
        console.debug(this.formatMessage(LogLevel.DEBUG, context, message, meta));
    }
}

export const logger = new Logger();
