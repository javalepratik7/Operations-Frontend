import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { 
  TrendingUp, Package, Truck, Warehouse, 
  AlertTriangle, ShoppingBag, Filter,
  RefreshCw, ChevronDown, Box
} from 'lucide-react';
import './ProductDashboard.css';

const ProductDashboard = () => {
  const [filters, setFilters] = useState({
    brand: 'All Brands',
    vendor: 'All Vendors',
    location: 'All Locations',
    category: 'All Categories'
  });

  // Main metrics data
  const metrics = [
    {
      title: 'TOTAL STOCK',
      value: '35,975',
      change: '1.2% vs last week',
      icon: <Box size={20} />,
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)',
      borderColor: '#3b82f6'
    },
    {
      title: 'IN TRANSIT',
      value: '5,550',
      icon: <Truck size={20} />,
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)',
      borderColor: '#3b82f6'
    },
    {
      title: 'CURRENT STOCK',
      value: '28,655',
      subtitle: 'WH + Marketplace',
      icon: <Warehouse size={20} />,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      borderColor: '#10b981'
    },
    {
      title: 'OVER INVENTORY',
      value: '400',
      subtitle: '> 90 Days Cover',
      icon: <TrendingUp size={20} />,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      borderColor: '#f59e0b'
    },
    {
      title: 'INVENTORY (COGS)',
      value: '₹123.5L',
      subtitle: 'Total Value',
      icon: <ShoppingBag size={20} />,
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)',
      borderColor: '#3b82f6'
    }
  ];

  // Alert metrics
  const alertMetrics = [
    {
      title: 'STOCK ALERT',
      value: '4',
      subtitle: '1 Zero | 3 Low',
      color: '#ef4444',
      icon: <AlertTriangle size={18} />,
      bgColor: '#ef44441a',
      borderColor: '#ff0404be'
    },
    {
      title: 'AVG DAYS COVER',
      value: '48',
      color: '#3b82f6',
      icon: <Package size={18} />,
      bgColor: 'rgba(59, 130, 246, 0.1)',
      borderColor: '#3b82f6'
    },
    {
      title: 'UPCOMING STOCK',
      value: '12',
      subtitle: 'Pending Receipts',
      color: '#8b5cf6',
      icon: <Package size={18} />,
      bgColor: 'rgba(139, 92, 246, 0.1)',
      borderColor: '#3b82f6'
    },
    {
      title: 'PO REQUIRED',
      value: '5',
      subtitle: 'Release to vendor',
      color: '#a855f7',
      icon: <Package size={18} />,
      bgColor: 'hsla(271, 91%, 65%, 0.10)',
      borderColor: '#3b82f6'
    }
  ];

  // SKU Data
  const skuData = [
    {
      brand: 'Urban Gabru',
      sku: '100000661934',
      product: 'Urbangabru Hair R...',
      currentStock: 3800,
      speed: 73,
      daysCover: 69,
      inTransit: 500,
      vendor: 'Hive',
      poStatus: '—',
      poIntent: '—',
      upcomingStock: { value: '1,500', days: '7d' },
      stockStatus: 'good',
      coverStatus: 'good'
    },
    {
      brand: 'Urban Gabru',
      sku: '100000613704',
      product: 'UrbanGabru Hair V...',
      currentStock: 1180,
      speed: 47,
      daysCover: 35,
      inTransit: 200,
      vendor: 'Merhaki',
      poStatus: '—',
      poIntent: { value: '1,175', icon: true },
      upcomingStock: { value: '800', days: '10d' },
      stockStatus: 'good',
      coverStatus: 'good'
    },
    {
      brand: 'Urban Yog',
      sku: '100000662656',
      product: 'Urban Yog Hair Re...',
      currentStock: 125,
      speed: 11,
      daysCover: 14,
      inTransit: 0,
      vendor: 'Assure',
      poStatus: 'PO Needed',
      poIntent: { value: '506', icon: true },
      upcomingStock: { value: '500', days: '5d' },
      stockStatus: 'low',
      coverStatus: 'low'
    },
    {
      brand: 'Urban Gabru',
      sku: '100000688087',
      product: 'UrbanGabru Hair V...',
      currentStock: 6300,
      speed: 85,
      daysCover: 86,
      inTransit: 1000,
      vendor: 'Firstery',
      poStatus: '—',
      poIntent: '—',
      upcomingStock: { value: '2,000', days: '5d' },
      stockStatus: 'good',
      coverStatus: 'good'
    },
    {
      brand: 'Urban Yog',
      sku: '200000254662',
      product: 'Urban Yog Facial H...',
      currentStock: 0,
      speed: 12,
      daysCover: 0,
      inTransit: 300,
      vendor: 'Brand',
      poStatus: 'PO Needed',
      poIntent: { value: '720', icon: true },
      upcomingStock: { value: '700', days: '14d' },
      stockStatus: 'zero',
      coverStatus: 'zero'
    }
  ];

  // Days Cover Trend Data
  const trendData = [
    { name: 'Jan 1', days: 65 },
    { name: 'Jan 8', days: 58 },
    { name: 'Jan 15', days: 52 },
    { name: 'Jan 22', days: 45 },
    { name: 'Jan 29', days: 48 },
    { name: 'Feb 5', days: 50 },
    { name: 'Feb 12', days: 48 }
  ];

  // Inventory Distribution Data
  const distributionData = [
    { name: 'Incremental', value: 3000, warehouse: true },
    { name: 'KV Traders', value: 6000, warehouse: false },
    { name: 'Processing Center', value: 8000, warehouse: false },
    { name: 'Amazon FBA', value: 12000, warehouse: false },
    { name: 'Flipkart FBP', value: 9000, warehouse: false },
    { name: 'Myntra', value: 6000, warehouse: false },
    { name: 'RK World', value: 4000, warehouse: false }
  ];

  // Quick Commerce Data
  const commerceData = [
    { name: 'Instamart', units: 28 },
    { name: 'Zepo', units: 21 },
    { name: 'Blinkit B2B', units: 14 },
    { name: 'Blinkit B2C', units: 7 }
  ];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

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
          <div className="last-updated">Last updated: 4:05:23 PM</div>
          <button className="btn btn-refresh">
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
                  borderLeft: `3px solid ${metric.borderColor}`
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
                borderLeft: `3px solid ${metric.borderColor}`,
                // backgroundColor: metric.bgColor ,
              }}
            >
              <div className="alert-metric-header">
                <div className="alert-icon" style={{ color: metric.color }}>
                  {metric.icon}
                </div>
                <span className="metric-label">{metric.title}</span>
              </div>
              <div className="alert-metric-value" style={{ color: "white" }}>
                {metric.value}
              </div>
              {metric.subtitle && (
                <div className="alert-metric-subtitle">{metric.subtitle}</div>
              )}
            </div>
          ))}
        </div>

        {/* Filters and Table Section */}
        <div className="filters-table-container">
          {/* Filters */}
          <div className="filters-section">
            <div className="section-header">
              <h3>
                <Filter size={18} />
                Filters
              </h3>
            </div>
            <div className="filters-grid">
              {Object.entries(filters).map(([key, value]) => (
                <div key={key} className="filter-group">
                  <label>
                    <span className="filter-icon">◉</span>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </label>
                  <div className="select-wrapper">
                    <select 
                      value={value}
                      onChange={(e) => handleFilterChange(key, e.target.value)}
                    >
                      <option>{value}</option>
                    </select>
                    <ChevronDown size={14} />
                  </div>
                </div>
              ))}
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
                  <tr key={index} className={row.stockStatus === 'zero' ? 'row-alert-zero' : row.stockStatus === 'low' ? 'row-alert-low' : ''}>
                    <td>
                      <span className={`brand-tag ${row.brand.includes('Gabru') ? 'gabru' : 'yog'}`}>
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
                          <ShoppingBag size={12} />
                          PO Needed
                        </button>
                      ) : (
                        <span className="po-status-empty">{row.poStatus}</span>
                      )}
                    </td>
                    <td>
                      {typeof row.poIntent === 'object' && row.poIntent.icon ? (
                        <span className="po-intent-value">
                          <TrendingUp size={12} />
                          {row.poIntent.value}
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
              <ResponsiveContainer width="100%" height={180}>
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
              <ResponsiveContainer width="100%" height={180}>
                <BarChart 
                  data={distributionData}
                  layout="horizontal"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3a" horizontal={false} />
                  <XAxis 
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    domain={[0, 12000]}
                  />
                  <YAxis 
                    type="category"
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                    width={95}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '6px',
                      color: '#fff'
                    }}
                    formatter={(value) => value.toLocaleString()}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#3b82f6"
                    radius={[0, 4, 4, 0]}
                    barSize={14}
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
              <ResponsiveContainer width="100%" height={180}>
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
                    domain={[0, 28]}
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
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
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