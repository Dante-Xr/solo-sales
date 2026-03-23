export type Language = "zh" | "en"

export const translations = {
  common: {
    loading: { zh: "加载中...", en: "Loading..." },
    save: { zh: "保存", en: "Save" },
    cancel: { zh: "取消", en: "Cancel" },
    edit: { zh: "编辑", en: "Edit" },
    confirm: { zh: "确认", en: "Confirm" },
    delete: { zh: "删除", en: "Delete" },
    back: { zh: "返回", en: "Back" },
    search: { zh: "搜索", en: "Search" },
    clear: { zh: "清空", en: "Clear" },
    close: { zh: "关闭", en: "Close" },
    submit: { zh: "提交", en: "Submit" },
    actions: { zh: "操作", en: "Actions" },
    total: { zh: "合计", en: "Total" },
    guest: { zh: "访客", en: "Guest" },
    user: { zh: "用户", en: "User" },
    shopNow: { zh: "去逛逛", en: "Shop Now" },
    none: { zh: "暂无", en: "None" },
    order: { zh: "订单", en: "Order" },
  },

  language: {
    switchTo: { zh: "English", en: "中文" },
    current: { zh: "中文", en: "English" },
    switchToEnglish: { zh: "切换到英文", en: "Switch to English" },
    switchToChinese: { zh: "切换到中文", en: "切换到中文" },
  },

  nav: {
    shopName: { zh: "SoloSales Shop", en: "SoloSales Shop" },
    searchPlaceholder: { zh: "搜索商品...", en: "Search products..." },
    searchHistory: { zh: "搜索历史", en: "Search History" },
    allProducts: { zh: "全部商品", en: "All Products" },
    shoppingCart: { zh: "购物车", en: "Shopping Cart" },
    hotSearch: { zh: "热搜", en: "Hot Search" },
  },

  auth: {
    login: { zh: "登录", en: "Login" },
    register: { zh: "注册", en: "Register" },
    logout: { zh: "退出登录", en: "Logout" },
    email: { zh: "邮箱", en: "Email" },
    password: { zh: "密码", en: "Password" },
    confirmPassword: { zh: "确认密码", en: "Confirm Password" },
    name: { zh: "用户名", en: "Name" },
    loginSuccess: { zh: "登录成功", en: "Login successful" },
    registerSuccess: { zh: "注册成功", en: "Registration successful" },
    loginTab: { zh: "登录", en: "Login" },
    registerTab: { zh: "注册", en: "Register" },
    guestCheckout: { zh: "游客购买", en: "Guest Checkout" },
    loginTitle: { zh: "欢迎回来", en: "Welcome Back" },
    loginDesc: { zh: "登录您的账户", en: "Sign in to your account" },
    registerTitle: { zh: "创建账户", en: "Create Account" },
    registerDesc: { zh: "注册新账户", en: "Register a new account" },
    guestTitle: { zh: "游客购买", en: "Guest Checkout" },
    guestDesc: { zh: "无需注册即可购买", en: "Checkout without registering" },
    noAccount: { zh: "还没有账户？", en: "Don't have an account?" },
    hasAccount: { zh: "已有账户？", en: "Already have an account?" },
    invalidEmail: { zh: "请输入有效的邮箱地址", en: "Please enter a valid email address" },
    passwordRequired: { zh: "密码至少6位", en: "Password must be at least 6 characters" },
    passwordMismatch: { zh: "两次密码输入不一致", en: "Passwords do not match" },
    emailRequired: { zh: "请输入邮箱", en: "Email is required" },
    nameRequired: { zh: "请输入用户名", en: "Name is required" },
    loginFailed: { zh: "登录失败，请检查邮箱和密码", en: "Login failed, please check email and password" },
    registerFailed: { zh: "注册失败，该邮箱可能已被使用", en: "Registration failed, email may already be in use" },
  },

  userMenu: {
    profile: { zh: "个人资料", en: "Profile" },
    orders: { zh: "我的订单", en: "My Orders" },
    adminPanel: { zh: "管理后台", en: "Admin Panel" },
  },

  profile: {
    title: { zh: "个人资料", en: "Profile" },
    accountInfo: { zh: "账户信息", en: "Account Information" },
    security: { zh: "安全设置", en: "Security" },
    changePassword: { zh: "修改密码", en: "Change Password" },
    comingSoon: { zh: "功能开发中", en: "Coming soon" },
    logoutConfirm: { zh: "确定要退出登录吗？", en: "Are you sure you want to logout?" },
    logoutSuccess: { zh: "已退出登录", en: "Logged out successfully" },
  },

  orders: {
    title: { zh: "我的订单", en: "My Orders" },
    noOrders: { zh: "暂无订单", en: "No orders yet" },
    orderNumber: { zh: "订单号", en: "Order ID" },
    status: { zh: "状态", en: "Status" },
    pending: { zh: "待支付", en: "Pending" },
    paid: { zh: "已支付", en: "Paid" },
    shipped: { zh: "已发货", en: "Shipped" },
    delivered: { zh: "已完成", en: "Delivered" },
    cancelled: { zh: "已取消", en: "Cancelled" },
    moreItems: { zh: "还有 {count} 件商品...", en: "And {count} more items..." },
    tracking: { zh: "运单号", en: "Tracking" },
    orderDetails: { zh: "订单详情", en: "Order Details" },
    orderInfo: { zh: "订单信息", en: "Order Info" },
    createdAt: { zh: "下单时间", en: "Created At" },
    contact: { zh: "联系方式", en: "Contact" },
    orderTracking: { zh: "订单追踪", en: "Order Tracking" },
    trackingNumber: { zh: "运单号", en: "Tracking Number" },
    shippingAddress: { zh: "收货地址", en: "Shipping Address" },
    items: { zh: "商品清单", en: "Items" },
    orderNotFound: { zh: "订单不存在", en: "Order not found" },
    backToOrders: { zh: "返回订单列表", en: "Back to Orders" },
    paidStatus: { zh: "已支付", en: "Paid" },
    shippedStatus: { zh: "已发货", en: "Shipped" },
    deliveredStatus: { zh: "已签收", en: "Delivered" },
    orderCancelled: { zh: "订单已取消", en: "Order Cancelled" },
    waitingPayment: { zh: "等待支付", en: "Waiting for Payment" },
    pleasePay: { zh: "请尽快完成支付", en: "Please complete payment" },
  },

  cart: {
    title: { zh: "购物车", en: "Shopping Cart" },
    empty: { zh: "购物车是空的", en: "Your cart is empty" },
    checkout: { zh: "去结算", en: "Checkout" },
    total: { zh: "合计", en: "Total" },
    addToCart: { zh: "加入购物车", en: "Add to Cart" },
    buyNow: { zh: "立即购买", en: "Buy Now" },
  },

  product: {
    featured: { zh: "热卖爆款推荐", en: "Featured Products" },
    description: { zh: "商品描述", en: "Description" },
    reviews: { zh: "商品评价", en: "Reviews" },
    quantity: { zh: "数量", en: "Quantity" },
    inStock: { zh: "有货", en: "In Stock" },
    outOfStock: { zh: "缺货", en: "Out of Stock" },
    flashSale: { zh: "限时特惠", en: "FLASH SALE" },
    share: { zh: "分享", en: "Share" },
    shareSuccess: { zh: "链接已复制", en: "Link copied!" },
    addToWishlist: { zh: "收藏", en: "Add to Wishlist" },
    removeFromWishlist: { zh: "取消收藏", en: "Remove from Wishlist" },
    watching: { zh: "人正在看", en: "watching" },
    sold: { zh: "已售", en: "Sold" },
  },

  checkout: {
    title: { zh: "结算", en: "Checkout" },
    shippingAddress: { zh: "收货地址", en: "Shipping Address" },
    contactInfo: { zh: "联系方式", en: "Contact Information" },
    contactName: { zh: "收货人姓名", en: "Recipient Name" },
    contactPhone: { zh: "联系电话", en: "Phone Number" },
    contactEmail: { zh: "电子邮箱", en: "Email" },
    addressDetail: { zh: "详细地址", en: "Detailed Address" },
    orderSummary: { zh: "订单摘要", en: "Order Summary" },
    orderTotal: { zh: "订单总计", en: "Order Total" },
    placeOrder: { zh: "提交订单", en: "Place Order" },
    paymentMethod: { zh: "支付方式", en: "Payment Method" },
    onlinePayment: { zh: "在线支付", en: "Online Payment" },
    cashOnDelivery: { zh: "货到付款", en: "Cash on Delivery" },
    addressRequired: { zh: "请输入详细地址", en: "Please enter detailed address" },
    nameRequired: { zh: "请输入收货人姓名", en: "Please enter recipient name" },
    phoneRequired: { zh: "请输入联系电话", en: "Please enter phone number" },
    phoneInvalid: { zh: "请输入有效的电话号码", en: "Please enter a valid phone number" },
    emailInvalid: { zh: "请输入有效的邮箱地址", en: "Please enter a valid email address" },
    orderPlacedSuccess: { zh: "订单提交成功！", en: "Order placed successfully!" },
    orderFailed: { zh: "订单提交失败，请重试", en: "Order failed, please try again" },
    selectAddress: { zh: "请选择或新增收货地址", en: "Please select or add a shipping address" },
    addNewAddress: { zh: "新增地址", en: "Add New Address" },
    editAddress: { zh: "编辑地址", en: "Edit Address" },
    defaultAddress: { zh: "默认地址", en: "Default Address" },
    setAsDefault: { zh: "设为默认", en: "Set as Default" },
    CODNote: { zh: "货到付款需支付额外手续费", en: "Cash on delivery requires additional handling fee" },
  },

  admin: {
    dashboard: { zh: "数据概览", en: "Dashboard" },
    totalRevenue: { zh: "总收入", en: "Total Revenue" },
    totalOrders: { zh: "订单总数", en: "Total Orders" },
    activeProducts: { zh: "在售商品", en: "Active Products" },
    activeUsers: { zh: "活跃用户", en: "Active Users" },
    fromLastMonth: { zh: "较上月", en: "from last month" },
    newThisWeek: { zh: "本周新增", en: "new this week" },
    inLastHour: { zh: "过去一小时", en: "in last hour" },
    salesTrend: { zh: "销售趋势", en: "Sales Trend" },
    sampleData: { zh: "(示例数据)", en: "(Sample Data)" },
    recentOrders: { zh: "最近订单", en: "Recent Orders" },
    orderManagement: { zh: "订单管理", en: "Order Management" },
    allOrders: { zh: "所有订单", en: "All Orders" },
    orderId: { zh: "订单号", en: "Order ID" },
    customer: { zh: "客户", en: "Customer" },
    amount: { zh: "金额", en: "Amount" },
    tracking: { zh: "运单号", en: "Tracking" },
    update: { zh: "更新物流", en: "Update" },
    add: { zh: "添加物流", en: "Add" },
    enterTrackingInfo: { zh: "物流信息录入", en: "Enter Tracking Info" },
    trackingNumber: { zh: "运单号", en: "Tracking Number" },
    enterTrackingNumber: { zh: "请输入快递运单号", en: "Enter tracking number" },
    autoUpdateToShipped: { zh: '录入运单号后，订单状态将自动更新为"已发货"', en: 'After entering tracking number, order status will be updated to "Shipped"' },
    updating: { zh: "更新中...", en: "Updating..." },
    productManagement: { zh: "商品管理", en: "Product Management" },
    addProduct: { zh: "上架新商品", en: "Add Product" },
    productName: { zh: "商品名称", en: "Product Name" },
    status: { zh: "状态", en: "Status" },
    price: { zh: "价格", en: "Price" },
    stock: { zh: "库存", en: "Stock" },
    sales: { zh: "销量", en: "Sales" },
    active: { zh: "上架", en: "Active" },
    inactive: { zh: "下架", en: "Inactive" },
    edit: { zh: "编辑", en: "Edit" },
    delete: { zh: "删除", en: "Delete" },
    fetchingOrders: { zh: "获取订单失败", en: "Failed to fetch orders" },
    updateFailed: { zh: "更新失败", en: "Update failed" },
    updateStatusFailed: { zh: "更新状态失败", en: "Failed to update status" },
  },

  welcome: {
    title: { zh: "新人专属优惠", en: "Welcome Gift" },
    discount: { zh: "首单立减5美元，全场通用", en: "$5 off your first order, valid on all products" },
    claim: { zh: "立即领取", en: "Claim Now" },
    couponCode: { zh: "优惠码", en: "Coupon Code" },
    validity: { zh: "* 有效期30天，不可与其他优惠叠加", en: "* Valid for 30 days, cannot be combined with other offers" },
  },
}

export type TranslationKey = keyof typeof translations
export type CommonKey = keyof typeof translations.common
export type LanguageKey = keyof typeof translations.language
export type NavKey = keyof typeof translations.nav
export type AuthKey = keyof typeof translations.auth
export type UserMenuKey = keyof typeof translations.userMenu
export type ProfileKey = keyof typeof translations.profile
export type OrdersKey = keyof typeof translations.orders
export type CartKey = keyof typeof translations.cart
export type ProductKey = keyof typeof translations.product
export type CheckoutKey = keyof typeof translations.checkout
export type AdminKey = keyof typeof translations.admin
export type WelcomeKey = keyof typeof translations.welcome

export function t(key: string, lang: Language = "zh"): string {
  const keys = key.split(".")
  let result: any = translations

  for (const k of keys) {
    if (result && typeof result === "object" && k in result) {
      result = result[k]
    } else {
      return key
    }
  }

  if (result && typeof result === "object" && "zh" in result && "en" in result) {
    return result[lang] || result.zh || key
  }

  return key
}
