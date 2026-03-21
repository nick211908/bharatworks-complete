import morgan from 'morgan';
import logger from '../utils/logger';

// Pipe Morgan HTTP logs through Winston
const stream = {
    write: (message: string) => {
        logger.http(message.trim());
    },
};

// Skip logging in test environment
const skip = () => process.env.NODE_ENV === 'test';

const requestLogger = morgan(
    ':method :url :status :res[content-length] - :response-time ms',
    { stream, skip }
);

export default requestLogger;
