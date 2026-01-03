export const GET = () => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_REDIRECT_URI;
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", clientId ?? "");
  url.searchParams.set("redirect_uri", redirectUri ?? "");
  url.searchParams.set("response_type", "code");

  return new Response(null, {
    status: 302,
    headers: { Location: url.toString() },
  });
};
