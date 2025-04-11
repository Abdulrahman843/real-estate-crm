import { useState, useEffect } from 'react';
import {
  Container, Paper, Grid, TextField, Button, Avatar,
  Typography, Box, Switch, FormControlLabel, Divider,
  Alert, CircularProgress, Tabs, Tab
} from '@mui/material';
import {
  Person, Notifications, Settings,
  PhotoCamera, Save
} from '@mui/icons-material';
import { userService } from '../../services/userService';

const ProfileSettings = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState({ success: false, error: null });
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    avatar: '',
    preferences: {
      darkMode: false,
      emailNotifications: true,
      pushNotifications: true,
      newsletter: true
    },
    notifications: {
      newListings: true,
      priceChanges: true,
      propertyUpdates: true,
      marketReports: false
    }
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userService.getProfile();
        setProfile(data);
      } catch (error) {
        console.error(error);
        setSaveStatus({ success: false, error: 'Failed to load profile' });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileUpdate = async () => {
    try {
      setLoading(true);
      await userService.updateProfile(profile);
      setSaveStatus({ success: true, error: null });
    } catch (error) {
        console.error(error);
      setSaveStatus({ success: false, error: 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const imageUrl = await userService.uploadAvatar(file);
        setProfile(prev => ({ ...prev, avatar: imageUrl }));
      } catch (error) {
        console.error(error);
        setSaveStatus({ success: false, error: 'Failed to upload image' });
      }
    }
  };

  const ProfileTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
        <Box sx={{ mb: 2 }}>
          <Avatar
            src={profile.avatar}
            sx={{ width: 120, height: 120, margin: 'auto' }}
          />
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="avatar-upload"
            type="file"
            onChange={handleImageUpload}
          />
          <label htmlFor="avatar-upload">
            <Button
              component="span"
              startIcon={<PhotoCamera />}
              sx={{ mt: 2 }}
            >
              Change Photo
            </Button>
          </label>
        </Box>
      </Grid>
      <Grid item xs={12} sm={8}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              value={profile.firstName}
              onChange={(e) => setProfile(prev => ({
                ...prev,
                firstName: e.target.value
              }))}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              value={profile.lastName}
              onChange={(e) => setProfile(prev => ({
                ...prev,
                lastName: e.target.value
              }))}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile(prev => ({
                ...prev,
                email: e.target.value
              }))}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Phone"
              value={profile.phone}
              onChange={(e) => setProfile(prev => ({
                ...prev,
                phone: e.target.value
              }))}
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );

  const PreferencesTab = () => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={profile.preferences.darkMode}
              onChange={(e) => setProfile(prev => ({
                ...prev,
                preferences: {
                  ...prev.preferences,
                  darkMode: e.target.checked
                }
              }))}
            />
          }
          label="Dark Mode"
        />
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={profile.preferences.emailNotifications}
              onChange={(e) => setProfile(prev => ({
                ...prev,
                preferences: {
                  ...prev.preferences,
                  emailNotifications: e.target.checked
                }
              }))}
            />
          }
          label="Email Notifications"
        />
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={profile.preferences.newsletter}
              onChange={(e) => setProfile(prev => ({
                ...prev,
                preferences: {
                  ...prev.preferences,
                  newsletter: e.target.checked
                }
              }))}
            />
          }
          label="Subscribe to Newsletter"
        />
      </Grid>
    </Grid>
  );

  const NotificationsTab = () => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={profile.notifications.newListings}
              onChange={(e) => setProfile(prev => ({
                ...prev,
                notifications: {
                  ...prev.notifications,
                  newListings: e.target.checked
                }
              }))}
            />
          }
          label="New Property Listings"
        />
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={profile.notifications.priceChanges}
              onChange={(e) => setProfile(prev => ({
                ...prev,
                notifications: {
                  ...prev.notifications,
                  priceChanges: e.target.checked
                }
              }))}
            />
          }
          label="Price Changes"
        />
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={profile.notifications.propertyUpdates}
              onChange={(e) => setProfile(prev => ({
                ...prev,
                notifications: {
                  ...prev.notifications,
                  propertyUpdates: e.target.checked
                }
              }))}
            />
          }
          label="Property Updates"
        />
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={profile.notifications.marketReports}
              onChange={(e) => setProfile(prev => ({
                ...prev,
                notifications: {
                  ...prev.notifications,
                  marketReports: e.target.checked
                }
              }))}
            />
          }
          label="Market Reports"
        />
      </Grid>
    </Grid>
  );

  if (loading) return <CircularProgress />;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>Profile Settings</Typography>
        
        {saveStatus.error && (
          <Alert severity="error" sx={{ mb: 2 }}>{saveStatus.error}</Alert>
        )}
        {saveStatus.success && (
          <Alert severity="success" sx={{ mb: 2 }}>Profile updated successfully</Alert>
        )}

        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab icon={<Person />} label="Profile" />
          <Tab icon={<Settings />} label="Preferences" />
          <Tab icon={<Notifications />} label="Notifications" />
        </Tabs>

        <Box sx={{ mb: 3 }}>
          {activeTab === 0 && <ProfileTab />}
          {activeTab === 1 && <PreferencesTab />}
          {activeTab === 2 && <NotificationsTab />}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleProfileUpdate}
            disabled={loading}
          >
            Save Changes
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProfileSettings;