const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const PRICE_PACK_5 = "price_1TVxEXFvdwbjRSVAwdGPdqgk";
const PRICE_MONTHLY = "price_1TVxG3FvdwbjRSVAf6no1Tx7";

function siteUrl() {
  return (
    process.env.SITE_URL ||
    process.env.URL ||
    process.env.DEPLOY_PRIME_URL ||
    "http://localhost:8888"
  ).replace(/\/$/, "");
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { priceId, mode } = body;
  if (!priceId || !mode) {
    return { statusCode: 400, body: JSON.stringify({ error: "priceId and mode required" }) };
  }

  if (priceId === PRICE_PACK_5 && mode !== "payment") {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid mode for pack price" }) };
  }
  if (priceId === PRICE_MONTHLY && mode !== "subscription") {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid mode for subscription price" }) };
  }
  if (priceId !== PRICE_PACK_5 && priceId !== PRICE_MONTHLY) {
    return { statusCode: 400, body: JSON.stringify({ error: "Unknown price" }) };
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "STRIPE_SECRET_KEY is not set in Netlify environment variables" }),
    };
  }

  const base = siteUrl();

  try {
    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${base}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/index.html`,
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || String(err) }),
    };
  }
};
