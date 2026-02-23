import React, { useState, useEffect } from 'react';
import { MapPin, Utensils, Search, Plus, User, Heart, MessageSquare, Share2, ChevronRight, Star, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { getCityHighlights, type Restaurant, type Post } from './services/geminiService';
import Markdown from 'react-markdown';

export default function App() {
  const [city, setCity] = useState('Atlanta');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [highlights, setHighlights] = useState<any[]>([]);
  const [sponsors, setSponsors] = useState<Restaurant[]>([]);
  const [isAddingPost, setIsAddingPost] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    detectLocation();
    fetchUser();
  }, []);

  useEffect(() => {
    fetchData();
  }, [city]);

  const detectLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Divine logic: Mock reverse geocoding for demo purposes
          // In a real app, use a geocoding API
          const mockCities: Record<string, string> = {
            "33.7": "Atlanta",
            "41.8": "Chicago",
            "29.7": "Houston",
            "42.3": "Detroit",
            "29.9": "New Orleans"
          };
          const latKey = latitude.toFixed(1);
          if (mockCities[latKey]) {
            setCity(mockCities[latKey]);
          }
        } catch (error) {
          console.error("Error detecting location", error);
        }
      });
    }
  };

  const fetchUser = async () => {
    const res = await fetch('/api/users/1');
    const data = await res.json();
    setUser(data);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resRestaurants, resPosts, resHighlights, resSponsors] = await Promise.all([
        fetch(`/api/restaurants?city=${city}`).then(r => r.json()),
        fetch('/api/posts?userId=1').then(r => r.json()),
        getCityHighlights(city),
        fetch('/api/sponsors').then(r => r.json())
      ]);
      setRestaurants(resRestaurants);
      setPosts(resPosts);
      setHighlights(resHighlights);
      setSponsors(resSponsors);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (followedId: number) => {
    if (!user) return;
    await fetch('/api/follow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ follower_id: user.id, followed_id: followedId })
    });
    fetchData(); // Refresh feed
  };

  const handleSponsor = async () => {
    const res = await fetch('/api/create-checkout-session', { method: 'POST' });
    const { url } = await res.json();
    window.location.href = url;
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-brand-cream/80 backdrop-blur-md border-b border-brand-ink/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-brand-orange rounded-full flex items-center justify-center text-white shadow-lg">
              <Utensils size={24} />
            </div>
            <h1 className="text-2xl font-bold tracking-tighter uppercase italic">
              BlackPeopleEats<span className="text-brand-orange">.</span>
            </h1>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium uppercase tracking-widest">
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-brand-orange transition-colors">Explore</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-brand-orange transition-colors">Cities</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-brand-orange transition-colors">Community</a>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-ink/40" size={18} />
              <input 
                type="text" 
                placeholder="Search spots..." 
                className="pl-10 pr-4 py-2 bg-white/50 border border-brand-ink/10 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 w-64"
              />
            </div>
            <button 
              onClick={() => setIsProfileOpen(true)}
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-brand-orange shadow-md hover:scale-105 transition-transform"
            >
              <img src={user?.profile_pic || "https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?q=80&w=100&h=100&fit=crop"} alt="Profile" className="w-full h-full object-cover" />
            </button>
            <button 
              onClick={() => setIsAddingPost(true)}
              className="bg-brand-ink text-white p-2 rounded-full hover:bg-brand-orange transition-all shadow-lg"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-12">
        {/* Hero Section */}
        <section className="relative h-[60vh] rounded-3xl overflow-hidden shadow-2xl group">
          <img 
            src={`https://images.unsplash.com/photo-1414235077428-338988a2e8c0?q=80&w=1920&h=1080&fit=crop`} 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            alt={city}
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-ink via-brand-ink/20 to-transparent" />
          
          <div className="absolute bottom-12 left-12 right-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-brand-orange font-semibold uppercase tracking-widest text-sm">
                <MapPin size={16} />
                <span>Featured City</span>
              </div>
              <h2 className="text-7xl md:text-9xl font-bold text-white tracking-tighter leading-none">
                {city}
              </h2>
              <p className="text-white/80 max-w-md text-lg font-serif italic">
                Discover the soul of the city through its flavors. From legendary BBQ to modern fusion, see where the community is eating.
              </p>
            </div>
            
            <div className="flex gap-4">
              {['Atlanta', 'Chicago', 'Houston', 'Detroit', 'New Orleans'].map(c => (
                <button 
                  key={c}
                  onClick={() => setCity(c)}
                  className={cn(
                    "px-6 py-3 rounded-full text-sm font-bold uppercase tracking-widest transition-all",
                    city === c ? "bg-brand-orange text-white shadow-xl scale-110" : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-md"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Feed */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-bold tracking-tight uppercase">Recent Meals</h3>
              <div className="h-px flex-1 mx-6 bg-brand-ink/10" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence mode='popLayout'>
                {posts.map((post, i) => (
                  <motion.div 
                    key={post.id || i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-brand-ink/5 flex flex-col"
                  >
                    <div className="relative aspect-[4/3]">
                      <img 
                        src={post.image_url || `https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&h=450&fit=crop`} 
                        className="w-full h-full object-cover"
                        alt={post.meal_name}
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 left-4 bg-brand-orange text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded">
                        {post.restaurant_name}
                      </div>
                    </div>
                    <div className="p-5 space-y-3 flex-1 flex flex-col">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-lg leading-tight">{post.meal_name}</h4>
                        <div className="flex items-center gap-1 text-xs font-medium text-brand-ink/40">
                          <img src={post.user_avatar || "https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?q=80&w=50&h=50&fit=crop"} className="w-5 h-5 rounded-full" />
                          <span>{post.user_name}</span>
                        </div>
                      </div>
                      <div className="flex gap-0.5 text-brand-orange">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} fill={i < (post.rating || 5) ? "currentColor" : "none"} />
                        ))}
                      </div>
                      <p className="text-sm text-brand-ink/60 line-clamp-2 font-serif italic">
                        "{post.review}"
                      </p>
                      <div className="pt-4 mt-auto flex items-center justify-between border-t border-brand-ink/5">
                        <div className="flex items-center gap-4 text-brand-ink/40">
                          <button onClick={() => alert('Liked!')} className="hover:text-brand-orange transition-colors flex items-center gap-1">
                            <Heart size={16} />
                            <span className="text-[10px] font-bold">24</span>
                          </button>
                          <button onClick={() => alert('Comments coming soon!')} className="hover:text-brand-orange transition-colors flex items-center gap-1">
                            <MessageSquare size={16} />
                            <span className="text-[10px] font-bold">8</span>
                          </button>
                        </div>
                        {post.user_id !== user?.id && (
                          <button 
                            onClick={() => post.user_id && handleFollow(post.user_id)}
                            className="text-[10px] font-bold uppercase tracking-widest text-brand-orange hover:underline"
                          >
                            Follow
                          </button>
                        )}
                        <button onClick={() => alert('Shared!')} className="text-brand-ink/40 hover:text-brand-orange transition-colors">
                          <Share2 size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column: Highlights & Map */}
          <div className="space-y-12">
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold tracking-tight uppercase">Sponsored Spots</h3>
                <button onClick={handleSponsor} className="text-[10px] font-bold text-brand-orange hover:underline">Sponsor Yours</button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {sponsors.map((s, i) => (
                  <div key={i} className="flex-shrink-0 w-48 bg-white rounded-2xl border border-brand-orange/20 p-3 shadow-sm">
                    <img src={`https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=200&h=120&fit=crop`} className="w-full h-24 object-cover rounded-xl mb-2" />
                    <h4 className="font-bold text-sm truncate">{s.name}</h4>
                    <p className="text-[10px] text-brand-ink/40 uppercase">{s.category}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold tracking-tight uppercase">Local Staples</h3>
                <ChevronRight size={20} className="text-brand-orange" />
              </div>
              
              <div className="space-y-4">
                {loading ? (
                  <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-24 bg-brand-ink/5 rounded-2xl" />)}
                  </div>
                ) : (
                  highlights.map((h, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="group bg-white p-4 rounded-2xl border border-brand-ink/5 shadow-sm hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex flex-col">
                          <h4 className="font-bold group-hover:text-brand-orange transition-colors">{h.name || h.recipeName}</h4>
                          {h.is_sponsored && (
                            <span className="text-[8px] font-bold text-brand-orange uppercase tracking-tighter">Sponsored</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-brand-orange">
                          <Star size={12} fill="currentColor" />
                          <span className="text-[10px] font-bold">4.9</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-brand-ink/40 uppercase tracking-widest font-bold mb-2">
                        {h.category || "Soul Food"}
                      </p>
                      <p className="text-xs text-brand-ink/60 font-serif italic line-clamp-2">
                        {h.reason || (h.ingredients ? h.ingredients.join(', ') : "A must-visit spot for authentic flavors and community vibes.")}
                      </p>
                    </motion.div>
                  ))
                )}
              </div>
            </section>

            <section className="bg-brand-ink rounded-3xl p-8 text-white space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-brand-orange/20 rounded-full blur-3xl" />
              <div className="relative z-10 space-y-4">
                <h3 className="text-2xl font-bold tracking-tight uppercase leading-none">
                  The Map <br/> 
                  <span className="text-brand-orange">Community Verified</span>
                </h3>
                <p className="text-sm text-white/60 font-serif italic">
                  Explore {city}'s top-rated Black-owned spots. Real people, real reviews, real culture.
                </p>
                <div onClick={() => window.open(`https://www.google.com/maps/search/${city}+black+owned+restaurants`, '_blank')} className="aspect-square bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center relative group cursor-pointer overflow-hidden shadow-inner">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-orange/10 via-transparent to-transparent opacity-50" />
                  <img 
                    src={`https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&h=800&fit=crop&grayscale=1`} 
                    className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-110 transition-transform duration-1000 group-hover:opacity-40"
                    alt="Map placeholder"
                    referrerPolicy="no-referrer"
                  />
                  <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-brand-orange rounded-full blur-xl animate-pulse opacity-50" />
                      <div className="w-16 h-16 bg-brand-orange rounded-full flex items-center justify-center shadow-2xl relative z-10 border-4 border-white/20">
                        <MapPin size={32} className="text-white" />
                      </div>
                    </div>
                    <div className="text-center">
                      <span className="text-xs font-bold uppercase tracking-[0.2em] block mb-1">Explore {city}</span>
                      <span className="text-[10px] text-white/40 uppercase tracking-widest">Interactive Experience</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="bg-brand-ink text-white py-12 px-6 mt-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-4xl font-bold tracking-tighter uppercase italic">
              BlackPeopleEats<span className="text-brand-orange">.</span>
            </h2>
            <p className="text-white/40 max-w-sm font-serif italic text-lg">
              Empowering our community through culinary discovery. We highlight the stories, the people, and the flavors that make our culture vibrant.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-brand-orange">Explore</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">All Cities</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">Black-Owned Spots</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">Community Feed</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setIsAddingPost(true); }} className="hover:text-white transition-colors">Submit a Spot</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-brand-orange">Connect</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Instagram</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">Newsletter</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-white/20">
          <p>© 2026 BlackPeopleEats. All Rights Reserved.</p>
          <div className="flex gap-8">
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>

      {/* Add Post Modal */}
      <AnimatePresence>
        {isAddingPost && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingPost(false)}
              className="absolute inset-0 bg-brand-ink/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-brand-cream w-full max-w-xl rounded-3xl shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold tracking-tight uppercase">Share Your Meal</h3>
                  <button onClick={() => setIsAddingPost(false)} className="text-brand-ink/40 hover:text-brand-ink transition-colors">
                    <Plus className="rotate-45" />
                  </button>
                </div>
                
                <form className="space-y-4" onSubmit={async (e) => { 
                  e.preventDefault(); 
                  const formData = new FormData(e.currentTarget);
                  const data = {
                    restaurant_id: parseInt(formData.get('restaurant_id') as string),
                    user_id: 1,
                    user_name: user?.username || "New User",
                    meal_name: formData.get('meal_name'),
                    review: formData.get('review'),
                    rating: parseInt(formData.get('rating') as string),
                    image_url: selectedImage || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&h=450&fit=crop"
                  };
                  
                  await fetch('/api/posts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                  });
                  
                  setIsAddingPost(false);
                  setSelectedImage(null);
                  fetchData();
                }}>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/40">Restaurant</label>
                    <select name="restaurant_id" className="w-full bg-white border border-brand-ink/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-orange/20">
                      {restaurants.map(r => (
                        <option key={r.id} value={r.id}>{r.name} ({r.city})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/40">Photo</label>
                    <div className="flex items-center gap-4">
                      <label className="flex-1 cursor-pointer">
                        <div className="border-2 border-dashed border-brand-ink/10 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-brand-orange/40 transition-colors bg-white/50">
                          {selectedImage ? (
                            <img src={selectedImage} className="w-full h-32 object-cover rounded-lg" alt="Preview" />
                          ) : (
                            <>
                              <Camera className="text-brand-ink/20" size={24} />
                              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/40">Upload Photo</span>
                            </>
                          )}
                        </div>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setSelectedImage(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      {selectedImage && (
                        <button 
                          type="button" 
                          onClick={() => setSelectedImage(null)}
                          className="text-[10px] font-bold uppercase tracking-widest text-brand-orange hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/40">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(num => (
                        <label key={num} className="cursor-pointer">
                          <input type="radio" name="rating" value={num} className="hidden peer" defaultChecked={num === 5} />
                          <Star className="peer-checked:fill-brand-orange peer-checked:text-brand-orange text-brand-ink/20 hover:text-brand-orange transition-colors" size={24} />
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/40">What did you eat?</label>
                    <input name="meal_name" type="text" required placeholder="e.g. One Night Stand Burger" className="w-full bg-white border border-brand-ink/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-orange/20" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/40">Your Review</label>
                    <textarea name="review" rows={3} required placeholder="Tell the community about it..." className="w-full bg-white border border-brand-ink/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 resize-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/40">Photo</label>
                    <div className="relative w-full h-32 bg-brand-ink/5 border-2 border-dashed border-brand-ink/20 rounded-xl flex flex-col items-center justify-center overflow-hidden hover:bg-brand-ink/10 transition-colors cursor-pointer">
                      {selectedImage ? (
                        <img src={selectedImage} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                      ) : (
                        <>
                          <Camera className="text-brand-ink/40 mb-2" size={24} />
                          <span className="text-xs text-brand-ink/60 font-bold uppercase tracking-widest">Upload Photo</span>
                        </>
                      )}
                      <input 
                        type="file" 
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setSelectedImage(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className="pt-4">
                    <button type="submit" className="w-full bg-brand-orange text-white font-bold uppercase tracking-widest py-4 rounded-xl shadow-lg hover:bg-brand-ink transition-all">
                      Post to Community
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Profile Modal */}
      <AnimatePresence>
        {isProfileOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileOpen(false)}
              className="absolute inset-0 bg-brand-ink/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-brand-cream w-full max-w-md rounded-3xl shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-8 space-y-6 text-center">
                <div className="relative w-32 h-32 mx-auto">
                  <img src={user?.profile_pic} className="w-full h-full object-cover rounded-full border-4 border-brand-orange shadow-xl" />
                  <button className="absolute bottom-0 right-0 bg-brand-orange text-white p-2 rounded-full shadow-lg">
                    <Plus size={16} />
                  </button>
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-bold tracking-tight uppercase italic">@{user?.username}</h3>
                  <p className="text-brand-ink/60 font-serif italic">{user?.bio}</p>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-brand-ink/10">
                  <div>
                    <p className="text-xl font-bold">124</p>
                    <p className="text-[10px] font-bold uppercase text-brand-ink/40">Posts</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold">1.2k</p>
                    <p className="text-[10px] font-bold uppercase text-brand-ink/40">Followers</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold">450</p>
                    <p className="text-[10px] font-bold uppercase text-brand-ink/40">Following</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full bg-brand-ink text-white font-bold uppercase tracking-widest py-4 rounded-xl shadow-lg hover:bg-brand-orange transition-all"
                >
                  Close Profile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
