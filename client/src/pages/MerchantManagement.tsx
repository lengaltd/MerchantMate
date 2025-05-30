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
  Building2, 
  UserPlus, 
  Edit3, 
  Trash2, 
  Search,
  Filter,
  MoreVertical,
  Phone,
  Mail,
  Calendar,
  Shield,
  Users,
  ShieldOff,
  ShieldCheck,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";

interface Merchant {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  businessName?: string;
}

interface CreateMerchantData {
  fullName: string;
  phoneNumber: string;
  email?: string;
  password: string;
  role: string;
  status: string;
  businessName?: string;
}

export default function MerchantManagement() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [formData, setFormData] = useState<CreateMerchantData>({
    fullName: "",
    phoneNumber: "",
    email: "",
    password: "",
    role: "MERCHANT",
    status: "active",
    businessName: ""
  });

  // Fetch Merchants
  const { data: merchants, isLoading } = useQuery<Merchant[]>({
    queryKey: ["/api/users", "MERCHANT"],
    retry: false,
  });

  // Create Merchant mutation
  const createMerchantMutation = useMutation({
    mutationFn: async (data: CreateMerchantData) => {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create merchant');
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
        role: "MERCHANT",
        status: "active",
        businessName: ""
      });
      toast({
        title: "Merchant Created",
        description: "New merchant has been successfully created.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create merchant",
        variant: "destructive",
      });
    },
  });

  // Update Merchant Status mutation
  const updateMerchantStatusMutation = useMutation({
    mutationFn: async ({ merchantId, status }: { merchantId: string; status: string }) => {
      const response = await fetch(`/api/users/${merchantId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update merchant status');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Status Updated",
        description: "Merchant status has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update merchant status",
        variant: "destructive",
      });
    },
  });

  // Delete Merchant mutation
  const deleteMerchantMutation = useMutation({
    mutationFn: async (merchantId: string) => {
      const response = await fetch(`/api/users/${merchantId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete merchant');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Merchant Deleted",
        description: "Merchant has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete merchant",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMerchantMutation.mutate(formData);
  };

  const handleStatusChange = (merchantId: string, newStatus: string, merchantName: string) => {
    const action = newStatus === 'active' ? 'enable' : 'disable';
    if (confirm(`Are you sure you want to ${action} access for ${merchantName}?`)) {
      updateMerchantStatusMutation.mutate({ merchantId, status: newStatus });
    }
  };

  const handleDelete = (merchantId: string, merchantName: string) => {
    if (confirm(`Are you sure you want to delete ${merchantName}? This action cannot be undone.`)) {
      deleteMerchantMutation.mutate(merchantId);
    }
  };

  const filteredMerchants = merchants?.filter(merchant => {
    const matchesSearch = merchant.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         merchant.phoneNumber.includes(searchTerm) ||
                         merchant.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         merchant.businessName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || merchant.status === statusFilter;
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
      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white p-8 rounded-2xl mb-8 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Merchant Management
            </h1>
            <p className="text-blue-100 mt-2 text-lg">Monitor and control merchant access and operations</p>
          </div>
          <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <Building2 className="w-5 h-5" />
            <span className="text-sm font-medium">{filteredMerchants.length} Merchants</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name, phone, email, or business..."
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
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Merchant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Merchant</DialogTitle>
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
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
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
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
                disabled={createMerchantMutation.isPending}
              >
                {createMerchantMutation.isPending ? "Creating..." : "Create Merchant"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Merchants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMerchants.map((merchant) => (
          <Card key={merchant.id} className="group relative overflow-hidden border-0 bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative z-10">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">
                      {merchant.fullName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-800">{merchant.fullName}</CardTitle>
                    {merchant.businessName && (
                      <p className="text-sm text-slate-600">{merchant.businessName}</p>
                    )}
                    <Badge 
                      className={`mt-1 text-xs ${
                        merchant.status === 'active' 
                          ? 'bg-green-100 text-green-700 border-green-200' 
                          : merchant.status === 'inactive'
                          ? 'bg-slate-100 text-slate-700 border-slate-200'
                          : 'bg-red-100 text-red-700 border-red-200'
                      }`}
                    >
                      {merchant.status}
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
                <span>{merchant.phoneNumber}</span>
              </div>
              {merchant.email && (
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                  <Mail className="w-4 h-4" />
                  <span>{merchant.email}</span>
                </div>
              )}
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <Building2 className="w-4 h-4" />
                <span>{merchant.role}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-500">
                <Calendar className="w-4 h-4" />
                <span>Joined {new Date(merchant.createdAt).toLocaleDateString()}</span>
              </div>
              {merchant.lastLogin && (
                <div className="flex items-center space-x-2 text-sm text-slate-500">
                  <Clock className="w-4 h-4" />
                  <span>Last seen {new Date(merchant.lastLogin).toLocaleDateString()}</span>
                </div>
              )}
              
              <div className="flex space-x-2 pt-4">
                {merchant.status === 'active' ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => handleStatusChange(merchant.id, 'inactive', merchant.fullName)}
                    disabled={updateMerchantStatusMutation.isPending}
                  >
                    <ShieldOff className="w-4 h-4 mr-1" />
                    Disable
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-green-200 text-green-600 hover:bg-green-50"
                    onClick={() => handleStatusChange(merchant.id, 'active', merchant.fullName)}
                    disabled={updateMerchantStatusMutation.isPending}
                  >
                    <ShieldCheck className="w-4 h-4 mr-1" />
                    Enable
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                  onClick={() => {
                    setSelectedMerchant(merchant);
                    setIsEditDialogOpen(true);
                  }}
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-slate-200 text-slate-600 hover:bg-slate-50"
                  onClick={() => handleDelete(merchant.id, merchant.fullName)}
                  disabled={deleteMerchantMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMerchants.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-600 mb-2">No Merchants Found</h3>
          <p className="text-slate-500 mb-4">
            {searchTerm ? "No merchants match your search criteria" : "Get started by adding your first merchant"}
          </p>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Merchant
          </Button>
        </div>
      )}
    </div>
  );
}