import { PrismaClient, ComponentKind, ProductCategory, ProductStatus, UserRole } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

type ComponentSeed = {
  slug: string;
  name: string;
  brand: string;
  kind: ComponentKind;
  priceCents: number;
  msrpCents?: number;
  description: string;
  image?: string;
  compatibility?: Record<string, unknown>;
  specs?: Record<string, unknown>;
  stock?: number;
  isRecommended?: boolean;
};

type ProductSeed = {
  slug: string;
  name: string;
  headline: string;
  shortDescription: string;
  description: string;
  category: ProductCategory;
  status: ProductStatus;
  basePriceCents: number;
  msrpCents?: number;
  inventory: number;
  isFeatured: boolean;
  heroImage: string;
  gallery: Array<{ url: string; alt: string }>;
  specifications: Array<{ label: string; value: string; group?: string }>;
  components: Array<{ slug: string; kind: ComponentKind; label: string; summary?: string }>;
  reviews: Array<{ rating: number; title: string; body: string; author: string; userId?: string }>;
};

type CustomBuildSeed = {
  slug: string;
  name: string;
  summary: string;
  notes?: string;
  coverImage?: string;
  estimatedWattage: number;
  componentSlugs: string[];
};

const componentSeeds: ComponentSeed[] = [
  {
    slug: "intel-core-i9-14900k",
    name: "Intel Core i9-14900K",
    brand: "Intel",
    kind: ComponentKind.CPU,
    priceCents: 57900,
    msrpCents: 62900,
    description:
      "24-core, 32-thread flagship processor with thermal velocity boost up to 6.0GHz for extreme gaming and creation workloads.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    compatibility: {
      socket: "LGA1700",
      chipset: ["Z790", "Z690"],
      wattage: 253,
      memory: "DDR5",
    },
    specs: {
      cores: 24,
      threads: 32,
      baseClock: "3.2 GHz",
      boostClock: "6.0 GHz",
      cache: "36MB Intel Smart Cache",
    },
    isRecommended: true,
  },
  {
    slug: "amd-ryzen-9-7950x3d",
    name: "AMD Ryzen 9 7950X3D",
    brand: "AMD",
    kind: ComponentKind.CPU,
    priceCents: 58900,
    msrpCents: 69900,
    description:
      "16-core Zen 4 processor featuring 3D V-Cache for elite gaming performance and heavyweight multi-threaded productivity.",
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=800&q=80",
    compatibility: {
      socket: "AM5",
      chipset: ["X670E", "B650E"],
      wattage: 162,
      memory: "DDR5",
    },
    specs: {
      cores: 16,
      threads: 32,
      baseClock: "4.2 GHz",
      boostClock: "5.7 GHz",
      cache: "128MB L3",
    },
    isRecommended: true,
  },
  {
    slug: "asus-rog-maximus-z790-hero",
    name: "ASUS ROG Maximus Z790 Hero",
    brand: "ASUS",
    kind: ComponentKind.MOTHERBOARD,
    priceCents: 47900,
    description:
      "Premium ROG Z790 board with 20+1 power stages, PCIe 5.0 support, Thunderbolt 4, and AI overclocking for 14th-gen Intel chips.",
    image: "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=800&q=80",
    compatibility: {
      socket: "LGA1700",
      formFactor: "ATX",
      memory: "DDR5",
    },
    specs: {
      vrm: "20+1",
      pcie: "PCIe 5.0 x16",
      memory: "4x DIMM DDR5-7600",
      connectivity: "Wi-Fi 7, 2.5G LAN, TB4",
    },
  },
  {
    slug: "msi-meg-x670e-ace",
    name: "MSI MEG X670E ACE",
    brand: "MSI",
    kind: ComponentKind.MOTHERBOARD,
    priceCents: 44900,
    description:
      "Ultra high-end AM5 motherboard with PCIe 5.0 lanes, triple Gen5 M.2 slots, and stellar power delivery for Ryzen 7000 chips.",
    image: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=800&q=80",
    compatibility: {
      socket: "AM5",
      formFactor: "E-ATX",
      memory: "DDR5",
    },
    specs: {
      vrm: "22+2+1",
      pcie: "PCIe 5.0 x16",
      storage: "4x M.2 (3x Gen5)",
      connectivity: "Wi-Fi 6E, 2.5G LAN",
    },
  },
  {
    slug: "nvidia-geforce-rtx-4090",
    name: "NVIDIA GeForce RTX 4090 24GB",
    brand: "NVIDIA",
    kind: ComponentKind.GPU,
    priceCents: 169990,
    msrpCents: 179999,
    description:
      "Flagship Ada Lovelace GPU delivering unmatched 4K/8K gaming, AI acceleration, and professional rendering performance.",
    image: "https://images.unsplash.com/photo-1615229286600-7b054d4e0f72?auto=format&fit=crop&w=800&q=80",
    compatibility: {
      lengthMm: 336,
      recommendedPsu: 1000,
      powerConnectors: "3x 8-pin / 1x 16-pin",
    },
    specs: {
      memory: "24GB GDDR6X",
      cuda: 16384,
      boostClock: "2520 MHz",
      ports: "HDMI 2.1, 3x DP 1.4a",
    },
    isRecommended: true,
  },
  {
    slug: "nvidia-geforce-rtx-4080-super",
    name: "NVIDIA GeForce RTX 4080 Super 16GB",
    brand: "NVIDIA",
    kind: ComponentKind.GPU,
    priceCents: 119999,
    description:
      "Balanced flagship GPU ideal for high-refresh 4K gaming and creative acceleration with DLSS 3 frame generation.",
    image: "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=800&q=80",
    compatibility: {
      lengthMm: 310,
      recommendedPsu: 850,
      powerConnectors: "1x 16-pin",
    },
    specs: {
      memory: "16GB GDDR6X",
      cuda: 10240,
      boostClock: "2550 MHz",
    },
  },
  {
    slug: "amd-radeon-rx-7900-xtx",
    name: "AMD Radeon RX 7900 XTX 24GB",
    brand: "AMD",
    kind: ComponentKind.GPU,
    priceCents: 98999,
    description:
      "RDNA 3 powerhouse with 24GB VRAM for creators and gamers demanding strong raster performance and future-ready ports.",
    image: "https://images.unsplash.com/photo-1481277542470-605612bd2d61?auto=format&fit=crop&w=800&q=80",
    compatibility: {
      lengthMm: 320,
      recommendedPsu: 900,
    },
    specs: {
      memory: "24GB GDDR6",
      computeUnits: 96,
      boostClock: "2500 MHz",
      ports: "2x DP 2.1, HDMI 2.1, USB-C",
    },
  },
  {
    slug: "corsair-dominator-32gb-ddr5-6000",
    name: "Corsair Dominator Titanium 32GB DDR5-6000",
    brand: "Corsair",
    kind: ComponentKind.MEMORY,
    priceCents: 22999,
    description:
      "Premium 2x16GB DDR5 kit with tight timings, onboard voltage regulation, and iCUE lighting for peak stability.",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
    compatibility: {
      capacityGb: 32,
      sticks: 2,
      type: "DDR5",
      speed: "6000MT/s",
    },
    specs: {
      latency: "CL30",
      voltage: "1.35V",
      heatspreader: "Aluminum",
    },
  },
  {
    slug: "gskill-trident-64gb-ddr5-6000",
    name: "G.Skill Trident Z5 Neo 64GB DDR5-6000",
    brand: "G.Skill",
    kind: ComponentKind.MEMORY,
    priceCents: 32999,
    description:
      "Creator-grade 2x32GB DDR5 kit tuned for AMD EXPO with sleek matte heatspreaders and reliable thermal performance.",
    image: "https://images.unsplash.com/photo-1521120413309-4f7f9357ca8a?auto=format&fit=crop&w=800&q=80",
    compatibility: {
      capacityGb: 64,
      sticks: 2,
      type: "DDR5",
      speed: "6000MT/s",
    },
    specs: {
      latency: "CL32",
      profile: "EXPO",
    },
  },
  {
    slug: "samsung-990-pro-2tb",
    name: "Samsung 990 Pro 2TB NVMe SSD",
    brand: "Samsung",
    kind: ComponentKind.STORAGE,
    priceCents: 21999,
    description:
      "PCIe 4.0 NVMe drive with blistering 7450 MB/s reads, hardware encryption, and dynamic thermal guard cooling.",
    image: "https://images.unsplash.com/photo-1603791452906-9cd13d06427d?auto=format&fit=crop&w=800&q=80",
    compatibility: {
      interface: "PCIe 4.0 x4",
      formFactor: "M.2 2280",
    },
    specs: {
      read: "7450 MB/s",
      write: "6900 MB/s",
      endurance: "1200 TBW",
    },
  },
  {
    slug: "seagate-firecuda-530-4tb",
    name: "Seagate FireCuda 530 4TB NVMe",
    brand: "Seagate",
    kind: ComponentKind.STORAGE,
    priceCents: 39999,
    description:
      "High-endurance PCIe 4.0 SSD with 4TB capacity, ideal for massive project files, 8K footage, and expansive game libraries.",
    image: "https://images.unsplash.com/photo-1517433456452-f9633a875f6f?auto=format&fit=crop&w=800&q=80",
    compatibility: {
      interface: "PCIe 4.0 x4",
      formFactor: "M.2 2280",
    },
    specs: {
      read: "7300 MB/s",
      write: "6900 MB/s",
      endurance: "5100 TBW",
    },
  },
  {
    slug: "corsair-hx1000i",
    name: "Corsair HX1000i 1000W 80+ Platinum",
    brand: "Corsair",
    kind: ComponentKind.POWER_SUPPLY,
    priceCents: 24999,
    description:
      "Fully modular platinum-rated PSU with digital monitoring, zero RPM fan mode, and native 12VHPWR support.",
    image: "https://images.unsplash.com/photo-1618005198919-d3d4b7816f1b?auto=format&fit=crop&w=800&q=80",
    compatibility: {
      wattage: 1000,
      efficiency: "80+ Platinum",
      formFactor: "ATX",
    },
    specs: {
      connectors: "1x 12VHPWR, 8x PCIe",
      warranty: "10 Years",
    },
    isRecommended: true,
  },
  {
    slug: "seasonic-vertex-1200",
    name: "Seasonic Vertex GX-1200",
    brand: "Seasonic",
    kind: ComponentKind.POWER_SUPPLY,
    priceCents: 29999,
    description:
      "1200W powerhouse PSU engineered for next-gen GPUs with hybrid silent mode and top-tier electrical stability.",
    image: "https://images.unsplash.com/photo-1618005198919-3a0af8577a72?auto=format&fit=crop&w=800&q=80",
    compatibility: {
      wattage: 1200,
      efficiency: "80+ Gold",
      formFactor: "ATX 3.0",
    },
    specs: {
      connectors: "2x 12VHPWR",
      warranty: "12 Years",
    },
  },
  {
    slug: "lian-li-o11-dynamic-evo",
    name: "Lian Li O11 Dynamic EVO",
    brand: "Lian Li",
    kind: ComponentKind.CASE,
    priceCents: 17999,
    description:
      "Iconic dual-chamber chassis with panoramic glass, reversible layout, and optimized airflow for showcase builds.",
    image: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?auto=format&fit=crop&w=800&q=80",
    compatibility: {
      formFactor: ["ATX", "E-ATX", "mATX"],
      maxGpuLengthMm: 426,
      maxRadiatorMm: 360,
    },
    specs: {
      color: "Black",
      weight: "27.5 lbs",
      driveBays: "6x 2.5\" + 3x 3.5\"",
    },
  },
  {
    slug: "fractal-north-xl",
    name: "Fractal Design North XL",
    brand: "Fractal",
    kind: ComponentKind.CASE,
    priceCents: 21999,
    description:
      "Scandinavian-inspired mid-tower with real walnut trim, airflow focus, and support for large GPUs.",
    image: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=800&q=80",
    compatibility: {
      formFactor: ["ATX", "mATX", "Mini-ITX"],
      maxGpuLengthMm: 413,
      maxRadiatorMm: 360,
    },
    specs: {
      color: "Charcoal",
      panels: "Tempered glass",
    },
  },
  {
    slug: "nzxt-kraken-elite-360",
    name: "NZXT Kraken Elite 360 RGB",
    brand: "NZXT",
    kind: ComponentKind.COOLING,
    priceCents: 21999,
    description:
      "360mm AIO with customizable LCD display, quiet Asetek Gen7 pump, and reinforced tubing for premium thermals.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    compatibility: {
      radiatorSizeMm: 360,
      sockets: ["LGA1700", "AM5"],
    },
    specs: {
      fans: "3x F Series 120mm",
      noise: "21 dBA",
    },
    isRecommended: true,
  },
  {
    slug: "corsair-icue-h150i",
    name: "Corsair iCUE H150i Elite LCD",
    brand: "Corsair",
    kind: ComponentKind.COOLING,
    priceCents: 23999,
    description:
      "High-performance 360mm cooler with brilliant IPS pump display, magnetic levitation fans, and sRGB sync.",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80",
    compatibility: {
      radiatorSizeMm: 360,
      sockets: ["LGA1700", "AM5"],
    },
    specs: {
      fans: "3x ML120 RGB",
      software: "iCUE",
    },
  },
  {
    slug: "windows-11-pro-license",
    name: "Windows 11 Pro (Digital License)",
    brand: "Microsoft",
    kind: ComponentKind.OS,
    priceCents: 19999,
    description:
      "Activated Windows 11 Pro with BitLocker, Hyper-V, and enterprise-grade remote management.",
    compatibility: {
      edition: "Pro",
      architecture: "64-bit",
    },
    specs: {
      delivery: "Pre-installed with digital license",
    },
  },
  {
    slug: "ezcomputers-premium-assembly",
    name: "EZComputers Precision Assembly & Stress Test",
    brand: "EZComputers",
    kind: ComponentKind.SERVICE,
    priceCents: 29900,
    description:
      "Hand-built by senior technicians with cable artistry, thermal calibration, and 48-hour stability burn-in.",
    specs: {
      coverage: "Lifetime workmanship guarantee",
    },
    isRecommended: true,
  },
];

