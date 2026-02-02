import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  IconButton,
  Tooltip,
  Box,
  Typography,
  InputAdornment,
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
  Checkbox,
  Chip,
  LinearProgress,
  Divider,
  FormControlLabel,
  Popover
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Tune as TuneIcon,
  Clear as ClearIcon,
  ViewColumn as ViewColumnIcon,
  Close as CloseIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CalendarToday as CalendarIcon,
  DateRange as DateRangeIcon
} from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { debounce } from 'lodash';

// Data fetching hook
const useProductData = (filters) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 50
  });
  const [availableBrands, setAvailableBrands] = useState([]);

  const fetchData = async (currentFilters) => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams({
        page: currentFilters.page || 1,
        limit: currentFilters.limit || 50,
        ...(currentFilters.search && { search: currentFilters.search }),
        ...(currentFilters.brand && { brand: currentFilters.brand }),
        ...(currentFilters.sortBy && { sortBy: currentFilters.sortBy }),
        ...(currentFilters.sortOrder && { sortOrder: currentFilters.sortOrder }),
        ...(currentFilters.startDate && { startDate: currentFilters.startDate }),
        ...(currentFilters.endDate && { endDate: currentFilters.endDate }),
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
    refreshData: () => fetchData(filters) 
  };
};

// Column Manager Component
const ColumnManager = ({ open, onClose, columns, visibleColumns, onColumnToggle, onResetColumns }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Manage Columns</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            {columns.map((column, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={visibleColumns[column.key]}
                      onChange={() => onColumnToggle(column.key)}
                      size="small"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      {column.label}
                    </Typography>
                  }
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onResetColumns} color="inherit">
          Reset to Default
        </Button>
        <Button onClick={onClose} variant="contained">
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Date Range Filter Component
const DateRangeFilter = ({ open, anchorEl, onClose, filters, onDateFilterChange }) => {
  const [localDates, setLocalDates] = useState({
    startDate: filters.startDate || null,
    endDate: filters.endDate || null
  });

  const handleApply = () => {
    // Format dates to YYYY-MM-DD
    const formattedDates = {
      startDate: localDates.startDate ? formatDateForAPI(localDates.startDate) : null,
      endDate: localDates.endDate ? formatDateForAPI(localDates.endDate) : null
    };
    onDateFilterChange(formattedDates);
    onClose();
  };

  const handleClear = () => {
    setLocalDates({ startDate: null, endDate: null });
    onDateFilterChange({ startDate: null, endDate: null });
    onClose();
  };

  // Helper function to format date to YYYY-MM-DD
  const formatDateForAPI = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2, minWidth: 300 }}>
          <Typography variant="subtitle2" gutterBottom>
            Filter by Date Range
          </Typography>
          <Stack spacing={2}>
            <DatePicker
              label="Start Date"
              value={localDates.startDate}
              onChange={(newValue) => setLocalDates(prev => ({ ...prev, startDate: newValue }))}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
            <DatePicker
              label="End Date"
              value={localDates.endDate}
              onChange={(newValue) => setLocalDates(prev => ({ ...prev, endDate: newValue }))}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button size="small" onClick={handleClear}>
                Clear
              </Button>
              <Button size="small" variant="contained" onClick={handleApply}>
                Apply
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Popover>
    </LocalizationProvider>
  );
};

