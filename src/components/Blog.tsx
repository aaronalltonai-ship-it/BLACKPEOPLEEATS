import React from 'react';
import { motion } from 'motion/react';
import { Calendar, User, ArrowRight } from 'lucide-react';

const BLOG_POSTS = [
  {
    id: 1,
    title: "The Rise of Black-Owned Vegan Soul Food",
    excerpt: "How entrepreneurs are redefining comfort food with plant-based innovations that honor tradition.",
    author: "Maya J.",
    date: "Feb 24, 2026",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&h=500&fit=crop",
    category: "Culture"
  },
  {
    id: 2,
    title: "5 Must-Visit BBQ Spots in Houston",
    excerpt: "From massive turkey legs to legendary brisket, we explore the best of H-Town's BBQ scene.",
    author: "Marcus T.",
    date: "Feb 20, 2026",
    image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?q=80&w=800&h=500&fit=crop",
    category: "Guides"
  },
  {
    id: 3,
    title: "Supporting Black-Owned Restaurants: Why It Matters",
    excerpt: "The economic and cultural impact of choosing to spend your dollars within the community.",
    author: "Dr. Elena S.",
    date: "Feb 15, 2026",
    image: "https://images.unsplash.com/photo-1550966841-3ee5ad60d0d9?q=80&w=800&h=500&fit=crop",
    category: "Community"
  }
];

export default function Blog() {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase italic">The Feed<span className="text-brand-orange">.</span></h2>
        <p className="text-brand-ink/60 max-w-2xl mx-auto font-serif italic text-lg">
          Stories, guides, and insights from the heart of the Black culinary community.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {BLOG_POSTS.map((post, i) => (
          <motion.article 
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-brand-ink/5"
          >
            <div className="relative h-64 overflow-hidden">
              <img 
                src={post.image} 
                alt={post.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute top-4 left-4 bg-brand-orange text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                {post.category}
              </div>
            </div>
            <div className="p-8 space-y-4">
              <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-brand-ink/40">
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>{post.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User size={12} />
                  <span>{post.author}</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold leading-tight group-hover:text-brand-orange transition-colors">
                {post.title}
              </h3>
              <p className="text-brand-ink/60 font-serif italic line-clamp-3">
                {post.excerpt}
              </p>
              <button className="flex items-center gap-2 text-brand-orange font-bold uppercase tracking-widest text-xs group/btn">
                Read More 
                <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
              </button>
            </div>
          </motion.article>
        ))}
      </div>

      {/* Ad Slot */}
      <div className="bg-brand-ink rounded-3xl p-12 text-white text-center space-y-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-orange/10 via-transparent to-transparent opacity-50" />
        <div className="relative z-10 space-y-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-orange">Sponsored</span>
          <h3 className="text-3xl font-bold tracking-tight uppercase">Your Brand Here</h3>
          <p className="text-white/60 max-w-md mx-auto font-serif italic">
            Reach thousands of food lovers in the community. Partner with BlackPeopleEats today.
          </p>
          <button className="bg-brand-orange text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-white hover:text-brand-ink transition-all shadow-xl">
            Partner With Us
          </button>
        </div>
      </div>
    </div>
  );
}
