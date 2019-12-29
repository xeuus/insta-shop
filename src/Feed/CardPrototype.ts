
export interface Comment {
  username: string;
  message: string;

}

export interface CardPrototype {
  id: string;
  username: string;
  title: string;
  ratio: number;
  createdDate: string;
  src: string;
  avatar: string;
  totalLikes: number;
  totalComments: number;
  comments: Comment[]
}
