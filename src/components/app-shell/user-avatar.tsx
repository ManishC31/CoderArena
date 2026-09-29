import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export type MenuUser = {
  name: string;
  email: string;
  image: string | null;
};

export function UserAvatar({ user }: { user: MenuUser }) {
  return (
    <Avatar size="sm">
      {user.image && <AvatarImage src={user.image} alt="" />}
      <AvatarFallback className="text-xs">{initials(user.name)}</AvatarFallback>
    </Avatar>
  );
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase()).join("") || "?";
}
