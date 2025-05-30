import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  Users, 
  Building2, 
  TrendingUp, 
  DollarSign,
  Activity,
  Shield,
  Eye,
  Settings,
  UserX,
  CheckCircle,
  AlertTriangle,
  Clock,
  Star
} from "lucide-react";

interface DashboardStats {
  totalMerchants: number;
  activeMerchants: number;
  inactiveMerchants: number;
  totalSponsors: number;
  recentActivity: number;
}

interface Merchant {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  status: string;
  businessName?: string;
  createdAt: string;
  lastLogin?: string;
}

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'success' | 'error';
}

export default function AppStaffDashboard() {
  const [selectedTab, setSelectedTab] = useState("overview");

  // Fetch dashboard stats
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/app-staff/stats"],
    retry: false,
  });

  // Fetch merchants
  const { data: merchants } = useQuery<Merchant[]>({
    queryKey: ["/api/users", "MERCHANT"],
    retry: false,
  });

  // Fetch recent activities
  const { data: activities } = useQuery<ActivityItem[]>({
    queryKey: ["/api/app-staff/activities"],
    retry: false,
  });

  const mockStats: DashboardStats = {
    totalMerchants: merchants?.length || 0,
    activeMerchants: merchants?.filter(m => m.status === 'active').length || 0,
    inactiveMerchants: merchants?.filter(m => m.status !== 'active').length || 0,
    totalSponsors: 0,
    recentActivity: activities?.length || 0
  };

  const mockActivities: ActivityItem[] = [
    {
      id: "1",
      type: "merchant_created",
      description: "New merchant registration: TechShop Ltd",
      timestamp: new Date().toISOString(),
      severity: "success"
    },
    {
      id: "2", 
      type: "merchant_disabled",
      description: "Merchant access disabled: QuickMart",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      severity: "warning"
    },
    {
      id: "3",
      type: "system_alert",
      description: "High transaction volume detected",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      severity: "info"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white p-4 sm:p-6 lg:p-8 rounded-2xl mb-6 sm:mb-8 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              APP Staff Dashboard
            </h1>
            <p className="text-blue-100 mt-2 text-sm sm:text-base lg:text-lg">Monitor and manage merchant operations</p>
          </div>
          <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <Shield className="w-5 h-5" />
            <span className="text-sm font-medium">Staff Control Panel</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="relative overflow-hidden border-0 bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10"></div>
          <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Merchants</CardTitle>
            <Building2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-slate-800">{mockStats.totalMerchants}</div>
            <p className="text-xs text-slate-500">Registered businesses</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10"></div>
          <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active Merchants</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-slate-800">{mockStats.activeMerchants}</div>
            <p className="text-xs text-slate-500">Currently operational</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10"></div>
          <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Inactive Merchants</CardTitle>
            <UserX className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-slate-800">{mockStats.inactiveMerchants}</div>
            <p className="text-xs text-slate-500">Require attention</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10"></div>
          <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Recent Activity</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-slate-800">{mockStats.recentActivity}</div>
            <p className="text-xs text-slate-500">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="merchants">Merchants</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-slate-50">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.severity === 'success' ? 'bg-green-500' :
                        activity.severity === 'warning' ? 'bg-orange-500' :
                        activity.severity === 'error' ? 'bg-red-500' : 'bg-blue-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800">{activity.description}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-purple-600" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button className="h-20 flex-col bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    <Users className="w-6 h-6 mb-2" />
                    <span className="text-sm">Manage Merchants</span>
                  </Button>
                  <Button className="h-20 flex-col bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                    <BarChart3 className="w-6 h-6 mb-2" />
                    <span className="text-sm">View Analytics</span>
                  </Button>
                  <Button className="h-20 flex-col bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <Eye className="w-6 h-6 mb-2" />
                    <span className="text-sm">Generate Reports</span>
                  </Button>
                  <Button className="h-20 flex-col bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                    <AlertTriangle className="w-6 h-6 mb-2" />
                    <span className="text-sm">System Alerts</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="merchants">
          <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle>Merchant Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">Merchant Management</h3>
                <p className="text-slate-500">Detailed merchant management features will be implemented here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle>Analytics & Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">Advanced Analytics</h3>
                <p className="text-slate-500">Comprehensive analytics and reporting dashboard</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle>Reports & Documentation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Eye className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">System Reports</h3>
                <p className="text-slate-500">Generate and view comprehensive system reports</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}