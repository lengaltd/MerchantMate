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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white p-8 rounded-2xl mb-8 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Super Admin Dashboard
            </h1>
            <p className="text-blue-100 mt-2 text-lg">Monitor and manage the entire POS ecosystem</p>
          </div>
          <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <Activity className="w-5 h-5" />
            <span className="text-sm font-medium">System Active</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
        <Card className="group relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-8 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-2 font-medium">Total APP Staff</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {stats?.appStaff || 12}
                </p>
                <p className="text-sm text-blue-600 flex items-center mt-3 font-medium">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  +2 this month
                </p>
              </div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl animate-pulse opacity-20"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-8 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-2 font-medium">Active Sponsors</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  {stats?.activeSponsors || 8}
                </p>
                <p className="text-sm text-emerald-600 flex items-center mt-3 font-medium">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  +1 this month
                </p>
              </div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                  <UserCheck className="w-8 h-8 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-green-400 rounded-2xl animate-pulse opacity-20"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-8 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-2 font-medium">Total Merchants</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                  {stats?.totalMerchants || 156}
                </p>
                <p className="text-sm text-purple-600 flex items-center mt-3 font-medium">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  +22 this month
                </p>
              </div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-violet-400 rounded-2xl animate-pulse opacity-20"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-8 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-2 font-medium">Total Revenue</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  TZS 45.2M
                </p>
                <p className="text-sm text-orange-600 flex items-center mt-3 font-medium">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  +12% this month
                </p>
              </div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-400 rounded-2xl animate-pulse opacity-20"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <Card className="relative overflow-hidden border-0 bg-white/90 backdrop-blur-sm shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-transparent"></div>
          <CardHeader className="relative z-10">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            <Button 
              className="w-full justify-start bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              size="lg"
            >
              <UserPlus className="w-5 h-5 mr-3" />
              Create APP Staff Account
            </Button>
            <Button 
              className="w-full justify-start bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              size="lg"
            >
              <Building2 className="w-5 h-5 mr-3" />
              Register New Sponsor
            </Button>
            <Button 
              className="w-full justify-start bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              size="lg"
            >
              <BarChart3 className="w-5 h-5 mr-3" />
              View System Analytics
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="relative overflow-hidden border-0 bg-white/90 backdrop-blur-sm shadow-xl lg:col-span-2">
          <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-indigo-500/10 to-transparent"></div>
          <CardHeader className="relative z-10">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="space-y-6">
              <div className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100 hover:shadow-md transition-all duration-300">
                <div className="relative">
                  <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full animate-ping opacity-20"></div>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">New merchant registered</p>
                  <p className="text-sm text-slate-600">TechMart Solutions joined the platform</p>
                  <p className="text-xs text-slate-500 mt-1">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 hover:shadow-md transition-all duration-300">
                <div className="relative">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-ping opacity-20"></div>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">APP Staff created</p>
                  <p className="text-sm text-slate-600">Sarah Johnson added to operations team</p>
                  <p className="text-xs text-slate-500 mt-1">6 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-100 hover:shadow-md transition-all duration-300">
                <div className="relative">
                  <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-violet-400 rounded-full animate-ping opacity-20"></div>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">Monthly report generated</p>
                  <p className="text-sm text-slate-600">Performance analytics ready for review</p>
                  <p className="text-xs text-slate-500 mt-1">1 day ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        <Card className="group relative overflow-hidden border-0 bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-transparent"></div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-400/20 to-transparent rounded-full"></div>
          <CardContent className="p-8 text-center relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-500">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
              1,245
            </div>
            <p className="text-slate-700 font-semibold mb-1">Active Users</p>
            <p className="text-xs text-slate-500 bg-slate-50 px-3 py-1 rounded-full inline-block">
              Across all roles
            </p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-0 bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-green-500/5 to-transparent"></div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-emerald-400/20 to-transparent rounded-full"></div>
          <CardContent className="p-8 text-center relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-500">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">
              TZS 890K
            </div>
            <p className="text-slate-700 font-semibold mb-1">Total Sales Today</p>
            <div className="flex items-center justify-center text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              +35% from yesterday
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-0 bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-purple-500/5 to-transparent"></div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-violet-400/20 to-transparent rounded-full"></div>
          <CardContent className="p-8 text-center relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-500">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">
              99.9%
            </div>
            <p className="text-slate-700 font-semibold mb-1">System Health</p>
            <div className="inline-flex items-center text-xs text-violet-600 bg-violet-50 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-violet-500 rounded-full mr-2 animate-pulse"></div>
              Uptime this month
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}