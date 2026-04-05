export class FromAuthDto {
    email: FieldDto = new FieldDto()
    password: FieldDto = new FieldDto()
    repeatPassword: FieldDto = new FieldDto()
    show!: boolean
    type: 'field' | 'alert' = 'field'
    alertWindow: HttpResponse | undefined
}

export class FieldDto {
    value: string | undefined
    error: string | undefined
}

export interface HttpResponse {
    transcript: string
    message: string,
    statusCode: number,
    body: any
}
