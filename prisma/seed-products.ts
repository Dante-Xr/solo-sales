import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const CATEGORIES = [
  {
    name: "Smart Home",
    description: "Intelligent devices that make your home smarter and more comfortable",
  },
  {
    name: "Digital Accessories",
    description: "Premium tech accessories for your everyday digital life",
  },
  {
    name: "Fitness",
    description: "Gear and equipment for your active lifestyle",
  },
  {
    name: "Creative Life",
    description: "Unique items that inspire creativity and enhance daily living",
  },
]

const PRODUCTS = [
  {
    name: "Smart LED Bulb Kit",
    description: "RGB color-changing smart bulb with app control, compatible with Alexa and Google Home. Set the mood with 16 million colors and adjustable white light.",
    price: 24.99,
    stock: 200,
    images: ["https://picsum.photos/seed/smartbulb/800/800"],
    categoryName: "Smart Home",
    isPublished: true,
  },
  {
    name: "Robot Vacuum Cleaner Pro",
    description: "LiDAR navigation robot vacuum with 2500Pa suction power, smart mapping, and auto-charging. Keeps your floors spotless effortlessly.",
    price: 189.99,
    stock: 50,
    images: ["https://picsum.photos/seed/robotvac/800/800"],
    categoryName: "Smart Home",
    isPublished: true,
  },
  {
    name: "Smart Plug Mini",
    description: "Compact WiFi smart plug with energy monitoring. Schedule and control any device from your phone. Voice control ready.",
    price: 16.99,
    stock: 350,
    images: ["https://picsum.photos/seed/smartplug/800/800"],
    categoryName: "Smart Home",
    isPublished: true,
  },
  {
    name: "Smart Humidifier with RGB Light",
    description: "Ultrasonic cool mist humidifier with ambient RGB lighting, app-controlled timer, and whisper-quiet operation. Perfect for bedrooms.",
    price: 34.99,
    stock: 120,
    images: ["https://picsum.photos/seed/humidifier/800/800"],
    categoryName: "Smart Home",
    isPublished: true,
  },
  {
    name: "Wireless Security Camera",
    description: "1080P HD indoor security camera with night vision, two-way audio, and motion detection alerts. Keep your home safe 24/7.",
    price: 49.99,
    stock: 80,
    images: ["https://picsum.photos/seed/seccam/800/800"],
    categoryName: "Smart Home",
    isPublished: true,
  },
  {
    name: "Smart Speaker Hub",
    description: "Voice-controlled smart speaker with premium sound quality. Built-in smart home hub to control all your connected devices.",
    price: 39.99,
    stock: 150,
    images: ["https://picsum.photos/seed/speaker/800/800"],
    categoryName: "Smart Home",
    isPublished: true,
  },
  {
    name: "Wireless Earbuds Pro",
    description: "Active noise cancelling earbuds with 36-hour battery life, IPX5 water resistance, and premium sound quality. Perfect for commute and workouts.",
    price: 29.99,
    stock: 300,
    images: ["https://picsum.photos/seed/earbuds/800/800"],
    categoryName: "Digital Accessories",
    isPublished: true,
  },
  {
    name: "Magnetic Phone Case",
    description: "Slim MagSafe-compatible case with built-in ring holder and wireless charging support. Military-grade drop protection in a sleek design.",
    price: 19.99,
    stock: 400,
    images: ["https://picsum.photos/seed/phonecase/800/800"],
    categoryName: "Digital Accessories",
    isPublished: true,
  },
  {
    name: "Fast Wireless Charger",
    description: "15W Qi wireless charging pad with LED indicator and overheat protection. Compatible with all Qi-enabled devices.",
    price: 24.99,
    stock: 250,
    images: ["https://picsum.photos/seed/charger/800/800"],
    categoryName: "Digital Accessories",
    isPublished: true,
  },
  {
    name: "USB-C Hub Adapter",
    description: "7-in-1 USB-C hub with 4K HDMI, USB 3.0, SD card reader, and 100W PD charging. Essential for laptop users on the go.",
    price: 32.99,
    stock: 180,
    images: ["https://picsum.photos/seed/usbhub/800/800"],
    categoryName: "Digital Accessories",
    isPublished: true,
  },
  {
    name: "Portable Power Bank 20000mAh",
    description: "Slim power bank with dual USB-C output, 22.5W fast charging, and LED display. Charge your phone 4 times on a single charge.",
    price: 27.99,
    stock: 220,
    images: ["https://picsum.photos/seed/powerbank/800/800"],
    categoryName: "Digital Accessories",
    isPublished: true,
  },
  {
    name: "Phone Stand with Wireless Charging",
    description: "Adjustable aluminum phone stand with integrated 10W wireless charger. Perfect for desk use and video calls.",
    price: 22.99,
    stock: 160,
    images: ["https://picsum.photos/seed/phonestand/800/800"],
    categoryName: "Digital Accessories",
    isPublished: true,
  },
  {
    name: "Premium Yoga Mat",
    description: "Extra thick 6mm eco-friendly TPE yoga mat with alignment lines. Non-slip surface, includes carrying strap.",
    price: 29.99,
    stock: 200,
    images: ["https://picsum.photos/seed/yogamat/800/800"],
    categoryName: "Fitness",
    isPublished: true,
  },
  {
    name: "Resistance Bands Set",
    description: "5-piece resistance band set with varying tensions from 10-50 lbs. Includes door anchor, handles, and ankle straps.",
    price: 14.99,
    stock: 350,
    images: ["https://picsum.photos/seed/bands/800/800"],
    categoryName: "Fitness",
    isPublished: true,
  },
  {
    name: "Adjustable Dumbbells",
    description: "Quick-adjust dumbbell set from 5-52.5 lbs. Space-saving design replaces 15 sets of weights. Perfect for home gyms.",
    price: 89.99,
    stock: 40,
    images: ["https://picsum.photos/seed/dumbbells/800/800"],
    categoryName: "Fitness",
    isPublished: true,
  },
  {
    name: "Fitness Tracker Watch",
    description: "24/7 heart rate monitor with SpO2, sleep tracking, and 20+ sport modes. 7-day battery life, IP68 waterproof.",
    price: 49.99,
    stock: 130,
    images: ["https://picsum.photos/seed/fitwatch/800/800"],
    categoryName: "Fitness",
    isPublished: true,
  },
  {
    name: "Jump Rope with Counter",
    description: "Weighted jump rope with digital counter, adjustable length, and ball bearings for smooth rotation. Great for cardio training.",
    price: 12.99,
    stock: 280,
    images: ["https://picsum.photos/seed/jumprope/800/800"],
    categoryName: "Fitness",
    isPublished: true,
  },
  {
    name: "Foam Roller Set",
    description: "3-piece foam roller set with textured surface for deep tissue massage. Relieves muscle tension and aids recovery.",
    price: 19.99,
    stock: 170,
    images: ["https://picsum.photos/seed/foamroller/800/800"],
    categoryName: "Fitness",
    isPublished: true,
  },
  {
    name: "Desk Lamp with Wireless Charger",
    description: "Modern LED desk lamp with 5 color temperatures, stepless dimming, and built-in 10W wireless charger. Eye-care technology.",
    price: 34.99,
    stock: 100,
    images: ["https://picsum.photos/seed/desklamp/800/800"],
    categoryName: "Creative Life",
    isPublished: true,
  },
  {
    name: "Pour-Over Coffee Maker Set",
    description: "Borosilicate glass pour-over coffee dripper with reusable stainless steel filter. Brew the perfect cup every morning.",
    price: 26.99,
    stock: 90,
    images: ["https://picsum.photos/seed/coffeemaker/800/800"],
    categoryName: "Creative Life",
    isPublished: true,
  },
  {
    name: "Minimalist Plant Pot Set",
    description: "Set of 3 ceramic plant pots with bamboo saucers. Modern minimalist design with drainage holes. Perfect for succulents and herbs.",
    price: 18.99,
    stock: 140,
    images: ["https://picsum.photos/seed/plantpot/800/800"],
    categoryName: "Creative Life",
    isPublished: true,
  },
  {
    name: "Aromatherapy Diffuser",
    description: "Ultrasonic essential oil diffuser with 7 ambient LED colors and auto shut-off. 300ml capacity for up to 10 hours of mist.",
    price: 24.99,
    stock: 110,
    images: ["https://picsum.photos/seed/diffuser/800/800"],
    categoryName: "Creative Life",
    isPublished: true,
  },
  {
    name: "Leather Journal Notebook",
    description: "Handcrafted genuine leather journal with 200 pages of acid-free paper. Vintage design with magnetic clasp closure.",
    price: 15.99,
    stock: 190,
    images: ["https://picsum.photos/seed/journal/800/800"],
    categoryName: "Creative Life",
    isPublished: true,
  },
  {
    name: "Sunset Lamp Projector",
    description: "USB-powered sunset projection lamp with 180 degree rotation. Creates stunning warm ambient lighting for photos and room decor.",
    price: 21.99,
    stock: 160,
    images: ["https://picsum.photos/seed/sunsetlamp/800/800"],
    categoryName: "Creative Life",
    isPublished: true,
  },
]

async function main() {
  console.log("开始初始化商品数据...")

  console.log("清理旧数据...")
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  console.log("旧数据已清理")

  console.log("创建分类...")
  const categoryMap = new Map<string, string>()
  for (const cat of CATEGORIES) {
    const created = await prisma.category.create({
      data: { name: cat.name, description: cat.description },
    })
    categoryMap.set(cat.name, created.id)
    console.log(`  创建分类: ${cat.name}`)
  }

  console.log("创建商品...")
  for (const product of PRODUCTS) {
    const categoryId = categoryMap.get(product.categoryName)
    if (!categoryId) {
      console.warn(`  跳过商品 ${product.name}: 找不到分类 ${product.categoryName}`)
      continue
    }

    await prisma.product.create({
      data: {
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        images: product.images,
        categoryId,
        isPublished: product.isPublished,
      },
    })
    console.log(`  创建商品: ${product.name}`)
  }

  console.log(`商品数据初始化完成! 共创建 ${PRODUCTS.length} 个商品`)
}

main()
  .catch((e) => {
    console.error("初始化失败:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
