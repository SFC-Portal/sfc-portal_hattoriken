import { apiClient } from "./client";
import type { Post, PostCreateInput, Comment, CommentCreateInput, PostFilters, Follow } from "@/types/sns";
import type { PaginatedResponse } from "@/types/common";

// Posts
export async function getPosts(
  filters?: PostFilters,
  page = 1,
  limit = 20
): Promise<PaginatedResponse<Post>> {
  const { data } = await apiClient.get("/sns/posts", {
    params: { ...filters, page, limit },
  });
  return data;
}

export async function getPost(id: string): Promise<Post> {
  const { data } = await apiClient.get(`/sns/posts/${id}`);
  return data;
}

export async function createPost(input: PostCreateInput): Promise<Post> {
  const { data } = await apiClient.post("/sns/posts", input);
  return data;
}

export async function deletePost(id: string): Promise<void> {
  await apiClient.delete(`/sns/posts/${id}`);
}

export async function likePost(id: string): Promise<void> {
  await apiClient.post(`/sns/posts/${id}/like`);
}

export async function unlikePost(id: string): Promise<void> {
  await apiClient.delete(`/sns/posts/${id}/like`);
}

// Comments
export async function getComments(
  postId: string,
  page = 1,
  limit = 20
): Promise<PaginatedResponse<Comment>> {
  const { data } = await apiClient.get(`/sns/posts/${postId}/comments`, {
    params: { page, limit },
  });
  return data;
}

export async function createComment(
  postId: string,
  input: CommentCreateInput
): Promise<Comment> {
  const { data } = await apiClient.post(`/sns/posts/${postId}/comments`, input);
  return data;
}

export async function deleteComment(postId: string, commentId: string): Promise<void> {
  await apiClient.delete(`/sns/posts/${postId}/comments/${commentId}`);
}

// Follows
export async function followUser(userId: string): Promise<Follow> {
  const { data } = await apiClient.post(`/sns/users/${userId}/follow`);
  return data;
}

export async function unfollowUser(userId: string): Promise<void> {
  await apiClient.delete(`/sns/users/${userId}/follow`);
}

export async function getFollowers(
  userId: string,
  page = 1,
  limit = 20
): Promise<PaginatedResponse<Follow>> {
  const { data } = await apiClient.get(`/sns/users/${userId}/followers`, {
    params: { page, limit },
  });
  return data;
}

export async function getFollowing(
  userId: string,
  page = 1,
  limit = 20
): Promise<PaginatedResponse<Follow>> {
  const { data } = await apiClient.get(`/sns/users/${userId}/following`, {
    params: { page, limit },
  });
  return data;
}
