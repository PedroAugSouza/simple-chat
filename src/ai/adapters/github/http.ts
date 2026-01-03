interface Props {
  path: string; // /user
  token: string;
}

export const httpRequest = async (props: Props) => {
  const request = await fetch(`https://api.github.com${props.path}`, {
    headers: {
      Authorization: `Bearer ${props.token}`,
    },
  });

  return await request.json();
};
