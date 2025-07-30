const axios = require('axios');

const LOG_API_URL = 'http://20.244.56.144/evaluation-service/logs';
const AUTH_API_URL = 'http://20.244.56.144/evaluation-service/auth';

const CLIENT_ID = 'c8fee2df-e0f5-4a38-994d-60a38b33a94b';
const CLIENT_SECRET = 'AxmCzqVMgBMHGCSZ';
const ACCESS_CODE = 'qxRMwq';
const EMAIL = '22pa1a4240@vishnu.edu.in';
const NAME = 'ASREETHASREEJA5';
const ROLL_NO = '22pa1a4240';


let currentAuthToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiIyMnBhMWE0MjQwQHZpc2hudS5lZHUuaW4iLCJleHAiOjE3NTM4NTc4ODcsImlhdCI6MTc1Mzg1Njk4NywiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6ImEyNDA1ZmYwLTYyMmUtNGI5ZC05NTVhLTRkMmIzODQ1NGM0MSIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6ImdvbGxhIGFzcmVldGhhIHNyZWVqYSIsInN1YiI6ImM4ZmVlMmRmLWUwZjUtNGEzOC05OTRkLTYwYTM4YjMzYTk0YiJ9LCJlbWFpbCI6IjIycGExYTQyNDBAdmlzaG51LmVkdS5pbiIsIm5hbWUiOiJnb2xsYSBhc3JlZXRoYSBzcmVlamEiLCJyb2xsTm8iOiIyMnBhMWE0MjQwIiwiYWNjZXNzQ29kZSI6InF4Uk13cSIsImNsaWVudElEIjoiYzhmZWUyZGYtZTBmNS00YTM4LTk5NGQtNjBhMzhiMzNhOTRiIiwiY2xpZW50U2VjcmV0IjoiQXhtQ3pxVk1nQk1IR0NTWiJ9.vlyUTk9KjsDtlwOjYEfIK7y73a0gSSM0WmAJxAsWoMY';

const packageConstraints = {
    backend: ['cache', 'controller', 'cron_job', 'db', 'domain', 'handler', 'repository', 'route', 'service'],
    frontend: ['api', 'component', 'hook', 'page', 'state', 'style'],
    both: ['auth', 'config', 'middleware', 'utils']
};

async function fetchNewAuthToken() {
    try {
        const response = await axios.post(AUTH_API_URL, {
            email: EMAIL,
            name: NAME,
            rollNo: ROLL_NO,
            accessCode: ACCESS_CODE,
            clientID: CLIENT_ID,
            clientSecret: CLIENT_SECRET
        });
        currentAuthToken = response.data.access_token;
        return currentAuthToken;
    } catch (error) {
        console.error('Authentication token retrieval failed:', error.message);
        throw new Error('Authentication failed');
    }
}

async function logMessage(stack, level, packageName, message, retries = 3) {
    if (!['backend', 'frontend'].includes(stack)) {
        console.error('Invalid stack provided.');
        return;
    }
    if (!['debug', 'info', 'warn', 'error', 'fatal'].includes(level)) {
        console.error('Invalid log level provided.');
        return;
    }

    const isValidPackage = (stack === 'backend' && packageConstraints.backend.includes(packageName)) ||
                           (stack === 'frontend' && packageConstraints.frontend.includes(packageName)) ||
                           packageConstraints.both.includes(packageName);

    if (!isValidPackage) {
        console.error(`Invalid package name "${packageName}" for stack "${stack}".`);
        return;
    }

    try {
        if (!currentAuthToken) {
            await fetchNewAuthToken();
        }

        await axios.post(LOG_API_URL, {
            stack,
            level,
            package: packageName,
            message
        }, {
            headers: {
                'Authorization': `Bearer ${currentAuthToken}`
            }
        });
    } catch (error) {
        if (retries > 0 && error.response && error.response.status === 401) {
            console.warn('Log API call unauthorized. Attempting token refresh and retry.');
            currentAuthToken = null;
            return logMessage(stack, level, packageName, message, retries - 1);
        }
        console.error(`Failed to send log after ${3 - retries} retries:`, error.message);
        console.error(`FALLBACK LOG: [${stack}][${level}][${packageName}] ${message}`);
    }
}

module.exports = logMessage;
