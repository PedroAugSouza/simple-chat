export const getUser = async (token: string) => {
  const request = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return await request.json();
};
