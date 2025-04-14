import React, { useState, useEffect, useMemo } from 'react';
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

const SettingsSwitch = ({ label, checked, onChange }) => (
  <FormControlLabel
    control={<Switch checked={checked} onChange={onChange} />}
    label={label}
  />
);

const ProfileSettings = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState({ success: false, error: null });
  const [originalProfile, setOriginalProfile] = useState(null);
  const [profile, setProfile] = useState({});

  const isChanged = useMemo(() => JSON.stringify(profile) !== JSON.stringify(originalProfile), [profile, originalProfile]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userService.getProfile();
        setProfile(data);
        setOriginalProfile(data);
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
      setOriginalProfile(profile);
      setSaveStatus({ success: true, error: null });
    } catch (error) {
      console.error(error);
      setSaveStatus({ success: false, error: 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const ProfileTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
        <Avatar src={profile.avatar} sx={{ width: 120, height: 120, margin: 'auto' }} />
        <label htmlFor="avatar-upload">
          <input
            accept="image/*"
            id="avatar-upload"
            type="file"
            style={{ display: 'none' }}
            onChange={async (e) => {
              const file = e.target.files[0];
              if (file) {
                const imageUrl = await userService.uploadAvatar(file);
                setProfile((prev) => ({ ...prev, avatar: imageUrl }));
              }
            }}
          />
          <Button component="span" startIcon={<PhotoCamera />} sx={{ mt: 2 }}>
            Change Photo
          </Button>
        </label>
      </Grid>
      <Grid item xs={12} sm={8}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="First Name"
              fullWidth
              value={profile.firstName}
              onChange={(e) => setProfile((prev) => ({ ...prev, firstName: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Last Name"
              fullWidth
              value={profile.lastName}
              onChange={(e) => setProfile((prev) => ({ ...prev, lastName: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={profile.email}
              onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Phone"
              fullWidth
              value={profile.phone}
              onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))}
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );

  const PreferencesTab = () => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <SettingsSwitch
          label="Dark Mode"
          checked={profile.preferences?.darkMode}
          onChange={(e) => setProfile((prev) => ({
            ...prev,
            preferences: { ...prev.preferences, darkMode: e.target.checked }
          }))}
        />
        <SettingsSwitch
          label="Email Notifications"
          checked={profile.preferences?.emailNotifications}
          onChange={(e) => setProfile((prev) => ({
            ...prev,
            preferences: { ...prev.preferences, emailNotifications: e.target.checked }
          }))}
        />
        <SettingsSwitch
          label="Subscribe to Newsletter"
          checked={profile.preferences?.newsletter}
          onChange={(e) => setProfile((prev) => ({
            ...prev,
            preferences: { ...prev.preferences, newsletter: e.target.checked }
          }))}
        />
      </Grid>
    </Grid>
  );

  const NotificationsTab = () => (
    <Grid container spacing={2}>
      <SettingsSwitch
        label="New Listings"
        checked={profile.notifications?.newListings}
        onChange={(e) => setProfile((prev) => ({
          ...prev,
          notifications: { ...prev.notifications, newListings: e.target.checked }
        }))}
      />
      <SettingsSwitch
        label="Price Changes"
        checked={profile.notifications?.priceChanges}
        onChange={(e) => setProfile((prev) => ({
          ...prev,
          notifications: { ...prev.notifications, priceChanges: e.target.checked }
        }))}
      />
      <SettingsSwitch
        label="Property Updates"
        checked={profile.notifications?.propertyUpdates}
        onChange={(e) => setProfile((prev) => ({
          ...prev,
          notifications: { ...prev.notifications, propertyUpdates: e.target.checked }
        }))}
      />
      <SettingsSwitch
        label="Market Reports"
        checked={profile.notifications?.marketReports}
        onChange={(e) => setProfile((prev) => ({
          ...prev,
          notifications: { ...prev.notifications, marketReports: e.target.checked }
        }))}
      />
    </Grid>
  );

  if (loading) return <CircularProgress />;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>Profile Settings</Typography>

        {saveStatus.error && <Alert severity="error">{saveStatus.error}</Alert>}
        {saveStatus.success && <Alert severity="success">Profile updated successfully</Alert>}

        <Tabs value={activeTab} onChange={(_, newVal) => setActiveTab(newVal)} sx={{ mb: 2 }}>
          <Tab icon={<Person />} label="Profile" />
          <Tab icon={<Settings />} label="Preferences" />
          <Tab icon={<Notifications />} label="Notifications" />
        </Tabs>

        {activeTab === 0 && <ProfileTab />}
        {activeTab === 1 && <PreferencesTab />}
        {activeTab === 2 && <NotificationsTab />}

        <Divider sx={{ my: 3 }} />

        <Box textAlign="right">
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
            onClick={handleProfileUpdate}
            disabled={!isChanged || loading}
          >
            Save Changes
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProfileSettings;