import type { CapturedErrorContext } from 'nitropack';
import { CustomError } from '../utils/custom.error';

// Completely disabled error handler to fix body stream conflicts
export default defineNitroPlugin((nitroApp) => {
    console.log('Error handler disabled to prevent response body conflicts');
});
