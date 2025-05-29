import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Plus, ShoppingCart, Search, Trash2, Receipt } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Sale {
  id: string;
  totalAmount: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
  customer?: {
    id: string;
    name: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: string;
    totalPrice: string;
    product: {
      id: string;
      name: string;
      price: string;
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
}

interface SaleItem {
  productId: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
}

const saleSchema = z.object({
  customerId: z.string().optional(),
  paymentMethod: z.string().min(1, "Payment method is required"),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    unitPrice: z.string(),
    totalPrice: z.string(),
  })).min(1, "At least one item is required"),
});

type SaleFormData = z.infer<typeof saleSchema>;

export default function Sales() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<SaleItem[]>([]);
  const { toast } = useToast();

  const form = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      customerId: "",
      paymentMethod: "cash",
      items: [],
    },
  });

  const { data: sales, isLoading } = useQuery<Sale[]>({
    queryKey: ["/api/sales"],
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const createSaleMutation = useMutation({
    mutationFn: async (data: SaleFormData) => {
      const totalAmount = selectedItems.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0);
      const saleData = {
        ...data,
        totalAmount: totalAmount.toFixed(2),
        items: selectedItems,
      };
      const response = await apiRequest("POST", "/api/sales", saleData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setIsDialogOpen(false);
      setSelectedItems([]);
      form.reset();
      toast({
        title: "Success",
        description: "Sale recorded successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to record sale",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SaleFormData) => {
    if (selectedItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item to the sale",
        variant: "destructive",
      });
      return;
    }
    createSaleMutation.mutate({ ...data, items: selectedItems });
  };

  const addItemToSale = (productId: string, quantity: number) => {
    const product = products?.find(p => p.id === productId);
    if (!product) return;

    const unitPrice = parseFloat(product.price);
    const totalPrice = unitPrice * quantity;

    const existingItemIndex = selectedItems.findIndex(item => item.productId === productId);
    
    if (existingItemIndex >= 0) {
      const updatedItems = [...selectedItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + quantity,
        totalPrice: ((updatedItems[existingItemIndex].quantity + quantity) * unitPrice).toFixed(2),
      };
      setSelectedItems(updatedItems);
    } else {
      setSelectedItems([...selectedItems, {
        productId,
        quantity,
        unitPrice: unitPrice.toFixed(2),
        totalPrice: totalPrice.toFixed(2),
      }]);
    }
  };

  const removeItemFromSale = (productId: string) => {
    setSelectedItems(selectedItems.filter(item => item.productId !== productId));
  };

  const updateItemQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItemFromSale(productId);
      return;
    }

    const product = products?.find(p => p.id === productId);
    if (!product) return;

    const unitPrice = parseFloat(product.price);
    const totalPrice = unitPrice * newQuantity;

    setSelectedItems(selectedItems.map(item => 
      item.productId === productId 
        ? { ...item, quantity: newQuantity, totalPrice: totalPrice.toFixed(2) }
        : item
    ));
  };

  const filteredSales = sales?.filter((sale) =>
    sale.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getTotalAmount = () => {
    return selectedItems.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0);
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Sales</h1>
          <p className="text-gray-600">Manage your sales transactions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-secondary text-white"
              onClick={() => {
                setSelectedItems([]);
                form.reset();
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Sale
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Sale</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Customer Selection */}
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select customer or leave blank for walk-in" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Walk-in Customer</SelectItem>
                          {customers?.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Payment Method */}
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                          <SelectItem value="mobile_money">Mobile Money</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Product Selection */}
                <div>
                  <FormLabel>Add Products</FormLabel>
                  <div className="grid grid-cols-1 gap-2 mt-2 max-h-48 overflow-y-auto border rounded-lg p-2">
                    {products?.filter(p => p.type === 'product' ? p.stockQuantity > 0 : true).map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                        <div className="flex-1">
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-600">
                            {formatCurrency(product.price)}
                            {product.type === 'product' && ` • Stock: ${product.stockQuantity}`}
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => addItemToSale(product.id, 1)}
                          disabled={product.type === 'product' && product.stockQuantity <= 0}
                        >
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selected Items */}
                {selectedItems.length > 0 && (
                  <div>
                    <FormLabel>Selected Items</FormLabel>
                    <div className="space-y-2 mt-2 border rounded-lg p-2">
                      {selectedItems.map((item) => {
                        const product = products?.find(p => p.id === item.productId);
                        return (
                          <div key={item.productId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex-1">
                              <p className="font-medium">{product?.name}</p>
                              <p className="text-sm text-gray-600">
                                {formatCurrency(item.unitPrice)} each
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateItemQuantity(item.productId, parseInt(e.target.value) || 0)}
                                className="w-16 h-8"
                              />
                              <span className="text-sm font-medium min-w-[60px]">
                                {formatCurrency(item.totalPrice)}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItemFromSale(item.productId)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                      <div className="pt-2 border-t">
                        <div className="flex justify-between items-center font-bold text-lg">
                          <span>Total:</span>
                          <span>{formatCurrency(getTotalAmount().toFixed(2))}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    className="flex-1" 
                    disabled={createSaleMutation.isPending || selectedItems.length === 0}
                  >
                    {createSaleMutation.isPending ? "Processing..." : "Complete Sale"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search sales..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Sales List */}
      <div className="space-y-4">
        {filteredSales && filteredSales.length > 0 ? (
          filteredSales.map((sale) => (
            <Card key={sale.id} className="card-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                      <Receipt className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-on-surface">
                        {sale.customer?.name || 'Walk-in Customer'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatDateTime(sale.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-secondary">
                      {formatCurrency(sale.totalAmount)}
                    </p>
                    <Badge variant="outline">
                      {sale.paymentMethod.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                
                <div className="border-t pt-3">
                  <p className="text-sm text-gray-600 mb-2">Items:</p>
                  <div className="space-y-1">
                    {sale.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>
                          {item.quantity}x {item.product.name}
                        </span>
                        <span>{formatCurrency(item.totalPrice)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sales found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? "Try adjusting your search terms" 
                : "Start by recording your first sale"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
