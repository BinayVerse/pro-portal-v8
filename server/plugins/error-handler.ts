import type { CapturedErrorContext } from 'nitropack';
import { CustomError } from '../utils/custom.error';

class ExtendedError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, ExtendedError.prototype);
    }
}

export default defineNitroPlugin((nitroApp) => {
    nitroApp.hooks.hook('error', (error: any, context: CapturedErrorContext) => {
        const { event } = context;

        if (event && event.node.res) {
            let statusCode = 500;
            let message = 'Internal Server Error';

            if (error instanceof CustomError || error instanceof ExtendedError) {
                statusCode = error.statusCode || 500;
                message = error.message || 'An error occurred';
            } else if (error instanceof Error) {
                statusCode = (error as any).statusCode || 500;
                message = error.message || 'An unknown error occurred';
            } else {
                console.error('Unhandled non-error object:', error);
                message = 'An unknown error occurred';
            }

            console.error(`[Nuxt Error]: ${message}, StatusCode: ${statusCode}`);

            event.node.res.statusCode = statusCode;
            event.node.res.setHeader('Content-Type', 'application/json');
            event.node.res.end(
                JSON.stringify({
                    status: 'error',
                    message,
                })
            );
        } else {
            console.error('Error occurred without H3Event context:', error);
        }
    });
});
