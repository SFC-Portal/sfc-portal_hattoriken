// SNS (Social Network) types

export interface Post {
  id: string;
  authorId: string;
  author: PostAuthor;
  content: string;
  images?: string[];
  tags?: string[];
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PostAuthor {
  id: string;
  displayName: string;
  avatarUrl?: string;
  faculty?: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author: PostAuthor;
  content: string;
  likesCount: number;
  isLiked: boolean;
  createdAt: string;
}

export interface PostCreateInput {
  content: string;
  images?: string[];
  tags?: string[];
}

export interface CommentCreateInput {
  content: string;
}

export interface PostFilters {
  authorId?: string;
  tag?: string;
  following?: boolean;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}
