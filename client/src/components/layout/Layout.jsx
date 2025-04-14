import { useContext } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import {
  AppBar, Box, Toolbar, Typography, IconButton, Drawer, List, ListItem,
  ListItemIcon, ListItemText, Avatar, Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon, Dashboard, House, Person,
  AdminPanelSettings, Settings, Logout, Brightness4, Brightness7
} from '@mui/icons-material';

import useAuth from '../../contexts/useAuth';
import { ThemeContext } from '../../contexts/ThemeContext';

const Layout = () => {
  // const [drawerOpen, setDrawerOpen] = useState(false);
  // const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  // const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
  // const [notificationSoundEnabled, setNotificationSoundEnabled] = useState(true);
  // const [desktopNotificationEnabled, setDesktopNotificationEnabled] = useState(true);

  const { user, logout, isAdmin } = useAuth();
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  // const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/' },
    { text: 'Properties', icon: <House />, path: '/properties' },
    { text: 'Profile', icon: <Person />, path: '/profile' },
    ...(isAdmin() ? [{ text: 'Admin', icon: <AdminPanelSettings />, path: '/admin' }] : [])
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => {}} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            Real Estate CRM
          </Typography>
          <Tooltip title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}>
            <IconButton color="inherit" onClick={toggleDarkMode}>
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Settings">
            <IconButton color="inherit">
              <Settings />
            </IconButton>
          </Tooltip>
          <Tooltip title="Profile">
            <IconButton onClick={() => navigate('/profile')} sx={{ ml: 1 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Tooltip title="Logout">
            <IconButton color="inherit" onClick={logout} sx={{ ml: 1 }}>
              <Logout />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box' }
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} component={Link} to={item.path} button={true}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
