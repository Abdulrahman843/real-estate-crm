import { useState, useEffect } from 'react';
import {
  Box, Paper, TextField, Slider, FormControl,
  InputLabel, Select, MenuItem, Button, Chip,
  Typography, Grid, Accordion, AccordionSummary,
  AccordionDetails, IconButton, Tooltip, Dialog,
  DialogTitle, DialogContent, DialogActions,
  useMediaQuery, useTheme, Menu, ListItemIcon,
  ListItemText, MenuItem as MenuItemMUI, Drawer,
  List, ListItem, Divider, SpeedDial,
  SpeedDialAction, SpeedDialIcon, Snackbar, Alert,
  Table, TableBody, TableCell, TableHead, TableRow, 
  Timeline, TimelineItem, TimelineContent,
  TimelineDot, TimelineSeparator, TimelineConnector, PieChart, Pie, Cell
} from '@mui/material';
import {
  ExpandMore, FilterList, RestartAlt, Save,
  SaveAlt, MoreVert, FolderOpen, Compare,
  History, Analytics, Share, Template,
  Star, Recommend, Group, TrendingUp
} from '@mui/icons-material';
import { ResponsiveContainer, BarChart, Bar } from 'recharts';

const PropertyFilters = ({ onApplyFilters }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [expanded, setExpanded] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: [0, 1000000],
    bedrooms: '',
    bathrooms: '',
    propertyType: '',
    amenities: [],
    location: '',
    area: [0, 5000],
    yearBuilt: '',
    status: '',
    features: []
  });

  const [presets, setPresets] = useState(JSON.parse(localStorage.getItem('filterPresets') || '{}'));
  const [presetName, setPresetName] = useState('');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [presetsMenuAnchor, setPresetsMenuAnchor] = useState(null);
  const [filterHistory, setFilterHistory] = useState([]);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [analytics, setAnalytics] = useState({});
  const [snackbarState, setSnackbarState] = useState({ open: false, message: '' });
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  
  const propertyTypes = ['House', 'Apartment', 'Condo', 'Townhouse', 'Land', 'Villa', 'Office'];
  const amenitiesList = [
    'Pool', 'Garage', 'Garden', 'Balcony', 'Security', 'Elevator',
    'Gym', 'Parking', 'Storage', 'Pet Friendly', 'Furnished'
  ];
  const statusOptions = ['For Sale', 'For Rent', 'Sold', 'Pending'];
  const featuresList = [
    'Waterfront', 'Mountain View', 'Beach Access', 'Smart Home',
    'Solar Panels', 'Wine Cellar', 'Home Theater'
  ];

  const filterTemplates = {
    'Luxury Homes': {
      priceRange: [750000, 1000000],
      propertyType: 'House',
      amenities: ['Pool', 'Smart Home', 'Security'],
      features: ['Waterfront', 'Wine Cellar', 'Home Theater'],
      status: 'For Sale'
    },
    'First-time Buyers': {
      priceRange: [200000, 400000],
      propertyType: 'Apartment',
      bedrooms: 2,
      bathrooms: 1,
      status: 'For Sale'
    },
    'Investment Property': {
      priceRange: [300000, 600000],
      propertyType: 'Condo',
      status: 'For Sale',
      features: ['Pet Friendly'],
      amenities: ['Parking', 'Security']
    }
  };

  const formatPrice = (value) => `$${value.toLocaleString()}`;

  useEffect(() => {
    const savedFilters = localStorage.getItem('propertyFilters');
    if (savedFilters) setFilters(JSON.parse(savedFilters));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => onApplyFilters(filters), 500);
    return () => clearTimeout(timer);
  }, [filters, onApplyFilters]);

  useEffect(() => {
    localStorage.setItem('propertyFilters', JSON.stringify(filters));
  }, [filters]);

  const toggleFilterItem = (key, item) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(item) ? prev[key].filter(i => i !== item) : [...prev[key], item]
    }));
  };

  const handleReset = () => setFilters({
    priceRange: [0, 1000000], bedrooms: '', bathrooms: '', propertyType: '',
    amenities: [], location: '', area: [0, 5000], yearBuilt: '', status: '', features: []
  });

  const handleSavePreset = () => {
    const updatedPresets = { ...presets, [presetName]: filters };
    setPresets(updatedPresets);
    localStorage.setItem('filterPresets', JSON.stringify(updatedPresets));
    setSaveDialogOpen(false);
    setPresetName('');
  };

  const handleLoadPreset = (name) => {
    setFilters(presets[name]);
    setPresetsMenuAnchor(null);
  };

  const handleCompareFilters = () => {
    const current = { ...filters, timestamp: new Date() };
    setFilterHistory(prev => [current, ...prev.slice(0, 4)]);
    setCompareDialogOpen(true);
  };

  const handleExportFilters = () => {
    navigator.clipboard.writeText(btoa(JSON.stringify(filters)));
    setSnackbarState({ open: true, message: 'Filter configuration copied to clipboard' });
  };

  const analyzeFilters = () => {
    setAnalytics({
      priceRange: `$${filters.priceRange[0].toLocaleString()} - $${filters.priceRange[1].toLocaleString()}`,
      selectedAmenities: filters.amenities.length,
      selectedFeatures: filters.features.length
    });
    generateRecommendations();
    setDrawerOpen(true);
  };

  const applyTemplate = (name) => setFilters({ ...filters, ...filterTemplates[name] });

  const generateRecommendations = () => {
    const rec = [];
    if (filters.priceRange[1] > 750000) rec.push('Consider adding luxury amenities');
    if (filters.propertyType === 'House' && !filters.features.includes('Garden'))
      rec.push('Properties with gardens are popular in this category');
    setRecommendations(rec);
  };

  return (
    <>
      <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
        <AccordionSummary expandIcon={<ExpandMore />} sx={{ flexDirection: isMobile ? 'column' : 'row', '& .MuiAccordionSummary-content': { flexWrap: 'wrap', gap: 1 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FilterList />
            <Typography>Property Filters</Typography>
            {Object.values(filters).some(value => value !== '' && (Array.isArray(value) ? value.length > 0 : true)) && (
              <Chip size="small" label="Filters Applied" color="primary" sx={{ ml: 2 }} />
            )}
          </Box>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); setPresetsMenuAnchor(e.currentTarget); }}>
            <MoreVert />
          </IconButton>
        </AccordionSummary>
  
        <AccordionDetails>
          <Grid container spacing={isMobile ? 2 : 3}>
            <Grid item xs={12}>
              <Typography gutterBottom>Price Range</Typography>
              <Slider value={filters.priceRange} onChange={(_, val) => setFilters(prev => ({ ...prev, priceRange: val }))} valueLabelDisplay="auto" valueLabelFormat={formatPrice} min={0} max={1000000} step={50000} />
            </Grid>
            <Grid item xs={12}><Typography gutterBottom>Area (sq ft)</Typography><Slider value={filters.area} onChange={(_, val) => setFilters(prev => ({ ...prev, area: val }))} valueLabelDisplay="auto" min={0} max={5000} step={100} /></Grid>
            <Grid item xs={12} sm={6}><FormControl fullWidth><InputLabel>Property Type</InputLabel><Select value={filters.propertyType} onChange={(e) => setFilters(prev => ({ ...prev, propertyType: e.target.value }))}>{propertyTypes.map(type => (<MenuItem key={type} value={type}>{type}</MenuItem>))}</Select></FormControl></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Location" value={filters.location} onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))} /></Grid>
            <Grid item xs={12} sm={6}><FormControl fullWidth><InputLabel>Bedrooms</InputLabel><Select value={filters.bedrooms} onChange={(e) => setFilters(prev => ({ ...prev, bedrooms: e.target.value }))}>{[1, 2, 3, 4, 5, '5+'].map(num => (<MenuItem key={num} value={num}>{num}</MenuItem>))}</Select></FormControl></Grid>
            <Grid item xs={12} sm={6}><FormControl fullWidth><InputLabel>Bathrooms</InputLabel><Select value={filters.bathrooms} onChange={(e) => setFilters(prev => ({ ...prev, bathrooms: e.target.value }))}>{[1, 2, 3, 4, '4+'].map(num => (<MenuItem key={num} value={num}>{num}</MenuItem>))}</Select></FormControl></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Year Built" type="number" value={filters.yearBuilt} onChange={(e) => setFilters(prev => ({ ...prev, yearBuilt: e.target.value }))} /></Grid>
            <Grid item xs={12} sm={6}><FormControl fullWidth><InputLabel>Status</InputLabel><Select value={filters.status} onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}>{statusOptions.map(status => (<MenuItem key={status} value={status}>{status}</MenuItem>))}</Select></FormControl></Grid>
            <Grid item xs={12}><Typography gutterBottom>Amenities</Typography><Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>{amenitiesList.map(amenity => (<Chip key={amenity} label={amenity} onClick={() => toggleFilterItem('amenities', amenity)} color={filters.amenities.includes(amenity) ? 'primary' : 'default'} />))}</Box></Grid>
            <Grid item xs={12}><Typography gutterBottom>Special Features</Typography><Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>{featuresList.map(feature => (<Tooltip key={feature} title={feature}><Chip label={feature} onClick={() => toggleFilterItem('features', feature)} color={filters.features.includes(feature) ? 'primary' : 'default'} /></Tooltip>))}</Box></Grid>
            <Grid item xs={12}><Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}><Tooltip title="Reset all filters"><IconButton onClick={handleReset}><RestartAlt /></IconButton></Tooltip><Button variant="contained" startIcon={<Save />} onClick={() => { onApplyFilters(filters); setExpanded(false); }}>Apply Filters</Button></Box></Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
  
      <Menu anchorEl={presetsMenuAnchor} open={Boolean(presetsMenuAnchor)} onClose={() => setPresetsMenuAnchor(null)}>
        <MenuItemMUI onClick={() => setSaveDialogOpen(true)}><ListItemIcon><SaveAlt /></ListItemIcon><ListItemText>Save Current Filters</ListItemText></MenuItemMUI>
        {Object.keys(presets).map(name => (<MenuItemMUI key={name} onClick={() => handleLoadPreset(name)}><ListItemIcon><FolderOpen /></ListItemIcon><ListItemText>{name}</ListItemText></MenuItemMUI>))}
      </Menu>
  
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Save Filter Preset</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Preset Name" fullWidth value={presetName} onChange={(e) => setPresetName(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSavePreset} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
  
      <SpeedDial ariaLabel="Filter Actions" sx={{ position: 'fixed', bottom: 16, right: 16 }} icon={<SpeedDialIcon />}>
        <SpeedDialAction icon={<Compare />} tooltipTitle="Compare Filters" onClick={handleCompareFilters} />
        <SpeedDialAction icon={<History />} tooltipTitle="Filter History" onClick={() => setDrawerOpen(true)} />
        <SpeedDialAction icon={<Share />} tooltipTitle="Share Filters" onClick={handleExportFilters} />
        <SpeedDialAction icon={<Analytics />} tooltipTitle="Analytics" onClick={analyzeFilters} />
        <SpeedDialAction icon={<Template />} tooltipTitle="Templates" onClick={() => setTemplateDialogOpen(true)} />
      </SpeedDial>
  
      <Dialog open={templateDialogOpen} onClose={() => setTemplateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Filter Templates</DialogTitle>
        <DialogContent>
          <List>
            {Object.entries(filterTemplates).map(([name, template]) => (
              <ListItem key={name} button onClick={() => { applyTemplate(name); setTemplateDialogOpen(false); }}>
                <ListItemIcon><Star /></ListItemIcon>
                <ListItemText primary={name} secondary={`${template.propertyType}, ${formatPrice(template.priceRange[0])} - ${formatPrice(template.priceRange[1])}`} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
  
      <Dialog open={compareDialogOpen} onClose={() => setCompareDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Filter Comparison</DialogTitle>
        <DialogContent>
          <Table><TableHead><TableRow><TableCell>Filter</TableCell>{filterHistory.map((_, i) => (<TableCell key={i}>Version {i + 1}</TableCell>))}</TableRow></TableHead>
            <TableBody>{Object.keys(filters).map(key => (<TableRow key={key}><TableCell>{key}</TableCell>{filterHistory.map((hist, i) => (<TableCell key={i}>{Array.isArray(hist[key]) ? hist[key].join(', ') : hist[key]?.toString() || '-'}</TableCell>))}</TableRow>))}</TableBody>
          </Table>
        </DialogContent>
      </Dialog>
  
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 300, p: 2 }}>
          <Typography variant="h6" gutterBottom>Filter Analytics</Typography>
          <List>{Object.entries(analytics).map(([key, val]) => (<ListItem key={key}><ListItemText primary={key.replace(/([A-Z])/g, ' $1').trim()} secondary={val} /></ListItem>))}</List>
          <Divider />
          <Box sx={{ height: 300, mt: 2 }}>
            <Typography variant="h6" gutterBottom>Filter Statistics</Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Amenities', value: filters.amenities.length },
                { name: 'Features', value: filters.features.length },
                { name: 'Price Range', value: (filters.priceRange[1] - filters.priceRange[0]) / 100000 }
              ]}>
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>Recommendations</Typography>
            <List>
              {recommendations.map((rec, index) => (
                <ListItem key={index}>
                  <ListItemIcon><Recommend /></ListItemIcon>
                  <ListItemText primary={rec} />
                </ListItem>
              ))}
            </List>
          </Box>
          <Divider />
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Filter History</Typography>
          <List>{filterHistory.map((hist, index) => (<ListItem key={index} secondaryAction={<Button size="small" onClick={() => { setFilters(hist); setDrawerOpen(false); }}>Apply</Button>}><ListItemText primary={`Version ${index + 1}`} secondary={new Date(hist.timestamp).toLocaleString()} /></ListItem>))}</List>
        </Box>
      </Drawer>
  
      <Snackbar open={snackbarState.open} autoHideDuration={6000} onClose={() => setSnackbarState({ ...snackbarState, open: false })}>
        <Alert severity="success" onClose={() => setSnackbarState({ ...snackbarState, open: false })}>{snackbarState.message}</Alert>
      </Snackbar>
    </>
  );
};  

export default PropertyFilters;
