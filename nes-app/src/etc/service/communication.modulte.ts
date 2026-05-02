import { Global, Module } from "@nestjs/common";
import { CommunicationBehaivorService } from "./communication.behaivor.service";
import { CommunicationService } from "./communication.service";

@Global()
@Module({
  providers: [CommunicationBehaivorService, CommunicationService],
  exports: [CommunicationBehaivorService, CommunicationService]
})
export class CommunicationModule {}