import {Observable, range, RequestContext, Service} from "coreact";
import {CardPrototype} from "Services/CardPrototype";

@Service
export class FeedService {

  @Observable
  list: CardPrototype[] = [];

  counter: number = 0;
  images: string[];
  messages: string[];
  names: string[];
  avatar: string;
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
    this.avatar = prefix + '/temp.png';
    this.images = [
      prefix + '/img1.jpg',
      prefix + '/img2.jpg',
      prefix + '/img3.jpg',
      prefix + '/img4.jpg',
      prefix + '/img5.jpg',
      prefix + '/img6.jpg',
      prefix + '/img7.jpg',
      prefix + '/img8.jpg',
    ];
  }


  async loadMore(){
    await new Promise(a => setTimeout(a, 100));
    return range(100).map<CardPrototype>((a) => {
      const id = Math.floor(Math.random() * this.images.length);
      const card: CardPrototype = {
        id: this.counter,
        images: [`https://picsum.photos/100/${100 + Math.floor(Math.random()*300)}/?cached=${this.counter}`],
        saved: false,
        liked: false,
        username: this.names[id],
        avatar: `https://picsum.photos/50/50?cached=${this.counter}`,
        totalLikes: Math.floor(Math.random() * 100 + 4),
        totalComments: Math.floor(Math.random() * 400 + 4),
        comments: range(Math.floor(Math.random()*4)).map(i => ({message: this.messages[Math.floor(Math.random() * this.messages.length)], username: this.names[Math.floor(Math.random() * this.names.length)]})),
        createdDate: new Date(Date.now() - (Math.random() * 6 * 86400000)).toISOString(),
      };
      this.counter ++;
      return card;
    });
  }
}