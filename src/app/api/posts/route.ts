import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const session = await getAuthSession();

  let followedCommunitiesIds: string[] = [];

  if (session) {
    const followedCommunities = await db.subscription.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        subreddit: true,
      },
    });

    followedCommunitiesIds = followedCommunities.map((sub) => sub.subreddit.id);
  }

  try {
    const { limit, lastCursor, subredditName } = z
      .object({
        limit: z.string(),
        subredditName: z.string().nullish().optional(),
        lastCursor: z.string().nullish().optional(),
      })
      .parse({
        subredditName: url.searchParams.get("subredditName"),
        limit: url.searchParams.get("limit"),
        lastCursor: url.searchParams.get("lastCursor"),
      });

    let whereClause = {};

    if (subredditName) {
      whereClause = {
        subreddit: {
          name: subredditName,
        },
      };
    } else if (session) {
      whereClause = {
        subreddit: {
          id: {
            in: followedCommunitiesIds,
          },
        },
      };
    }

    // cursor based pagination
    let posts = await db.post.findMany({
      take: parseInt(limit) ?? 10,
      ...(lastCursor?.length && {
        skip: 1, // Do not include the cursor itself in the query result.
        cursor: {
          id: lastCursor,
        },
      }),
      orderBy: {
        createdAt: "desc",
      },
      include: {
        subreddit: true,
        votes: true,
        author: true,
        comments: true,
      },
      where: whereClause,
    });

    if (posts.length === 0) {
      return new Response(
        JSON.stringify({
          data: [],
          meta: {
            lastCursor: null,
            hasNextPage: false,
          },
        }),
        { status: 200 },
      );
    }

    const lastPostInResults = posts[posts.length - 1];
    const cursor = lastPostInResults.id;

    const nextPosts = await db.post.findMany({
      take: parseInt(limit) ?? 10,
      skip: 1,
      cursor: {
        id: cursor,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        subreddit: true,
        votes: true,
        author: true,
        comments: true,
      },
      where: whereClause,
    });

    return new Response(
      JSON.stringify({
        data: posts,
        meta: { lastCursor: cursor, hasNextPage: nextPosts.length > 0 },
      }),
      {
        status: 200,
      },
    );
  } catch (error) {
    return new Response("Could not fetch posts", { status: 500 });
  }
}
