import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { insertUserSchema } from "@shared/schema";
import {
  insertProductSchema,
  insertCustomerSchema,
  insertSaleSchema,
  insertExpenseSchema,
  insertCategorySchema,
  userRoles,
} from "@shared/schema";
import { z } from "zod";

// Simple authentication middleware
const isAuthenticated = (req: any, res: any, next: any) => {
  if (req.session?.userId) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

// Session setup
function setupSession(app: Express) {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  app.set("trust proxy", 1);
  app.use(session({
    secret: process.env.SESSION_SECRET || "dev-secret-key",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: sessionTtl,
    },
  }));
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session
  setupSession(app);

  // Initialize super admin on startup
  await storage.initializeSuperAdmin();

  // Auth routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { phoneNumber, password } = req.body;
      
      if (!phoneNumber || !password) {
        return res.status(400).json({ message: "Phone number and password are required" });
      }

      const user = await storage.getUserByPhoneNumber(phoneNumber);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (user.status !== 'active') {
        return res.status(401).json({ message: "Account is not active" });
      }

      // Store user ID in session
      (req.session as any).userId = user.id;
      
      res.json({ 
        message: "Login successful",
        user: {
          id: user.id,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          role: user.role,
          status: user.status
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session?.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        role: user.role,
        status: user.status
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User management routes
  app.get('/api/users', isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Only Super Admin can view all users
      if (currentUser.role !== userRoles.SUPER_ADMIN) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const { role } = req.query;
      let users;
      
      if (role === 'APP_STAFF') {
        users = await storage.getUsersByRole(userRoles.APP_STAFF);
      } else {
        users = await storage.getAllUsers();
      }

      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post('/api/users', isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Role-based access control
      const { role: newUserRole } = req.body;
      if (currentUser.role === userRoles.SUPER_ADMIN) {
        // Super admin can create APP_STAFF and SPONSORS
        if (![userRoles.APP_STAFF, userRoles.SPONSOR].includes(newUserRole)) {
          return res.status(403).json({ message: "Cannot create this user role" });
        }
      } else if (currentUser.role === userRoles.APP_STAFF) {
        // APP Staff can create MERCHANTS
        if (newUserRole !== userRoles.MERCHANT) {
          return res.status(403).json({ message: "Cannot create this user role" });
        }
      } else {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser({
        ...userData,
        id: 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      });

      res.json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.delete('/api/users/:id', isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Only Super Admin can delete users
      if (currentUser.role !== userRoles.SUPER_ADMIN) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const { id } = req.params;
      
      // Prevent deleting self
      if (id === currentUser.id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }

      await storage.deleteUser(id);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Business routes
  app.get('/api/business', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const business = await storage.getUserBusiness(userId);
      res.json(business);
    } catch (error) {
      console.error("Error fetching business:", error);
      res.status(500).json({ message: "Failed to fetch business" });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const business = await storage.getUserBusiness(userId);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }

      const stats = await storage.getDashboardStats(business.id);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Product routes
  app.get('/api/products', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const business = await storage.getUserBusiness(userId);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }

      const products = await storage.getProducts(business.id);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post('/api/products', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const business = await storage.getUserBusiness(userId);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }

      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct({
        ...productData,
        businessId: business.id,
      });

      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put('/api/products/:id', isAuthenticated, async (req: any, res) => {
    try {
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, productData);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete('/api/products/:id', isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  app.get('/api/products/low-stock', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const business = await storage.getUserBusiness(userId);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }

      const lowStockProducts = await storage.getLowStockProducts(business.id);
      res.json(lowStockProducts);
    } catch (error) {
      console.error("Error fetching low stock products:", error);
      res.status(500).json({ message: "Failed to fetch low stock products" });
    }
  });

  // Customer routes
  app.get('/api/customers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const business = await storage.getUserBusiness(userId);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }

      const customers = await storage.getCustomers(business.id);
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.post('/api/customers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const business = await storage.getUserBusiness(userId);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }

      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer({
        ...customerData,
        businessId: business.id,
      });

      res.json(customer);
    } catch (error) {
      console.error("Error creating customer:", error);
      res.status(500).json({ message: "Failed to create customer" });
    }
  });

  app.put('/api/customers/:id', isAuthenticated, async (req: any, res) => {
    try {
      const customerData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(req.params.id, customerData);
      res.json(customer);
    } catch (error) {
      console.error("Error updating customer:", error);
      res.status(500).json({ message: "Failed to update customer" });
    }
  });

  app.delete('/api/customers/:id', isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteCustomer(req.params.id);
      res.json({ message: "Customer deleted successfully" });
    } catch (error) {
      console.error("Error deleting customer:", error);
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });

  // Sales routes
  app.get('/api/sales', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const business = await storage.getUserBusiness(userId);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }

      const sales = await storage.getSales(business.id);
      res.json(sales);
    } catch (error) {
      console.error("Error fetching sales:", error);
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  app.post('/api/sales', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const business = await storage.getUserBusiness(userId);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }

      const { items, ...saleData } = req.body;
      const saleSchema = insertSaleSchema.extend({
        items: z.array(z.object({
          productId: z.string(),
          quantity: z.number().positive(),
          unitPrice: z.string(),
          totalPrice: z.string(),
        })),
      });

      const validatedData = saleSchema.parse({ ...saleData, items });
      
      const sale = await storage.createSale(
        {
          ...validatedData,
          businessId: business.id,
          soldById: userId,
        },
        validatedData.items
      );

      res.json(sale);
    } catch (error) {
      console.error("Error creating sale:", error);
      res.status(500).json({ message: "Failed to create sale" });
    }
  });

  // Expense routes
  app.get('/api/expenses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const business = await storage.getUserBusiness(userId);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }

      const expenses = await storage.getExpenses(business.id);
      res.json(expenses);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  app.post('/api/expenses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const business = await storage.getUserBusiness(userId);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }

      const expenseData = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense({
        ...expenseData,
        businessId: business.id,
        recordedById: userId,
      });

      res.json(expense);
    } catch (error) {
      console.error("Error creating expense:", error);
      res.status(500).json({ message: "Failed to create expense" });
    }
  });

  app.delete('/api/expenses/:id', isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteExpense(req.params.id);
      res.json({ message: "Expense deleted successfully" });
    } catch (error) {
      console.error("Error deleting expense:", error);
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });

  // Category routes
  app.get('/api/categories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const business = await storage.getUserBusiness(userId);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }

      const categories = await storage.getCategories(business.id);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post('/api/categories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const business = await storage.getUserBusiness(userId);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }

      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory({
        ...categoryData,
        businessId: business.id,
      });

      res.json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Analytics routes
  app.get('/api/analytics/weekly-sales', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const business = await storage.getUserBusiness(userId);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      
      const weeklySales = await storage.getWeeklySales(business.id, startDate);
      res.json(weeklySales);
    } catch (error) {
      console.error("Error fetching weekly sales:", error);
      res.status(500).json({ message: "Failed to fetch weekly sales" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
