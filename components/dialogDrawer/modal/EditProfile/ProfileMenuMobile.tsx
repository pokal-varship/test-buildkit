import { ExtendedSession } from "@components/header/types";
import Icon from "@components/image/Icons";
import { CONTACT_IMAGE } from "@config/Header/image.config";
import { open_dialog } from "@lib/modalHandler";
import React, { useState } from "react";

const ProfileMenuMobile: React.FC<{ session: ExtendedSession }> = ({ session }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen); // Toggle the state for opening/closing the menu
    if (!isOpen) {
      open_dialog("profileMenu", {
        open: true,
        propsData: {session},
        type: "profileMenu",
        handlerDialog: () => { },
        handleClose: () => {
          setIsOpen(false); // Ensure the menu is closed when the dialog is closed
        },
        anchor: "bottom", // Adjust this if necessary based on your layout
      });
      setIsOpen(isOpen);
    }
  };

  return (
    <div className="profile-menu-container">
      <div className="profile-icon" onClick={toggleMenu}>
        <div>
          <Icon
            icon={`${CONTACT_IMAGE}#contact-icon`}
            width={22}
            height={22}
            color={"var(--primary-text)"}
            viewBox="0 0 16 18"
            className="mr-1"
            />
        </div>
        {/* <span className="mt-1">
          <Icon
            icon={isOpen ? `${ARROW_UP_IMAGE}#arrow-up` : `${ARROW_DOWN_IMAGE}#arrow-down`}
            width={15}
            height={15}
            color={"var(--primary-text)"}
            viewBox="0 0 9 6"
          />
        </span> */}
      </div>

      <style>{`
        .profile-menu-container {
          position: relative;
        }

        .profile-icon {
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        .profile-image {
          width: 40px;
          height: 40px;
          border-radius: 50%;
        }

        .profile-dropdown {
          position: absolute;
          top: 50px;
          right: 0;
          width: 250px;
          background-color: #f4f4f9;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 10px;
          z-index: 10;
        }

        .profile-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .profile-details {
          display: flex;
          flex-direction: column;
          margin-left: 10px;
        }

        .user-name {
          font-weight: bold;
          font-size: var(--description-font);
        }

        .user-email {
          font-size: var(--extraSmall-font);
          color: #666;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: var(--description-font);
          cursor: pointer;
        }

        .menu-items {
          margin-top: 15px;
        }

        .menu-item {
          width: 100%;
          padding: 10px;
          text-align: left;
          background: none;
          border: none;
          font-size: var(--small-font);
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .menu-item:hover {
          background-color: #e1e1e1;
        }
      `}</style>
    </div>
  );
};

export default ProfileMenuMobile;
