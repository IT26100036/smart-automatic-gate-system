import { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  CardMedia,
  Popover,
  Divider,
  MenuList,
  Typography,
  IconButton,
  MenuItem,
} from "@mui/material";
import { menuItemClasses } from "@mui/material/MenuItem";
import { Icon } from "@iconify/react";
import { useAuth } from "../context/AuthContext";

const MENU_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <Icon icon="solar:home-angle-bold-duotone" width={22} />,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: <Icon icon="solar:settings-bold-duotone" width={22} />,
  },
];

export default function AccountPopover({ sx, ...other }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { logout, user } = useAuth();

  const [openPopover, setOpenPopover] = useState(null);

  const handleOpenPopover = useCallback(
    (e) => setOpenPopover(e.currentTarget),
    [],
  );
  const handleClosePopover = useCallback(() => setOpenPopover(null), []);

  const handleClickItem = useCallback(
    (path) => {
      handleClosePopover();
      navigate(path);
    },
    [handleClosePopover, navigate],
  );

  return (
    <>
      <IconButton
        onClick={handleOpenPopover}
        sx={{
          p: "2px",
          width: 45,
          height: 45,
          background: (theme) =>
            `conic-gradient(${theme.palette.primary.light}, ${theme.palette.warning.light}, ${theme.palette.primary.light})`,
          ...sx,
        }}
        {...other}
      >
        <CardMedia
          image="/admin-avatar.png"
          sx={{ width: "100%", height: "100%", borderRadius: "50%" }}
        />
      </IconButton>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "bottom", horizontal: "right" }}
        slotProps={{ paper: { sx: { width: 200 } } }}
      >
        <MenuList
          disablePadding
          sx={{
            p: 1,
            gap: 0.5,
            display: "flex",
            flexDirection: "column",
            [`& .${menuItemClasses.root}`]: {
              px: 1,
              gap: 2,
              borderRadius: 0.75,
              typography: "body2",
              fontWeight: 600,
              color: "#637381",
              [`&.${menuItemClasses.selected}`]: {
                fontWeight: 600,
                bgcolor: "rgba(249,115,22,0.08)",
                color: "#f97316",
                "&:hover": { bgcolor: "rgba(249,115,22,0.14)" },
              },
            },
          }}
        >
          {MENU_ITEMS.map((option) => (
            <MenuItem
              key={option.label}
              selected={option.href === pathname}
              onClick={() => handleClickItem(option.href)}
            >
              {option.icon}
              {option.label}
            </MenuItem>
          ))}
        </MenuList>

        <Divider sx={{ borderStyle: "dashed" }} />

        <Box sx={{ p: 1 }}>
          <Button
            fullWidth
            color="error"
            size="medium"
            variant="text"
            onClick={logout}
            sx={{ fontWeight: 700 }}
          >
            Logout
          </Button>
        </Box>
      </Popover>
    </>
  );
}
