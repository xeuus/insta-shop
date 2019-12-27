
export interface Comment {
  username: string;
  message: string;

}

export interface CardPrototype {
  id: number;
  liked: boolean;
  saved: boolean;
  username: string;
  avatar: string;
  totalLikes: number;
  totalComments: number;
  comments: Comment[];
  images: string[];
  createdDate: string;
}