async function main() {
  console.info("? Resetting database...");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.savedBuild.deleteMany();
  await prisma.customBuildComponent.deleteMany();
  await prisma.customBuild.deleteMany();
  await prisma.productReview.deleteMany();
  await prisma.productComponent.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productSpecification.deleteMany();
  await prisma.product.deleteMany();
  await prisma.componentOption.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  console.info("?? Seeding users...");
  const adminPassword = await hash("Admin123!", 12);
  const customerPassword = await hash("Customer123!", 12);

  const adminUser = await prisma.user.create({
    data: {
      name: "Alex Morgan",
      email: "admin@ezcomputers.com",
      role: UserRole.ADMIN,
      passwordHash: adminPassword,
    },
  });

  const demoUser = await prisma.user.create({
    data: {
      name: "Jordan Blake",
      email: "demo@ezcomputers.com",
      role: UserRole.CUSTOMER,
      passwordHash: customerPassword,
    },
  });

  console.info("?? Seeding component catalog...");
  const componentIdBySlug = new Map<string, string>();
  const componentPriceBySlug = new Map<string, number>();
  const componentKindBySlug = new Map<string, ComponentKind>();

  for (const seed of componentSeeds) {
    const record = await prisma.componentOption.create({
      data: {
        slug: seed.slug,
        name: seed.name,
        brand: seed.brand,
        kind: seed.kind,
        description: seed.description,
        image: seed.image,
        priceCents: seed.priceCents,
        msrpCents: seed.msrpCents ?? null,
        compatibility: seed.compatibility ? JSON.stringify(seed.compatibility) : null,
        specs: seed.specs ? JSON.stringify(seed.specs) : null,
        stock: seed.stock ?? 25,
        isRecommended: seed.isRecommended ?? false,
      },
    });
    componentIdBySlug.set(seed.slug, record.id);
    componentPriceBySlug.set(seed.slug, seed.priceCents);
    componentKindBySlug.set(seed.slug, seed.kind);
  }

  const productSeeds: ProductSeed[] = [
    {
      slug: "apex-raptor-elite",
      name: "Apex Raptor Elite",
      headline: "Unmatched 4K performance with headroom for tomorrow.",
      shortDescription: "Flagship 4K gaming PC pairing Intel 14900K with RTX 4090 inside a showcase chassis.",
      description:
        "The Apex Raptor Elite is engineered for enthusiasts who demand perfect frame pacing, uncompromising thermals, and whisper-quiet acoustics. Premium components are curated for synergy, while our tuning pipeline extracts every ounce of performance.",
      category: ProductCategory.GAMING,
      status: ProductStatus.ACTIVE,
      basePriceCents: 429900,
      msrpCents: 459900,
      inventory: 8,
      isFeatured: true,
      heroImage: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1600&q=80",
      gallery: [
        { url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1600&q=80", alt: "Apex Raptor Elite front view" },
        { url: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80", alt: "Apex Raptor Elite tempered glass side" },
        { url: "https://images.unsplash.com/photo-1481277542470-605612bd2d61?auto=format&fit=crop&w=1200&q=80", alt: "Custom sleeved cables and cooling" },
      ],
      specifications: [
        { label: "CPU", value: "Intel Core i9-14900K", group: "Performance" },
        { label: "GPU", value: "NVIDIA GeForce RTX 4090 24GB", group: "Performance" },
        { label: "Memory", value: "32GB (2x16GB) Corsair Dominator DDR5-6000", group: "Performance" },
        { label: "Storage", value: "2TB Samsung 990 Pro NVMe", group: "Storage" },
        { label: "Chassis", value: "Lian Li O11 Dynamic EVO", group: "Design" },
      ],
      components: [
        { slug: "intel-core-i9-14900k", label: "CPU", kind: ComponentKind.CPU, summary: "24-core Raptor Lake Refresh" },
        { slug: "asus-rog-maximus-z790-hero", label: "Motherboard", kind: ComponentKind.MOTHERBOARD, summary: "PCIe 5.0 & Thunderbolt 4" },
        { slug: "nvidia-geforce-rtx-4090", label: "Graphics", kind: ComponentKind.GPU, summary: "24GB flagship Ada GPU" },
        { slug: "corsair-dominator-32gb-ddr5-6000", label: "Memory", kind: ComponentKind.MEMORY, summary: "Low-latency DDR5" },
        { slug: "samsung-990-pro-2tb", label: "Primary Storage", kind: ComponentKind.STORAGE, summary: "PCIe 4.0 NVMe" },
        { slug: "corsair-hx1000i", label: "Power Supply", kind: ComponentKind.POWER_SUPPLY, summary: "1000W Platinum" },
        { slug: "nzxt-kraken-elite-360", label: "Cooling", kind: ComponentKind.COOLING, summary: "360mm LCD AIO" },
        { slug: "lian-li-o11-dynamic-evo", label: "Chassis", kind: ComponentKind.CASE, summary: "Dual-chamber showcase" },
        { slug: "windows-11-pro-license", label: "Operating System", kind: ComponentKind.OS, summary: "Windows 11 Pro" },
        { slug: "ezcomputers-premium-assembly", label: "Services", kind: ComponentKind.SERVICE, summary: "Custom sleeving & burn-in" },
      ],
      reviews: [
        {
          rating: 5,
          title: "Crushes everything in 4K",
          body: "Cyberpunk with path tracing stays well above 120 FPS and the system is silent thanks to the custom fan tuning from EZComputers.",
          author: "Noah P.",
          userId: demoUser.id,
        },
        {
          rating: 5,
          title: "Attention to detail is insane",
          body: "Cable routing, packaging, documentation-every step felt premium. Thermals are 15 deg C cooler than my previous boutique build.",
          author: "Taylor V.",
        },
      ],
    },
    {
      slug: "eclipse-creator-pro",
      name: "Eclipse Creator Pro",
      headline: "Render, edit, and stream without compromise.",
      shortDescription: "Ryzen 7950X3D meets RTX 4080 Super in a meticulously tuned creator workstation.",
      description:
        "Purpose-built for hybrid creators who livestream, edit, and design in the same timeline. Dual high-capacity NVMe drives keep assets instant, while our quiet airflow profile preserves focus even during overnight renders.",
      category: ProductCategory.CREATOR,
      status: ProductStatus.ACTIVE,
      basePriceCents: 319900,
      msrpCents: 339900,
      inventory: 12,
      isFeatured: true,
      heroImage: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=1600&q=80",
      gallery: [
        {
          url: "https://images.unsplash.com/photo-1587202372775-98927e820908?auto=format&fit=crop&w=1600&q=80",
          alt: "Eclipse Creator Pro workstation",
        },
        { url: "https://images.unsplash.com/photo-1521120413309-4f7f9357ca8a?auto=format&fit=crop&w=1200&q=80", alt: "Top exhaust layout" },
        { url: "https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=1200&q=80", alt: "Rear I/O with Thunderbolt" },
      ],
      specifications: [
        { label: "CPU", value: "AMD Ryzen 9 7950X3D", group: "Performance" },
        { label: "GPU", value: "NVIDIA GeForce RTX 4080 Super 16GB", group: "Performance" },
        { label: "Memory", value: "64GB G.Skill Trident DDR5-6000", group: "Performance" },
        { label: "Storage", value: "2TB Samsung 990 Pro + 4TB FireCuda 530", group: "Storage" },
        { label: "Connectivity", value: "Wi-Fi 6E, 2.5G LAN, USB4", group: "Connectivity" },
      ],
      components: [
        { slug: "amd-ryzen-9-7950x3d", label: "CPU", kind: ComponentKind.CPU, summary: "16-core Zen 4 with 3D V-Cache" },
        { slug: "msi-meg-x670e-ace", label: "Motherboard", kind: ComponentKind.MOTHERBOARD, summary: "PCIe 5.0 & triple M.2" },
        { slug: "nvidia-geforce-rtx-4080-super", label: "Graphics", kind: ComponentKind.GPU, summary: "Studio-ready Ada" },
        { slug: "gskill-trident-64gb-ddr5-6000", label: "Memory", kind: ComponentKind.MEMORY, summary: "64GB EXPO kit" },
        { slug: "samsung-990-pro-2tb", label: "Primary Storage", kind: ComponentKind.STORAGE, summary: "2TB OS drive" },
        { slug: "seagate-firecuda-530-4tb", label: "Project Drive", kind: ComponentKind.STORAGE, summary: "4TB scratch disk" },
        { slug: "seasonic-vertex-1200", label: "Power Supply", kind: ComponentKind.POWER_SUPPLY, summary: "1200W ATX 3.0" },
        { slug: "corsair-icue-h150i", label: "Cooling", kind: ComponentKind.COOLING, summary: "360mm LCD AIO" },
        { slug: "fractal-north-xl", label: "Chassis", kind: ComponentKind.CASE, summary: "Designer airflow" },
        { slug: "windows-11-pro-license", label: "Operating System", kind: ComponentKind.OS, summary: "Windows 11 Pro" },
        { slug: "ezcomputers-premium-assembly", label: "Services", kind: ComponentKind.SERVICE, summary: "Precision assembly" },
      ],
      reviews: [
        {
          rating: 5,
          title: "Exactly what my studio needed",
          body: "DaVinci Resolve and Unreal run simultaneously without framedrops. System remains under 40 dBA even under 100% CPU load.",
          author: "Mira L.",
        },
      ],
    },
    {
      slug: "nebula-stealth-compact",
      name: "Nebula Stealth Compact",
      headline: "Small footprint, serious performance.",
      shortDescription: "A compact powerhouse optimized for premium 1440p experiences and modern living spaces.",
      description:
        "Nebula Stealth Compact blends minimalist design with punchy performance. Tuned airflow and acoustics deliver full-size horsepower in a footprint that fits any battle station or creative nook.",
      category: ProductCategory.COMPACT,
      status: ProductStatus.ACTIVE,
      basePriceCents: 219900,
      msrpCents: 229900,
      inventory: 15,
      isFeatured: false,
      heroImage: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1600&q=80",
      gallery: [
        { url: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1600&q=80", alt: "Nebula Stealth Compact front" },
        { url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80", alt: "Compact tempered glass profile" },
      ],
      specifications: [
        { label: "CPU", value: "Intel Core i9-14900K (tuned)", group: "Performance" },
        { label: "GPU", value: "NVIDIA GeForce RTX 4080 Super", group: "Performance" },
        { label: "Memory", value: "32GB DDR5-6000", group: "Performance" },
        { label: "Storage", value: "2TB Samsung 990 Pro", group: "Storage" },
        { label: "Dimensions", value: "18.3\" x 9.1\" x 15.5\"", group: "Design" },
      ],
      components: [
        { slug: "intel-core-i9-14900k", label: "CPU", kind: ComponentKind.CPU, summary: "Custom tuned down for SFF thermals" },
        { slug: "asus-rog-maximus-z790-hero", label: "Motherboard", kind: ComponentKind.MOTHERBOARD, summary: "Wi-Fi 7 + TB4" },
        { slug: "nvidia-geforce-rtx-4080-super", label: "Graphics", kind: ComponentKind.GPU, summary: "1440p ultrawide beast" },
        { slug: "corsair-dominator-32gb-ddr5-6000", label: "Memory", kind: ComponentKind.MEMORY, summary: "32GB DDR5" },
        { slug: "samsung-990-pro-2tb", label: "Storage", kind: ComponentKind.STORAGE, summary: "2TB NVMe" },
        { slug: "corsair-hx1000i", label: "Power Supply", kind: ComponentKind.POWER_SUPPLY, summary: "1000W Platinum" },
        { slug: "nzxt-kraken-elite-360", label: "Cooling", kind: ComponentKind.COOLING, summary: "360mm AIO" },
        { slug: "fractal-north-xl", label: "Chassis", kind: ComponentKind.CASE, summary: "Compact airflow" },
        { slug: "windows-11-pro-license", label: "Operating System", kind: ComponentKind.OS, summary: "Windows 11 Pro" },
        { slug: "ezcomputers-premium-assembly", label: "Services", kind: ComponentKind.SERVICE, summary: "Acoustic tuning" },
      ],
      reviews: [],
    },
  ];

  console.info("??? Seeding pre-built systems...");
  for (const product of productSeeds) {
    await prisma.product.create({
      data: {
        slug: product.slug,
        name: product.name,
        headline: product.headline,
        shortDescription: product.shortDescription,
        description: product.description,
        category: product.category,
        status: product.status,
        basePriceCents: product.basePriceCents,
        msrpCents: product.msrpCents ?? null,
        inventory: product.inventory,
        isFeatured: product.isFeatured,
        heroImage: product.heroImage,
        gallery: {
          create: product.gallery.map((image, index) => ({ ...image, position: index })),
        },
        specifications: {
          create: product.specifications.map((spec, index) => ({ ...spec, position: index })),
        },
        components: {
          create: product.components.map((component, index) => ({
            label: component.label,
            summary: component.summary,
            kind: component.kind,
            position: index,
            component: { connect: { id: componentIdBySlug.get(component.slug)! } },
          })),
        },
        reviews: {
          create: product.reviews.map((review) => ({
            rating: review.rating,
            title: review.title,
            body: review.body,
            author: review.author,
            userId: review.userId ?? null,
          })),
        },
      },
    });
  }

  const customBuildSeeds: CustomBuildSeed[] = [
    {
      slug: "creator-studio-max",
      name: "Creator Studio Max",
      summary: "Optimized for Adobe CC, Unreal, and DaVinci Resolve heavy hitters.",
      notes: "Includes tuned fan curves, render profile, and project-based folder structures pre-configured.",
      coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80",
      estimatedWattage: 780,
      componentSlugs: [
        "amd-ryzen-9-7950x3d",
        "msi-meg-x670e-ace",
        "nvidia-geforce-rtx-4090",
        "gskill-trident-64gb-ddr5-6000",
        "samsung-990-pro-2tb",
        "seagate-firecuda-530-4tb",
        "seasonic-vertex-1200",
        "corsair-icue-h150i",
        "lian-li-o11-dynamic-evo",
        "windows-11-pro-license",
        "ezcomputers-premium-assembly",
      ],
    },
    {
      slug: "esports-sprint-x",
      name: "Esports Sprint X",
      summary: "High refresh 1080p/1440p competitive rig with latency-tuned BIOS profile.",
      notes: "Ships with EZLatency profile, 2.5GbE QoS tagging, and per-title fan curve presets.",
      coverImage: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1400&q=80",
      estimatedWattage: 620,
      componentSlugs: [
        "intel-core-i9-14900k",
        "asus-rog-maximus-z790-hero",
        "nvidia-geforce-rtx-4080-super",
        "corsair-dominator-32gb-ddr5-6000",
        "samsung-990-pro-2tb",
        "corsair-hx1000i",
        "nzxt-kraken-elite-360",
        "fractal-north-xl",
        "windows-11-pro-license",
        "ezcomputers-premium-assembly",
      ],
    },
  ];

  console.info("??? Seeding custom build presets...");
  for (const build of customBuildSeeds) {
    const componentIds = build.componentSlugs
      .map((slug) => componentIdBySlug.get(slug))
      .filter((id): id is string => Boolean(id));

    const basePriceCents = build.componentSlugs.reduce(
      (total, slug) => total + (componentPriceBySlug.get(slug) ?? 0),
      0,
    );
    const adjustmentsCents = Math.round(basePriceCents * 0.08);
    const totalPriceCents = basePriceCents + adjustmentsCents;

    await prisma.customBuild.create({
      data: {
        slug: build.slug,
        name: build.name,
        summary: build.summary,
        notes: build.notes,
        coverImage: build.coverImage,
        estimatedWattage: build.estimatedWattage,
        basePriceCents,
        adjustmentsCents,
        totalPriceCents,
        userId: adminUser.id,
        components: {
          create: componentIds.map((componentId, index) => ({
            position: index,
            kind:
              componentKindBySlug.get(build.componentSlugs[index]) ?? ComponentKind.ACCESSORY,
            component: { connect: { id: componentId } },
          })),
        },
      },
    });
  }

  console.info("? Seed completed successfully.");
}

main()
  .catch((err) => {
    console.error("Seed failed", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });




