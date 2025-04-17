// client/src/components/dashboard/StatCard.jsx

import React from 'react';
import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';

/**
 * StatCard Component
 * Displays a simple statistics card with an icon, title, and value.
 *
 * @param {string} title - Label for the statistic (e.g., "Total Views")
 * @param {string|number} value - The statistic's numeric or text value
 * @param {JSX.Element} icon - MUI icon to visually represent the stat
 * @param {string} color - Theme color (e.g., "primary", "secondary")
 */
const StatCard = ({ title, value, icon, color = 'primary' }) => {
  return (
    <Card elevation={3} sx={{ borderRadius: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar
            sx={{
              bgcolor: (theme) => theme.palette[color].main,
              color: 'white',
              width: 48,
              height: 48
            }}
          >
            {icon}
          </Avatar>

          <Box>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
            >
              {title}
            </Typography>

            <Typography variant="h5" fontWeight={600}>
              {value}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;
