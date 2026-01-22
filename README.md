## Payments (Direct Sales)

This project uses **payment links (URLs)** for Stripe and PayPal —  
**not** embedded SDKs or checkout sessions.

### How it works
- Stripe and PayPal links are stored as **URLs** on the Book record
- These URLs are created and managed directly in:
  - Stripe Dashboard (Payment Links)
  - PayPal Dashboard (Checkout / Buy Now links)
- The site simply **redirects the user** to the selected payment provider

### Admin Fields (Book)
- `stripePaymentLink` — full Stripe payment URL
- `paypalPaymentLink` — full PayPal payment URL
- `allowDirectSale` — enables/disables direct sales
- `ebookFileUrl` — private Blob URL (ebook file)

### Important Rules
- Stripe and PayPal are **links only**
- No Stripe SDK or PayPal SDK is required to initiate payment
- Payments are handled entirely off-site by the provider

### Ebook Access
- Ebook files are stored privately using Vercel Blob
- A download link must only be released **after payment is confirmed**
- Payment confirmation is expected via webhook or manual verification logic
  (implementation-dependent)

⚠️ Do not assume Stripe Elements, Checkout Sessions, or client-side SDK usage.
