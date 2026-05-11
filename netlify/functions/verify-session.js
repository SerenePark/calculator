const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const PRICE_PACK_5 = "price_1TVxEXFvdwbjRSVAwdGPdqgk";
const PRICE_MONTHLY = "price_1TVxG3FvdwbjRSVAf6no1Tx7";

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const sessionId = event.queryStringParameters && event.queryStringParameters.session_id;
  if (!sessionId) {
    return { statusCode: 400, body: JSON.stringify({ error: "session_id required" }) };
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "STRIPE_SECRET_KEY is not set" }),
    };
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "subscription"],
    });

    const paid =
      session.payment_status === "paid" ||
      session.payment_status === "no_payment_required" ||
      session.status === "complete";

    if (!paid) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ok: false, reason: "unpaid" }),
      };
    }

    if (session.mode === "subscription") {
      let sub = session.subscription;
      if (typeof sub === "string") {
        sub = await stripe.subscriptions.retrieve(sub);
      }
      if (!sub) {
        return {
          statusCode: 200,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ok: false, reason: "no_subscription" }),
        };
      }
      const priceId = sub.items.data[0] && sub.items.data[0].price && sub.items.data[0].price.id;
      if (priceId !== PRICE_MONTHLY) {
        return {
          statusCode: 200,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ok: false, reason: "unknown_subscription_price" }),
        };
      }
      if (!["active", "trialing"].includes(sub.status)) {
        return {
          statusCode: 200,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ok: false, reason: "subscription_not_active" }),
        };
      }
      const subscriptionEndsAt = sub.current_period_end * 1000;
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ok: true, type: "subscription", subscriptionEndsAt }),
      };
    }

    if (session.mode === "payment") {
      const items = (session.line_items && session.line_items.data) || [];
      const priceIds = items.map((li) => li.price && li.price.id).filter(Boolean);
      if (!priceIds.includes(PRICE_PACK_5)) {
        return {
          statusCode: 200,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ok: false, reason: "unknown_payment_price" }),
        };
      }
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ok: true, type: "pack", creditsToAdd: 5 }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: false, reason: "unknown_mode" }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || String(err) }),
    };
  }
};