// Main Table Component
function MainTable() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    search: '',
    brand: '',
    sortBy: 'created_at',
    sortOrder: 'DESC',
    startDate: null,
    endDate: null
  });

  const [selectedRows, setSelectedRows] = useState([]);
  const [showColumnManager, setShowColumnManager] = useState(false);
  const [dateAnchorEl, setDateAnchorEl] = useState(null);
  const tableContainerRef = useRef(null);

  // Define ALL columns from your data
  const [visibleColumns, setVisibleColumns] = useState({
    // Basic Information
    'brand': true,
    'gb_sku': true,
    'asin': true,
    'multiple_listing': true,
    'ean_code': true,
    'product_title': true,
    'category': true,
    
    // Pricing
    'mrp': true,
    'selling_price': true,
    'cogs': true,
    
    // Product Details
    'pack_size': true,
    'lead_time_vendor_lt': true,
    'vendor_name': true,
    'launch_date': true,
    'is_bundle': true,
    'vendor_increff': true,
    
    // Vendor Transfers
    'vendor_to_pc': true,
    'vendor_to_fba': true,
    'vendor_to_fbf': true,
    'vendor_to_kv': true,
    
    // PC Transfers
    'pc_to_increff': true,
    'pc_to_fba': true,
    'pc_to_fbf': true,
    
    // KV Transfers
    'kv_to_fba': true,
    'kv_to_fbf': true,
    'kv_allocated_on_hold': true,
    
    // Warehouse Stock
    'increff_units': true,
    'website_drr': true,
    'allocated_on_hold': true,
    'increff_day_cover': true,
    'kvt_units': true,
    'drr': true,
    'kvt_day_cover': true,
    'pc_units': true,
    'allocated_on_hold_pc_units': true,
    
    // FBA
    'fba_units_gb': true,
    'fba_bundled_units': true,
    'fba_drr': true,
    
    // FBF
    'fbf_units_gb': true,
    'fbf_bundled_units': true,
    'fbf_drr': true,
    
    // Myntra
    'myntra_units_gb': true,
    'myntra_bundled_units': true,
    'myntra_drr': true,
    
    // RK World
    'rk_world_stock': true,
    'rk_world_speed': true,
    'rk_world_day_cover': true,
    
    // Marketplace Speeds
    'marketplace_speed_7_days': true,
    'marketplace_speed_15_days': true,
    'marketplace_speed_30_days': true,
    
    // Instamart
    'instamart_stock': true,
    'instamart_speed': true,
    'instamart_day_cover': true,
    
    // Zepto
    'zepto_stock': true,
    'zepto_speed': true,
    'zepto_days_of_cover': true,
    
    // Blinkit B2B
    'blinkit_b2b_stock': true,
    'blinkit_b2b_speed': true,
    'blinkit_b2b_days_of_cover': true,
    
    // Blinkit Marketplace
    'blinkit_marketplace_stock': true,
    'blinkit_marketplace_speed': true,
    'blinkit_marketplace_days_of_cover': true,
    'blinkit_marketplace_speed_7_days': true,
    'blinkit_marketplace_speed_15_days': true,
    'blinkit_marketplace_speed_30_days': true,
    
    // Quick Commerce
    'quickcomm_speed_7_days': true,
    'quickcomm_speed_15_days': true,
    'quickcomm_speed_30_days': true,
    
    // BigBasket
    'bigbasket_stock': true,
    'bigbasket_speed': true,
    'bigbasket_days_of_cover': true,
    
    // Purple
    'purple_stock': true,
    'purple_speed': true,
    'purple_days_of_cover': true,
    
    // Reliance
    'reliance_stock': true,
    'reliance_speed': true,
    'reliance_days_of_cover': true,
    
    // Nykaa
    'nykaa_stock': true,
    'nykaa_speed': true,
    'nykaa_days_of_cover': true,
    
    // Meesho
    'meesho_stock': true,
    'meesho_speed': true,
    'meesho_days_of_cover': true,
    
    // GoLocal Export
    'golocal_export_stock': true,
    'golocal_export_speed': true,
    'golocal_export_days_of_cover': true,
    
    // Pop Club
    'pop_club_stock': true,
    'pop_club_speed': true,
    'pop_club_days_of_cover': true,
    
    // B2B Speeds
    'b2b_speed_7_days': true,
    'b2b_speed_15_days': true,
    'b2b_speed_30_days': true,
    
    // Warehouse Totals
    'warehouse_total_stock': true,
    'warehouse_total_speed': true,
    'warehouse_total_days_of_cover': true,
    
    // Marketplace Totals
    'marketplace_total_stock': true,
    'marketplace_total_speed': true,
    'marketplace_total_days_of_cover': true,
    
    // Quick Commerce Totals
    'quick_comm_total_stock': true,
    'quick_comm_total_speed': true,
    'quick_comm_total_days_of_cover': true,
    
    // B2B Totals
    'b2b_stock': true,
    'b2b_speed': true,
    'b2b_days_of_cover': true,
    
    // Total Aggregates
    'total_price_at_mrp': true,
    'total_price_at_selling': true,
    'total_stock': true,
    'total_speed': true,
    'total_day_cover': true,
    'total_cogs': true,
    
    // DRR Specifics
    'blinkit_b2b_drr_7d': true,
    'blinkit_b2b_drr_15d': true,
    'blinkit_b2b_drr_30d': true,
    'Instamart_B2B_drr_7d': true,
    'Instamart_B2B_drr_15d': true,
    'Instamart_B2B_drr_30d': true,
    'Zepto_B2B_drr_7d': true,
    'Zepto_B2B_drr_15d': true,
    'Zepto_B2B_drr_30d': true,
    
    // Timestamp
    'created_at': true,
    
    // Swiggy
    'swiggy_state': true,
    'swiggy_city': true,
    'swiggy_area_name': true,
    'swiggy_store_id': true,
    'swiggy_drr_7d': true,
    'swiggy_drr_14d': true,
    'swiggy_drr_30d': true,
  });

  const { 
    data, 
    loading, 
    error, 
    pagination, 
    availableBrands,
    refreshData 
  } = useProductData(filters);

  // Define column configuration
  const columns = useMemo(() => [
    // Basic Information
    { key: 'brand', label: 'Brand', width: 120 },
    { key: 'gb_sku', label: 'SKU', width: 140 },
    { key: 'asin', label: 'ASIN', width: 120 },
    { key: 'multiple_listing', label: 'Multiple Listing', width: 140 },
    { key: 'ean_code', label: 'EAN Code', width: 120 },
    { key: 'product_title', label: 'Product Title', width: 250 },
    { key: 'category', label: 'Category', width: 180 },
    
    // Pricing
    { key: 'mrp', label: 'MRP', width: 100 },
    { key: 'selling_price', label: 'Selling Price', width: 120 },
    { key: 'cogs', label: 'COGS', width: 100 },
    
    // Product Details
    { key: 'pack_size', label: 'Pack Size', width: 100 },
    { key: 'lead_time_vendor_lt', label: 'Vendor LT', width: 100 },
    { key: 'vendor_name', label: 'Vendor Name', width: 150 },
    { key: 'launch_date', label: 'Launch Date', width: 120 },
    { key: 'is_bundle', label: 'Is Bundle', width: 100 },
    { key: 'vendor_increff', label: 'Vendor Increff', width: 120 },
    
    // Vendor Transfers
    { key: 'vendor_to_pc', label: 'Vendor → PC', width: 100 },
    { key: 'vendor_to_fba', label: 'Vendor → FBA', width: 100 },
    { key: 'vendor_to_fbf', label: 'Vendor → FBF', width: 100 },
    { key: 'vendor_to_kv', label: 'Vendor → KV', width: 100 },
    
    // PC Transfers
    { key: 'pc_to_increff', label: 'PC → Increff', width: 100 },
    { key: 'pc_to_fba', label: 'PC → FBA', width: 100 },
    { key: 'pc_to_fbf', label: 'PC → FBF', width: 100 },
    
    // KV Transfers
    { key: 'kv_to_fba', label: 'KV → FBA', width: 100 },
    { key: 'kv_to_fbf', label: 'KV → FBF', width: 100 },
    { key: 'kv_allocated_on_hold', label: 'KV Allocated', width: 120 },
    
    // Warehouse Stock
    { key: 'increff_units', label: 'Increff Units', width: 100 },
    { key: 'website_drr', label: 'Website DRR', width: 100 },
    { key: 'allocated_on_hold', label: 'Allocated Hold', width: 120 },
    { key: 'increff_day_cover', label: 'Increff Days', width: 100 },
    { key: 'kvt_units', label: 'KVT Units', width: 100 },
    { key: 'drr', label: 'DRR', width: 80 },
    { key: 'kvt_day_cover', label: 'KVT Days', width: 100 },
    { key: 'pc_units', label: 'PC Units', width: 100 },
    { key: 'allocated_on_hold_pc_units', label: 'PC Allocated', width: 120 },
    
    // FBA
    { key: 'fba_units_gb', label: 'FBA Units', width: 100 },
    { key: 'fba_bundled_units', label: 'FBA Bundled', width: 120 },
    { key: 'fba_drr', label: 'FBA DRR', width: 100 },
    
    // FBF
    { key: 'fbf_units_gb', label: 'FBF Units', width: 100 },
    { key: 'fbf_bundled_units', label: 'FBF Bundled', width: 120 },
    { key: 'fbf_drr', label: 'FBF DRR', width: 100 },
    
    // Myntra
    { key: 'myntra_units_gb', label: 'Myntra Units', width: 120 },
    { key: 'myntra_bundled_units', label: 'Myntra Bundled', width: 140 },
    { key: 'myntra_drr', label: 'Myntra DRR', width: 120 },
    
    // RK World
    { key: 'rk_world_stock', label: 'RK Stock', width: 100 },
    { key: 'rk_world_speed', label: 'RK Speed', width: 100 },
    { key: 'rk_world_day_cover', label: 'RK Days', width: 100 },
    
    // Marketplace Speeds
    { key: 'marketplace_speed_7_days', label: 'MP Speed 7d', width: 120 },
    { key: 'marketplace_speed_15_days', label: 'MP Speed 15d', width: 120 },
    { key: 'marketplace_speed_30_days', label: 'MP Speed 30d', width: 120 },
    
    // Instamart
    { key: 'instamart_stock', label: 'Instamart Stock', width: 120 },
    { key: 'instamart_speed', label: 'Instamart Speed', width: 120 },
    { key: 'instamart_day_cover', label: 'Instamart Days', width: 120 },
    
    // Zepto
    { key: 'zepto_stock', label: 'Zepto Stock', width: 100 },
    { key: 'zepto_speed', label: 'Zepto Speed', width: 100 },
    { key: 'zepto_days_of_cover', label: 'Zepto Days', width: 100 },
    
    // Blinkit B2B
    { key: 'blinkit_b2b_stock', label: 'Blinkit B2B Stock', width: 140 },
    { key: 'blinkit_b2b_speed', label: 'Blinkit B2B Speed', width: 140 },
    { key: 'blinkit_b2b_days_of_cover', label: 'Blinkit B2B Days', width: 140 },
    
    // Blinkit Marketplace
    { key: 'blinkit_marketplace_stock', label: 'Blinkit MP Stock', width: 140 },
    { key: 'blinkit_marketplace_speed', label: 'Blinkit MP Speed', width: 140 },
    { key: 'blinkit_marketplace_days_of_cover', label: 'Blinkit MP Days', width: 140 },
    { key: 'blinkit_marketplace_speed_7_days', label: 'Blinkit MP 7d', width: 120 },
    { key: 'blinkit_marketplace_speed_15_days', label: 'Blinkit MP 15d', width: 120 },
    { key: 'blinkit_marketplace_speed_30_days', label: 'Blinkit MP 30d', width: 120 },
    
    // Quick Commerce
    { key: 'quickcomm_speed_7_days', label: 'QC Speed 7d', width: 120 },
    { key: 'quickcomm_speed_15_days', label: 'QC Speed 15d', width: 120 },
    { key: 'quickcomm_speed_30_days', label: 'QC Speed 30d', width: 120 },
    
    // BigBasket
    { key: 'bigbasket_stock', label: 'BigBasket Stock', width: 120 },
    { key: 'bigbasket_speed', label: 'BigBasket Speed', width: 120 },
    { key: 'bigbasket_days_of_cover', label: 'BigBasket Days', width: 120 },
    
    // Purple
    { key: 'purple_stock', label: 'Purple Stock', width: 100 },
    { key: 'purple_speed', label: 'Purple Speed', width: 100 },
    { key: 'purple_days_of_cover', label: 'Purple Days', width: 100 },
    
    // Reliance
    { key: 'reliance_stock', label: 'Reliance Stock', width: 120 },
    { key: 'reliance_speed', label: 'Reliance Speed', width: 120 },
    { key: 'reliance_days_of_cover', label: 'Reliance Days', width: 120 },
    
    // Nykaa
    { key: 'nykaa_stock', label: 'Nykaa Stock', width: 100 },
    { key: 'nykaa_speed', label: 'Nykaa Speed', width: 100 },
    { key: 'nykaa_days_of_cover', label: 'Nykaa Days', width: 100 },
    
    // Meesho
    { key: 'meesho_stock', label: 'Meesho Stock', width: 100 },
    { key: 'meesho_speed', label: 'Meesho Speed', width: 100 },
    { key: 'meesho_days_of_cover', label: 'Meesho Days', width: 100 },
    
    // GoLocal Export
    { key: 'golocal_export_stock', label: 'GoLocal Stock', width: 120 },
    { key: 'golocal_export_speed', label: 'GoLocal Speed', width: 120 },
    { key: 'golocal_export_days_of_cover', label: 'GoLocal Days', width: 120 },
    
    // Pop Club
    { key: 'pop_club_stock', label: 'Pop Club Stock', width: 120 },
    { key: 'pop_club_speed', label: 'Pop Club Speed', width: 120 },
    { key: 'pop_club_days_of_cover', label: 'Pop Club Days', width: 120 },
    
    // B2B Speeds
    { key: 'b2b_speed_7_days', label: 'B2B Speed 7d', width: 120 },
    { key: 'b2b_speed_15_days', label: 'B2B Speed 15d', width: 120 },
    { key: 'b2b_speed_30_days', label: 'B2B Speed 30d', width: 120 },
    
    // Warehouse Totals
    { key: 'warehouse_total_stock', label: 'WH Total Stock', width: 120 },
    { key: 'warehouse_total_speed', label: 'WH Total Speed', width: 120 },
    { key: 'warehouse_total_days_of_cover', label: 'WH Total Days', width: 120 },
    
    // Marketplace Totals
    { key: 'marketplace_total_stock', label: 'MP Total Stock', width: 120 },
    { key: 'marketplace_total_speed', label: 'MP Total Speed', width: 120 },
    { key: 'marketplace_total_days_of_cover', label: 'MP Total Days', width: 120 },
    
    // Quick Commerce Totals
    { key: 'quick_comm_total_stock', label: 'QC Total Stock', width: 120 },
    { key: 'quick_comm_total_speed', label: 'QC Total Speed', width: 120 },
    { key: 'quick_comm_total_days_of_cover', label: 'QC Total Days', width: 120 },
    
    // B2B Totals
    { key: 'b2b_stock', label: 'B2B Stock', width: 100 },
    { key: 'b2b_speed', label: 'B2B Speed', width: 100 },
    { key: 'b2b_days_of_cover', label: 'B2B Days', width: 100 },
    
    // Total Aggregates
    { key: 'total_price_at_mrp', label: 'Total MRP Value', width: 120 },
    { key: 'total_price_at_selling', label: 'Total Selling Value', width: 140 },
    { key: 'total_stock', label: 'Total Stock', width: 100 },
    { key: 'total_speed', label: 'Total Speed', width: 100 },
    { key: 'total_day_cover', label: 'Total Days', width: 100 },
    { key: 'total_cogs', label: 'Total COGS', width: 100 },
    
    // DRR Specifics
    { key: 'blinkit_b2b_drr_7d', label: 'Blinkit B2B 7d', width: 120 },
    { key: 'blinkit_b2b_drr_15d', label: 'Blinkit B2B 15d', width: 120 },
    { key: 'blinkit_b2b_drr_30d', label: 'Blinkit B2B 30d', width: 120 },
    { key: 'Instamart_B2B_drr_7d', label: 'Instamart B2B 7d', width: 140 },
    { key: 'Instamart_B2B_drr_15d', label: 'Instamart B2B 15d', width: 140 },
    { key: 'Instamart_B2B_drr_30d', label: 'Instamart B2B 30d', width: 140 },
    { key: 'Zepto_B2B_drr_7d', label: 'Zepto B2B 7d', width: 120 },
    { key: 'Zepto_B2B_drr_15d', label: 'Zepto B2B 15d', width: 120 },
    { key: 'Zepto_B2B_drr_30d', label: 'Zepto B2B 30d', width: 120 },
    
    // Timestamp
    { key: 'created_at', label: 'Created At', width: 150 },
    
    // Swiggy
    { key: 'swiggy_state', label: 'Swiggy State', width: 120 },
    { key: 'swiggy_city', label: 'Swiggy City', width: 120 },
    { key: 'swiggy_area_name', label: 'Swiggy Area', width: 120 },
    { key: 'swiggy_store_id', label: 'Swiggy Store ID', width: 140 },
    { key: 'swiggy_drr_7d', label: 'Swiggy 7d', width: 100 },
    { key: 'swiggy_drr_14d', label: 'Swiggy 14d', width: 100 },
    { key: 'swiggy_drr_30d', label: 'Swiggy 30d', width: 100 },
  ], []);

  // Handlers
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

  const handleRowSelect = (gbSku) => {
    setSelectedRows(prev => 
      prev.includes(gbSku) 
        ? prev.filter(sku => sku !== gbSku)
        : [...prev, gbSku]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === data.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(data.map(item => item.gb_sku));
    }
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 50,
      search: '',
      brand: '',
      sortBy: 'created_at',
      sortOrder: 'DESC',
      startDate: null,
      endDate: null
    });
    setSelectedRows([]);
  };

  const handleExport = () => {
    const queryParams = new URLSearchParams({
      ...(filters.search && { search: filters.search }),
      ...(filters.brand && { brand: filters.brand }),
      ...(filters.startDate && { startDate: filters.startDate }),
      ...(filters.endDate && { endDate: filters.endDate }),
    }).toString();
    window.open(`http://localhost:5000/api/inventory/export?${queryParams}`, '_blank');
  };

  const handleColumnToggle = (columnKey) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
  };

  const handleResetColumns = () => {
    const allVisible = {};
    Object.keys(visibleColumns).forEach(key => {
      allVisible[key] = true;
    });
    setVisibleColumns(allVisible);
  };

  const handleHorizontalScroll = (direction) => {
    const container = tableContainerRef.current;
    if (container) {
      const scrollAmount = 200;
      if (direction === 'left') {
        container.scrollLeft -= scrollAmount;
      } else {
        container.scrollLeft += scrollAmount;
      }
    }
  };

  const handleDateFilterClick = (event) => {
    setDateAnchorEl(event.currentTarget);
  };

  const handleDateFilterChange = (dates) => {
    setFilters(prev => ({ 
      ...prev, 
      startDate: dates.startDate,
      endDate: dates.endDate,
      page: 1 
    }));
  };

