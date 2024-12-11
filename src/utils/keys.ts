const getBaseURL = (NODE_ENV: string | undefined) => {
    switch (NODE_ENV) {
        case 'prod':
            return 'https://agent-backend-lv9j.onrender.com';

        case 'staging':
            return 'https://agent-backend-lv9j.onrender.com';

        case 'dev':
            return 'http://localhost:4500';

        default: return 'http://localhost:4500';
    }
};

export const API_URL = getBaseURL(process.env.NEXT_PUBLIC_NODE_ENV);