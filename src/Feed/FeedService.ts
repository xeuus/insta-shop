import {Autowired, Observable, range, RequestContext, Service} from "coreact";
import {CardPrototype} from "./CardPrototype";
import {Networking} from "Services/Networking";

@Service
export class FeedService {
  private networking = Autowired(Networking, this);
  @Observable
  list: CardPrototype[] = [];

  counter: number = 0;
  messages: string[];
  names: string[];
  constructor(context?: RequestContext) {
    const prefix = context.baseUrl + '/assets';
    this.names = [
      'kodvlpr',
      'jake80',
      'holasius',
      'makaruni',
      'jakenutli',
      'annebis',
      'tonaris',
      'johncena',
    ];
    this.messages = [
      'thats nice',
      'epic!',
      'so lovely, i wanna grab it.',
      'roses are red, blossoms are blue',
      'keep going',
      'such a nice picture',
      'that\'s amazing!',
      'keeps postinng like this.',
    ];
  }


  async loadMore(){
    const response = await this.networking.GET<{
      id: string;
      username: string;
      title: string;
      ratio: number;
      createdDate: string;
      src: string;
    }[]>('/feed/list');

    return response.payload.map<CardPrototype>((a) => {
      const card: CardPrototype = {
        id: a.id,
        title: a.title,
        images: [a.src],
        saved: false,
        liked: false,
        ratio: a.ratio,
        username: a.username,
        avatar: `https://picsum.photos/50/50?cached=${this.counter}`,
        totalLikes: Math.floor(Math.random() * 100 + 4),
        totalComments: Math.floor(Math.random() * 400 + 4),
        comments: range(Math.floor(Math.random()*4)).map(i => ({message: this.messages[Math.floor(Math.random() * this.messages.length)], username: this.names[Math.floor(Math.random() * this.names.length)]})),
        createdDate: a.createdDate,
      };
      this.counter ++;
      return card;
    });
  }
}