const formatDateForDisplay = (dateString) => {
  if (!dateString) return '';
  // Parse YYYY-MM-DD format
  const [year, month, day] = dateString.split('-');
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

  // Format cell value
  const formatCellValue = (value, key) => {
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    
    // Format numbers with commas
    if (typeof value === 'number' || !isNaN(value)) {
      const num = parseFloat(value);
      if (key.includes('price') || key.includes('mrp') || key.includes('selling') || key.includes('cogs')) {
        return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
      return num;
    }
    
    // Format dates
    if (key.includes('date') || key.includes('created')) {
      try {
        return new Date(value).toLocaleDateString();
      } catch {
        return value;
      }
    }
    
    return value;
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
        <Button onClick={refreshData} sx={{ ml: 2 }} size="small">Retry</Button>
      </Alert>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ 
        p: 1, 
        bgcolor: '#f5f5f5', 
        minHeight: '100vh',
        fontFamily: '"Segoe UI", Arial, sans-serif'
      }}>
        {/* Header Controls */}
        <Paper sx={{ 
          mb: 1, 
          p: 1.5, 
          bgcolor: 'white',
          borderRadius: 1,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <Grid container alignItems="center" spacing={1}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a', fontSize: '1.1rem' }}>
                📊 Product Inventory Data
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total: {pagination.totalItems.toLocaleString()} records
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center">
                <TextField
                  size="small"
                  fullWidth
                  variant="outlined"
                  placeholder="Search..."
                  value={filters.search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                    sx: { 
                      bgcolor: 'white',
                      fontSize: '0.875rem',
                      height: 36
                    }
                  }}
                />
                
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <Select
                    value={filters.brand}
                    displayEmpty
                    onChange={(e) => handleBrandChange(e.target.value)}
                    sx={{ 
                      bgcolor: 'white',
                      fontSize: '0.875rem',
                      height: 36
                    }}
                  >
                    <MenuItem value="">All Brands</MenuItem>
                    {availableBrands.map(brand => (
                      <MenuItem key={brand} value={brand} sx={{ fontSize: '0.875rem' }}>
                        {brand}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleDateFilterClick}
                  startIcon={<DateRangeIcon />}
                  sx={{ 
                    height: 36, 
                    whiteSpace: 'nowrap',
                    borderColor: filters.startDate || filters.endDate ? '#1976d2' : '#ddd',
                    color: filters.startDate || filters.endDate ? '#1976d2' : 'inherit',
                    backgroundColor: filters.startDate || filters.endDate ? '#1976d210' : 'white',
                    minWidth:"300px"
                  }}
                >
                  {filters.startDate || filters.endDate ? 'Date Range' : 'Date'}
                </Button>

                <IconButton 
                  size="small" 
                  onClick={refreshData}
                  sx={{ border: '1px solid #ddd', height: 36, width: 36 }}
                  title="Refresh"
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>

                <Button
                  size="small"
                  variant="contained"
                  onClick={handleExport}
                  startIcon={<DownloadIcon />}
                  sx={{ height: 36, whiteSpace: 'nowrap', minWidth: "150px" }}
                >
                  Export
                </Button>

                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setShowColumnManager(true)}
                  startIcon={<ViewColumnIcon />}
                  sx={{ height: 36, whiteSpace: 'nowrap', minWidth: "150px" }}
                >
                  Columns ({Object.values(visibleColumns).filter(v => v).length})
                </Button>
              </Stack>
            </Grid>
          </Grid>

          {/* Active Filters */}
          {(filters.search || filters.brand || filters.startDate || filters.endDate) && (
            <Box sx={{ mt: 1 }}>
              <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                {filters.search && (
                  <Chip
                    size="small"
                    label={`Search: "${filters.search}"`}
                    onDelete={() => handleSearchChange('')}
                    sx={{ fontSize: '0.7rem' }}
                  />
                )}
                {filters.brand && (
                  <Chip
                    size="small"
                    label={`Brand: ${filters.brand}`}
                    onDelete={() => handleBrandChange('')}
                    sx={{ fontSize: '0.7rem' }}
                  />
                )}
                {(filters.startDate || filters.endDate) && (
                  <Chip
                    size="small"
                    icon={<CalendarIcon />}
                    label={`${filters.startDate ? formatDateForDisplay(filters.startDate) : 'Any'} - ${filters.endDate ? formatDateForDisplay(filters.endDate) : 'Any'}`}
                    onDelete={() => handleDateFilterChange({ startDate: null, endDate: null })}
                    sx={{ fontSize: '0.7rem' }}
                  />
                )}
                <Button
                  size="small"
                  onClick={handleResetFilters}
                  startIcon={<ClearIcon />}
                  sx={{ fontSize: '0.7rem', height: 24 }}
                >
                  Clear All
                </Button>
              </Stack>
            </Box>
          )}
        </Paper>

        {/* Date Range Filter Popover */}
        <DateRangeFilter
          open={Boolean(dateAnchorEl)}
          anchorEl={dateAnchorEl}
          onClose={() => setDateAnchorEl(null)}
          filters={filters}
          onDateFilterChange={handleDateFilterChange}
        />

        {/* Horizontal Scroll Controls */}
        <Paper sx={{ 
          mb: 1, 
          p: 1, 
          bgcolor: 'white',
          borderRadius: 1,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="caption" color="text.secondary">
              Showing {data.length} rows • Page {pagination.page} of {pagination.totalPages}
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton 
                size="small" 
                onClick={() => handleHorizontalScroll('left')}
                sx={{ border: '1px solid #ddd' }}
                title="Scroll left"
              >
                <ChevronLeftIcon fontSize="small" />
              </IconButton>
              <IconButton 
                size="small" 
                onClick={() => handleHorizontalScroll('right')}
                sx={{ border: '1px solid #ddd' }}
                title="Scroll right"
              >
                <ChevronRightIcon fontSize="small" />
              </IconButton>
              <Select
                size="small"
                value={filters.limit}
                onChange={handleRowsPerPageChange}
                sx={{ fontSize: '0.75rem', height: 32 }}
              >
                <MenuItem value={10}>10 rows</MenuItem>
                <MenuItem value={25}>25 rows</MenuItem>
                <MenuItem value={50}>50 rows</MenuItem>
                <MenuItem value={100}>100 rows</MenuItem>
              </Select>
            </Stack>
          </Stack>
        </Paper>

        {/* Main Table */}
        <Paper sx={{ 
          width: '100%', 
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderRadius: 1
        }}>
          {loading && <LinearProgress sx={{ height: 2 }} />}
          
          <TableContainer 
            ref={tableContainerRef}
            sx={{ 
              maxHeight: 'calc(100vh - 200px)',
              overflowX: 'auto',
              '&::-webkit-scrollbar': {
                height: 8,
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#888',
                borderRadius: 4,
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: '#555',
              }
            }}
          >
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell 
                    padding="checkbox" 
                    sx={{ 
                      bgcolor: '#f8f9fa',
                      borderRight: '1px solid #e0e0e0',
                      position: 'sticky',
                      left: 0,
                      zIndex: 10,
                      minWidth: 50
                    }}
                  >
                    <Checkbox
                      size="small"
                      checked={selectedRows.length === data.length && data.length > 0}
                      indeterminate={selectedRows.length > 0 && selectedRows.length < data.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  {columns.map((column) => (
                    visibleColumns[column.key] && (
                      <TableCell
                        key={column.key}
                        sx={{ 
                          minWidth: column.width,
                          bgcolor: '#f8f9fa',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          color: '#333',
                          borderRight: '1px solid #e0e0e0',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          '&:hover': { bgcolor: '#e9ecef' }
                        }}
                        onClick={() => handleSort(column.key)}
                      >
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <span>{column.label}</span>
                          {filters.sortBy === column.key && (
                            filters.sortOrder === 'ASC' ? 
                              <ArrowUpwardIcon fontSize="inherit" /> : 
                              <ArrowDownwardIcon fontSize="inherit" />
                          )}
                        </Stack>
                      </TableCell>
                    )
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row, rowIndex) => (
                  <TableRow 
                    key={row.gb_sku}
                    hover
                    selected={selectedRows.includes(row.gb_sku)}
                    sx={{ 
                      '&:hover': { bgcolor: '#fafafa' },
                      '&.Mui-selected': { bgcolor: '#e3f2fd' },
                      '&.Mui-selected:hover': { bgcolor: '#bbdefb' }
                    }}
                  >
                    <TableCell 
                      padding="checkbox" 
                      sx={{ 
                        borderRight: '1px solid #e0e0e0',
                        position: 'sticky',
                        left: 0,
                        bgcolor: selectedRows.includes(row.gb_sku) ? '#e3f2fd' : 'inherit',
                        zIndex: 1,
                        minWidth: 50
                      }}
                    >
                      <Checkbox
                        size="small"
                        checked={selectedRows.includes(row.gb_sku)}
                        onChange={() => handleRowSelect(row.gb_sku)}
                      />
                    </TableCell>
                    
                    {columns.map((column) => (
                      visibleColumns[column.key] && (
                        <TableCell 
                          key={column.key}
                          sx={{ 
                            borderRight: '1px solid #e0e0e0',
                            fontSize: '0.8rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: column.width,
                            bgcolor: rowIndex % 2 === 0 ? '#ffffff' : '#fafafa'
                          }}
                          title={row[column.key]?.toString() || '-'}
                        >
                          {formatCellValue(row[column.key], column.key)}
                        </TableCell>
                      )
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Table Footer */}
          <Box sx={{ 
            p: 1, 
            bgcolor: '#f8f9fa',
            borderTop: '1px solid #e0e0e0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              {selectedRows.length > 0 ? `${selectedRows.length} rows selected` : 'No selection'}
            </Typography>
            
            <TablePagination
              component="div"
              count={pagination.totalItems}
              page={pagination.page - 1}
              onPageChange={handlePageChange}
              rowsPerPage={filters.limit}
              onRowsPerPageChange={handleRowsPerPageChange}
              rowsPerPageOptions={[10, 25, 50, 100]}
              sx={{
                '& .MuiTablePagination-toolbar': {
                  minHeight: 'auto',
                  padding: 0
                },
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                  fontSize: '0.75rem',
                  margin: 0
                }
              }}
            />
          </Box>
        </Paper>

        {/* Quick Stats */}
        <Paper sx={{ 
          mt: 1, 
          p: 1, 
          bgcolor: 'white',
          borderRadius: 1,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary" display="block">
                Visible Columns
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {Object.values(visibleColumns).filter(v => v).length} / {columns.length}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary" display="block">
                Current Page
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {pagination.page} of {pagination.totalPages}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary" display="block">
                Total Records
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {pagination.totalItems.toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3} >
              <Typography variant="caption" color="text.secondary" display="block" style={{minWidth:"500px"}}>
                Date Range
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {filters.startDate || filters.endDate 
                  ? `${filters.startDate ? formatDateForDisplay(filters.startDate) : 'Any'} - ${filters.endDate ? formatDateForDisplay(filters.endDate) : 'Any'}`
                  : 'All dates'
                }
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Column Manager Dialog */}
        <ColumnManager
          open={showColumnManager}
          onClose={() => setShowColumnManager(false)}
          columns={columns}
          visibleColumns={visibleColumns}
          onColumnToggle={handleColumnToggle}
          onResetColumns={handleResetColumns}
        />
      </Box>
    </LocalizationProvider>
  );
}

export default MainTable;