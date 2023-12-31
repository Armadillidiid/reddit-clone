"use client";

import { INFINITE_SCROLL_PAGINATION_RESULTS } from "@/config";
import { ExtendedPost } from "@/types/db";
import { useIntersection } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { FC, useEffect } from "react";
import Post from "./Post";
import { Session } from "next-auth";

interface PostFeedProps {
  initialPosts: ExtendedPost[];
  subredditName?: string;
  session: Session | null;
}

const PostFeed: FC<PostFeedProps> = ({
  initialPosts,
  subredditName,
  session,
}) => {
  const { ref, entry } = useIntersection({
    root: null,
    threshold: 1,
  });

  const { data, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["infinite-query"],
      queryFn: async ({ pageParam }) => {
        const query =
          `/api/posts?limit=${INFINITE_SCROLL_PAGINATION_RESULTS}&lastCursor=${pageParam ?? ""}` +
          (!!subredditName ? `&subredditName=${subredditName}` : "");

        const { data } = await axios.get(query);
        return data as {
          data: ExtendedPost[];
          meta: { lastCursor: number | null; hasNextPage: boolean };
        };
      },
      getNextPageParam: (lastPage) => lastPage?.meta.lastCursor ?? null,
      initialData: {
        pages: [
          { data: initialPosts, meta: { lastCursor: null, hasNextPage: true } },
        ],
        pageParams: [""],
      },
    });

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage) {
      fetchNextPage(); // Load more posts when the last post comes into view
    }
  }, [entry, fetchNextPage, hasNextPage]);

  const posts = data?.pages.flatMap((page) => page.data) ?? initialPosts;

  return (
    <ul className="flex flex-col col-span-2 space-y-6">
      {posts.map((post, index) => {
        const votesAmt = post.votes.reduce((acc, vote) => {
          if (vote.type === "UP") return acc + 1;
          if (vote.type === "DOWN") return acc - 1;
          return acc;
        }, 0);

        const currentVote = post.votes.find(
          (vote) => vote.userId === session?.user.id,
        );

        if (index === posts.length - 1) {
          // Add a ref to the last post in the list
          return (
            <li key={post.id} ref={ref}>
              <Post
                post={post}
                commentAmt={post.comments.length}
                subredditName={post.subreddit.name}
                votesAmt={votesAmt}
                currentVote={currentVote}
              />
            </li>
          );
        } else {
          return (
            <Post
              key={post.id}
              post={post}
              commentAmt={post.comments.length}
              subredditName={post.subreddit.name}
              votesAmt={votesAmt}
              currentVote={currentVote}
            />
          );
        }
      })}

      {isFetchingNextPage && (
        <li className="flex justify-center">
          <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
        </li>
      )}
    </ul>
  );
};

export default PostFeed;
