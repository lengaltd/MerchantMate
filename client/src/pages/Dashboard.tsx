import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Receipt, UserPlus, Package, CircleAlert, ShoppingCart, Plus, ReceiptText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface DashboardStats {
  todaySales: number;
  todayTransactions: number;
  newCustomers: number;
  productsSold: number;
}

interface Sale {
  id: string;
  totalAmount: string;
  createdAt: string;
  customer?: {
    name: string;
  };
  items: Array<{
    quantity: number;
    product: {
      name: string;
    };
  }>;
}

interface LowStockProduct {
  id: string;
  name: string;
  stockQuantity: number;
  minStockLevel: number;
}

export default function Dashboard() {
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: recentSales, isLoading: salesLoading } = useQuery<Sale[]>({
    queryKey: ["/api/sales"],
  });

  const { data: lowStockProducts, isLoading: lowStockLoading } = useQuery<LowStockProduct[]>({
    queryKey: ["/api/products/low-stock"],
  });

  const { data: weeklySales } = useQuery<Array<{ date: string; amount: number }>>({
    queryKey: ["/api/analytics/weekly-sales"],
  });

  if (statsLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="p-4 pb-20">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-on-surface">
          Welcome back, {user?.fullName}
        </h1>
        <p className="text-gray-600">Here's what's happening with your business today</p>
      </div>

      {/* Quick Stats */}
      <section className="mb-6">
        <h2 className="text-lg font-medium text-on-surface mb-4">Today's Overview</h2>
        <div className="grid grid-cols-2 gap-4">
          <Card className="card-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today's Sales</p>
                  <p className="text-2xl font-bold text-secondary">
                    {stats ? formatCurrency(stats.todaySales) : '$0'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Transactions</p>
                  <p className="text-2xl font-bold text-primary">
                    {stats?.todayTransactions || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Receipt className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">New Customers</p>
                  <p className="text-2xl font-bold text-accent">
                    {stats?.newCustomers || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <UserPlus className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Products Sold</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats?.productsSold || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mb-6">
        <h2 className="text-lg font-medium text-on-surface mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          <Button className="bg-secondary text-white h-16 flex items-center justify-center space-x-3 shadow-lg">
            <ShoppingCart className="h-5 w-5" />
            <span className="font-medium">New Sale</span>
          </Button>
          <Button className="bg-primary text-white h-16 flex items-center justify-center space-x-3 shadow-lg">
            <Plus className="h-5 w-5" />
            <span className="font-medium">Add Product</span>
          </Button>
          <Button className="bg-accent text-white h-16 flex items-center justify-center space-x-3 shadow-lg">
            <UserPlus className="h-5 w-5" />
            <span className="font-medium">Add Customer</span>
          </Button>
          <Button className="bg-red-500 text-white h-16 flex items-center justify-center space-x-3 shadow-lg">
            <ReceiptText className="h-5 w-5" />
            <span className="font-medium">Add Expense</span>
          </Button>
        </div>
      </section>

      {/* Recent Sales */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-on-surface">Recent Sales</h2>
          <Button variant="ghost" size="sm" className="text-primary">
            View All
          </Button>
        </div>
        <Card className="card-shadow">
          <CardContent className="p-0">
            {salesLoading ? (
              <div className="p-4">
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : recentSales && recentSales.length > 0 ? (
              recentSales.slice(0, 3).map((sale, index) => (
                <div key={sale.id} className={`p-4 ${index < 2 ? 'border-b border-gray-100' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                        <ShoppingCart className="h-4 w-4 text-secondary" />
                      </div>
                      <div>
                        <p className="font-medium text-on-surface">
                          {sale.customer?.name || 'Walk-in Customer'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {sale.items.length} item{sale.items.length !== 1 ? 's' : ''} • {sale.items.map(item => item.product.name).join(', ')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-secondary">
                        {formatCurrency(parseFloat(sale.totalAmount))}
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatTime(sale.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No sales recorded yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Low Stock Alerts */}
      {!lowStockLoading && lowStockProducts && lowStockProducts.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-on-surface">Low Stock Alerts</h2>
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {lowStockProducts.length}
            </span>
          </div>
          <Card className="card-shadow">
            <CardContent className="p-0">
              {lowStockProducts.slice(0, 3).map((product, index) => (
                <div key={product.id} className={`p-4 ${index < Math.min(2, lowStockProducts.length - 1) ? 'border-b border-gray-100' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <CircleAlert className="h-4 w-4 text-red-500" />
                      </div>
                      <div>
                        <p className="font-medium text-on-surface">{product.name}</p>
                        <p className="text-sm text-gray-600">Low stock alert</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-500">
                        {product.stockQuantity} left
                      </p>
                      <Button variant="ghost" size="sm" className="text-xs text-primary font-medium h-auto p-0">
                        Restock
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      )}

      {/* Weekly Summary */}
      <section className="mb-6">
        <h2 className="text-lg font-medium text-on-surface mb-4">This Week's Performance</h2>
        <Card className="card-shadow">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-secondary">
                  {weeklySales ? formatCurrency(weeklySales.reduce((sum, day) => sum + day.amount, 0)) : '$0'}
                </p>
                <p className="text-sm text-gray-600">Total Sales</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {stats?.todayTransactions || 0}
                </p>
                <p className="text-sm text-gray-600">Transactions</p>
              </div>
            </div>

            {/* Simple bar chart representation */}
            {weeklySales && weeklySales.length > 0 && (
              <div className="space-y-2">
                {weeklySales.map((day, index) => {
                  const maxAmount = Math.max(...weeklySales.map(d => d.amount));
                  const percentage = maxAmount > 0 ? (day.amount / maxAmount) * 100 : 0;
                  const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
                  
                  return (
                    <div key={day.date} className="flex items-center justify-between text-sm">
                      <span className="w-8">{dayName}</span>
                      <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${index === weeklySales.length - 1 ? 'bg-accent' : 'bg-secondary'}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-gray-600 w-16 text-right">
                        {formatCurrency(day.amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
