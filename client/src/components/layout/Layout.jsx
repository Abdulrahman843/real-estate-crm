import { useState, useContext, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import {
  AppBar, Box, Drawer, List, ListItem, ListItemIcon, ListItemText,
  Toolbar, Typography, IconButton, Switch, FormControlLabel,
  Avatar, Menu, MenuItem, Divider, Breadcrumbs, Badge,
  InputBase, Paper, Autocomplete, TextField, Chip, Select,
  FormControl, InputLabel, Dialog, DialogTitle, DialogContent,
  DialogActions, Button
} from '@mui/material';
import {
  Menu as MenuIcon, Dashboard, House, Person,
  AdminPanelSettings, Logout, Brightness4, Brightness7,
  Notifications, Search as SearchIcon, Settings, History
} from '@mui/icons-material';

import useAuth from '../../hooks/useAuth';
import { ThemeContext } from '../../contexts/ThemeContext';
import { notificationService } from '../../services/notificationService';
import { searchService } from '../../services/searchService';
import websocketService from '../../services/websocketService';

const Layout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [notificationSoundEnabled, setNotificationSoundEnabled] = useState(true);
  const [desktopNotificationEnabled, setDesktopNotificationEnabled] = useState(true);
  const [searchHistory, setSearchHistory] = useState(() => JSON.parse(localStorage.getItem('searchHistory') || '[]'));
  const [notificationFilter, setNotificationFilter] = useState('all');
  const [responseDialog, setResponseDialog] = useState({ open: false, notificationId: null, response: '' });
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);

  const { user, logout, isAdmin } = useAuth();
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const notificationSound = useRef(new Audio('/notification.mp3'));

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/' },
    { text: 'Properties', icon: <House />, path: '/properties' },
    { text: 'Profile', icon: <Person />, path: '/profile' },
    ...(isAdmin() ? [{ text: 'Admin', icon: <AdminPanelSettings />, path: '/admin' }] : [])
  ];

  useEffect(() => {
    const sound = localStorage.getItem('notify_sound');
    const desktop = localStorage.getItem('notify_desktop');
    if (sound !== null) setNotificationSoundEnabled(sound === 'true');
    if (desktop !== null) setDesktopNotificationEnabled(desktop === 'true');
  }, []);

  useEffect(() => {
    localStorage.setItem('notify_sound', notificationSoundEnabled);
    localStorage.setItem('notify_desktop', desktopNotificationEnabled);
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
  }, [notificationSoundEnabled, desktopNotificationEnabled, searchHistory]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    };

    fetchNotifications();

    if (user?.id) {
      websocketService.connect(user.id);
      websocketService.subscribeToNotifications((notification) => {
        setNotifications(prev => [notification, ...prev]);
        if (notificationSoundEnabled) {
          notificationSound.current.play().catch(console.error);
        }
        if (desktopNotificationEnabled && 'Notification' in window && Notification.permission === 'granted') {
          new Notification('New Notification', {
            body: notification.message,
            icon: '/logo192.png'
          });
        }
      });
    }

    const interval = setInterval(fetchNotifications, 30000);
    return () => {
      clearInterval(interval);
      websocketService.disconnect();
    };
  }, [user?.id, notificationSoundEnabled, desktopNotificationEnabled]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  const groupedNotifications = useMemo(() => {
    return notifications.reduce((groups, notification) => {
      const date = new Date(notification.time).toLocaleDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(notification);
      return groups;
    }, {});
  }, [notifications]);

  const handleSearchInput = useCallback(async (e, value) => {
    setSearchQuery(value);
    if (value?.trim().length >= 2) {
      const suggestions = await searchService.getAutocompleteSuggestions(value);
      setSearchSuggestions(suggestions);
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (searchQuery.trim()) query.append('search', searchQuery.trim());
    if (minPrice) query.append('minPrice', minPrice);
    if (maxPrice) query.append('maxPrice', maxPrice);
    if (bedrooms) query.append('bedrooms', bedrooms);
    const searchData = {
      query: searchQuery,
      filters: { minPrice, maxPrice, bedrooms },
      timestamp: new Date().toISOString()
    };
    setSearchHistory(prev => [searchData, ...prev.slice(0, 4)]);
    navigate(`/properties?${query.toString()}`);
  };

  const handleNotificationItemClick = async (id) => {
    await notificationService.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationResponse = async () => {
    try {
      await notificationService.respondToInquiry(responseDialog.notificationId, responseDialog.response);
      setResponseDialog({ open: false, notificationId: null, response: '' });
    } catch (error) {
      console.error('Failed to respond to inquiry:', error);
    }
  };

  const getNotificationColor = (type) => {
    const colors = {
      inquiry: '#1976d2',
      property_view: '#2e7d32',
      system: '#ed6c02',
      alert: '#d32f2f'
    };
    return colors[type] || '#757575';
  };

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    return paths.map((path, index) => ({
      path: `/${paths.slice(0, index + 1).join('/')}`,
      name: path.charAt(0).toUpperCase() + path.slice(1)
    }));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Top App Bar */}
      <AppBar position="fixed">
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setDrawerOpen(true)} sx={{ mr: 2, display: { sm: 'none' } }}>
            <MenuIcon />
          </IconButton>
  
          <Typography variant="h6" noWrap>
            Real Estate CRM
          </Typography>
  
          {/* Search Bar */}
          <Autocomplete
            freeSolo
            options={searchSuggestions}
            value={searchQuery}
            onInputChange={handleSearchInput}
            renderInput={(params) => (
              <Paper component="form" onSubmit={handleSearch} sx={{ ml: 2, p: '2px 4px', display: 'flex', alignItems: 'center', width: 400 }}>
                <InputBase
                  {...params.InputProps}
                  placeholder="Search properties..."
                  sx={{ ml: 1, flex: 1 }}
                />
                <IconButton onClick={(e) => setFilterAnchorEl(e.currentTarget)}>
                  <History />
                </IconButton>
                <IconButton type="submit">
                  <SearchIcon />
                </IconButton>
              </Paper>
            )}
          />
  
          {/* Advanced Filters */}
          <Box sx={{ display: 'flex', gap: 2, ml: 2 }}>
            <TextField label="Min Price" size="small" type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
            <TextField label="Max Price" size="small" type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
            <TextField label="Bedrooms" size="small" type="number" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} />
          </Box>
  
          {/* Notifications */}
          <IconButton color="inherit" onClick={(e) => setNotificationAnchorEl(e.currentTarget)} sx={{ ml: 2 }}>
            <Badge badgeContent={unreadCount} color="error">
              <Notifications />
            </Badge>
          </IconButton>
  
          {/* Theme Toggle */}
          <FormControlLabel
            control={<Switch checked={darkMode} onChange={toggleDarkMode} />}
            label={darkMode ? <Brightness4 /> : <Brightness7 />}
            sx={{ ml: 2 }}
          />
  
          {/* Settings */}
          <IconButton color="inherit" onClick={(e) => setSettingsAnchorEl(e.currentTarget)}>
            <Settings />
          </IconButton>
  
          {/* User Avatar */}
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: 2 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </Avatar>
          </IconButton>
        </Toolbar>
  
        {/* Breadcrumbs */}
        <Box sx={{ px: 3, py: 1, bgcolor: 'rgba(255,255,255,0.08)' }}>
          <Breadcrumbs sx={{ color: 'white' }}>
            <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
            {getBreadcrumbs().map((bc, i) => (
              <Link key={i} to={bc.path} style={{ color: 'inherit', textDecoration: 'none' }}>
                {bc.name}
              </Link>
            ))}
          </Breadcrumbs>
        </Box>
      </AppBar>
  
      {/* Permanent Drawer for Desktop */}
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { width: 240, boxSizing: 'border-box' }
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', mt: 2 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem button key={item.text} component={Link} to={item.path}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
  
      {/* Temporary Drawer for Mobile */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { width: 240 }
        }}
      >
        <Toolbar />
        <List>
          {menuItems.map((item) => (
            <ListItem button key={item.text} component={Link} to={item.path} onClick={() => setDrawerOpen(false)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
       {/* Notification Menu */}
    <Menu
      anchorEl={notificationAnchorEl}
      open={Boolean(notificationAnchorEl)}
      onClose={() => setNotificationAnchorEl(null)}
      PaperProps={{ sx: { width: 320 } }}
    >
      <Box sx={{ px: 2, py: 1 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Filter</InputLabel>
          <Select
            value={notificationFilter}
            onChange={(e) => setNotificationFilter(e.target.value)}
            label="Filter"
          >
            <MenuItem value="all">All Notifications</MenuItem>
            <MenuItem value="inquiry">Inquiries</MenuItem>
            <MenuItem value="property_view">Property Views</MenuItem>
            <MenuItem value="system">System</MenuItem>
            <MenuItem value="alert">Alerts</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Divider />

      {notifications.length > 0 && (
        <MenuItem onClick={handleMarkAllRead}>
          <Typography variant="body2" color="primary">Mark all as read</Typography>
        </MenuItem>
      )}

      <Divider />

      {Object.entries(groupedNotifications).map(([date, group]) => (
        <Box key={date}>
          <Typography variant="subtitle2" sx={{ px: 2, mt: 1 }}>{date}</Typography>
          {group.map((n) => (
            <MenuItem
              key={n.id}
              onClick={() => handleNotificationItemClick(n.id)}
              sx={{
                bgcolor: n.read ? 'inherit' : 'action.hover',
                borderLeft: `4px solid ${getNotificationColor(n.type)}`,
                '&:hover': { bgcolor: 'action.selected' }
              }}
            >
              <Box sx={{ width: '100%' }}>
                <Typography variant="body1">{n.message}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(n.time).toLocaleTimeString()}
                  </Typography>
                  <Chip
                    label={n.type}
                    size="small"
                    sx={{ bgcolor: getNotificationColor(n.type), color: 'white' }}
                  />
                </Box>

                {n.type === 'inquiry' && (
                  <Button
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setResponseDialog({ open: true, notificationId: n.id, response: '' });
                    }}
                    sx={{ mt: 1 }}
                  >
                    Respond
                  </Button>
                )}
              </Box>
            </MenuItem>
          ))}
        </Box>
      ))}
    </Menu>

    {/* Settings Menu */}
    <Menu anchorEl={settingsAnchorEl} open={Boolean(settingsAnchorEl)} onClose={() => setSettingsAnchorEl(null)}>
      <MenuItem>
        <FormControlLabel
          control={<Switch checked={notificationSoundEnabled} onChange={() => setNotificationSoundEnabled(p => !p)} />}
          label="Sound Notifications"
        />
      </MenuItem>
      <MenuItem>
        <FormControlLabel
          control={<Switch checked={desktopNotificationEnabled} onChange={() => setDesktopNotificationEnabled(p => !p)} />}
          label="Desktop Notifications"
        />
      </MenuItem>
    </Menu>

    {/* User Menu */}
    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
      <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile'); }}>
        <Person sx={{ mr: 1 }} /> Profile
      </MenuItem>
      <Divider />
      <MenuItem onClick={() => { setAnchorEl(null); logout(); navigate('/login'); }}>
        <Logout sx={{ mr: 1 }} /> Logout
      </MenuItem>
    </Menu>

    {/* Search History Menu */}
    <Menu
      anchorEl={filterAnchorEl}
      open={Boolean(showSearchHistory)}
      onClose={() => setShowSearchHistory(false)}
    >
      {searchHistory.length > 0 ? (
        searchHistory.map((item, index) => (
          <MenuItem
            key={index}
            onClick={() => {
              setSearchQuery(item.query);
              setMinPrice(item.filters.minPrice);
              setMaxPrice(item.filters.maxPrice);
              setBedrooms(item.filters.bedrooms);
              setShowSearchHistory(false);
            }}
          >
            <Box>
              <Typography variant="body1">{item.query}</Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(item.timestamp).toLocaleString()}
              </Typography>
            </Box>
          </MenuItem>
        ))
      ) : (
        <MenuItem disabled>No search history</MenuItem>
      )}
    </Menu>

    {/* Response Dialog */}
    <Dialog open={responseDialog.open} onClose={() => setResponseDialog({ open: false, notificationId: null, response: '' })}>
      <DialogTitle>Respond to Inquiry</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          multiline
          rows={4}
          fullWidth
          value={responseDialog.response}
          onChange={(e) => setResponseDialog(prev => ({ ...prev, response: e.target.value }))}
          placeholder="Type your response..."
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setResponseDialog({ open: false, notificationId: null, response: '' })}>
          Cancel
        </Button>
        <Button onClick={handleNotificationResponse} variant="contained" color="primary">
          Send Response
        </Button>
      </DialogActions>
    </Dialog>
  {/* Main Content */}
  <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 12 }}>
      <Outlet />
    </Box>
  </Box>
);
};

export default Layout;
