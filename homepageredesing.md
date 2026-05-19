<!DOCTYPE html>

<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>EduDock - Educational Tools &amp; Resources</title>
<!-- Tailwind CSS v3 CDN -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<!-- Google Fonts: Inter -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&amp;display=swap" rel="stylesheet"/>
<style data-purpose="custom-styles">
    body {
      font-family: 'Inter', sans-serif;
      background-color: #f8fafc;
      color: #1e293b;
    }
    .glass-card {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.5);
      box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.05);
    }
    .hero-gradient-text {
      background: linear-gradient(90deg, #38bdf8, #ec4899);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .blue-gradient-btn {
      background: linear-gradient(135deg, #60a5fa, #3b82f6);
    }
    .soft-shadow {
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
    }
    .carousel-dot-active {
      width: 24px;
      background-color: #3b82f6;
    }
  </style>
</head>
<body class="antialiased">
<!-- BEGIN: MainHeader -->
<header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
<nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
<!-- Logo and Brand -->
<div class="flex items-center space-x-2">
<img alt="EduDock Logo" class="h-10 w-10 object-contain" onerror="this.src='https://placehold.co/40x40?text=ED'" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcWh-MS9XUjyxDKpa3ws1lCtPUB1DVNjGYYhSTzYFq-ya27U4YJWzCEcjDNz11Ch4IDiDGB7FPfS21LK_R_MG57u8GEWW-1ioBw03KGqiUah1wXeIWK-I9bRJA7yaAIXlvV80ggLV3IRg1zBoT1VPIl_n2HnsH6Vdz2oJdvpbx29HYFzoo_3DsSVWS0Q01nQxwPheqSTMI9pbZqlZrTWl82-Dg3jTcqn4zaC_L_SrxgkuoUNDvoNq5LYJq_urh9529GtReYl0q3Q1K"/>
<span class="text-2xl font-extrabold tracking-tight text-slate-800">Edu<span class="text-blue-500">Dock</span></span>
</div>
<!-- Navigation Links -->
<div class="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600">
<a class="text-blue-600" href="#">Home</a>
<a class="hover:text-blue-600 transition" href="#">Tools</a>
<a class="hover:text-blue-600 transition" href="#">PDFs</a>
<a class="hover:text-blue-600 transition" href="#">Updates</a>
</div>
<!-- Search and Theme Toggle -->
<div class="flex items-center space-x-4">
<div class="relative hidden sm:block">
<input class="pl-4 pr-10 py-2 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 w-48 lg:w-64" placeholder="Search" type="text"/>
<span class="absolute right-3 top-2.5 text-gray-400">
<svg class="h-4 w-4" fill="none" stroke="currentColor" viewbox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
<path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
</svg>
</span>
</div>
<button class="w-12 h-6 bg-slate-800 rounded-full flex items-center px-1">
<div class="w-4 h-4 bg-white rounded-full ml-auto"></div>
</button>
</div>
</nav>
</header>
<!-- END: MainHeader -->
<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-24">
<!-- BEGIN: HeroSection -->
<section class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center" data-purpose="hero-container">
<div class="space-y-8">
<h1 class="text-6xl md:text-7xl font-extrabold leading-tight">
<span class="hero-gradient-text">Welcome to</span><br/>
<span class="text-slate-800">EduDock</span>
</h1>
<p class="text-lg text-slate-600 max-w-lg leading-relaxed">
          Discover curated educational tools, resources, and updates — everything you need in one place.
        </p>
<div class="flex flex-wrap gap-4">
<button class="blue-gradient-btn px-8 py-3.5 rounded-full text-white font-bold soft-shadow hover:opacity-90 transition">
            Explore Tools
          </button>
<button class="border-2 border-blue-400 px-8 py-3.5 rounded-full text-blue-600 font-bold hover:bg-blue-50 transition">
            Browse PDFs
          </button>
</div>
</div>
<div class="relative flex justify-center">
<!-- Main Hero Illustration Placeholder -->
<img alt="EduDock Illustration" class="w-full max-w-xl h-auto" onerror="this.src='https://placehold.co/600x600?text=Abstract+3D+Illustration'" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXtmQpY6QD8cwKoHW9jjc5h_QFOqcNVU6a-grdcZXTyvL1T601IfW_UPgYaEoUthPgms8Jxcz0ePELUhh89iWccW2RUr1WpEqTTpv51FG4H1lOm8HM0iphehQTeRgU0HBmiIu4qoqfcYZdrQzPWpP9LpsTk199TvPqHLo2bBBtuz8idKNSwd8Wj_8GEbbz6_qMFHanOzSCDUUtCYkF1KFuf_ohFS6K8SKZ_yOQbYaceEFd4ix3bJqiWumhOrQSWOZSHjsq4LVf3MHC"/>
</div>
</section>
<!-- END: HeroSection -->
<!-- BEGIN: TrendingNow -->
<section class="space-y-8" data-purpose="trending-carousel">
<div class="flex items-center justify-between">
<h2 class="text-3xl font-extrabold text-slate-800">Trending Now</h2>
<div class="flex space-x-2">
<button class="p-2 rounded-full bg-white border border-gray-200 text-gray-400 hover:bg-gray-50 transition">
<svg class="h-5 w-5" fill="none" stroke="currentColor" viewbox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M15 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
</button>
<button class="p-2 rounded-full bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 transition">
<svg class="h-5 w-5" fill="none" stroke="currentColor" viewbox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
</button>
</div>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
<!-- Trending Card 1 -->
<div class="glass-card p-6 rounded-3xl space-y-4 hover:translate-y-[-4px] transition duration-300 cursor-pointer">
<div class="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center">
<img alt="Alert" class="w-6 h-6 object-cover" onerror="this.src='https://placehold.co/24x24/6366f1/ffffff?text=!'" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9Eobgom6rFSGobS3DV1YcHr_T7m-RKjQkgB4vgpGFnYRlNAIU1c10xGjezr4qmpETAIb3A_gbcTxgEUHggUPxFJfqybgTzfPbNFpGMk2GCOw_Os1jxN04gKyyfh4gbWEH0VNbl3CrvPnv0fAEgr2SgUWt_RGqFxYtCM0He8S2AydK8z_bJ6nZ8c-O8ijifhlrWAEkcNm2HaeZjPvE-5lFSMvqGrWDy34P-Wgq3AOrCUHgBcwmulhVChPIxaFnjealSvFPC7KjBoSc"/>
</div>
<h3 class="font-bold text-slate-800 leading-snug">JENPAS(UG) 2026 URGENT ALERT</h3>
<p class="text-xs text-slate-500 line-clamp-2">Discover curated educational tools, resources, and updates.</p>
</div>
<!-- Trending Card 2 -->
<div class="glass-card p-6 rounded-3xl space-y-4 hover:translate-y-[-4px] transition duration-300 cursor-pointer">
<div class="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center">
<img alt="Grad" class="w-6 h-6 object-cover" onerror="this.src='https://placehold.co/24x24/a855f7/ffffff?text=G'" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9Eobgom6rFSGobS3DV1YcHr_T7m-RKjQkgB4vgpGFnYRlNAIU1c10xGjezr4qmpETAIb3A_gbcTxgEUHggUPxFJfqybgTzfPbNFpGMk2GCOw_Os1jxN04gKyyfh4gbWEH0VNbl3CrvPnv0fAEgr2SgUWt_RGqFxYtCM0He8S2AydK8z_bJ6nZ8c-O8ijifhlrWAEkcNm2HaeZjPvE-5lFSMvqGrWDy34P-Wgq3AOrCUHgBcwmulhVChPIxaFnjealSvFPC7KjBoSc"/>
</div>
<h3 class="font-bold text-slate-800 leading-snug">JEE ADVANCED 2026: Urgent Fee</h3>
<p class="text-xs text-slate-500 line-clamp-2">JEE Advanced 2026: Urgent Fee online lears state mooascsd teowad...</p>
</div>
<!-- Trending Card 3 -->
<div class="glass-card p-6 rounded-3xl space-y-4 hover:translate-y-[-4px] transition duration-300 cursor-pointer">
<div class="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
<img alt="File" class="w-6 h-6 object-cover" onerror="this.src='https://placehold.co/24x24/3b82f6/ffffff?text=F'" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9Eobgom6rFSGobS3DV1YcHr_T7m-RKjQkgB4vgpGFnYRlNAIU1c10xGjezr4qmpETAIb3A_gbcTxgEUHggUPxFJfqybgTzfPbNFpGMk2GCOw_Os1jxN04gKyyfh4gbWEH0VNbl3CrvPnv0fAEgr2SgUWt_RGqFxYtCM0He8S2AydK8z_bJ6nZ8c-O8ijifhlrWAEkcNm2HaeZjPvE-5lFSMvqGrWDy34P-Wgq3AOrCUHgBcwmulhVChPIxaFnjealSvFPC7KjBoSc"/>
</div>
<h3 class="font-bold text-slate-800 leading-snug">WBJEE 2026 Admit Card Released</h3>
<p class="text-xs text-slate-500 line-clamp-2">WBJEE 2026 Admit Card Released of updates umery/mmr for 2024...</p>
</div>
<!-- Trending Card 4 -->
<div class="glass-card p-6 rounded-3xl space-y-4 hover:translate-y-[-4px] transition duration-300 cursor-pointer">
<div class="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center">
<img alt="Alert" class="w-6 h-6 object-cover" onerror="this.src='https://placehold.co/24x24/6366f1/ffffff?text=!'" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9Eobgom6rFSGobS3DV1YcHr_T7m-RKjQkgB4vgpGFnYRlNAIU1c10xGjezr4qmpETAIb3A_gbcTxgEUHggUPxFJfqybgTzfPbNFpGMk2GCOw_Os1jxN04gKyyfh4gbWEH0VNbl3CrvPnv0fAEgr2SgUWt_RGqFxYtCM0He8S2AydK8z_bJ6nZ8c-O8ijifhlrWAEkcNm2HaeZjPvE-5lFSMvqGrWDy34P-Wgq3AOrCUHgBcwmulhVChPIxaFnjealSvFPC7KjBoSc"/>
</div>
<h3 class="font-bold text-slate-800 leading-snug">JENPAS(UG) 2026 Urgent Fee</h3>
<p class="text-xs text-slate-500 line-clamp-2">JEE Advanced 2026: Urgent Fee online learn more...</p>
</div>
</div>
<div class="flex justify-center space-x-2 pt-4">
<div class="h-2 w-2 rounded-full bg-gray-300"></div>
<div class="h-2 carousel-dot-active rounded-full"></div>
<div class="h-2 w-2 rounded-full bg-gray-300"></div>
</div>
</section>
<!-- END: TrendingNow -->
<!-- BEGIN: HotUpdates -->
<section class="space-y-8" data-purpose="hot-updates">
<div class="flex items-center justify-between">
<h2 class="text-3xl font-extrabold text-slate-800">Hot Updates</h2>
<div class="flex space-x-2">
<button class="p-2 rounded-full bg-white border border-gray-200 text-gray-400 hover:bg-gray-50 transition">
<svg class="h-5 w-5" fill="none" stroke="currentColor" viewbox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M15 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
</button>
<button class="p-2 rounded-full bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 transition">
<svg class="h-5 w-5" fill="none" stroke="currentColor" viewbox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
</button>
</div>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
<!-- Update Card 1 -->
<div class="glass-card p-6 rounded-3xl space-y-4 hover:translate-y-[-4px] transition duration-300 cursor-pointer">
<div class="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
<img alt="File" class="w-6 h-6 object-cover" onerror="this.src='https://placehold.co/24x24/3b82f6/ffffff?text=F'" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9Eobgom6rFSGobS3DV1YcHr_T7m-RKjQkgB4vgpGFnYRlNAIU1c10xGjezr4qmpETAIb3A_gbcTxgEUHggUPxFJfqybgTzfPbNFpGMk2GCOw_Os1jxN04gKyyfh4gbWEH0VNbl3CrvPnv0fAEgr2SgUWt_RGqFxYtCM0He8S2AydK8z_bJ6nZ8c-O8ijifhlrWAEkcNm2HaeZjPvE-5lFSMvqGrWDy34P-Wgq3AOrCUHgBcwmulhVChPIxaFnjealSvFPC7KjBoSc"/>
</div>
<h3 class="font-bold text-slate-800 leading-snug">WBJEE 2026 Admit Card Released</h3>
<p class="text-xs text-slate-500 line-clamp-2">WBJEE 2026 Admit Card Released of updates querylinmmrse 2026...</p>
</div>
<!-- Update Card 2 -->
<div class="glass-card p-6 rounded-3xl space-y-4 hover:translate-y-[-4px] transition duration-300 cursor-pointer">
<div class="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center">
<img alt="Grad" class="w-6 h-6 object-cover" onerror="this.src='https://placehold.co/24x24/a855f7/ffffff?text=G'" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9Eobgom6rFSGobS3DV1YcHr_T7m-RKjQkgB4vgpGFnYRlNAIU1c10xGjezr4qmpETAIb3A_gbcTxgEUHggUPxFJfqybgTzfPbNFpGMk2GCOw_Os1jxN04gKyyfh4gbWEH0VNbl3CrvPnv0fAEgr2SgUWt_RGqFxYtCM0He8S2AydK8z_bJ6nZ8c-O8ijifhlrWAEkcNm2HaeZjPvE-5lFSMvqGrWDy34P-Wgq3AOrCUHgBcwmulhVChPIxaFnjealSvFPC7KjBoSc"/>
</div>
<h3 class="font-bold text-slate-800 leading-snug">JEE ADVANCED 2026: Urgent Fee</h3>
<p class="text-xs text-slate-500 line-clamp-2">JEE Advanced 2026: Urgent Fee online lears state mooascsd teowad...</p>
</div>
<!-- Update Card 3 -->
<div class="glass-card p-6 rounded-3xl space-y-4 hover:translate-y-[-4px] transition duration-300 cursor-pointer">
<div class="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
<img alt="File" class="w-6 h-6 object-cover" onerror="this.src='https://placehold.co/24x24/3b82f6/ffffff?text=F'" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9Eobgom6rFSGobS3DV1YcHr_T7m-RKjQkgB4vgpGFnYRlNAIU1c10xGjezr4qmpETAIb3A_gbcTxgEUHggUPxFJfqybgTzfPbNFpGMk2GCOw_Os1jxN04gKyyfh4gbWEH0VNbl3CrvPnv0fAEgr2SgUWt_RGqFxYtCM0He8S2AydK8z_bJ6nZ8c-O8ijifhlrWAEkcNm2HaeZjPvE-5lFSMvqGrWDy34P-Wgq3AOrCUHgBcwmulhVChPIxaFnjealSvFPC7KjBoSc"/>
</div>
<h3 class="font-bold text-slate-800 leading-snug">WBJEE 2026 Admit Card Released</h3>
<p class="text-xs text-slate-500 line-clamp-2">WBJEE 2026 Admit Card Released of updates umery/mmr for 2024...</p>
</div>
<!-- Update Card 4 -->
<div class="glass-card p-6 rounded-3xl space-y-4 hover:translate-y-[-4px] transition duration-300 cursor-pointer">
<div class="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center">
<img alt="Grad" class="w-6 h-6 object-cover" onerror="this.src='https://placehold.co/24x24/a855f7/ffffff?text=G'" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9Eobgom6rFSGobS3DV1YcHr_T7m-RKjQkgB4vgpGFnYRlNAIU1c10xGjezr4qmpETAIb3A_gbcTxgEUHggUPxFJfqybgTzfPbNFpGMk2GCOw_Os1jxN04gKyyfh4gbWEH0VNbl3CrvPnv0fAEgr2SgUWt_RGqFxYtCM0He8S2AydK8z_bJ6nZ8c-O8ijifhlrWAEkcNm2HaeZjPvE-5lFSMvqGrWDy34P-Wgq3AOrCUHgBcwmulhVChPIxaFnjealSvFPC7KjBoSc"/>
</div>
<h3 class="font-bold text-slate-800 leading-snug">JEE ADVANCED: Urgent Fee</h3>
<p class="text-xs text-slate-500 line-clamp-2">JEE Advanced 2026: Urgent Fee online learn me...</p>
</div>
</div>
<div class="flex justify-center space-x-2 pt-4">
<div class="h-2 w-2 rounded-full bg-gray-300"></div>
<div class="h-2 carousel-dot-active rounded-full"></div>
<div class="h-2 w-2 rounded-full bg-gray-300"></div>
</div>
</section>
<!-- END: HotUpdates -->
<!-- BEGIN: AllToolsRepository -->
<section class="space-y-8" data-purpose="tools-repository">
<h2 class="text-3xl font-extrabold text-slate-800">All Tools Repository</h2>
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
<!-- Tool Card 1 -->
<div class="glass-card p-10 rounded-3xl flex flex-col items-center justify-center space-y-6 group hover:scale-[1.02] transition duration-300 cursor-pointer">
<div class="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition">
<img alt="Math" class="w-8 h-8 object-cover" onerror="this.src='https://placehold.co/32x32/3b82f6/ffffff?text=%2B%2F-x'" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9Eobgom6rFSGobS3DV1YcHr_T7m-RKjQkgB4vgpGFnYRlNAIU1c10xGjezr4qmpETAIb3A_gbcTxgEUHggUPxFJfqybgTzfPbNFpGMk2GCOw_Os1jxN04gKyyfh4gbWEH0VNbl3CrvPnv0fAEgr2SgUWt_RGqFxYtCM0He8S2AydK8z_bJ6nZ8c-O8ijifhlrWAEkcNm2HaeZjPvE-5lFSMvqGrWDy34P-Wgq3AOrCUHgBcwmulhVChPIxaFnjealSvFPC7KjBoSc"/>
</div>
<span class="font-bold text-slate-700 text-lg">Math Tools</span>
</div>
<!-- Tool Card 2 -->
<div class="glass-card p-10 rounded-3xl flex flex-col items-center justify-center space-y-6 group hover:scale-[1.02] transition duration-300 cursor-pointer">
<div class="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition">
<img alt="Science" class="w-8 h-8 object-cover" onerror="this.src='https://placehold.co/32x32/a855f7/ffffff?text=Atom'" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9Eobgom6rFSGobS3DV1YcHr_T7m-RKjQkgB4vgpGFnYRlNAIU1c10xGjezr4qmpETAIb3A_gbcTxgEUHggUPxFJfqybgTzfPbNFpGMk2GCOw_Os1jxN04gKyyfh4gbWEH0VNbl3CrvPnv0fAEgr2SgUWt_RGqFxYtCM0He8S2AydK8z_bJ6nZ8c-O8ijifhlrWAEkcNm2HaeZjPvE-5lFSMvqGrWDy34P-Wgq3AOrCUHgBcwmulhVChPIxaFnjealSvFPC7KjBoSc"/>
</div>
<span class="font-bold text-slate-700 text-lg">Science Resources</span>
</div>
<!-- Tool Card 3 -->
<div class="glass-card p-10 rounded-3xl flex flex-col items-center justify-center space-y-6 group hover:scale-[1.02] transition duration-300 cursor-pointer">
<div class="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center group-hover:bg-teal-100 transition">
<img alt="Language" class="w-8 h-8 object-cover" onerror="this.src='https://placehold.co/32x32/14b8a6/ffffff?text=文A'" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9Eobgom6rFSGobS3DV1YcHr_T7m-RKjQkgB4vgpGFnYRlNAIU1c10xGjezr4qmpETAIb3A_gbcTxgEUHggUPxFJfqybgTzfPbNFpGMk2GCOw_Os1jxN04gKyyfh4gbWEH0VNbl3CrvPnv0fAEgr2SgUWt_RGqFxYtCM0He8S2AydK8z_bJ6nZ8c-O8ijifhlrWAEkcNm2HaeZjPvE-5lFSMvqGrWDy34P-Wgq3AOrCUHgBcwmulhVChPIxaFnjealSvFPC7KjBoSc"/>
</div>
<span class="font-bold text-slate-700 text-lg">Language Aids</span>
</div>
<!-- Tool Card 4 -->
<div class="glass-card p-10 rounded-3xl flex flex-col items-center justify-center space-y-6 group hover:scale-[1.02] transition duration-300 cursor-pointer">
<div class="w-16 h-16 rounded-2xl bg-pink-50 flex items-center justify-center group-hover:bg-pink-100 transition">
<img alt="PDF" class="w-8 h-8 object-cover" onerror="this.src='https://placehold.co/32x32/ec4899/ffffff?text=PDF'" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9Eobgom6rFSGobS3DV1YcHr_T7m-RKjQkgB4vgpGFnYRlNAIU1c10xGjezr4qmpETAIb3A_gbcTxgEUHggUPxFJfqybgTzfPbNFpGMk2GCOw_Os1jxN04gKyyfh4gbWEH0VNbl3CrvPnv0fAEgr2SgUWt_RGqFxYtCM0He8S2AydK8z_bJ6nZ8c-O8ijifhlrWAEkcNm2HaeZjPvE-5lFSMvqGrWDy34P-Wgq3AOrCUHgBcwmulhVChPIxaFnjealSvFPC7KjBoSc"/>
</div>
<span class="font-bold text-slate-700 text-lg">PDF Converters</span>
</div>
<!-- Tool Card 5 -->
<div class="glass-card p-10 rounded-3xl flex flex-col items-center justify-center space-y-6 group hover:scale-[1.02] transition duration-300 cursor-pointer">
<div class="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition">
<img alt="Courses" class="w-8 h-8 object-cover" onerror="this.src='https://placehold.co/32x32/10b981/ffffff?text=▶'" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9Eobgom6rFSGobS3DV1YcHr_T7m-RKjQkgB4vgpGFnYRlNAIU1c10xGjezr4qmpETAIb3A_gbcTxgEUHggUPxFJfqybgTzfPbNFpGMk2GCOw_Os1jxN04gKyyfh4gbWEH0VNbl3CrvPnv0fAEgr2SgUWt_RGqFxYtCM0He8S2AydK8z_bJ6nZ8c-O8ijifhlrWAEkcNm2HaeZjPvE-5lFSMvqGrWDy34P-Wgq3AOrCUHgBcwmulhVChPIxaFnjealSvFPC7KjBoSc"/>
</div>
<span class="font-bold text-slate-700 text-lg">Online Courses</span>
</div>
<!-- Tool Card 6 -->
<div class="glass-card p-10 rounded-3xl flex flex-col items-center justify-center space-y-6 group hover:scale-[1.02] transition duration-300 cursor-pointer">
<div class="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition">
<img alt="Planner" class="w-8 h-8 object-cover" onerror="this.src='https://placehold.co/32x32/6366f1/ffffff?text=📅'" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9Eobgom6rFSGobS3DV1YcHr_T7m-RKjQkgB4vgpGFnYRlNAIU1c10xGjezr4qmpETAIb3A_gbcTxgEUHggUPxFJfqybgTzfPbNFpGMk2GCOw_Os1jxN04gKyyfh4gbWEH0VNbl3CrvPnv0fAEgr2SgUWt_RGqFxYtCM0He8S2AydK8z_bJ6nZ8c-O8ijifhlrWAEkcNm2HaeZjPvE-5lFSMvqGrWDy34P-Wgq3AOrCUHgBcwmulhVChPIxaFnjealSvFPC7KjBoSc"/>
</div>
<span class="font-bold text-slate-700 text-lg">Study Planners</span>
</div>
</div>
</section>
<!-- END: AllToolsRepository -->
</main>
<!-- BEGIN: MainFooter -->
<footer class="bg-gray-50 border-t border-gray-200 pt-20 pb-10">
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
<!-- Column 1: About -->
<div class="space-y-6">
<h4 class="text-lg font-bold text-slate-800">About EduDock</h4>
<p class="text-sm text-slate-500 leading-relaxed">
            Discover curated educational tools, resources, and updates — everything you need in one place.
          </p>
<p class="text-sm text-slate-500 leading-relaxed">
            Our mission statement is a curated to pursom-ranr experience and educational platform.
          </p>
</div>
<!-- Column 2: Resources -->
<div class="space-y-6">
<h4 class="text-lg font-bold text-slate-800">Resources</h4>
<ul class="space-y-3 text-sm text-slate-500">
<li><a class="hover:text-blue-500 transition" href="#">Tools</a></li>
<li><a class="hover:text-blue-500 transition" href="#">PDFs</a></li>
<li><a class="hover:text-blue-500 transition" href="#">Updates</a></li>
<li><a class="hover:text-blue-500 transition" href="#">Blog</a></li>
</ul>
</div>
<!-- Column 3: Contact -->
<div class="space-y-6">
<h4 class="text-lg font-bold text-slate-800">Contact</h4>
<ul class="space-y-3 text-sm text-slate-500">
<li><a class="hover:text-blue-500 transition" href="mailto:Email@edudock.com">Email@edudock.com</a></li>
<li><a class="hover:text-blue-500 transition" href="#">Support links</a></li>
<li><a class="hover:text-blue-500 transition" href="#">Support Link</a></li>
</ul>
</div>
<!-- Column 4: Get in Touch -->
<div class="space-y-6">
<h4 class="text-lg font-bold text-slate-800">Get in Touch</h4>
<p class="text-sm text-slate-500">Sign up for our newsletter contentt and more moties.</p>
<div class="relative">
<input class="w-full bg-white border border-gray-200 rounded-full py-2.5 px-5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="Strive your email" type="email"/>
<button class="absolute right-1 top-1 bg-blue-500 text-white p-1.5 rounded-full hover:bg-blue-600 transition">
<svg class="h-4 w-4" fill="none" stroke="currentColor" viewbox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
</button>
</div>
<!-- Social Icons -->
<div class="flex space-x-4 pt-2">
<a class="text-slate-800 hover:text-blue-500 transition" href="#">
<svg class="h-5 w-5 fill-current" viewbox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path></svg>
</a>
<a class="text-slate-800 hover:text-blue-500 transition" href="#">
<svg class="h-5 w-5 fill-current" viewbox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.805.249 2.227.412.56.216.96.474 1.38.894.42.42.678.82.894 1.38.163.422.358 1.057.412 2.227.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.054 1.17-.249 1.805-.412 2.227-.216.56-.474.96-.894 1.38-.42.42-.82.678-1.38.894-.422.163-1.057.358-2.227.412-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.054-1.805-.249-2.227-.412-.56-.216-.96-.474-1.38-.894-.42-.42-.678-.82-.894-1.38-.163-.422-.358-1.057-.412-2.227-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.054-1.17.249-1.805.412-2.227.216-.56.474-.96.894-1.38.42-.42.82-.678 1.38-.894.422-.163 1.057-.358 2.227-.412 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-1.277.058-2.148.262-2.91.558-.788.306-1.456.714-2.122 1.38-.666.666-1.074 1.334-1.38 2.122-.296.762-.5 1.633-.558 2.91-.058 1.28-.072 1.688-.072 4.947s.014 3.667.072 4.947c.058 1.277.262 2.148.558 2.91.306.788.714 1.456 1.38 2.122.666.666 1.334 1.074 2.122 1.38.762.296 1.633.5 2.91.558 1.28.058 1.688.072 4.947.072s3.667-.014 4.947-.072c1.277-.058 2.148-.262 2.91-.558.788-.306 1.456-.714 2.122-1.38.666-.666 1.074-1.334 1.38-2.122.296-.762.5-1.633.558-2.91.058-1.28.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.058-1.277-.262-2.148-.558-2.91-.306-.788-.714-1.456-1.38-2.122-.666-.666-1.334-1.074-2.122-1.38-.762-.296-1.633-.5-2.91-.558-1.28-.058-1.688-.072-4.947-.072z"></path><path d="M12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path></svg>
</a>
<a class="text-slate-800 hover:text-blue-500 transition" href="#">
<svg class="h-5 w-5 fill-current" viewbox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"></path></svg>
</a>
<a class="text-slate-800 hover:text-blue-500 transition" href="#">
<svg class="h-5 w-5 fill-current" viewbox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 4-8 4z"></path></svg>
</a>
</div>
</div>
</div>
<div class="border-t border-gray-200 pt-8 flex flex-col sm:flex-row items-center justify-center space-x-2 text-sm text-slate-400">
<span>Powered by</span>
<div class="flex items-center text-blue-500 font-bold">
<svg class="w-4 h-4 mr-1 fill-current" viewbox="0 0 24 24"><circle cx="12" cy="12" fill="none" r="10" stroke="currentColor" stroke-width="2"></circle><path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="2"></path></svg>
          EduDock
        </div>
</div>
</div>
</footer>
<!-- END: MainFooter -->
</body></html>