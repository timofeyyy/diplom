import { TokenStatus } from "src/enum"

export class JWTRequest {
    id: string
}
export class VerifyTokenResponse {
    status: TokenStatus
    regDate: string | undefined
}