import { NavLink } from "react-router-dom";
import { Icon } from "@iconify/react";
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  Typography,
  Divider,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import AccountPopover from "./AccountPopover";

const NAV_SECTIONS = [
  {
    title: "STUDENT",
    items: [
      { label: "Dashboard", to: "/dashboard", icon: "solar:home-angle-bold-duotone" },
      { label: "Slots", to: "/slots", icon: "solar:widget-bold-duotone" },
      { label: "Analytics", to: "/analytics", icon: "solar:chart-bold-duotone" },
    ],
  },
  {
    title: "ACTIVITY",
    items: [
      { label: "Logs", to: "/logs", icon: "solar:history-bold-duotone" },
      { label: "Clients", to: "/clients", icon: "solar:users-group-rounded-bold-duotone" },
      { label: "Cards", to: "/cards", icon: "solar:card-bold-duotone" },
    ],
  },
  {
    title: "ACCOUNT",
    items: [
      { label: "Settings", to: "/settings", icon: "solar:settings-bold-duotone" },
    ],
  },
];

const sinhalaFont = {
  fontFamily: "'Noto Sans Sinhala', serif !important",
  fontVariationSettings: '"wdth" 100',
  fontOpticalSizing: "auto",
  fontStyle: "normal",
};

export default function Sidebar({ width }) {
  const { user } = useAuth();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.paper",
          boxShadow: "2px 0 6px rgba(0,0,0,0.08)",
          borderRight: "1px solid",
          borderColor: "divider",
        },
      }}
    >
      {/* Brand */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", px: 2.5, minHeight: 64 }}>
        <Typography
          variant="h6"
          noWrap
          sx={{
            color: "primary.main",
            fontWeight: 800,
            fontSize: 17,
            letterSpacing: 0.5,
            lineHeight: "1.5",
            textTransform: "uppercase",
            ...sinhalaFont,
          }}
        >
          Smart Gate System
        </Typography>
      </Box>

      <Divider />

      {/* Nav sections */}
      <Box component="nav" sx={{ flexGrow: 1, overflowY: "auto", px: 1.5, pt: 1.5 }}>
        {NAV_SECTIONS.map((section, index) => (
          <Box key={section.title}>
            {index > 0 && <Divider sx={{ my: 1.5 }} />}
            <List disablePadding>
              {section.items.map(({ label, to, icon }) => (
                <ListItem key={to} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    component={NavLink}
                    to={to}
                    sx={{
                      px: 1,
                      gap: 2,
                      borderRadius: 0.75,
                      color: "text.secondary",
                      fontWeight: 600,
                      "&.active": {
                        bgcolor: "rgba(249,115,22,0.08)",
                        color: "primary.main",
                        "& .nav-icon": { color: "#f97316" },
                        "&:hover": { bgcolor: "rgba(249,115,22,0.14)" },
                      },
                      "&:not(.active):hover": { bgcolor: "action.hover" },
                    }}
                  >
                    <Box className="nav-icon" sx={{ width: 24, height: 24, color: "text.disabled", display: "flex" }}>
                      <Icon icon={icon} width={22} />
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, letterSpacing: 0.5, lineHeight: 1.5, ...sinhalaFont }}
                    >
                      {label}
                    </Typography>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        ))}
      </Box>

      {/* Account */}
      <Divider />
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1.5 }}>
        <AccountPopover />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" fontWeight={700} noWrap sx={{ color: "text.primary", lineHeight: 1.3, ...sinhalaFont }}>
            Admin
          </Typography>
          <Typography variant="caption" noWrap sx={{ color: "text.disabled", display: "block", letterSpacing: 0.3 }}>
            {user?.email ?? "admin@smartgate.local"}
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
}
