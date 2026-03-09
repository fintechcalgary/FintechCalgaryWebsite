export async function GET() {
  const res = await fetch("https://www.convergepay.com/hosted-payments/myip", {
    method: "GET",
    headers: { Accept: "text/plain" },
  });
  const ip = await res.text();
  return new Response(ip, {
    headers: { "Content-Type": "text/plain" },
  });
}
