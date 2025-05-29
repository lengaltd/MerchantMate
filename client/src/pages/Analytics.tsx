import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package, Calendar, BarChart3 } from "lucide-react";
import { useState } from "react";

interface DashboardStats {
  todaySales: number;
  todayTransactions: number;
  newCustomers: number;
  productsSold: number;
}

interface WeeklySale {
  date: string;
  amount: number;
}

interface Product {
  id: string;
  name: string;
  stockQuantity: number;
  minStockLevel: number;
}

interface Sale {
  id: string;
  totalAmount: string;
  createdAt: string;
  items: Array<{
    quantity: number;
    product: {
      name: string;
    };
  }>;
}

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("7d");

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: weeklySales } = useQuery<WeeklySale[]>({
    queryKey: ["/api/analytics/weekly-sales"],
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: sales } = useQuery<Sale[]>({
    queryKey: ["/api/sales"],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getTopSellingProducts = () => {
    if (!sales) return [];
    
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const productName = item.product.name;
        if (!productSales[productName]) {
          productSales[productName] = { name: productName, quantity: 0, revenue: 0 };
        }
        productSales[productName].quantity += item.quantity;
        productSales[productName].revenue += parseFloat(sale.totalAmount) / sale.items.length;
      });
    });

    return Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  };

  const getTotalRevenue = () => {
    return weeklySales?.reduce((sum, day) => sum + day.amount, 0) || 0;
  };

  const getRevenueGrowth = () => {
    if (!weeklySales || weeklySales.length < 2) return 0;
    
    const firstHalf = weeklySales.slice(0, Math.floor(weeklySales.length / 2));
    const secondHalf = weeklySales.slice(Math.floor(weeklySales.length / 2));
    
    const firstHalfTotal = firstHalf.reduce((sum, day) => sum + day.amount, 0);
    const secondHalfTotal = secondHalf.reduce((sum, day) => sum + day.amount, 0);
    
    if (firstHalfTotal === 0) return 0;
    return ((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100;
  };

  const getLowStockCount = () => {
    return products?.filter(p => p.stockQuantity <= p.minStockLevel).length || 0;
  };

  const getAverageOrderValue = () => {
    if (!sales || sales.length === 0) return 0;
    const total = sales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0);
    return total / sales.length;
  };

  const revenueGrowth = getRevenueGrowth();

  return (
    <div className="p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Analytics</h1>
          <p className="text-gray-600">Business insights and performance metrics</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="card-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-xl font-bold text-secondary">
                  {formatCurrency(getTotalRevenue())}
                </p>
                <div className="flex items-center mt-1">
                  {revenueGrowth >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span className={`text-xs ${revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {Math.abs(revenueGrowth).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-xl font-bold text-primary">
                  {sales?.length || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">All time</p>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Order Value</p>
                <p className="text-xl font-bold text-accent">
                  {formatCurrency(getAverageOrderValue())}
                </p>
                <p className="text-xs text-gray-500 mt-1">Per transaction</p>
              </div>
              <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock Items</p>
                <p className="text-xl font-bold text-red-500">
                  {getLowStockCount()}
                </p>
                <p className="text-xs text-gray-500 mt-1">Need restocking</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Package className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Trend Chart */}
      <Card className="card-shadow mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Sales Trend</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {weeklySales && weeklySales.length > 0 ? (
            <div className="space-y-3">
              {weeklySales.map((day, index) => {
                const maxAmount = Math.max(...weeklySales.map(d => d.amount));
                const percentage = maxAmount > 0 ? (day.amount / maxAmount) * 100 : 0;
                const dayName = new Date(day.date).toLocaleDateString('en-US', { 
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                });
                
                return (
                  <div key={day.date} className="flex items-center justify-between text-sm">
                    <span className="w-16 text-gray-600">{dayName}</span>
                    <div className="flex-1 mx-3 bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-secondary h-3 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-secondary font-medium w-20 text-right">
                      {formatCurrency(day.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No sales data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Selling Products */}
      <Card className="card-shadow mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Top Selling Products</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {getTopSellingProducts().length > 0 ? (
            <div className="space-y-4">
              {getTopSellingProducts().map((product, index) => (
                <div key={product.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-on-surface">{product.name}</p>
                      <p className="text-sm text-gray-600">
                        {product.quantity} units sold
                      </p>
                    </div>
                  </div>
                  <span className="text-secondary font-medium">
                    {formatCurrency(product.revenue)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No product sales data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today's Performance */}
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Today's Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-secondary/5 rounded-lg">
              <p className="text-2xl font-bold text-secondary">
                {formatCurrency(stats?.todaySales || 0)}
              </p>
              <p className="text-sm text-gray-600">Sales</p>
            </div>
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <p className="text-2xl font-bold text-primary">
                {stats?.todayTransactions || 0}
              </p>
              <p className="text-sm text-gray-600">Transactions</p>
            </div>
            <div className="text-center p-4 bg-accent/5 rounded-lg">
              <p className="text-2xl font-bold text-accent">
                {stats?.newCustomers || 0}
              </p>
              <p className="text-sm text-gray-600">New Customers</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {stats?.productsSold || 0}
              </p>
              <p className="text-sm text-gray-600">Products Sold</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
