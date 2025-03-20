"use client";

import { 
  Avatar,
  Popup,
} from "@/components/kendo";
import { UserMenu } from "@/components/UserMenu";
import { useState, useRef } from "react";
import { useSession } from "next-auth/react";

export const UserProfile = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
    const avatarRef = useRef<HTMLDivElement | null>(null);
    const { data: session } = useSession();

    const toggleUserMenu = () => {
        setShowUserMenu(!showUserMenu);
      };
    return (<div className="relative" ref={avatarRef}>
            <div 
              className="cursor-pointer"
              onClick={toggleUserMenu}
              aria-haspopup="true"
              aria-expanded={showUserMenu}
            >
              <Avatar
                type={session?.user?.image ? "image" : "text"}
                size="medium"
                rounded="full"
                style={{ backgroundColor: "#0747A6" }}
                themeColor="info"
                showTooltip={true}
                tooltip={session?.user?.name ?? "Guest"}
              >
                {session?.user?.image ? (
                  <img src={session?.user?.image} alt="User Avatar" />
                ) : (
                  session?.user?.name?.charAt(0)
                )}
              </Avatar>
            </div>
            <Popup
              anchor={avatarRef.current}
              show={showUserMenu}
              popupClass="popup-content"
              animate={true}
              anchorAlign={{ horizontal: 'right', vertical: 'bottom' }}
              popupAlign={{ horizontal: 'right', vertical: 'top' }}
              onClose={() => setShowUserMenu(false)}
            >
              <UserMenu/>
            </Popup>
          </div>)
}