// config.js
const configurations = {
    development: {
        API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
        WEBSOCKET_URL: process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:8000/ws' // Add WebSocket URL
    },
    production: {
        API_BASE_URL: process.env.REACT_APP_API_URL || 'http://172.16.117.87:8000',
        WEBSOCKET_URL: process.env.REACT_APP_WEBSOCKET_URL || 'ws://172.16.117.87:8000/ws' // Add WebSocket URL
    }
};

const env = process.env.NODE_ENV || 'development';
const config = configurations[env];

// Fallback logic
if (!config.API_BASE_URL) {
    config.API_BASE_URL = configurations[env].API_BASE_URL;
}

if (!config.WEBSOCKET_URL) {  // Fallback for websocket URL
    config.WEBSOCKET_URL = configurations[env].WEBSOCKET_URL;
}

export default config;