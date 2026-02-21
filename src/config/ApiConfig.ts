export const API_CONFIG = {
    BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8181/api',
    KEYCLOAK_URL: process.env.REACT_APP_KEYCLOAK_URL || 'http://localhost:9090/realms/poctime-app/protocol/openid-connect/token',
    KEYCLOAK_CLIENT_ID: process.env.REACT_APP_KEYCLOAK_CLIENT_ID || 'api-backend',
    KEYCLOAK_CLIENT_SECRET: process.env.REACT_APP_KEYCLOAK_CLIENT_SECRET || 'uc87VVWr9Um4w2nVJk20gTUfxMFaFFNp',
    ROWS_PER_PAGE: 7
};
