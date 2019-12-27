import {Observable, range, RequestContext, Service} from "coreact";
import {Card} from "./Card";

@Service
export class FeedService {

  @Observable
  list: Card[] = [];

  counter: number = 0;
  images: string[];
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
    return range(2500).map<Card>((a) => {
      const id = this.counter % this.images.length;
      const card: Card = {
        id: this.counter,
        images: [this.images[id]],
        saved: false,
        liked: false,
        username: this.names[id],
        avatar: this.avatar,
        totalLikes: Math.floor(Math.random() * 1000000 + 4),
        totalComments: Math.floor(Math.random() * 1000000 + 4),
        comments: [],
        createdDate: new Date(Date.now() - (Math.random() * 6 * 86400000)).toISOString(),
      };
      this.counter ++;
      return card;
    });
  }
}