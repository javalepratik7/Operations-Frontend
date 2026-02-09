import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid
} from 'recharts';
import {
  TrendingUp, Package, Truck, Warehouse,
  AlertTriangle, ShoppingBag, Filter,
  RefreshCw, ChevronDown, Box,
  Building2, Layers, Tags, ShoppingCart 
} from 'lucide-react';
import './ProductDashboard.css';
import './Pagination.css';

const ProductDashboard = () => {
  const [filters, setFilters] = useState({
    brand: {
      label: 'Brand',
      value: 'All Brands',
      icon: Layers,
      options: []
    },
    vendor: {
      label: 'Vendor',
      value: 'All Vendors',
      icon: Building2,
      options: []
    },
    location: {
      label: 'Location',
      value: 'All Locations',
      icon: Warehouse,
      options: []
    },
    category: {
      label: 'Category',
      value: 'All Categories',
      icon: Tags,
      options: []
    }
  });

  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  // Helper functions - defined first
  const formatNumber = (num) => {
    if (!num && num !== 0) return '0';
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₹0';
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  const getStockAlertSubtitle = (skuDetails) => {
    if (!skuDetails) return '0 Zero | 0 Low';
    const zeroStock = skuDetails.filter(item => item.current_stock === 0).length;
    const lowStock = skuDetails.filter(item => 
      item.inventory_status === 'LOW_STOCK' && item.current_stock > 0
    ).length;
    return `${zeroStock} Zero | ${lowStock} Low`;
  };

  const getBrandFromEAN = (ean) => {
    if (!ean) return 'Unknown Brand';
    // Simple mapping - adjust based on your actual EAN patterns
    if (ean.startsWith('890435')) return 'Urban Gabru';
    if (ean.startsWith('890913')) return 'Seoul Skin';
    if (ean.startsWith('890572')) return 'Urban Yog';
    if (ean.startsWith('300000')) return 'Makemeebold';
    return 'Unknown Brand';
  };

  const getVendorFromStatus = (item) => {
    if (!item || !item.ean_code) return 'Unknown';
    // Placeholder - adjust based on your actual vendor data
    if (item.ean_code.startsWith('890435')) return 'Hive';
    if (item.ean_code.startsWith('890913')) return 'Merhaki';
    if (item.ean_code.startsWith('300000')) return 'Brand';
    return 'Assure';
  };

  const calculatePOIntent = (item) => {
    if (!item) return '0';
    // Calculate PO intent based on safety stock and current stock
    const drr = parseFloat(item.drr_30d) || 0;
    const safetyStock = parseFloat(item.safety_stock_days || 0) * drr;
    const poIntent = Math.max(0, safetyStock - (item.current_stock || 0));
    return formatNumber(Math.round(poIntent));
  };

  const formatDateForChart = (dateString, index) => {
    if (!dateString) return `Day ${index + 1}`;
    try {
      const date = new Date(dateString);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const day = date.getDate();
      const month = months[date.getMonth()];
      return `${month} ${day}`;
    } catch (e) {
      return `Day ${index + 1}`;
    }
  };

  const truncateString = (str, maxLength) => {
    if (!str) return '';
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + '...';
  };

  // Fetch data from API with filter parameters
  const fetchData = async (filterParams = {}, page = 1, limit = 15) => {
    try {
      setLoading(true);
      
      // Build query string from filter parameters
      const queryParams = new URLSearchParams();
      
      if (filterParams.brand && filterParams.brand !== 'All Brands') {
        queryParams.append('brand', filterParams.brand);
      }
      if (filterParams.vendor && filterParams.vendor !== 'All Vendors') {
        queryParams.append('vendor', filterParams.vendor);
      }
      if (filterParams.location && filterParams.location !== 'All Locations') {
        queryParams.append('location', filterParams.location);
      }
      if (filterParams.category && filterParams.category !== 'All Categories') {
        queryParams.append('category', filterParams.category);
      }
      
      // Add pagination parameters
      queryParams.append('page', page);
      queryParams.append('limit', limit);
      
      const queryString = queryParams.toString();
      const url = `http://localhost:5000/api/planning${queryString ? '?' + queryString : ''}`;
      
      console.log('Fetching data from:', url); // Debug log
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      setApiData(data);
      
      // ALWAYS update filter options from API response (for cascading filters)
      if (data.filters) {
        setFilters(prev => ({
          brand: {
            ...prev.brand,
            options: data.filters.brands || []
          },
          vendor: {
            ...prev.vendor,
            options: data.filters.vendors?.filter(v => v && v.trim() !== '') || []
          },
          location: {
            ...prev.location,
            options: data.filters.locations?.filter(loc => loc) || []
          },
          category: {
            ...prev.category,
            options: data.filters.categories || []
          }
        }));
      }
      
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Main metrics data from API
  const metrics = apiData ? [
    {
      title: 'TOTAL STOCK',
      value: formatNumber(apiData.summary.total_stock),
      // change: '1.2% vs last week',
      icon: <Box size={20} />,
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)',
      borderColor: '#3b82f6'
    },
    {
      title: 'IN TRANSIT',
      value: formatNumber(apiData.summary.in_transit),
      icon: <Truck size={20} />,
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)',
      borderColor: '#3b82f6'
    },
    {
      title: 'CURRENT STOCK',
      value: formatNumber(apiData.summary.current_stock),
      subtitle: 'WH + Marketplace',
      icon: <Warehouse size={20} />,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      borderColor: '#10b981'
    },
    {
      title: 'OVER INVENTORY',
      value: formatNumber(apiData.summary.over_inventory),
      subtitle: '> 90 Days Cover',
      icon: <TrendingUp size={20} />,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      borderColor: '#f59e0b'
    },
    {
      title: 'INVENTORY (COGS)',
      value: formatCurrency(apiData.summary.inventory_cogs),
      subtitle: 'Total Value',
      icon: <ShoppingBag size={20} />,
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)',
      borderColor: '#3b82f6'
    }
  ] : [];

  // Alert metrics from API
  const alertMetrics = apiData ? [
    {
      title: 'STOCK ALERT',
      value: apiData.summary.stock_alert?.toString() || '0',
      subtitle: getStockAlertSubtitle(apiData.sku_inventory_details),
      color: '#ef4444',
      icon: <AlertTriangle size={22} />,
      bgColor: '#ef44441a',
      borderColor: '#ff0404be'
    },
    {
      title: 'AVG DAYS COVER',
      value: apiData.summary.avg_days_cover?.toString() || '0',
      color: '#3b82f6',
      icon: <Package size={22} />,
      bgColor: 'rgba(59, 130, 246, 0.1)',
      borderColor: '#3b82f6'
    },
    {
      title: 'UPCOMING STOCK',
      value: formatNumber(apiData.summary.upcoming_stock),
      subtitle: 'Pending Receipts',
      color: '#8b5cf6',
      icon: <Package size={22} />,
      bgColor: 'rgba(139, 92, 246, 0.1)',
      borderColor: '#3b82f6'
    },
    {
      title: 'PO REQUIRED',
      value: apiData.summary.po_required?.toString() || '0',
      subtitle: 'Release to vendor',
      color: '#a855f7',
      icon: <Package size={22} />,
      bgColor: 'hsla(271, 91%, 65%, 0.10)',
      borderColor: '#3b82f6'
    }
  ] : [];

// Transform API SKU data to match table structure
const skuData = apiData ? (apiData.sku_inventory_details || []).map(item => {
  // Use inventory_status from API directly, but map to your frontend statuses
  let stockStatus = 'good';
  
  // Map API statuses to your frontend statuses
  switch(item.inventory_status) {
    case 'LOW_STOCK':
      stockStatus = 'low';
      break;
    case 'PO_REQUIRED':
      stockStatus = 'po';
      break;
    case 'ZERO_STOCK': // If API has this status
    default:
      if (item.current_stock === 0) {
        stockStatus = 'zero';
      }
      break;
  }

  // Determine cover status based on days_of_cover
  let coverStatus = 'good';
  const daysCover = parseFloat(item.days_of_cover) || 0;
  if (daysCover <= 0) coverStatus = 'zero';
  else if (daysCover <= 14) coverStatus = 'low';

  // Use brand from API response, fallback to EAN-based detection
  const brand = item.brand || getBrandFromEAN(item.ean_code);
  
  // Determine PO Intent - use po_intent_units from API if available
  let poIntentDisplay = '—';
  let poIntentIcon = false;
  
  if (item.po_intent_units !== undefined && item.po_intent_units !== null) {
    // If po_intent_units exists and has a value
    const poIntentValue = parseFloat(item.po_intent_units);
    if (!isNaN(poIntentValue) && poIntentValue > 0) {
      poIntentDisplay = {
        value: formatNumber(Math.round(poIntentValue)),
        icon: true
      };
      poIntentIcon = true;
    }
  } else if (item.inventory_status === 'PO_REQUIRED') {
    // Fallback to calculation if po_intent_units is not available but PO is required
    poIntentDisplay = {
      value: calculatePOIntent(item),
      icon: true
    };
    poIntentIcon = true;
  }
  
  return {
    brand: brand,
    sku: item.ean_code || 'N/A',
    product: truncateString(item.product_title || item.ean_code, 30), // Use product_title from API
    currentStock: item.current_stock || 0,
    speed: Math.round(parseFloat(item.drr_30d) || 0), // Using DRR as speed
    daysCover: Math.round(daysCover),
    inTransit: item.in_transit_stock || 0,
    vendor: item.vendor_name || getVendorFromStatus(item), // Use vendor_name from API
    poStatus: item.inventory_status === 'PO_REQUIRED' ? 'PO Needed' : '—',
    poIntent: poIntentDisplay,
    poIntentIcon: poIntentIcon, // Add this flag to check if icon should be shown
    upcomingStock: { 
      value: formatNumber(item.upcoming_stock), 
      days: '7d' // Placeholder - you might want to calculate this
    },
    stockStatus: stockStatus,
    coverStatus: coverStatus
  };
}) : [];

  // Days Cover Trend Data from API
  const trendData = apiData ? (apiData.summary.days_cover_trend || []).map((item, index) => ({
    name: formatDateForChart(item.snapshot_date, index),
    days: parseFloat(item.avg_days_cover) || 0
  })) : [];

  // Inventory Distribution Data from API
  const distributionData = apiData ? [
    { name: "Increff", warehouse: apiData.summary.inventory_distribution?.increff || 0, marketplace: 0 },
    { name: "KV Traders", warehouse: apiData.summary.inventory_distribution?.kv_traders || 0, marketplace: 0 },
    { name: "Processing", warehouse: apiData.summary.inventory_distribution?.processing || 0, marketplace: 0 },
    { name: "FBA", warehouse: 0, marketplace: apiData.summary.inventory_distribution?.fba || 0 },
    { name: "FBF", warehouse: 0, marketplace: apiData.summary.inventory_distribution?.fbf || 0 },
    { name: "Myntra", warehouse: 0, marketplace: apiData.summary.inventory_distribution?.myntra || 0 },
    { name: "RK World", warehouse: 0, marketplace: apiData.summary.inventory_distribution?.rk_world || 0 },
  ] : [];

  // Quick Commerce Data from API
  const commerceData = apiData ? [
    { name: 'Instamart', units: apiData.summary.quick_commerce_speed?.instamart || 0 },
    { name: 'Zepo', units: apiData.summary.quick_commerce_speed?.zepto || 0 },
    { name: 'Blinkit B2B', units: apiData.summary.quick_commerce_speed?.blinkit_b2b || 0 },
    { name: 'Blinkit B2C', units: apiData.summary.quick_commerce_speed?.blinkit_b2c || 0 }
  ] : [];

  const handleFilterChange = (key, value) => {
    // Update the filter state
    setFilters(prev => ({ 
      ...prev, 
      [key]: { ...prev[key], value } 
    }));
    
    // Reset to page 1 when filters change
    setCurrentPage(1);
    
    // Build filter parameters object
    const updatedFilters = {
      ...filters,
      [key]: { ...filters[key], value }
    };
    
    const filterParams = {
      brand: updatedFilters.brand.value,
      vendor: updatedFilters.vendor.value,
      location: updatedFilters.location.value,
      category: updatedFilters.category.value
    };
    
    // Fetch data with new filters and reset to page 1
    fetchData(filterParams, 1, itemsPerPage);
  };

  const handleRefresh = () => {
    // Get current filter values
    const filterParams = {
      brand: filters.brand.value,
      vendor: filters.vendor.value,
      location: filters.location.value,
      category: filters.category.value
    };
    
    fetchData(filterParams, currentPage, itemsPerPage);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    
    const filterParams = {
      brand: filters.brand.value,
      vendor: filters.vendor.value,
      location: filters.location.value,
      category: filters.category.value
    };
    
    fetchData(filterParams, newPage, itemsPerPage);
    
    // Scroll to top of table
    document.querySelector('.table-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newLimit) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1); // Reset to first page
    
    const filterParams = {
      brand: filters.brand.value,
      vendor: filters.vendor.value,
      location: filters.location.value,
      category: filters.category.value
    };
    
    fetchData(filterParams, 1, newLimit);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-container">
          <AlertTriangle size={48} color="#ef4444" />
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <button className="btn btn-refresh" onClick={fetchData}>
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <Box size={24} className="logo-icon-title" />
          <div className="logo-title">
            <h2 className='title-text'>Product Availability Dashboard</h2>
            <p className="subtitle">Real-time inventory tracking across all channels</p>
          </div>
        </div>
        <div className="header-actions">
          <div className="last-updated">
            Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <button className="btn btn-refresh" onClick={handleRefresh}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Main Metrics */}
        <div className="metrics-section">
          <div className="metrics-grid">
            {metrics.map((metric, index) => (
              <div
                key={index}
                className="metric-card"
                style={{
                  // backgroundColor: metric.bgColor,
                  borderLeft: `4px solid ${metric.borderColor}`
                }}
              >
                <div className="metric-header">
                  <div className="metric-icon" style={{ color: metric.color }}>
                    {metric.icon}
                  </div>
                  <div className='metric-gap'>
                    <div className="metric-title">{metric.title}</div>
                    <div className="metric-value">{metric.value}</div>
                  </div>
                </div>
                {metric.change && (
                  <div className="metric-change">{metric.change}</div>
                )}
                {metric.subtitle && (
                  <div className="metric-subtitle">{metric.subtitle}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Alert Metrics */}
        <div className="alert-metrics-section">
          {alertMetrics.map((metric, index) => (
            <div
              key={index}
              className="alert-metric-card"
              style={{
                borderLeft: `4px solid ${metric.borderColor}`,
                // backgroundColor: metric.bgColor ,
              }}
            >
              <div className="alert-icon" style={{ color: metric.color, backgroundColor: `${metric.color}1A` }}>
                {metric.icon}
              </div>
              <div>
                <div className="alert-metric-header">
                  <span className="metric-label">{metric.title}</span>
                </div>
                <div className="alert-metric-value" style={{ color: "white" }}>
                  {metric.value}
                </div>
                {metric.subtitle && (
                  <div className="alert-metric-subtitle">{metric.subtitle}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Filters and Table Section */}
        <div className="filters-table-container">
          {/* Filters */}
          <div className="filters-section">
            <div className="section-header">
              <h3>
                <Filter size={18} color='blue' />
                Filters
              </h3>
            </div>
            <div className="filters-grid">
              {Object.entries(filters).map(([key, filter]) => {
                const Icon = filter.icon;

                return (
                  <div key={key} className="filter-group">
                    <label>
                      <Icon size={14} className="filter-icon" />
                      {filter.label}
                    </label>

                    <div className="select-wrapper">
                      <select
                        value={filter.value}
                        onChange={(e) => handleFilterChange(key, e.target.value)}
                      >
                        <option value={`All ${filter.label}s`}>All {filter.label}s</option>
                        {filter.options && filter.options.map((option, index) => (
                          <option key={index} value={option || 'Unknown'}>
                            {option || 'Unknown'}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SKU Table */}
          <div className="table-section">
            <div className="section-header">
              <h3>SKU Inventory Details</h3>
              <div className="legend">
                <span className="legend-item">
                  <span className="legend-dot zero"></span>
                  Zero Stock
                </span>
                <span className="legend-item">
                  <span className="legend-dot low"></span>
                  Low Cover
                </span>
                <span className="legend-item">
                  <span className="legend-dot po"></span>
                  PO Required
                </span>
              </div>
            </div>
            <div className="table-container">
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>Brand</th>
                    <th>SKU</th>
                    <th>Product</th>
                    <th>Current Stock</th>
                    <th>Speed</th>
                    <th>Days Cover</th>
                    <th>In Transit</th>
                    <th>Vendor</th>
                    <th>PO Status</th>
                    <th>PO Intent</th>
                    <th>Upcoming Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {skuData.map((row, index) => (
                    <tr
                      key={index}
                      className={`rowHeight ${row.stockStatus === 'zero'
                          ? 'row-alert-zero'
                          : row.stockStatus === 'low'
                            ? 'row-alert-low'
                            : row.stockStatus === 'po'
                              ? 'row-alert-po'
                              : ''
                        }`}
                    >
                      <td>
                        <span className={`brand-tag ${row.brand.includes('Gabru') ? 'gabru' : row.brand.includes('Yog') ? 'yog' : row.brand.includes('Seoul') ? 'seoul' : row.brand.includes('Makemeebold') ? 'makemeebold' : 'other'}`}>
                          {row.brand}
                        </span>
                      </td>
                      <td className="sku-cell">{row.sku}</td>
                      <td className="product-cell">{row.product}</td>
                      <td>
                        <span className={`stock-value ${row.stockStatus}`}>
                          {row.currentStock.toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <div className="speed-indicator">
                          <span className="speed-value">{row.speed}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`days-cover ${row.coverStatus}`}>
                          {row.daysCover}
                        </span>
                      </td>
                      <td className="transit-cell">{row.inTransit.toLocaleString()}</td>
                      <td className="vendor-cell">{row.vendor}</td>
                      <td>
                        {row.poStatus === 'PO Needed' ? (
                          <button className="po-status-btn">
                            <ShoppingCart size={12}  color='black'/>
                            PO Needed
                          </button>
                        ) : (
                          <span className="po-status-empty">{row.poStatus}</span>
                        )}
                      </td>
                      <td>
                  {row.poIntentIcon ? (
                    <span className="po-intent-value">
                      <TrendingUp size={12} />
                      {typeof row.poIntent === 'object' ? row.poIntent.value : row.poIntent}
                    </span>
                  ) : (
                    <span className="po-intent-empty">{row.poIntent}</span>
                  )}
                </td>
                      <td>
                        <span className="upcoming-stock">
                          <Package size={12} />
                          {row.upcomingStock.value}
                          <span className="upcoming-days">in {row.upcomingStock.days}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {apiData && apiData.pagination && (
              <div className="pagination-container">
                <div className="pagination-info">
                  <span className="pagination-text">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                    {Math.min(currentPage * itemsPerPage, apiData.pagination.total || (currentPage * itemsPerPage))} 
                    {apiData.pagination.total && ` of ${apiData.pagination.total}`}
                  </span>
                  
                  <div className="items-per-page">
                    <label htmlFor="itemsPerPage">Items per page:</label>
                    <select 
                      id="itemsPerPage"
                      value={itemsPerPage} 
                      onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                      className="items-per-page-select"
                    >
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>
                
                <div className="pagination-buttons">
                  <button 
                    className="pagination-btn"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                  >
                    First
                  </button>
                  
                  <button 
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  
                  <div className="page-numbers">
                    {(() => {
                      const totalPages = apiData.pagination.totalPages || currentPage;
                      const pages = [];
                      let startPage = Math.max(1, currentPage - 2);
                      let endPage = Math.min(totalPages, currentPage + 2);
                      
                      // Adjust if we're near the start
                      if (currentPage <= 3) {
                        endPage = Math.min(5, totalPages);
                      }
                      
                      // Adjust if we're near the end
                      if (currentPage >= totalPages - 2) {
                        startPage = Math.max(1, totalPages - 4);
                      }
                      
                      for (let i = startPage; i <= endPage; i++) {
                        pages.push(
                          <button
                            key={i}
                            className={`page-number ${i === currentPage ? 'active' : ''}`}
                            onClick={() => handlePageChange(i)}
                          >
                            {i}
                          </button>
                        );
                      }
                      
                      return pages;
                    })()}
                  </div>
                  
                  <button 
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= (apiData.pagination.totalPages || currentPage)}
                  >
                    Next
                  </button>
                  
                  <button 
                    className="pagination-btn"
                    onClick={() => handlePageChange(apiData.pagination.totalPages || currentPage)}
                    disabled={currentPage >= (apiData.pagination.totalPages || currentPage)}
                  >
                    Last
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-section">
          {/* Days Cover Trend */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Days Cover Trend</h3>
              <div className="chart-icon">
                <TrendingUp size={14} />
              </div>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3a" vertical={false} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    domain={[0, 80]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '6px',
                      color: '#fff'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="days"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Inventory Distribution */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Inventory Distribution</h3>
              <div className="chart-legend">
                <span className="legend-item">
                  <span className="legend-box warehouse"></span>
                  Warehouse
                </span>
                <span className="legend-item">
                  <span className="legend-box marketplace"></span>
                  Marketplace
                </span>
              </div>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={distributionData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                  barCategoryGap={10}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#2a2e3a"
                    horizontal={false}
                  />

                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                    domain={[0, Math.max(...distributionData.map(d => Math.max(d.warehouse, d.marketplace))) * 1.1 || 1000]}
                  />

                  <YAxis
                    type="category"
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 11 }}
                    width={90}
                    interval={0}
                  />

                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: 8,
                      color: "#fff",
                      fontSize: 12,
                    }}
                    formatter={(value) => value.toLocaleString()}
                  />

                  <Bar
                    dataKey="warehouse"
                    fill="#3b82f6"
                    barSize={16}
                    radius={[0, 6, 6, 0]}
                  />

                  <Bar
                    dataKey="marketplace"
                    fill="#22c55e"
                    barSize={18}
                    radius={[0, 6, 6, 0]}
                  />
                </BarChart>

              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Commerce Speed */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Quick Commerce Speed</h3>
              <div className="units-label">
                <TrendingUp size={12} />
                Units/Day
              </div>
            </div>
            <div className="commerce-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={commerceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3a" vertical={false} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 10 }}
                    angle={0}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    domain={[0, Math.max(...commerceData.map(d => d.units)) * 1.2 || 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '6px',
                      color: '#fff'
                    }}
                  />
                  <Bar
                    dataKey="units"
                    fill="#00cd6b"
                    radius={[4, 4, 0, 0]}
                    barSize={70}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDashboard;