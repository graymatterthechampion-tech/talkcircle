import { Compass, House, MessageCircle, Plus, User, type LucideIcon } from "lucide-react";

export interface NavItem {
    to: string;
    label: string;
    icon: LucideIcon;
}

export const NAV_ITEMS: readonly NavItem[] = [
    {to: "/home", label: "Home", icon: House},
    {to: "/explore", label: "Explore circles", icon: Compass },
    {to: "/create", label: "New Post", icon: Plus },
    {to: "/chats", label: "Chats", icon: MessageCircle },
    {to: "/profiles", label: "Your profile", icon: User },
];