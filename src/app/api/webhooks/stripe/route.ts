import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    // Verify webhook signature
    if (!signature) {
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 400 }
      );
    }

    const event = JSON.parse(body);

    // Store the webhook event
    const webhookEvent = await prisma.stripeWebhookEvent.create({
      data: {
        type: event.type,
        data: event,
        signature,
      },
    });

    // Handle the event
    try {
      switch (event.type) {
        case "checkout.session.completed":
          const session = event.data.object;
          const customerEmail = session.customer_details.email;

          if (customerEmail) {
            // Update user's premium status
            await prisma.user.update({
              where: {
                email: customerEmail,
              },
              data: {
                isPremium: true,
              },
            });
          }
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      // Update webhook event status
      await prisma.stripeWebhookEvent.update({
        where: { id: webhookEvent.id },
        data: { status: "processed" },
      });
    } catch (error) {
      // Update webhook event with error
      await prisma.stripeWebhookEvent.update({
        where: { id: webhookEvent.id },
        data: { 
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
        },
      });
      throw error; // Re-throw to be caught by outer try-catch
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Stripe webhook error:", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
} 