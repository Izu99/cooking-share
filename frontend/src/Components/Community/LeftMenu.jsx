import React from "react";
import { useSnapshot } from "valtio";
import { useNavigate } from "react-router-dom";
import state from "../../Utils/Store";

const LeftMenu = () => {
  const snap = useSnapshot(state);
  const navigate = useNavigate();

  const menuItems = [
    { label: "Dashboard", route: "/dashboard" },
    { label: "Posts", route: "/posts" },
    { label: "Skill Plans", route: "/skill-plans" },
    { label: "Friends", route: "/friends" },
    { label: "Notifications", route: "/notifications" },
  ];

  const handleClick = (index, route) => {
    state.activeIndex = index;
    navigate(route);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        background: "#FFFFFF",
        left: 0,
        width: "250px",
        height: "100vh",
        color: "#333",
        boxShadow: "0 0 10px rgba(0,0,0,0.08)",
        zIndex: 1000,
        borderRight: "1px solid #e0e0e0",
      }}
    >
      <h3
        style={{
          textAlign: "center",
          padding: "20px 0",
          borderBottom: "1px solid #e0e0e0",
          margin: 0,
          fontWeight: 600,
          background: "#64B5F6",
          color: "white",
        }}
      >
        Skill Share
      </h3>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {menuItems.map((item, index) => (
          <li
            key={index}
            onClick={() => handleClick(index + 1, item.route)}
            style={{
              padding: "12px 20px",
              borderBottom: "1px solid #f0f0f0",
              background: snap.activeIndex === index + 1 ? "#E3F2FD" : "white",
              color: snap.activeIndex === index + 1 ? "#64B5F6" : "#555",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              position: "relative",
            }}
          >
            <span
              style={{
                textDecoration: "none",
                color: "inherit",
                fontWeight: snap.activeIndex === index + 1 ? "600" : "normal",
                width: "100%",
              }}
            >
              {item.label}
            </span>
            {snap.activeIndex === index + 1 && (
              <div
                style={{
                  width: "4px",
                  height: "24px",
                  background: "#64B5F6",
                  position: "absolute",
                  right: 0,
                  borderRadius: "4px 0 0 4px",
                }}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LeftMenu;
