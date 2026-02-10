interface Props {
  path: string; // /user
  token: string;
}

export const githubClient = async (props: Props) => {
  const request = await fetch(
    `https://api.github.com${
      props.path.split("")[0] === "/" ? props.path : `/${props.path}`
    }`,
    {
      headers: {
        Authorization: `Bearer ${props.token}`,
      },
    }
  );

  return await request.json();
};
