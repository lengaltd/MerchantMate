import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Users, TrendingUp, BarChart3 } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-surface-variant">
      {/* Hero Section */}
      <div className="bg-primary text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              BizPOS
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Complete Point of Sale solution for small businesses
            </p>
            <p className="text-lg mb-8 opacity-80">
              Manage products, track sales, handle customers, and analyze your business performance all in one place.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              className="text-lg px-8 py-4"
              onClick={() => window.location.href = '/api/login'}
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-on-surface mb-4">
            Everything you need to run your business
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From inventory management to sales analytics, BizPOS provides all the tools you need to grow your business.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center card-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle>Sales Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Process sales quickly and efficiently with our intuitive point-of-sale interface.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center card-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Customer Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Keep track of your customers and build lasting relationships with detailed customer profiles.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center card-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Inventory Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Monitor stock levels, get low inventory alerts, and manage your products and services.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center card-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Analytics & Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get insights into your business performance with detailed analytics and reports.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Roles Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-on-surface mb-4">
              Multi-Role Management
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Designed for businesses of all sizes with role-based access control.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle className="text-primary">Super Admin</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Manage APP Staff and Sponsors</li>
                  <li>• View all analytics and reports</li>
                  <li>• Complete system access</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="card-shadow">
              <CardHeader>
                <CardTitle className="text-secondary">APP Staff</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Register and manage Merchants</li>
                  <li>• View analytics and reports</li>
                  <li>• Support merchant operations</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="card-shadow">
              <CardHeader>
                <CardTitle className="text-accent">Merchant</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Manage products and services</li>
                  <li>• Handle sales and customers</li>
                  <li>• Track expenses and performance</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-secondary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to grow your business?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of businesses already using BizPOS to streamline their operations.
          </p>
          <Button 
            size="lg" 
            variant="outline"
            className="text-lg px-8 py-4 bg-white text-secondary hover:bg-gray-100"
            onClick={() => window.location.href = '/api/login'}
          >
            Start Your Free Trial
          </Button>
        </div>
      </div>
    </div>
  );
}
