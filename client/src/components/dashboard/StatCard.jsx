// StatCard.jsx
import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';

const StatCard = ({ title, value, icon, color = 'primary' }) => {
  return (
    <Card sx={{ boxShadow: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: `${color}.main` }}>{icon}</Avatar>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
            <Typography variant="h5" fontWeight={600}>{value}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;