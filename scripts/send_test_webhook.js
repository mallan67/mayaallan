const https = require("https");
const http = require("http");
const crypto = require("crypto");
const { URL } = require("url");

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
if (!webhookSecret) {
  console.error("ERROR: Please set STRIPE_WEBHOOK_SECRET env var (the webhook signing secret).");
  process.exit(1);
}

const dest = process.argv[2] || process.env.WEBHOOK_URL || "http://localhost:3000/api/webhooks/stripe";
const parsed = new URL(dest);

// Build a realistic checkout.session.completed event
const now = Date.now();
const sessionId = `cs_test_${now}`;
const event = {
  id: `evt_test_${now}`,
  object: "event",
  type: "checkout.session.completed",
  data: {
    object: {
      id: sessionId,
      object: "checkout.session",
      metadata: { bookId: "1", formatType: "ebook" },
      payment_intent: `pi_test_${now}`,
      amount_total: 1000,
      currency: "usd",
      customer_email: "buyer@example.com",
      customer_details: { name: "Test Buyer" }
    }
  }
};

const payload = JSON.stringify(event);
const timestamp = Math.floor(Date.now() / 1000);
const signedPayload = `${timestamp}.${payload}`;
const signature = crypto.createHmac("sha256", webhookSecret).update(signedPayload).digest("hex");
const stripeSignatureHeader = `t=${timestamp},v1=${signature}`;

// Prepare HTTP request
const opts = {
  hostname: parsed.hostname,
  port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
  path: parsed.pathname + (parsed.search || ""),
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
    "stripe-signature": stripeSignatureHeader,
  },
};

// pick http or https
const client = parsed.protocol === "https:" ? https : http;

console.log("Posting signed test webhook to:", dest);
console.log("Stripe Signature header:", stripeSignatureHeader);

const req = client.request(opts, (res) => {
  console.log("Response status:", res.statusCode);
  let body = "";
  res.setEncoding("utf8");
  res.on("data", (chunk) => (body += chunk));
  res.on("end", () => {
    console.log("Response body:");
    console.log(body);
  });
});

req.on("error", (err) => {
  console.error("Request error:", err);
});

req.write(payload);
req.end();
