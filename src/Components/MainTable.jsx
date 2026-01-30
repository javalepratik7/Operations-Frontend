import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  Box,
  Typography,
  InputAdornment,
  Card,
  CardContent,
  LinearProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Button,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Modal,
  Avatar,
  Divider,
  Tab,
  Tabs,
  Badge,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon,
  Inventory2 as InventoryIcon,
  PriceChange as PriceChangeIcon,
  Category as CategoryIcon,
  ShoppingBag as ShoppingBagIcon,
  AttachMoney as AttachMoneyIcon,
  Code as CodeIcon,
  LocalOffer as LocalOfferIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  Tune as TuneIcon,
  Store as StoreIcon,
  Timeline as TimelineIcon,
  Warehouse as WarehouseIcon
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { debounce } from 'lodash';

// Custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#6366f1',
    },
    secondary: {
      main: '#8b5cf6',
    },
    success: {
      main: '#10b981',
    },
    warning: {
      main: '#f59e0b',
    },
    error: {
      main: '#ef4444',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 1px 2px rgba(0, 0, 0, 0.05)',
    '0px 1px 3px rgba(0, 0, 0, 0.1)',
    '0px 1px 4px rgba(0, 0, 0, 0.1)',
    '0px 2px 5px rgba(0, 0, 0, 0.1)',
    '0px 3px 6px rgba(0, 0, 0, 0.1)',
    '0px 4px 8px rgba(0, 0, 0, 0.1)',
    '0px 5px 10px rgba(0, 0, 0, 0.1)',
    '0px 6px 12px rgba(0, 0, 0, 0.1)',
    '0px 7px 14px rgba(0, 0, 0, 0.1)',
    '0px 8px 16px rgba(0, 0, 0, 0.1)',
    '0px 9px 18px rgba(0, 0, 0, 0.1)',
    '0px 10px 20px rgba(0, 0, 0, 0.1)',
    '0px 11px 22px rgba(0, 0, 0, 0.1)',
    '0px 12px 24px rgba(0, 0, 0, 0.1)',
    '0px 13px 26px rgba(0, 0, 0, 0.1)',
    '0px 14px 28px rgba(0, 0, 0, 0.1)',
    '0px 15px 30px rgba(0, 0, 0, 0.1)',
    '0px 16px 32px rgba(0, 0, 0, 0.1)',
    '0px 17px 34px rgba(0, 0, 0, 0.1)',
    '0px 18px 36px rgba(0, 0, 0, 0.1)',
    '0px 19px 38px rgba(0, 0, 0, 0.1)',
    '0px 20px 40px rgba(0, 0, 0, 0.1)',
    '0px 21px 42px rgba(0, 0, 0, 0.1)',
    '0px 22px 44px rgba(0, 0, 0, 0.1)',
  ],
});

