import { Github } from "lucide-react";

interface Props {
  name: string;
  size?: number;
  className?: string;
}

export const PlatformIcon = ({ name, className, size = 22 }: Props) => {
  const icons = {
    github: <Github className={className} size={size} />,
  };

  return icons[name as keyof typeof icons];
};
