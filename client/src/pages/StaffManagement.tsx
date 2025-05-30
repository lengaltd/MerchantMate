import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { 
  Users, 
  UserPlus, 
  Edit3, 
  Trash2, 
  Search,
  Filter,
  MoreVertical,
  Phone,
  Mail,
  Calendar,
  Shield
} from "lucide-react";

interface AppStaff {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateStaffData {
  fullName: string;
  phoneNumber: string;
  email?: string;
  password: string;
  role: string;
  status: string;
}

export default function StaffManagement() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<AppStaff | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [formData, setFormData] = useState<CreateStaffData>({
    fullName: "",
    phoneNumber: "",
    email: "",
    password: "",
    role: "APP_STAFF",
    status: "active"
  });

  // Fetch APP Staff
  const { data: appStaff, isLoading } = useQuery<AppStaff[]>({
    queryKey: ["/api/users", "APP_STAFF"],
    queryFn: async () => {
      const response = await fetch('/api/users?role=APP_STAFF');
      if (!response.ok) {
        throw new Error('Failed to fetch app staff');
      }
      return response.json();
    },
    retry: false,
  });

  // Create APP Staff mutation
  const createStaffMutation = useMutation({
    mutationFn: async (data: CreateStaffData) => {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create staff');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsCreateDialogOpen(false);
      setFormData({
        fullName: "",
        phoneNumber: "",
        email: "",
        password: "",
        role: "APP_STAFF",
        status: "active"
      });
      toast({
        title: "APP Staff Created",
        description: "New APP Staff member has been successfully created.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create APP Staff member",
        variant: "destructive",
      });
    },
  });

  // Delete APP Staff mutation
  const deleteStaffMutation = useMutation({
    mutationFn: async (staffId: string) => {
      const response = await fetch(`/api/users/${staffId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete staff');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "APP Staff Deleted",
        description: "APP Staff member has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete APP Staff member",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createStaffMutation.mutate(formData);
  };

  const handleDelete = (staffId: string, staffName: string) => {
    if (confirm(`Are you sure you want to delete ${staffName}? This action cannot be undone.`)) {
      deleteStaffMutation.mutate(staffId);
    }
  };

  const filteredStaff = appStaff?.filter(staff => {
    const matchesSearch = staff.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.phoneNumber.includes(searchTerm) ||
                         staff.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || staff.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  if (isLoading) {
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
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              APP Staff Management
            </h1>
            <p className="text-blue-100 mt-2 text-lg">Manage your APP Staff team members and permissions</p>
          </div>
          <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <Users className="w-5 h-5" />
            <span className="text-sm font-medium">{filteredStaff.length} Staff Members</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/80 backdrop-blur-sm border-0 shadow-lg"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg">
              <UserPlus className="w-4 h-4 mr-2" />
              Add APP Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New APP Staff</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="+255700000000"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                disabled={createStaffMutation.isPending}
              >
                {createStaffMutation.isPending ? "Creating..." : "Create APP Staff"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStaff.map((staff) => (
          <Card key={staff.id} className="group relative overflow-hidden border-0 bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative z-10">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">
                      {staff.fullName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-800">{staff.fullName}</CardTitle>
                    <Badge 
                      className={`mt-1 text-xs ${
                        staff.status === 'active' 
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {staff.status}
                    </Badge>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="relative z-10 space-y-3">
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <Phone className="w-4 h-4" />
                <span>{staff.phoneNumber}</span>
              </div>
              {staff.email && (
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                  <Mail className="w-4 h-4" />
                  <span>{staff.email}</span>
                </div>
              )}
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <Shield className="w-4 h-4" />
                <span>{staff.role}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-500">
                <Calendar className="w-4 h-4" />
                <span>Joined {new Date(staff.createdAt).toLocaleDateString()}</span>
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                  onClick={() => {
                    setSelectedStaff(staff);
                    setIsEditDialogOpen(true);
                  }}
                >
                  <Edit3 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => handleDelete(staff.id, staff.fullName)}
                  disabled={deleteStaffMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStaff.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-600 mb-2">No APP Staff Found</h3>
          <p className="text-slate-500 mb-4">
            {searchTerm ? "No staff members match your search criteria" : "Get started by adding your first APP Staff member"}
          </p>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add APP Staff
          </Button>
        </div>
      )}
    </div>
  );
}