// Product Detail Modal
const ProductDetailModal = ({ open, onClose, product }) => {
  if (!product) return null;

  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { label: 'Overview', icon: <InfoIcon /> },
    { label: 'Inventory', icon: <WarehouseIcon /> },
    { label: 'Sales', icon: <TrendingUpIcon /> },
    { label: 'Channels', icon: <StoreIcon /> }
  ];

  // Format currency
  const formatCurrency = (value) => {
    return `₹${parseFloat(value || 0).toFixed(2)}`;
  };

  // Calculate margin
  const calculateMargin = () => {
    const mrp = parseFloat(product.mrp || 0);
    const cogs = parseFloat(product.cogs || 0);
    const selling = parseFloat(product.selling_price || 0);
    
    if (selling > 0) {
      return ((selling - cogs) / selling * 100).toFixed(1);
    } else if (mrp > 0) {
      return ((mrp - cogs) / mrp * 100).toFixed(1);
    }
    return '0';
  };

  // Get stock status
  const getStockStatus = (stock) => {
    const units = parseInt(stock || 0);
    if (units === 0) return { label: 'Out of Stock', color: '#ef4444' };
    if (units < 10) return { label: 'Low Stock', color: '#f59e0b' };
    if (units < 50) return { label: 'Medium', color: '#3b82f6' };
    return { label: 'In Stock', color: '#10b981' };
  };

  const fbaStockStatus = getStockStatus(product.fba_units_gb);
  const fbfStockStatus = getStockStatus(product.fbf_units_gb);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, overflow: 'hidden' }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: 'primary.main', 
        color: 'white',
        py: 2,
        position: 'relative'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Product Details
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              SKU: {product.gb_sku}
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Header Section */}
        <Box sx={{ p: 3, bgcolor: 'background.default' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12}>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                {product.product_title}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Chip
                  label={product.brand}
                  icon={<LocalOfferIcon />}
                  sx={{ bgcolor: `${theme.palette.primary.main}15`, fontWeight: 600 }}
                />
                <Chip
                  label={product.category?.split('-').pop() || 'Uncategorized'}
                  icon={<CategoryIcon />}
                  variant="outlined"
                />
                {/* <Badge 
                  badgeContent={product.is_bundle ? "Bundle" : "Single"} 
                  color="secondary"
                  sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', height: 20 } }}
                /> */}
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Chip
                  label={`ASIN: ${product.asin || 'N/A'}`}
                  icon={<CodeIcon />}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={`EAN: ${product.ean_code || 'N/A'}`}
                  icon={<CodeIcon />}
                  size="small"
                  variant="outlined"
                />
              </Stack>
            </Grid>
          </Grid>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {tabs.map((tab, index) => (
              <Tab 
                key={index} 
                label={tab.label} 
                icon={tab.icon} 
                iconPosition="start"
                sx={{ minHeight: 60 }}
              />
            ))}
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <Grid container spacing={3}>
              {/* Pricing Information */}
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <AttachMoneyIcon sx={{ mr: 1, fontSize: 20 }} />
                      Pricing Information
                    </Typography>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="textSecondary">MRP</Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {formatCurrency(product.mrp)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="textSecondary">Selling Price</Typography>
                        <Typography variant="body1" fontWeight={600} color={parseFloat(product.selling_price) > 0 ? 'success.main' : 'text.primary'}>
                          {formatCurrency(product.selling_price)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="textSecondary">COGS</Typography>
                        <Typography variant="body1" fontWeight={600} color="error.main">
                          {formatCurrency(product.cogs)}
                        </Typography>
                      </Box>
                      <Divider />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="textSecondary">Margin</Typography>
                        <Chip
                          label={`${calculateMargin()}%`}
                          size="small"
                          sx={{
                            bgcolor: parseFloat(calculateMargin()) > 30 ? '#10b98120' : 
                                     parseFloat(calculateMargin()) > 10 ? '#f59e0b20' : '#ef444420',
                            color: parseFloat(calculateMargin()) > 30 ? '#10b981' : 
                                   parseFloat(calculateMargin()) > 10 ? '#f59e0b' : '#ef4444',
                            fontWeight: 600
                          }}
                        />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Stock Summary */}
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <InventoryIcon sx={{ mr: 1, fontSize: 20 }} />
                      Stock Summary
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" color="textSecondary" gutterBottom>FBA Stock</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="h6" fontWeight={700}>
                            {product.fba_units_gb || 0} units
                          </Typography>
                          <Chip
                            label={fbaStockStatus.label}
                            size="small"
                            sx={{
                              bgcolor: `${fbaStockStatus.color}20`,
                              color: fbaStockStatus.color,
                              fontWeight: 600
                            }}
                          />
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="textSecondary" gutterBottom>FBF Stock</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="h6" fontWeight={700}>
                            {product.fbf_units_gb || 0} units
                          </Typography>
                          <Chip
                            label={fbfStockStatus.label}
                            size="small"
                            sx={{
                              bgcolor: `${fbfStockStatus.color}20`,
                              color: fbfStockStatus.color,
                              fontWeight: 600
                            }}
                          />
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="textSecondary" gutterBottom>Myntra Stock</Typography>
                        <Typography variant="h6" fontWeight={700}>
                          {product.myntra_units_gb || 0} units
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Sales Performance */}
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <TrendingUpIcon sx={{ mr: 1, fontSize: 20 }} />
                      Sales Performance
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" color="textSecondary" gutterBottom>FBA DRR</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="h6" fontWeight={700}>
                            {product.fba_drr || 0} days
                          </Typography>
                          {/* <Chip
                            label={parseFloat(product.fba_drr) < 7 ? 'Fast Moving' : 'Slow Moving'}
                            size="small"
                            color={parseFloat(product.fba_drr) < 7 ? 'success' : 'warning'}
                            variant="outlined"
                          /> */}
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="textSecondary" gutterBottom>FBF DRR</Typography>
                        <Typography variant="h6" fontWeight={700}>
                          {product.fbf_drr || 0} days
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="textSecondary" gutterBottom>Myntra DRR</Typography>
                        <Typography variant="h6" fontWeight={700}>
                          {product.myntra_drr || 0} days
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Additional Information */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Additional Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="textSecondary">Multiple Listing</Typography>
                        <Typography variant="body1">{product.multiple_listing || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="textSecondary">Pack Size</Typography>
                        <Typography variant="body1">{product.pack_size || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="textSecondary">Launch Date</Typography>
                        <Typography variant="body1">
                          {product.launch_date ? new Date(product.launch_date).toLocaleDateString() : 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="textSecondary">Created At</Typography>
                        <Typography variant="body1">
                          {new Date(product.created_at).toLocaleString()}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Detailed Inventory Breakdown</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom color="textSecondary">
                      Warehouse Stock
                    </Typography>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Increff Units</Typography>
                        <Typography fontWeight={600}>{product.increff_units || 0}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">PC Units</Typography>
                        <Typography fontWeight={600}>{product.pc_units || 0}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Allocated on Hold</Typography>
                        <Typography fontWeight={600}>{product.allocated_on_hold || 0}</Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom color="textSecondary">
                      Quick Commerce
                    </Typography>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Instamart Stock</Typography>
                        <Typography fontWeight={600}>{product.instamart_stock || 0}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Zepto Stock</Typography>
                        <Typography fontWeight={600}>{product.zepto_stock || 0}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Blinkit B2B Stock</Typography>
                        <Typography fontWeight={600}>{product.blinkit_b2b_stock || 0}</Typography>
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {activeTab === 2 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Sales Analytics</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom color="textSecondary">
                      Sales Speed (Last 30 Days)
                    </Typography>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Marketplace Speed</Typography>
                        <Typography fontWeight={600}>{product.marketplace_speed_30_days || 0}/day</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Quick Commerce Speed</Typography>
                        <Typography fontWeight={600}>{product.quickcomm_speed_30_days || 0}/day</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">B2B Speed</Typography>
                        <Typography fontWeight={600}>{product.b2b_speed_30_days || 0}/day</Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom color="textSecondary">
                      Day Coverage
                    </Typography>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Increff Day Cover</Typography>
                        <Typography fontWeight={600}>{product.increff_day_cover || 0} days</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Warehouse Day Cover</Typography>
                        <Typography fontWeight={600}>{product.warehouse_total_days_of_cover || 0} days</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Total Day Cover</Typography>
                        <Typography fontWeight={600}>{product.total_day_cover || 0} days</Typography>
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {activeTab === 3 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Channel Distribution</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom color="textSecondary">
                      Marketplace Stock
                    </Typography>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Nykaa Stock</Typography>
                        <Typography fontWeight={600}>{product.nykaa_stock || 0}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Reliance Stock</Typography>
                        <Typography fontWeight={600}>{product.reliance_stock || 0}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">BigBasket Stock</Typography>
                        <Typography fontWeight={600}>{product.bigbasket_stock || 0}</Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom color="textSecondary">
                      Other Channels
                    </Typography>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Meesho Stock</Typography>
                        <Typography fontWeight={600}>{product.meesho_stock || 0}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Purple Stock</Typography>
                        <Typography fontWeight={600}>{product.purple_stock || 0}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Swiggy Coverage</Typography>
                        <Typography fontWeight={600}>{product.swiggy_drr_30d || 0} days</Typography>
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: 'background.default' }}>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<DownloadIcon />}
        >
          Export Details
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Price Display Component
const PriceDisplay = ({ mrp, sellingPrice, cogs }) => {
  const profitMargin = ((parseFloat(sellingPrice) - parseFloat(cogs)) / parseFloat(sellingPrice)) * 100;
  
  return (
    <Stack spacing={0.5}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="body2" color="textSecondary">MRP:</Typography>
        <Typography variant="body2" fontWeight={600}>
          ₹{parseFloat(mrp || 0).toFixed(2)}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="body2" color="textSecondary">Selling:</Typography>
        <Typography 
          variant="body2" 
          fontWeight={600}
          color={parseFloat(sellingPrice) > 0 ? 'success.main' : 'text.secondary'}
        >
          ₹{parseFloat(sellingPrice || 0).toFixed(2)}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="body2" color="textSecondary">COGS:</Typography>
        <Typography variant="body2" fontWeight={600} color="error.main">
          ₹{parseFloat(cogs || 0).toFixed(2)}
        </Typography>
      </Box>
      {!isNaN(profitMargin) && parseFloat(sellingPrice) > 0 && (
        <Chip
          label={`${profitMargin.toFixed(1)}% margin`}
          size="small"
          sx={{
            bgcolor: profitMargin > 30 ? '#10b98120' : 
                     profitMargin > 10 ? '#f59e0b20' : '#ef444420',
            color: profitMargin > 30 ? '#10b981' : 
                   profitMargin > 10 ? '#f59e0b' : '#ef4444',
            fontSize: '0.7rem',
            height: 20,
            width: '100%',
            mt: 0.5
          }}
        />
      )}
    </Stack>
  );
};

// Data fetching hook
const useProductData = (filters) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [availableBrands, setAvailableBrands] = useState([]);
  const [stats, setStats] = useState(null);

  const fetchData = async (currentFilters) => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams({
        page: currentFilters.page || 1,
        limit: currentFilters.limit || 10,
        ...(currentFilters.search && { search: currentFilters.search }),
        ...(currentFilters.brand && { brand: currentFilters.brand }),
        ...(currentFilters.category && { category: currentFilters.category }),
        ...(currentFilters.sortBy && { sortBy: currentFilters.sortBy }),
        ...(currentFilters.sortOrder && { sortOrder: currentFilters.sortOrder }),
      }).toString();

      const response = await fetch(`http://localhost:5000/api/inventory/last-day?${queryParams}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const result = await response.json();
      
      if (result.success) {
        setData(result.data || []);
        setPagination({
          page: result.currentPage,
          totalPages: result.totalPages,
          totalItems: result.count,
          itemsPerPage: result.itemsPerPage
        });
        setAvailableBrands(result.filters?.availableBrands || []);
        setStats(result.stats);
        setError(null);
      } else {
        throw new Error(result.message || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetch = useMemo(
    () => debounce(fetchData, 300),
    []
  );

  useEffect(() => {
    debouncedFetch(filters);
    return () => debouncedFetch.cancel();
  }, [filters, debouncedFetch]);

  return { 
    data, 
    loading, 
    error, 
    pagination, 
    availableBrands, 
    stats, 
    refreshData: () => fetchData(filters) 
  };
};

// Main Table Component
function MainTable() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    brand: '',
    sortBy: 'created_at',
    sortOrder: 'DESC'
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  
  const { 
    data, 
    loading, 
    error, 
    pagination, 
    availableBrands, 
    stats, 
    refreshData 
  } = useProductData(filters);

  const handleSearchChange = (value) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  const handleBrandChange = (brand) => {
    setFilters(prev => ({ ...prev, brand, page: 1 }));
  };

  const handlePageChange = (event, newPage) => {
    setFilters(prev => ({ ...prev, page: newPage + 1 }));
  };

  const handleRowsPerPageChange = (event) => {
    setFilters(prev => ({ 
      ...prev, 
      limit: parseInt(event.target.value, 10),
      page: 1 
    }));
  };

  const handleSort = (key) => {
    setFilters(prev => ({
      ...prev,
      sortBy: key,
      sortOrder: prev.sortBy === key && prev.sortOrder === 'DESC' ? 'ASC' : 'DESC',
      page: 1
    }));
  };

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setDetailModalOpen(true);
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      search: '',
      brand: '',
      sortBy: 'created_at',
      sortOrder: 'DESC'
    });
  };

  const handleExport = () => {
    const queryParams = new URLSearchParams({
      ...(filters.search && { search: filters.search }),
      ...(filters.brand && { brand: filters.brand }),
    }).toString();
    window.open(`http://localhost:5000/api/inventory/export?${queryParams}`, '_blank');
  };

  if (loading && !data.length) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress />
        <Typography align="center" sx={{ mt: 2 }}>Loading product data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 4 }}>
        Error loading data: {error}
        <Button onClick={refreshData} sx={{ ml: 2 }}>Retry</Button>
      </Alert>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom color="primary">
            <ShoppingBagIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
            Product Inventory Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and monitor our product inventory across all channels
          </Typography>
        </Box>

        {/* Stats Cards */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%',
                borderLeft: '4px solid',
                borderColor: 'primary.main',
                boxShadow: 2
              }}>
                <CardContent>
                  <Typography color="textSecondary" variant="body2" gutterBottom>
                    Total Products
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="primary">
                    {stats.totalProducts}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {stats.activeProducts} active products
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%',
                borderLeft: '4px solid',
                borderColor: 'success.main',
                boxShadow: 2
              }}>
                <CardContent>
                  <Typography color="textSecondary" variant="body2" gutterBottom>
                    Total Stock Value
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="success.main">
                    ₹{(stats.totalFbaStock * 254 + stats.totalFbfStock * 254).toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Based on average COGS
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%',
                borderLeft: '4px solid',
                borderColor: 'warning.main',
                boxShadow: 2
              }}>
                <CardContent>
                  <Typography color="textSecondary" variant="body2" gutterBottom>
                    Avg FBA DRR
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="warning.main">
                    {stats.avgFbaDrr} days
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Days of remaining range
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%',
                borderLeft: '4px solid',
                borderColor: 'secondary.main',
                boxShadow: 2
              }}>
                <CardContent>
                  <Typography color="textSecondary" variant="body2" gutterBottom>
                    Data Freshness
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="secondary.main">
                    Just now
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Real-time updates
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Controls */}
        <Card sx={{ mb: 3, boxShadow: 3, borderRadius: 2 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search products by name, SKU, or brand..."
                  value={filters.search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                    sx: { 
                      borderRadius: 2,
                      bgcolor: 'background.paper'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth style={{minWidth:"200px"}}>
                  <InputLabel>Filter by Brand</InputLabel>
                  <Select
                    value={filters.brand}
                    label="Filter by Brand"
                    onChange={(e) => handleBrandChange(e.target.value)}
                    sx={{ 
                      borderRadius: 2,
                      bgcolor: 'background.paper'
                    }}
                  >
                    <MenuItem value="">All Brands</MenuItem>
                    {availableBrands.map(brand => (
                      <MenuItem key={brand} value={brand}>
                        {brand}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Tooltip title="Refresh Data">
                    <IconButton 
                      onClick={refreshData} 
                      sx={{ 
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'primary.dark' }
                      }}
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Export CSV">
                    <IconButton 
                      onClick={handleExport}
                      sx={{ 
                        bgcolor: 'success.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'success.dark' }
                      }}
                    >
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Grid>
            </Grid>
            {(filters.search || filters.brand) && (
              <Box sx={{ mt: 2 }}>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  {filters.search && (
                    <Chip
                      label={`Search: "${filters.search}"`}
                      onDelete={() => handleSearchChange('')}
                      color="primary"
                      size="small"
                    />
                  )}
                  {filters.brand && (
                    <Chip
                      label={`Brand: ${filters.brand}`}
                      onDelete={() => handleBrandChange('')}
                      color="secondary"
                      size="small"
                    />
                  )}
                  <Button
                    size="small"
                    onClick={handleResetFilters}
                    startIcon={<CloseIcon />}
                    sx={{ ml: 'auto' }}
                  >
                    Clear Filters
                  </Button>
                </Stack>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Results Info */}
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="textSecondary">
            Showing <strong>{data.length}</strong> of <strong>{pagination.totalItems}</strong> products
          </Typography>
          <Chip
            icon={<LocalOfferIcon />}
            label={`Page ${pagination.page} of ${pagination.totalPages}`}
            color="primary"
            variant="outlined"
          />
        </Box>

        {/* Main Table */}
        <Card sx={{ boxShadow: 3, borderRadius: 2, overflow: 'hidden' }}>
          {loading && <LinearProgress />}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ 
                  bgcolor: 'primary.main',
                  '& th': { 
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    py: 2
                  }
                }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ShoppingBagIcon sx={{ mr: 1, fontSize: 20 }} />
                      Product
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                      onClick={() => handleSort('brand')}>
                      <LocalOfferIcon sx={{ mr: 1, fontSize: 20 }} />
                      Brand
                      {filters.sortBy === 'brand' && (
                        filters.sortOrder === 'ASC' ? 
                          <ArrowUpwardIcon sx={{ ml: 1 }} /> : 
                          <ArrowDownwardIcon sx={{ ml: 1 }} />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CodeIcon sx={{ mr: 1, fontSize: 20 }} />
                      SKU
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CategoryIcon sx={{ mr: 1, fontSize: 20 }} />
                      Category
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AttachMoneyIcon sx={{ mr: 1, fontSize: 20 }} />
                      Pricing
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <VisibilityIcon sx={{ mr: 1, fontSize: 20 }} />
                      Actions
                    </Box>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((product) => (
                  <TableRow 
                    key={product.gb_sku}
                    hover
                    sx={{ 
                      '&:hover': { 
                        bgcolor: 'action.hover',
                        transform: 'translateY(-2px)',
                        transition: 'all 0.2s'
                      },
                      transition: 'all 0.2s'
                    }}
                  >
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                          {product.product_title}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ASIN: {product.asin || 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={product.brand}
                        size="small"
                        sx={{
                          bgcolor: `${theme.palette.primary.main}15`,
                          color: theme.palette.primary.main,
                          fontWeight: 600,
                          px: 1
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontFamily: 'monospace',
                          bgcolor: 'grey.50',
                          p: 1,
                          borderRadius: 1,
                          fontSize: '0.85rem'
                        }}
                      >
                        {product.gb_sku}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          {product.category?.split('-').pop() || 'Uncategorized'}
                        </Typography>
                        <Chip
                          label={product.multiple_listing || 'Standard'}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell sx={{ minWidth: 180 }}>
                      <PriceDisplay 
                        mrp={product.mrp}
                        sellingPrice={product.selling_price}
                        cogs={product.cogs}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Full Details">
                        <IconButton
                          onClick={() => handleViewDetails(product)}
                          sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                            '&:hover': {
                              bgcolor: 'primary.dark',
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s'
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            component="div"
            count={pagination.totalItems}
            page={pagination.page - 1}
            onPageChange={handlePageChange}
            rowsPerPage={pagination.itemsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[10, 25, 50, 100]}
            sx={{ 
              borderTop: '1px solid',
              borderColor: 'divider',
              '& .MuiTablePagination-toolbar': {
                px: 2
              }
            }}
          />
        </Card>

        {/* Footer */}
        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" color="textSecondary" align="center">
            Data refreshes automatically • Last updated: {data[0]?.created_at ? new Date(data[0].created_at).toLocaleTimeString() : 'Loading...'}
          </Typography>
        </Box>

        {/* Product Detail Modal */}
        <ProductDetailModal
          open={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          product={selectedProduct}
        />
      </Box>
    </ThemeProvider>
  );
}

export default MainTable;