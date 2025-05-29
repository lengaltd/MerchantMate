import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  Users, 
  Package, 
  ShoppingCart,
  Receipt,
  DollarSign,
  BarChart3
} from "lucide-react";

interface Sale {
  id: string;
  totalAmount: string;
  paymentMethod: string;
  createdAt: string;
  customer?: {
    name: string;
  };
  items: Array<{
    quantity: number;
    unitPrice: string;
    totalPrice: string;
    product: {
      name: string;
    };
  }>;
}

interface Product {
  id: string;
  name: string;
  price: string;
  stockQuantity: number;
  type: string;
}

interface Customer {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  createdAt: string;
}

interface Expense {
  id: string;
  description: string;
  amount: string;
  category: string;
  createdAt: string;
}

export default function Reports() {
  const [reportType, setReportType] = useState("sales");
  const [dateRange, setDateRange] = useState("30d");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: sales } = useQuery<Sale[]>({
    queryKey: ["/api/sales"],
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: expenses } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const formatCurrency = (amount: string | number) => {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getFilteredData = () => {
    const now = new Date();
    let startDateTime: Date;
    
    switch (dateRange) {
      case "7d":
        startDateTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDateTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDateTime = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "custom":
        startDateTime = startDate ? new Date(startDate) : new Date(0);
        break;
      default:
        startDateTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const endDateTime = dateRange === "custom" && endDate ? new Date(endDate) : now;

    const filterByDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date >= startDateTime && date <= endDateTime;
    };

    return {
      sales: sales?.filter(sale => filterByDate(sale.createdAt)) || [],
      expenses: expenses?.filter(expense => filterByDate(expense.createdAt)) || [],
      customers: customers?.filter(customer => filterByDate(customer.createdAt)) || [],
    };
  };

  const generateSalesReport = () => {
    const { sales: filteredSales } = getFilteredData();
    
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0);
    const totalTransactions = filteredSales.length;
    const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    
    const paymentMethodBreakdown = filteredSales.reduce((acc, sale) => {
      acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + parseFloat(sale.totalAmount);
      return acc;
    }, {} as Record<string, number>);

    const productSales = filteredSales.reduce((acc, sale) => {
      sale.items.forEach(item => {
        const productName = item.product.name;
        if (!acc[productName]) {
          acc[productName] = { quantity: 0, revenue: 0 };
        }
        acc[productName].quantity += item.quantity;
        acc[productName].revenue += parseFloat(item.totalPrice);
      });
      return acc;
    }, {} as Record<string, { quantity: number; revenue: number }>);

    const topProducts = Object.entries(productSales)
      .sort(([,a], [,b]) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      totalRevenue,
      totalTransactions,
      averageOrderValue,
      paymentMethodBreakdown,
      topProducts,
      sales: filteredSales,
    };
  };

  const generateExpensesReport = () => {
    const { expenses: filteredExpenses } = getFilteredData();
    
    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    
    const categoryBreakdown = filteredExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + parseFloat(expense.amount);
      return acc;
    }, {} as Record<string, number>);

    const topCategories = Object.entries(categoryBreakdown)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    return {
      totalExpenses,
      categoryBreakdown,
      topCategories,
      expenses: filteredExpenses,
    };
  };

  const generateCustomersReport = () => {
    const { customers: filteredCustomers } = getFilteredData();
    
    const totalCustomers = filteredCustomers.length;
    const customersWithEmail = filteredCustomers.filter(c => c.email).length;
    const customersWithPhone = filteredCustomers.filter(c => c.phoneNumber).length;

    return {
      totalCustomers,
      customersWithEmail,
      customersWithPhone,
      customers: filteredCustomers,
    };
  };

  const generateInventoryReport = () => {
    const totalProducts = products?.length || 0;
    const lowStockProducts = products?.filter(p => p.stockQuantity <= 10) || [];
    const outOfStockProducts = products?.filter(p => p.stockQuantity === 0) || [];
    const totalInventoryValue = products?.reduce((sum, product) => {
      return sum + (parseFloat(product.price) * product.stockQuantity);
    }, 0) || 0;

    return {
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalInventoryValue,
      products: products || [],
    };
  };

  const downloadReport = () => {
    let reportData: any;
    let filename = `${reportType}_report_${new Date().toISOString().split('T')[0]}.json`;

    switch (reportType) {
      case "sales":
        reportData = generateSalesReport();
        break;
      case "expenses":
        reportData = generateExpensesReport();
        break;
      case "customers":
        reportData = generateCustomersReport();
        break;
      case "inventory":
        reportData = generateInventoryReport();
        break;
      default:
        reportData = {};
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderSalesReport = () => {
    const report = generateSalesReport();
    
    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="card-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-xl font-bold text-secondary">
                    {formatCurrency(report.totalRevenue)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Transactions</p>
                  <p className="text-xl font-bold text-primary">
                    {report.totalTransactions}
                  </p>
                </div>
                <ShoppingCart className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Order Value</p>
                  <p className="text-xl font-bold text-accent">
                    {formatCurrency(report.averageOrderValue)}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Methods */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(report.paymentMethodBreakdown).map(([method, amount]) => (
                <div key={method} className="flex justify-between items-center">
                  <span className="capitalize text-gray-600">
                    {method.replace('_', ' ')}
                  </span>
                  <span className="font-medium">
                    {formatCurrency(amount)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.topProducts.slice(0, 5).map(([productName, data]) => (
                <div key={productName} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{productName}</p>
                    <p className="text-sm text-gray-600">{data.quantity} units sold</p>
                  </div>
                  <span className="font-medium text-secondary">
                    {formatCurrency(data.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderExpensesReport = () => {
    const report = generateExpensesReport();
    
    return (
      <div className="space-y-6">
        <Card className="card-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Expenses</p>
                <p className="text-xl font-bold text-red-500">
                  {formatCurrency(report.totalExpenses)}
                </p>
              </div>
              <Receipt className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-shadow">
          <CardHeader>
            <CardTitle>Expense Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.topCategories.map(([category, amount]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="text-gray-600">{category}</span>
                  <span className="font-medium text-red-500">
                    {formatCurrency(amount)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCustomersReport = () => {
    const report = generateCustomersReport();
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Card className="card-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Customers</p>
                  <p className="text-xl font-bold text-primary">
                    {report.totalCustomers}
                  </p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">With Email</p>
                  <p className="text-xl font-bold text-accent">
                    {report.customersWithEmail}
                  </p>
                </div>
                <Users className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="card-shadow">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Customers with Email</span>
                <span className="font-medium">{report.customersWithEmail}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Customers with Phone</span>
                <span className="font-medium">{report.customersWithPhone}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderInventoryReport = () => {
    const report = generateInventoryReport();
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Card className="card-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Products</p>
                  <p className="text-xl font-bold text-primary">
                    {report.totalProducts}
                  </p>
                </div>
                <Package className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Inventory Value</p>
                  <p className="text-xl font-bold text-secondary">
                    {formatCurrency(report.totalInventoryValue)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Low Stock</p>
                  <p className="text-xl font-bold text-yellow-500">
                    {report.lowStockProducts.length}
                  </p>
                </div>
                <Package className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Out of Stock</p>
                  <p className="text-xl font-bold text-red-500">
                    {report.outOfStockProducts.length}
                  </p>
                </div>
                <Package className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {report.lowStockProducts.length > 0 && (
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle>Low Stock Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {report.lowStockProducts.slice(0, 10).map((product) => (
                  <div key={product.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-600">{formatCurrency(product.price)}</p>
                    </div>
                    <span className="font-medium text-red-500">
                      {product.stockQuantity} left
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderReport = () => {
    switch (reportType) {
      case "sales":
        return renderSalesReport();
      case "expenses":
        return renderExpensesReport();
      case "customers":
        return renderCustomersReport();
      case "inventory":
        return renderInventoryReport();
      default:
        return null;
    }
  };

  return (
    <div className="p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Reports</h1>
          <p className="text-gray-600">Generate detailed business reports</p>
        </div>
        <Button onClick={downloadReport} className="bg-primary text-white">
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>

      {/* Report Controls */}
      <Card className="card-shadow mb-6">
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="reportType">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales Report</SelectItem>
                  <SelectItem value="expenses">Expenses Report</SelectItem>
                  <SelectItem value="customers">Customers Report</SelectItem>
                  <SelectItem value="inventory">Inventory Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dateRange">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dateRange === "custom" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      {renderReport()}
    </div>
  );
}
