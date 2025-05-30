import {
  users,
  businesses,
  products,
  customers,
  sales,
  saleItems,
  expenses,
  categories,
  userRoles,
  type User,
  type UpsertUser,
  type Business,
  type InsertBusiness,
  type Product,
  type InsertProduct,
  type Customer,
  type InsertCustomer,
  type Sale,
  type InsertSale,
  type SaleItem,
  type InsertSaleItem,
  type Expense,
  type InsertExpense,
  type Category,
  type InsertCategory,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByPhoneNumber(phoneNumber: string): Promise<User | undefined>;
  createUser(userData: Omit<UpsertUser, 'id'>): Promise<User>;
  initializeSuperAdmin(): Promise<User>;
  getUsersByRole(role: string): Promise<User[]>;
  getAllUsers(): Promise<User[]>;
  updateUserStatus(id: string, status: string): Promise<User>;
  deleteUser(id: string): Promise<void>;

  // Business operations
  createBusiness(business: InsertBusiness): Promise<Business>;
  getUserBusiness(userId: string): Promise<Business | undefined>;

  // Product operations
  getProducts(businessId: string): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  getLowStockProducts(businessId: string): Promise<Product[]>;

  // Customer operations
  getCustomers(businessId: string): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer>;
  deleteCustomer(id: string): Promise<void>;

  // Sales operations
  getSales(businessId: string): Promise<(Sale & { customer?: Customer; items: (SaleItem & { product: Product })[] })[]>;
  getSale(id: string): Promise<(Sale & { customer?: Customer; items: (SaleItem & { product: Product })[] }) | undefined>;
  createSale(sale: InsertSale, items: InsertSaleItem[]): Promise<Sale>;
  getDailySales(businessId: string, date: Date): Promise<{ totalAmount: number; transactionCount: number }>;
  getWeeklySales(businessId: string, startDate: Date): Promise<{ date: string; amount: number }[]>;

  // Expense operations
  getExpenses(businessId: string): Promise<Expense[]>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  deleteExpense(id: string): Promise<void>;

  // Category operations
  getCategories(businessId: string): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Analytics operations
  getDashboardStats(businessId: string): Promise<{
    todaySales: number;
    todayTransactions: number;
    newCustomers: number;
    productsSold: number;
  }>;
  
  // APP Staff operations
  updateUserStatus(userId: string, status: string): Promise<User>;
  getAllBusinesses(): Promise<Business[]>;
  getTotalSalesAllBusinesses(): Promise<number>;
  getMonthlyGrowthAllBusinesses(): Promise<number>;
  getSystemAnalytics(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByPhoneNumber(phoneNumber: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phoneNumber, phoneNumber));
    return user;
  }

  async createUser(userData: Omit<UpsertUser, 'id'>): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.role, role))
      .orderBy(desc(users.createdAt));
  }

  async getAllUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));
  }

  async deleteUser(id: string): Promise<void> {
    await db
      .delete(users)
      .where(eq(users.id, id));
  }

  async initializeSuperAdmin(): Promise<User> {
    // Check if super admin already exists
    const existingSuperAdmin = await db
      .select()
      .from(users)
      .where(eq(users.phoneNumber, '+255700000000'))
      .limit(1);

    if (existingSuperAdmin.length > 0) {
      return existingSuperAdmin[0];
    }

    // Create default super admin
    const [superAdmin] = await db
      .insert(users)
      .values({
        id: 'super-admin-' + Date.now(),
        fullName: 'Super Admin',
        phoneNumber: '+255700000000',
        password: '12345678',
        role: userRoles.SUPER_ADMIN,
        status: 'active',
      })
      .returning();

    return superAdmin;
  }

  // Business operations
  async createBusiness(business: InsertBusiness): Promise<Business> {
    const [newBusiness] = await db
      .insert(businesses)
      .values(business)
      .returning();
    return newBusiness;
  }

  async getUserBusiness(userId: string): Promise<Business | undefined> {
    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.ownerId, userId));
    return business;
  }

  // Product operations
  async getProducts(businessId: string): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.businessId, businessId))
      .orderBy(desc(products.createdAt));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db
      .insert(products)
      .values(product)
      .returning();
    return newProduct;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product> {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async getLowStockProducts(businessId: string): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.businessId, businessId),
          sql`${products.stockQuantity} <= ${products.minStockLevel}`
        )
      );
  }

  // Customer operations
  async getCustomers(businessId: string): Promise<Customer[]> {
    return await db
      .select()
      .from(customers)
      .where(eq(customers.businessId, businessId))
      .orderBy(desc(customers.createdAt));
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db
      .insert(customers)
      .values(customer)
      .returning();
    return newCustomer;
  }

  async updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer> {
    const [updatedCustomer] = await db
      .update(customers)
      .set({ ...customer, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();
    return updatedCustomer;
  }

  async deleteCustomer(id: string): Promise<void> {
    await db.delete(customers).where(eq(customers.id, id));
  }

  // Sales operations
  async getSales(businessId: string): Promise<(Sale & { customer?: Customer; items: (SaleItem & { product: Product })[] })[]> {
    const salesData = await db
      .select()
      .from(sales)
      .leftJoin(customers, eq(sales.customerId, customers.id))
      .where(eq(sales.businessId, businessId))
      .orderBy(desc(sales.createdAt));

    const salesWithItems = await Promise.all(
      salesData.map(async (saleData) => {
        const items = await db
          .select()
          .from(saleItems)
          .innerJoin(products, eq(saleItems.productId, products.id))
          .where(eq(saleItems.saleId, saleData.sales.id));

        return {
          ...saleData.sales,
          customer: saleData.customers,
          items: items.map(item => ({ ...item.sale_items, product: item.products })),
        };
      })
    );

    return salesWithItems;
  }

  async getSale(id: string): Promise<(Sale & { customer?: Customer; items: (SaleItem & { product: Product })[] }) | undefined> {
    const [saleData] = await db
      .select()
      .from(sales)
      .leftJoin(customers, eq(sales.customerId, customers.id))
      .where(eq(sales.id, id));

    if (!saleData) return undefined;

    const items = await db
      .select()
      .from(saleItems)
      .innerJoin(products, eq(saleItems.productId, products.id))
      .where(eq(saleItems.saleId, id));

    return {
      ...saleData.sales,
      customer: saleData.customers,
      items: items.map(item => ({ ...item.sale_items, product: item.products })),
    };
  }

  async createSale(sale: InsertSale, items: InsertSaleItem[]): Promise<Sale> {
    const [newSale] = await db
      .insert(sales)
      .values(sale)
      .returning();

    // Insert sale items
    const saleItemsWithSaleId = items.map(item => ({
      ...item,
      saleId: newSale.id,
    }));

    await db.insert(saleItems).values(saleItemsWithSaleId);

    // Update product stock quantities
    for (const item of items) {
      await db
        .update(products)
        .set({
          stockQuantity: sql`${products.stockQuantity} - ${item.quantity}`,
        })
        .where(eq(products.id, item.productId));
    }

    return newSale;
  }

  async getDailySales(businessId: string, date: Date): Promise<{ totalAmount: number; transactionCount: number }> {
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

    const result = await db
      .select({
        totalAmount: sql<number>`COALESCE(SUM(${sales.totalAmount}), 0)`,
        transactionCount: sql<number>`COUNT(*)`,
      })
      .from(sales)
      .where(
        and(
          eq(sales.businessId, businessId),
          gte(sales.createdAt, startOfDay),
          lte(sales.createdAt, endOfDay)
        )
      );

    return result[0] || { totalAmount: 0, transactionCount: 0 };
  }

  async getWeeklySales(businessId: string, startDate: Date): Promise<{ date: string; amount: number }[]> {
    const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    const result = await db
      .select({
        date: sql<string>`DATE(${sales.createdAt})`,
        amount: sql<number>`COALESCE(SUM(${sales.totalAmount}), 0)`,
      })
      .from(sales)
      .where(
        and(
          eq(sales.businessId, businessId),
          gte(sales.createdAt, startDate),
          lte(sales.createdAt, endDate)
        )
      )
      .groupBy(sql`DATE(${sales.createdAt})`)
      .orderBy(sql`DATE(${sales.createdAt})`);

    return result;
  }

  // Expense operations
  async getExpenses(businessId: string): Promise<Expense[]> {
    return await db
      .select()
      .from(expenses)
      .where(eq(expenses.businessId, businessId))
      .orderBy(desc(expenses.createdAt));
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    const [newExpense] = await db
      .insert(expenses)
      .values(expense)
      .returning();
    return newExpense;
  }

  async deleteExpense(id: string): Promise<void> {
    await db.delete(expenses).where(eq(expenses.id, id));
  }

  // Category operations
  async getCategories(businessId: string): Promise<Category[]> {
    return await db
      .select()
      .from(categories)
      .where(eq(categories.businessId, businessId))
      .orderBy(categories.name);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values(category)
      .returning();
    return newCategory;
  }

  // Analytics operations
  async getDashboardStats(businessId: string): Promise<{
    todaySales: number;
    todayTransactions: number;
    newCustomers: number;
    productsSold: number;
  }> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Today's sales
    const todayStats = await this.getDailySales(businessId, today);

    // New customers today
    const newCustomersResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(customers)
      .where(
        and(
          eq(customers.businessId, businessId),
          gte(customers.createdAt, startOfDay),
          lte(customers.createdAt, endOfDay)
        )
      );

    // Products sold today
    const productsSoldResult = await db
      .select({ count: sql<number>`COALESCE(SUM(${saleItems.quantity}), 0)` })
      .from(saleItems)
      .innerJoin(sales, eq(saleItems.saleId, sales.id))
      .where(
        and(
          eq(sales.businessId, businessId),
          gte(sales.createdAt, startOfDay),
          lte(sales.createdAt, endOfDay)
        )
      );

    return {
      todaySales: todayStats.totalAmount,
      todayTransactions: todayStats.transactionCount,
      newCustomers: newCustomersResult[0]?.count || 0,
      productsSold: productsSoldResult[0]?.count || 0,
    };
  }

  // APP Staff operations
  async updateUserStatus(userId: string, status: string): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ status, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async getAllBusinesses(): Promise<Business[]> {
    return await db
      .select()
      .from(businesses)
      .orderBy(desc(businesses.createdAt));
  }

  async getTotalSalesAllBusinesses(): Promise<number> {
    const result = await db
      .select({
        total: sql<number>`COALESCE(SUM(${sales.totalAmount}), 0)`,
      })
      .from(sales);

    return result[0]?.total || 0;
  }

  async getMonthlyGrowthAllBusinesses(): Promise<number> {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

    const thisMonthSales = await db
      .select({
        total: sql<number>`COALESCE(SUM(${sales.totalAmount}), 0)`,
      })
      .from(sales)
      .where(gte(sales.createdAt, thisMonth));

    const lastMonthSales = await db
      .select({
        total: sql<number>`COALESCE(SUM(${sales.totalAmount}), 0)`,
      })
      .from(sales)
      .where(
        and(
          gte(sales.createdAt, lastMonth),
          lte(sales.createdAt, thisMonth)
        )
      );

    const thisMonthTotal = thisMonthSales[0]?.total || 0;
    const lastMonthTotal = lastMonthSales[0]?.total || 0;

    if (lastMonthTotal === 0) return 0;
    return ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
  }

  async getSystemAnalytics(): Promise<any> {
    const totalUsers = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users);

    const totalBusinesses = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(businesses);

    const totalSales = await db
      .select({
        total: sql<number>`COALESCE(SUM(${sales.totalAmount}), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(sales);

    const totalProducts = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(products);

    return {
      totalUsers: totalUsers[0]?.count || 0,
      totalBusinesses: totalBusinesses[0]?.count || 0,
      totalSalesAmount: totalSales[0]?.total || 0,
      totalSalesCount: totalSales[0]?.count || 0,
      totalProducts: totalProducts[0]?.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
