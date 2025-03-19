"use client";

import { 
  Avatar,
  Popup,
} from "@/components/kendo";
import { UserMenu } from "@/components/UserMenu";
import { useState, useRef } from "react";


export const UserProfile = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
    const avatarRef = useRef<HTMLDivElement | null>(null);
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
                type="image"
                size="medium"
                rounded="full"
                style={{ backgroundColor: "#0747A6" }}
                themeColor="info"
                showTooltip={true}
                tooltip="John Doe - Account Settings"
              >
                JD
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