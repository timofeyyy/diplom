export enum AuthStrategy {
    REFRESH_JWT = "jwt-refresh",
    ACCES_JWT = "jwt-access",
    LOCAL = "local",
    GOOGLE = "google"
}

export enum TokenType {
    REFRESH_TOKEN = "refreshToken",
    ACCES_TOKEN = "accesToken",
    PASSWORD_TOKEN = "passwordToken",
    CONFERENCE_TOKEN = "conferenceTokens"
}

export const tokens_ttl_sec = {
    refreshToken: 60*60,
    accesToken: 10*60,
    passwordToken: 10*60
}