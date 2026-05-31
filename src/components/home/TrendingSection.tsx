import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TrendingUp, Flame, Eye, ChevronRight, Wrench, BookOpen, Bell } from 'lucide-react';
import { type Update, type Tool, type Pdf } from '@/types';

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as any },
    },
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.92 },
    show: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as any },
    },
};

const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
};

interface TrendingSectionProps {
    trendingTools: Tool[];
    trendingPdfs: Pdf[];
    trendingUpdates: Update[];
    searchQuery: string;
    searchMatchedTools: Tool[];
    searchMatchedPdfs: Pdf[];
    searchMatchedUpdates: Update[];
}

export default function TrendingSection({
    trendingTools,
    trendingPdfs,
    trendingUpdates,
    searchQuery,
    searchMatchedTools,
    searchMatchedPdfs,
    searchMatchedUpdates,
}: TrendingSectionProps) {
    function getRankStyle(i: number) {
        if (i === 0) return 'bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-600';
        if (i === 1) return 'bg-gradient-to-br from-slate-500/20 to-slate-600/10 border-slate-500/30 text-slate-600';
        if (i === 2) return 'bg-gradient-to-br from-rose-500/20 to-rose-600/10 border-rose-500/30 text-rose-600';
        return 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 text-primary';
    }

    const isSearching = searchQuery.trim().length > 0;

    return (
        <div className="space-y-20">
            {/* Search Results Section */}
            {isSearching && (
                <AnimatePresence>
                    {searchMatchedTools.length === 0 &&
                        searchMatchedPdfs.length === 0 &&
                        searchMatchedUpdates.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="text-center py-12"
                                role="status"
                                aria-live="polite"
                            >
                                <div className="glass-card inline-flex p-6 rounded-3xl mb-6">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                                        <Eye className="h-6 w-6 text-primary" />
                                    </div>
                                </div>
                                <h2 className="text-2xl font-display font-semibold mb-3">
                                    No results for "{searchQuery}"
                                </h2>
                                <p className="text-muted-foreground max-w-md mx-auto">
                                    Try searching for something else or browse our collections below.
                                </p>
                            </motion.div>
                        )}

                    {searchMatchedTools.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center" aria-hidden="true">
                                        <Wrench className="h-5 w-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-display font-semibold">Matching Tools</h2>
                                        <p className="text-sm text-muted-foreground">
                                            {searchMatchedTools.length} tool{searchMatchedTools.length !== 1 ? 's' : ''} found
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    to="/tools"
                                    className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1"
                                    aria-label={`View all ${searchMatchedTools.length} tools`}
                                >
                                    View all <ChevronRight className="h-4 w-4" aria-hidden="true" />
                                </Link>
                            </div>

                            <motion.div
                                variants={stagger}
                                initial="hidden"
                                animate="show"
                                className="flex flex-row flex-nowrap overflow-x-auto gap-6 pb-2 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full"
                                style={{ touchAction: 'pan-x' }}
                                role="list"
                                aria-label="Search results for tools"
                            >
                                {searchMatchedTools.map((tool: any, i: number) => (
                                    <motion.div key={tool.id} variants={fadeUp} role="listitem" className="min-w-[280px] shrink-0">
                                        <Link
                                            to={tool.url || '#'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="glass-card group block p-5 rounded-2xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1"
                                            aria-label={`Open ${tool.title} tool${tool.short_description ? `: ${tool.short_description}` : ''}`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center flex-shrink-0">
                                                    <Wrench className="h-6 w-6 text-primary" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-display font-semibold mb-1 group-hover:text-primary transition-colors">
                                                        {tool.title}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                                        {tool.short_description}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </motion.div>
                    )}

                    {searchMatchedPdfs.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center" aria-hidden="true">
                                        <BookOpen className="h-5 w-5 text-emerald-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-display font-semibold">Matching PDFs</h2>
                                        <p className="text-sm text-muted-foreground">
                                            {searchMatchedPdfs.length} PDF{searchMatchedPdfs.length !== 1 ? 's' : ''} found
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    to="/pdfs"
                                    className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1"
                                    aria-label={`View all ${searchMatchedPdfs.length} PDFs`}
                                >
                                    View all <ChevronRight className="h-4 w-4" aria-hidden="true" />
                                </Link>
                            </div>

                            <motion.div
                                variants={stagger}
                                initial="hidden"
                                animate="show"
                                className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 scrollbar-hide w-full"
                                role="list"
                                aria-label="Search results for PDFs"
                            >
                                {searchMatchedPdfs.map((pdf: any) => (
                                    <motion.div key={pdf.id} variants={fadeUp} role="listitem">
                                        <Link to={`/pdfs/${pdf.slug || pdf.id}`} aria-label={`View ${pdf.title} PDF`}>
                                            {pdf.cover_image_url ? (
                                                <img
                                                    src={pdf.cover_image_url}
                                                    alt={pdf.title}
                                                    className="w-[40vw] md:w-[200px] flex-none snap-start aspect-[2/3] object-cover rounded-lg shadow-md block transition-transform hover:scale-[1.02]"
                                                />
                                            ) : (
                                                <div className="w-[40vw] md:w-[200px] flex-none snap-start aspect-[2/3] flex items-center justify-center bg-gray-100 dark:bg-[#111111] rounded-lg shadow-md transition-transform hover:scale-[1.02]">
                                                    <BookOpen className="h-8 w-8 text-primary/40" />
                                                </div>
                                            )}
                                        </Link>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </motion.div>
                    )}

                    {searchMatchedUpdates.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center" aria-hidden="true">
                                        <Bell className="h-5 w-5 text-purple-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-display font-semibold">Matching Updates</h2>
                                        <p className="text-sm text-muted-foreground">
                                            {searchMatchedUpdates.length} update{searchMatchedUpdates.length !== 1 ? 's' : ''} found
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    to="/updates"
                                    className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1"
                                    aria-label={`View all ${searchMatchedUpdates.length} updates`}
                                >
                                    View all <ChevronRight className="h-4 w-4" aria-hidden="true" />
                                </Link>
                            </div>

                            <motion.div
                                variants={stagger}
                                initial="hidden"
                                animate="show"
                                className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 scrollbar-hide w-full"
                                role="list"
                                aria-label="Search results for updates"
                            >
                                {searchMatchedUpdates.map((update: any) => (
                                    <motion.div key={update.id} variants={fadeUp} role="listitem">
                                        <Link to={`/updates/${update.slug || update.id}`} aria-label={`Read ${update.title} update`}>
                                            {update.image_url ? (
                                                <img
                                                    src={update.image_url}
                                                    alt={update.title}
                                                    className="w-[88vw] md:w-[720px] flex-none snap-center aspect-[1200/620] object-cover rounded-xl shadow-md block transition-transform hover:scale-[1.02]"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="w-[88vw] md:w-[720px] flex-none snap-center aspect-[1200/620] flex items-center justify-center bg-gray-200 dark:bg-[#111111] rounded-xl shadow-md transition-transform hover:scale-[1.02]">
                                                    <Bell className="h-8 w-8 text-primary/40" />
                                                </div>
                                            )}
                                        </Link>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}

            {/* Trending Content (when not searching) */}
            {!isSearching && (
                <>
                    {/* Trending Tools */}
                    <section className="pb-20 overflow-hidden" aria-labelledby="trending-tools-heading">
                        <div className="container mx-auto px-4">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="space-y-8"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center" aria-hidden="true">
                                            <TrendingUp className="h-5 w-5 text-blue-500" />
                                        </div>
                                        <div>
                                            <h2 id="trending-tools-heading" className="text-2xl font-display font-semibold">Trending Tools</h2>
                                            <p className="text-sm text-muted-foreground">Most visited this week</p>
                                        </div>
                                    </div>
                                    <Link
                                        to="/tools"
                                        className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1"
                                        aria-label="View all tools"
                                    >
                                        View all <ChevronRight className="h-4 w-4" aria-hidden="true" />
                                    </Link>
                                </div>

                                <motion.div
                                    variants={stagger}
                                    initial="hidden"
                                    whileInView="show"
                                    viewport={{ once: true }}
                                    className="flex flex-row flex-nowrap overflow-x-auto gap-6 pb-2 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full"
                                    style={{ touchAction: 'pan-x' }}
                                    role="list"
                                    aria-label="Trending tools"
                                >
                                    {trendingTools.map((tool: any, i: number) => (
                                        <motion.div key={tool.id} variants={fadeUp} role="listitem" className="min-w-[280px] shrink-0">
                                            <Link
                                                to={tool.url || '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="glass-card group block p-5 rounded-2xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1"
                                                aria-label={`Open ${tool.title} tool, ranked ${i + 1} with ${tool.clicks || 0} views`}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={`h-12 w-12 rounded-xl ${getRankStyle(i)} flex items-center justify-center flex-shrink-0`} aria-label={`Rank ${i + 1}`}>
                                                        <span className="font-bold" aria-hidden="true">{i + 1}</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-display font-semibold mb-1 group-hover:text-primary transition-colors">
                                                            {tool.title}
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                                            {tool.short_description}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <Eye className="h-3 w-3 text-muted-foreground" />
                                                            <span className="text-xs text-muted-foreground">
                                                                {tool.clicks || 0} views
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </motion.div>
                        </div>
                    </section>

                    {/* Trending PDFs */}
                    {trendingPdfs && trendingPdfs.length > 0 && (
                        <section className="pb-20 overflow-hidden" aria-labelledby="hot-pdfs-heading">
                            <div className="container mx-auto px-4">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6 }}
                                    className="space-y-8"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center" aria-hidden="true">
                                                <Flame className="h-5 w-5 text-emerald-500" />
                                            </div>
                                            <div>
                                                <h2 id="hot-pdfs-heading" className="text-2xl font-display font-semibold">Hot PDFs</h2>
                                                <p className="text-sm text-muted-foreground">Most downloaded recently</p>
                                            </div>
                                        </div>
                                        <Link
                                            to="/pdfs"
                                            className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1"
                                            aria-label="View all PDFs"
                                        >
                                            View all <ChevronRight className="h-4 w-4" aria-hidden="true" />
                                        </Link>
                                    </div>

                                    <motion.div
                                        variants={stagger}
                                        initial="hidden"
                                        whileInView="show"
                                        viewport={{ once: true }}
                                        className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 scrollbar-hide w-full"
                                        role="list"
                                        aria-label="Hot PDFs"
                                    >
                                        {trendingPdfs.map((pdf: any, i: number) => (
                                            <motion.div key={pdf.id} variants={scaleIn} role="listitem">
                                                <Link to={`/pdfs/${pdf.slug || pdf.id}`} aria-label={`View ${pdf.title} PDF`}>
                                                    {pdf.cover_image_url ? (
                                                        <img
                                                            src={pdf.cover_image_url}
                                                            alt={pdf.title}
                                                            className="w-[40vw] md:w-[200px] flex-none snap-start aspect-[2/3] object-cover rounded-lg shadow-md block transition-transform hover:scale-[1.02]"
                                                        />
                                                    ) : (
                                                        <div className="w-[40vw] md:w-[200px] flex-none snap-start aspect-[2/3] flex items-center justify-center bg-gray-100 dark:bg-[#1f1f1f] rounded-lg shadow-md transition-transform hover:scale-[1.02]">
                                                            <BookOpen className="h-8 w-8 text-primary/40" />
                                                        </div>
                                                    )}
                                                </Link>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                </motion.div>
                            </div>
                        </section>
                    )}

                    {/* Trending Updates */}
                    {trendingUpdates && trendingUpdates.length > 0 && (
                        <section className="pb-20 overflow-hidden" aria-labelledby="latest-updates-heading">
                            <div className="container mx-auto px-4">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6 }}
                                    className="space-y-8"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center" aria-hidden="true">
                                                <Bell className="h-5 w-5 text-purple-500" />
                                            </div>
                                            <div>
                                                <h2 id="latest-updates-heading" className="text-2xl font-display font-semibold">Latest Updates</h2>
                                                <p className="text-sm text-muted-foreground">Fresh content for you</p>
                                            </div>
                                        </div>
                                        <Link
                                            to="/updates"
                                            className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1"
                                            aria-label="View all updates"
                                        >
                                            View all <ChevronRight className="h-4 w-4" aria-hidden="true" />
                                        </Link>
                                    </div>

                                    <motion.div
                                        variants={stagger}
                                        initial="hidden"
                                        whileInView="show"
                                        viewport={{ once: true }}
                                        className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 scrollbar-hide w-full"
                                        role="list"
                                        aria-label="Latest updates"
                                    >
                                        {trendingUpdates.map((update: any) => (
                                                    <motion.div key={update.id} variants={fadeUp} role="listitem" className="flex-none w-[88vw] md:w-[720px] snap-center">
                                                        <Link to={`/updates/${update.slug || update.id}`} aria-label={`Read ${update.title} update`} className="block rounded-xl overflow-hidden shadow-md">
                                                            {update.image_url ? (
                                                                <div className="aspect-[1200/620] w-full h-full">
                                                                    <img
                                                                        src={update.image_url}
                                                                        alt={update.title}
                                                                        className="w-full h-full object-cover block transition-transform hover:scale-[1.02]"
                                                                        loading="lazy"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div className="aspect-[1200/620] w-full h-full flex items-center justify-center bg-gray-200 dark:bg-[#2a2a2a]">
                                                                    <Bell className="h-8 w-8 text-primary/40" />
                                                                </div>
                                                            )}
                                                        </Link>
                                                    </motion.div>
                                                ))}
                                    </motion.div>
                                </motion.div>
                            </div>
                        </section>
                    )}
                </>
            )}
        </div>
    );
}