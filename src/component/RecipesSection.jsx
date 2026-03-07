
function RecipesSection() {
  const recipes = [
    {
      image: "/recipe_elderberry_1772812850880.png",
      tag: "IMMUNITY",
      time: "10m",
      title: "Golden Elderberry Infusion",
      description: "A potent blend designed to strengthen your natural defenses."
    },
    {
      image: "/recipe_lavender_1772813202167.png",
      tag: "SLEEP",
      time: "15m",
      title: "Midnight Lavender Mist",
      description: "Calming aromas and herbs to prepare your body for deep rest."
    },
    {
      image: "/recipe_mint_1772813548450.png",
      tag: "ENERGY",
      time: "5m",
      title: "Revitalizing Mint Tonic",
      description: "A refreshing kick to start your day without the caffeine crash."
    },
    {
      image: "/recipe_ginger_1772813587696.png",
      tag: "DIGESTION",
      time: "12m",
      title: "Ginger Root Soother",
      description: "Gentle warmth for a happy stomach and better digestion."
    }
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Featured AI Recipes</h2>
          <p className="text-slate-600">Discover what our community is brewing this week.</p>
        </div>
        <a href="#" className="flex items-center text-primary font-bold text-sm hover:underline group">
          View All 
          <span className="material-symbols-outlined text-base ml-1 transition-transform group-hover:translate-x-1">arrow_forward</span>
        </a>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recipes.map((recipe, idx) => (
          <div key={idx} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 flex flex-col transition-shadow hover:shadow-md">
            <div className="h-48 w-full overflow-hidden">
              <img 
                src={recipe.image} 
                alt={recipe.title} 
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1576092762791-dd9e2220afa1?w=600&q=80";
                }}
              />
            </div>
            
            <div className="p-6 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-3">
                <span className="bg-primary-light text-primary text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                  {recipe.tag}
                </span>
                <div className="flex items-center text-slate-400 text-xs font-medium">
                  <span className="material-symbols-outlined text-sm mr-1">schedule</span>
                  {recipe.time}
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight">{recipe.title}</h3>
              <p className="text-slate-500 text-sm mb-6 flex-1 line-clamp-2">
                {recipe.description}
              </p>
              
              <button className="w-full py-2.5 bg-primary-light/50 hover:bg-primary-light text-primary font-bold text-sm rounded-xl transition-colors">
                View Recipe
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default RecipesSection;
