
export interface Comment {
  username: string;
  message: string;

}

export interface CardPrototype {
  id: string;
  title: string;
  liked: boolean;
  saved: boolean;
  username: string;
  avatar: string;
  totalLikes: number;
  totalComments: number;
  ratio: number;
  comments: Comment[];
  images: string[];
  createdDate: string;
}
