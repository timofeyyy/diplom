import { TokenStatus } from "src/enum";

export class TokenResult {
    status: TokenStatus
    tracking: SessionTracking | undefined
    constructor(status: TokenStatus, tracking: SessionTracking | undefined) {
        this.status = status
        this.tracking = tracking
    }
}

export class SessionTracking {
    from: string
    to: string | undefined
    constructor(from: string, to: string | undefined) {
        this.from = from
        this.to = to
    }
}



export class TokenResponse {
    result: TokenResult | undefined
    error: Error | undefined
     constructor(result: TokenResult | undefined, error: Error | undefined) {
        this.result = result
        this.error = error
    }
}

export class TokenRecord {
    _id: string | undefined
    data: any
}