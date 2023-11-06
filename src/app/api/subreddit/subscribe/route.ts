import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { SubredditSubscriptionValidator } from "@/lib/validators/subreddit";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { subredditId, action } = SubredditSubscriptionValidator.parse(body);

    // check if user has already subscribed to subreddit
    const subscriptionExists = await db.subscription.findFirst({
      where: {
        subredditId,
        userId: session.user.id,
      },
    });

    if (action === "subscribe" && subscriptionExists) {
      return new Response("You've already subscribed to this subreddit", {
        status: 400,
      });
    } else if (action === "unsubscribe" && !subscriptionExists) {
      return new Response(
        "You've not been subscribed to this subreddit, yet.",
        { status: 400 },
      );
    }

    // handle subscription
    if (action === "subscribe") {
      await db.subscription.create({
        data: {
          subredditId,
          userId: session.user.id,
        },
      });
    } else {
      await db.subscription.delete({
        where: {
          userId_subredditId: {
            subredditId,
            userId: session.user.id,
          },
        },
      });
    }

    return new Response(subredditId);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 400 });
    }

    return new Response("Something went wrong. Please try again.", {
      status: 500,
    });
  }
}
