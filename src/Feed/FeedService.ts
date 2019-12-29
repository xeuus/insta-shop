import {Autowired, Observable, Service} from "coreact";
import {CardPrototype} from "./CardPrototype";
import {Networking} from "Services/Networking";

@Service
export class FeedService {
  private networking = Autowired(Networking, this);

  @Observable list: CardPrototype[] = [];

  async loadMore() {
    let lastTime = null;
    if (this.list.length > 0) {
      lastTime = this.list[this.list.length - 1].createdDate;
    }
    const response = await this.networking.POST<CardPrototype[]>('/feed/list', {lastTime});
    if (response.payload.length > 0) {
      this.list = [
        ...this.list,
        ...response.payload,
      ];
      return true
    }
    return false;
  }
}