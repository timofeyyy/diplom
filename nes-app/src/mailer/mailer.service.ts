import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendTest(link: string, email: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'VideoConferenceApp',
      text: `Here's your link to subbmit your new password ${link}.\nThe link is active for 10 minutes`,
    });
  }
}
