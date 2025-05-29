import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Building2, 
  TrendingUp, 
  DollarSign,
  UserPlus,
  UserCheck,
  BarChart3,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

interface DashboardStats {
  appStaff: number;
  activeSponsors: number;
  totalMerchants: number;
  totalRevenue: number;
  revenueGrowth: number;
  activeUsers: number;
  totalSalesToday: number;
  systemHealth: number;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  time: string;
}

export default function SuperAdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/super-admin/stats"],
    retry: false,
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery<RecentActivity[]>({
    queryKey: ["/api/super-admin/activities"],
    retry: false,
  });

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
            <p className="text-blue-100 mt-1">Monitor and manage the entire POS ecosystem</p>
          </div>
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span className="text-sm">System Status: Active</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total APP Staff</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.appStaff || 12}</p>
                <p className="text-sm text-blue-600 flex items-center mt-1">
                  <Users className="w-4 h-4 mr-1" />
                  +2 this month
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Sponsors</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.activeSponsors || 8}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <UserCheck className="w-4 h-4 mr-1" />
                  +1 this month
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Merchants</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalMerchants || 156}</p>
                <p className="text-sm text-purple-600 flex items-center mt-1">
                  <Building2 className="w-4 h-4 mr-1" />
                  +22 this month
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">TZS 45,230,000</p>
                <p className="text-sm text-orange-600 flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +12% this month
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" size="sm">
              <UserPlus className="w-4 h-4 mr-2" />
              Create APP Staff Account
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Building2 className="w-4 h-4 mr-2" />
              Register New Sponsor
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <BarChart3 className="w-4 h-4 mr-2" />
              View System Analytics
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">New merchant registered</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">APP Staff created</p>
                    <p className="text-xs text-gray-500">6 hours ago</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Monthly report generated</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">1,245</div>
            <p className="text-gray-600 text-sm">Active Users</p>
            <p className="text-xs text-gray-500 mt-1">Across all roles</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">TZS 890,000</div>
            <p className="text-gray-600 text-sm">Total Sales Today</p>
            <p className="text-xs text-green-500 mt-1 flex items-center justify-center">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              +35% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-emerald-600 mb-2">99.9%</div>
            <p className="text-gray-600 text-sm">System Health</p>
            <p className="text-xs text-gray-500 mt-1">Uptime this month</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}